"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as subjectService from "@/services/subjectService";
import * as programSvc from "@/services/programService";
import * as locationSvc from "@/services/LocationService";
import * as adminService from "@/services/adminService";
import * as settingService from "@/services/settingService";
import * as authService from "@/services/auth";
import * as userSvc from "@/services/userService";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import * as alertify from "alertifyjs";
import { FileDrop } from "react-file-drop";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import clientApi from "@/lib/clientApi";
import { getPassword } from "@/lib/helpers";
import CustomPagination from "@/components/CustomPagenation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import { avatar } from "@/lib/pipe";
import Link from "next/link";

export default function UserManagement() {
  const currentUser: any = useSession()?.data?.user?.info || {};
  const [users, setUsers] = useState<any>([]);
  const [maxDob, setMaxDob] = useState<any>(null);
  const [minDob, setMinDob] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>({});
  const [programList, setProgramList] = useState<any>([]);
  const [fileToUpload, setFileToUpload] = useState<any>(null);
  const [user, setUser] = useState<any>({
    role: "",
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>([]);
  const [oldUserId, setOldUserId] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);
  const [filterParams, setFilterParams] = useState<any>({
    searchText: "",
    role: "student",
    includeDeactive: false,
    page: 1,
    limit: 15,
  });
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);
  const [subjectList, setSubjectList] = useState<any>(null);
  const [showDropMenu, setShowDropMenu] = useState<any>([]);
  const [addUserModal, setAddUserModal] = useState<boolean>(false);
  const [edigUserModal, setEditUserModal] = useState<boolean>(false);
  const [passManagement, setPassManagement] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<any>({});
  const fileBrowseRef = useRef(null);
  const [isAfterSearch, setIsAfterSearch] = useState<boolean>(false);
  const [locationList, setLocationList] = useState<any>([]);
  const [timeAccommodation, setTimeAccommodation] = useState<any>({});
  const [timeAccommodationModal, setTimeAccommodationModal] =
    useState<boolean>(false);
  const dropdownRefs = useRef([]);

  const handleDocumentClick = (e) => {
    if (!dropdownRefs.current.some((ref) => ref && ref.contains(e.target))) {
      setShowDropMenu({});
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);
  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    const now = new Date();
    setMaxDob(new Date(now.getFullYear() - 13, now.getMonth(), now.getDate()));
    setMinDob(new Date(now.getFullYear() - 123, now.getMonth(), now.getDate()));
    settingService.findOne("masterdata").then((data) => {
      setMasterData(data);
    });
    programSvc.findAll().then((p) => setProgramList(p));
    if (currentUser.role !== "publisher") {
      locationSvc.find({}).then((res) => {
        setLocationList(res);
      });
    }
    subjectService
      .findAll()
      .then((res) => {
        setSubjectList(res);
      })
      .catch((err) => {
        console.log(err);
      });

    search();
  }, []);

  const openModal = (template: any, id: number, data?: any) => {
    if (data) {
      const user_tmp = { ...data };
      user_tmp.programs = programList.filter(
        (d) => user_tmp.programs.indexOf(d._id) != -1
      );

      user_tmp.subjects = subjectList
        .filter((d) => user_tmp.subjects.indexOf(d._id) != -1)
        .map((d) => {
          return { ...d, value: d._id, display: d.name };
        });
      user_tmp.locations = locationList.filter(
        (d) => user_tmp.locations.indexOf(d._id) != -1
      );
      if (user_tmp.birthdate) {
        user_tmp.birthdate = new Date(user_tmp.birthdate);
      }
      setOldUserId(user_tmp.userId);

      user_tmp.programs = user_tmp.programs.map((d) => {
        return { ...d, value: d._id, display: d.name };
      });

      setUser(user_tmp);
    } else {
      setUser({
        programs: [],
        subjects: [],
        isVerified: true,
      });
    }
    // this.modalRef = this.modalService.show(template, { id: id, ignoreBackdropClick: true })
    if (template === "addUser") {
      setAddUserModal(true);
    } else if (template === "editUser") {
      setEditUserModal(true);
    } else if (template === "passManagement") {
      setPassManagement(true);
    }
  };

  const handleShowDropMenu = (index: number) => {
    const updatedShowDropMenu = [];

    updatedShowDropMenu[index] = !updatedShowDropMenu[index];
    // updatedShowDropMenu.map((item, i) => {
    //   if (i !== index) {
    //     item = false;
    //   }
    // });
    setShowDropMenu(updatedShowDropMenu);
  };

  const dropped = (files: any) => {
    // this.files = files;
    // for (const droppedFile of files) {

    //   // Is it a file?
    //   if (droppedFile.fileEntry.isFile) {
    //     const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
    //     fileEntry.file((file: File) => {
    //       this.uploadFile = file;
    //     });
    //   } else {
    //     // It was a directory (empty directories are added, otherwise only files)
    //     const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
    //     console.log(droppedFile.relativePath, fileEntry);
    //   }
    // }
    setUploadFile(files[0]);
  };

  const uploadUser = async (file: any) => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);

    adminService
      .uploadUser(formData)
      .then((data: any) => {
        if (data) {
          setUploadFile({});
          if (data.errorCount > 0) {
            return alertify.alert(
              "Message",
              "One or more validation issues found in the file. An email has been sent. Please review email, fix issues in the file and resubmit"
            );
          } else {
            return alertify.success("Students added successfully.");
          }
        }
      })
      .catch((err) => {
        console.log(err);

        return alertify.alert(
          "Message",
          "One or more validation issues found in the file. An email has been sent. Please review email, fix issues in the file and resubmit"
        );
      });
  };

  const uploadMentor = (file: any) => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);

    adminService
      .uploadMentor(formData)
      .then((data: any) => {
        if (data) {
          // this.modalRef.hide();
          setUploadFile({});
          if (data.errorCount > 0) {
            return alertify.alert(
              "Message",
              "One or more validation issues found in the file. An email has been sent. Please review email, fix issues in the file and resubmit"
            );
          } else {
            return alertify.success("Mentor/Mentee added successfully.");
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setUploadFile({});

        return alertify.alert(
          "Message",
          "One or more validation issues found in the file. An email has been sent. Please review email, fix issues in the file and resubmit"
        );
      });
  };

  const search = (filter?: any, type?: string) => {
    setIsAfterSearch(true);
    let para = filterParams;

    if (type) {
      if (type === "role") {
        para.role = filter;
      } else if (type === "search") {
        para.searchText = filter;
      } else if (type === "includeDeactive") {
        para.includeDeactive = filter;
      } else if (type === "both") {
        para.role = filter.role;
        para.searchText = filter.searchText;
      }
    }
    setTotalStudents(0);
    setUsers([]);

    if (!para.searchText && !para.role) {
      return;
    }

    if (searching) {
      return;
    }

    if (currentUser.role === "publisher") {
      setFilterParams({
        ...filterParams,
        includeDeactive: true,
      });
      para.includeDeactive = true;
    } else {
      setFilterParams({
        ...filterParams,
        page: 1,
      });
      para.apge = 1;
    }

    const query: any = {
      searchText: para.searchText,
      roles: para.role,
      count: true,
      limit: para.limit,
      page: para.page,
    };

    if (para.includeDeactive) {
      query.includeDeactive = true;
    }

    if (para.role == "student") {
      query.lastAttempt = true;
    }
    setSearching(true);
    authService
      .findUsers(query)
      .then(({ users, count }: { users: []; count: number }) => {
        setUsers(users);
        setTotalStudents(count);
        setSearching(false);
      });
  };

  const clearSearch = () => {
    setFilterParams({
      ...filterParams,
      searchText: "",
    });
    search("", "search");
  };

  const onFileSelected = async (file: any) => {
    setFileToUpload(file[0]);

    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", file[0], file[0].name);
    formData.append("uploadType", "avatar");
    const session = await getSession();

    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((res: any) => {
        setUser({
          ...user,
          avatar: res.data,
          avatarUrl: res.data.fileUrl,
          avatarUrlSM: res.data.fileUrl,
        });
      })
      .catch((err) => {
        setUser({
          ...user,
          avatar: {},
          avatarUrl: "",
          avatarUrlSM: "",
        });

        alertify.error("upload failed");
      });
  };

  const changeStatus = (user, i) => {
    // user.isActive = !user.isActive;
    const deactiveMessage =
      "Do you want to remove this user from your institute? User will no longer be able to login";
    const activeMessage = "Do you want to activate this user?";
    const params = {
      _id: user._id,
      isActive: !user.isActive,
    };
    if (params.isActive) {
      alertify.confirm(activeMessage, () => {
        authService
          .changeStatus(user._id, params)
          .then((res) => {
            if (params.isActive) {
              setUsers((prevUsers) => {
                const newUsers = [...prevUsers];
                newUsers[i].isActive = params.isActive;
                return newUsers;
              });
              alertify.success("User activate  successfully.");
            } else {
              setUsers((prevUsers) => {
                const newUsers = [...prevUsers];
                newUsers[i].isActive = params.isActive;
                return newUsers;
              });
              alertify.success("User deactivate successfully.");
            }
            const updated_show = showDropMenu;
            updated_show[i] = !updated_show[i];
            setShowDropMenu(updated_show);
          })
          .catch((err) => {
            if (err.error && err.error.msg) {
              alertify.alert("Message", err.error.msg);
            } else {
              alertify.alert("Message", "Fail to change user status");
            }
            const updated_show = showDropMenu;
            updated_show[i] = !updated_show[i];
            setShowDropMenu(updated_show);
          });
      });
    } else {
      alertify.confirm(deactiveMessage, () => {
        authService
          .changeStatus(user._id, params)
          .then((res) => {
            if (params.isActive) {
              setUsers((prevUsers) => {
                const newUsers = [...prevUsers];
                newUsers[i].isActive = params.isActive;
                return newUsers;
              });
              alertify.success("User activate  successfully.");
            } else {
              setUsers((prevUsers) => {
                const newUsers = [...prevUsers];
                newUsers[i].isActive = params.isActive;
                return newUsers;
              });

              alertify.success("User deactivate successfully.");
            }
            const updated_show = showDropMenu;
            updated_show[i] = !updated_show[i];
            setShowDropMenu(updated_show);
          })
          .catch((err) => {
            if (err.error && err.error.msg) {
              alertify.alert("Message", err.error.msg);
            } else {
              alertify.alert("Message", "Fail to change user status");
            }
            const updated_show = showDropMenu;
            updated_show[i] = !updated_show[i];
            setShowDropMenu(updated_show);
          });
      });
    }
  };

  const saveUser = () => {
    setUser({
      ...user,
      country: {
        code: currentUser.country.code,
        name: currentUser.country.name,
      },
    });

    const tempUser: any = {
      ...user,
      country: {
        code: currentUser.country.code,
        name: currentUser.country.name,
      },
    };

    if (!tempUser.password) {
      tempUser.password = getPassword();
      tempUser.tempPassword = tempUser.password;
    } else {
      tempUser.newPassword = true;
    }

    tempUser.programs = tempUser.programs.map((d) => d._id);
    tempUser.subjects = tempUser.subjects.map((d) => d._id);

    for (const p of programList) {
      if (tempUser.programs.indexOf(p._id) > -1) {
        for (const s of p.subjects) {
          if (tempUser.subjects.indexOf(s._id) == -1) {
            tempUser.subjects.push(s._id);
          }
        }
      }
    }
    tempUser.locations &&
      (tempUser.locations = tempUser.locations.map((d) => d._id));
    tempUser.isVerified = !!tempUser.isVerified;
    tempUser.whiteboard = !!tempUser.whiteboard;
    tempUser.liveboard = !!tempUser.liveboard;
    tempUser.openAI = !!tempUser.openAI;

    authService
      .addUser(tempUser)
      .then((data: any) => {
        cancel("addUser");

        alertify.success("User added successfully.");
        setFilterParams({
          ...filterParams,
          role: tempUser.role,
          searchText: tempUser.userId,
        });
        const tmp = {
          role: tempUser.role,
          searchText: tempUser.userId,
        };

        search(tmp, "both");
      })
      .catch((res) => {
        setErrors([]);
        if (res.response.data) {
          const tmp_errors = [];
          for (const data of res.response.data) {
            tmp_errors.push(data.msg);
            setErrors(tmp_errors);
          }
        } else {
          alertify.success("Fail to add user.");
        }
      });
  };

  const updateUser = () => {
    const tempUser: any = { ...user };

    tempUser.programs = user.programs?.map((d) => d._id);
    tempUser.subjects = user.subjects?.map((d) => d._id);

    for (const p of programList) {
      if (tempUser.programs.indexOf(p._id) > -1) {
        for (const s of p.subjects) {
          if (tempUser.subjects.indexOf(s._id) == -1) {
            tempUser.subjects.push(s._id);
          }
        }
      }
    }
    tempUser.locations = tempUser.locations.map((d) => d._id);

    if (oldUserId != user.userId) {
      tempUser.newUserId = user.userId;
    }
    authService
      .updateUser(tempUser)
      .then((data: any) => {
        if (edigUserModal) {
          cancel("editUser");
        } else if (passManagement) {
          cancel("passManagement");
        }

        if (data) {
          tempUser.password = "";
          tempUser.forcePasswordReset = false;
          let tmp = users;

          tmp = users.map((u) => {
            if (u._id == tempUser._id) {
              return { ...tempUser };
            } else {
              return u;
            }
          });
          setUsers(tmp);

          setUser({});
          alertify.success("User updated successfully.");
        }
      })
      .catch((error) => {
        setErrors([]);
        if (error.errors) {
          const tmp_errors = [];
          for (const key in error.errors) {
            tmp_errors.push(error.errors[key].message);
            setErrors(tmp_errors);
          }
        } else {
          console.log(error);
          alertify.success("Fail to update user.");
        }
      });
  };

  const cancel = (template?: string) => {
    setUser({});
    setErrors([]);

    if (template === "addUser") {
      setAddUserModal(false);
    } else if (template === "editUser") {
      setEditUserModal(false);
    } else if (template === "passManagement") {
      setPassManagement(false);
    } else {
      setTimeAccommodationModal(false);
    }

    // this.modalRef.hide()
  };

  const cancelDocs = () => {
    setUploadFile(null);
    setFiles(null);
  };

  const openTimeAccom = (user) => {
    // this.timeAccommodation = { ...data };
    userSvc.getTimeAccommodation(user._id).then((timeAcc) => {
      setTimeAccommodation(timeAcc);
      setTimeAccommodationModal(true);
    });
  };

  const updateTimeAcc = () => {
    userSvc
      .updateTimeAccommodation(timeAccommodation)
      .then((timeAcc) => {
        setTimeAccommodationModal(false);
        setTimeAccommodation({});
        alertify.success("User updated successfully.");
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Failed to update time accommodation.");
      });
  };

  const onPageChanged = (page) => {
    if (searching) {
      return;
    }
    setFilterParams({
      ...filterParams,
      page: page,
    });

    const query: any = {
      searchText: filterParams.searchText,
      roles: filterParams.role,
      limit: filterParams.limit,
      page: page,
    };

    if (filterParams.includeDeactive) {
      query.includeDeactive = true;
    }

    if (filterParams.role == "student") {
      query.lastAttempt = true;
    }
    setSearching(true);
    authService.findUsers(query).then(({ users }: { users: [] }) => {
      setUsers(users);
      setSearching(false);
    });
  };
  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      <main className="pt-lg-3 Admininistration-admin_new">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="row">
              <div className="col-lg-12 Admin-Cur_ricuLam">
                <div className="rounded-boxes  bg-white">
                  <div className="UserCardAdmiN-AlL1">
                    <div className="row">
                      <div className="col">
                        <div className="section_heading_wrapper mb-0">
                          <h3 className="section_top_heading">
                            User Management ({totalStudents})
                          </h3>
                        </div>
                      </div>
                    </div>
                    {currentUser.primaryInstitute?.preferences?.user
                      ?.canCreate && (
                      <div className="row my-3">
                        <div className="col-lg-3 col-md-4">
                          <div className="dashed-border-box h-lg-100 d-flex flex-column">
                            <p className="assess-help">
                              You can add user in the platform
                            </p>
                            <div className="text-right mt-auto">
                              <button
                                className="btn btn-primary mt-2"
                                onClick={() => openModal("addUser", 1)}
                              >
                                Add User
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-9 col-md-8">
                          <div className="dashed-border-box h-lg-100">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="standard-upload-box m-0">
                                  <FileDrop onDrop={(f) => dropped(f)}>
                                    <h2 className="upload_icon text-center">
                                      <span className="material-icons setting-image">
                                        file_copy
                                      </span>
                                    </h2>
                                    <p className="pro-text-drug text-center d-block active text-primary">
                                      {uploadFile?.name}
                                    </p>
                                    <span className="title text-center drag-photo-title">
                                      Drag and drop or{" "}
                                      <span
                                        className="active"
                                        onClick={filePicker}
                                      >
                                        Browse
                                      </span>{" "}
                                      your files.
                                    </span>
                                    <div className="text-center">
                                      {uploadFile?.name ? (
                                        <button
                                          className="btn btn-secondary btn-sm set_cancel__btn mx-2"
                                          onClick={cancelDocs}
                                        >
                                          Cancel
                                        </button>
                                      ) : (
                                        <button
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
                                        onClick={() => uploadUser(uploadFile)}
                                        disabled={!uploadFile}
                                      >
                                        Upload
                                      </button>
                                    </div>
                                    <input
                                      id="fileInput"
                                      type="file"
                                      accept=".xlsx"
                                      style={{ display: "none" }}
                                      ref={fileBrowseRef}
                                      onChange={(e) => dropped(e.target.files)}
                                    />
                                  </FileDrop>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <p className="assess-help">
                                  Download the template for adding users in
                                  volume
                                </p>
                                <a
                                  href="/assets/media/ImportTemplate.xlsx"
                                  target="_blank"
                                  className="btn btn-outline mt-2"
                                >
                                  <div className="d-flex align-items-center justify-content-center">
                                    <img
                                      src="/assets/images/assessment-excel.svg"
                                      alt=""
                                      className="tem-svg mr-2"
                                    />
                                    Download Template.
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <section className="my-2">
                      <div className="row">
                        <div className="col-4 d-flex align-items-center gap-xs">
                          <div className="title">
                            <h6 style={{ fontSize: "14px" }}>Filter by Role</h6>
                          </div>

                          <select
                            className="form-control w-auto flex-grow-1"
                            name="filterRole"
                            value={
                              currentUser.role !== "publisher"
                                ? filterParams.role
                                : filterParams.role === "student"
                                ? ""
                                : filterParams.role
                            }
                            onChange={(e) => {
                              setFilterParams({
                                ...filterParams,
                                role: e.target.value,
                              });
                              search(e.target.value, "role");
                            }}
                          >
                            <option value="" disabled>
                              Select a Role
                            </option>
                            {currentUser.role === "publisher" ? (
                              <>
                                {settings?.roles.teacher && (
                                  <option value="teacher">Teacher</option>
                                )}

                                {settings?.roles.support && (
                                  <option value="support">Support</option>
                                )}
                                {settings?.roles.operator && (
                                  <option value="operator">Operator</option>
                                )}
                              </>
                            ) : currentUser.role === "admin" ? (
                              <>
                                <option value="student">Student</option>
                                {settings?.roles.teacher && (
                                  <option value="teacher">Teacher</option>
                                )}
                                {settings?.roles.mentor && (
                                  <option value="mentor">Parent/Mentor</option>
                                )}
                                {settings?.roles.publisher && (
                                  <option value="publisher">Publisher</option>
                                )}
                                {settings?.roles.support && (
                                  <option value="support">Support</option>
                                )}
                                {settings?.roles.operator && (
                                  <option value="operator">Operator</option>
                                )}
                                {settings?.roles.director &&
                                  currentUser.role === "director" && (
                                    <option value="director">Director</option>
                                  )}
                                {currentUser.role === "admin" && (
                                  <>
                                    {settings?.roles.director && (
                                      <option value="director">Director</option>
                                    )}
                                    <option value="admin">Admin</option>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {settings?.roles.student && (
                                  <option value="student">Student</option>
                                )}

                                {settings?.roles.teacher && (
                                  <option value="teacher">Teacher</option>
                                )}
                                {settings?.roles.director && (
                                  <option value="director">Director</option>
                                )}
                              </>
                            )}
                          </select>
                        </div>
                        <div className="col-2"></div>
                        <div className="col-4">
                          <div className="member-search my-3">
                            <form
                              className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                              style={{ maxWidth: "100%" }}
                              onSubmit={(e) => {
                                e.preventDefault();
                                // search();
                              }}
                            >
                              <input
                                type="text"
                                className="form-control border-0 my-0"
                                maxLength={50}
                                placeholder="Search for user"
                                name="txtSearch"
                                value={filterParams.searchText}
                                onChange={(e) => {
                                  setFilterParams({
                                    ...filterParams,
                                    searchText: e.target.value,
                                  });
                                  search(e.target.value, "search");
                                }}
                              />
                              {filterParams.searchText !== "" && (
                                <span
                                  className="search-pause"
                                  style={{
                                    position: "absolute",
                                    top: "12px",
                                    right: "3px",
                                  }}
                                  onClick={() => {
                                    clearSearch();
                                  }}
                                >
                                  <FontAwesomeIcon icon={faXmarkCircle} />
                                </span>
                              )}

                              <span className="m-0 w-auto h-auto">
                                <figure className="m-0 w-auto">
                                  <img
                                    className="m-0 h-auto mw-100"
                                    src="/assets/images/search-icon-2.png"
                                    alt=""
                                  />
                                </figure>
                              </span>
                            </form>
                          </div>
                        </div>
                        <div className="d-flex align-items-center ">
                          <div className="instance-head mt-0 mr-2">
                            Show Inactive Users
                          </div>
                          <div className="switch-item mt-0 float-none ml-auto d-block">
                            <label className="switch my-0">
                              <input
                                type="checkbox"
                                value="1"
                                checked={filterParams.includeDeactive}
                                onChange={(e) => {
                                  setFilterParams({
                                    ...filterParams,
                                    includeDeactive: e.target.checked,
                                  });
                                  search(e.target.checked, "includeDeactive");
                                }}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </section>
                    {currentUser.role !== "publisher" ? (
                      <>
                        {users.length > 0 ? (
                          <div className="table-responsive-md vertical-middle table-wrap">
                            <table className="table mb-0 memberDetailsClass1 ml-0">
                              <thead>
                                <tr>
                                  <th className="border-0 tableClshead1 ml-50px d-block">
                                    Name
                                  </th>
                                  <th className="border-0 tableClshead1">
                                    User Id
                                  </th>
                                  <th className="border-0 tableClshead1">
                                    Last Login Date
                                  </th>
                                  {filterParams.role === "student" && (
                                    <th className="border-0 tableClshead1">
                                      Last Attempt Date
                                    </th>
                                  )}
                                  <th className="border-0 tableClshead1"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-0">
                                      <div className="d-flex align-items-center mb-0 p-0">
                                        <figure className="user_img_circled_wrap m-0">
                                          <img
                                            src={avatar(item)}
                                            alt=""
                                            className="user_img_circled"
                                          />
                                        </figure>
                                        <div>
                                          &nbsp;&nbsp;{item.name}
                                          {!item.isActive && (
                                            <p className="text-danger">
                                              &nbsp;&nbsp;Deactivated
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td>{item.userId}</td>
                                    <td>
                                      {item.lastLogin && (
                                        <p>
                                          {moment(item.lastLogin).fromNow()}
                                        </p>
                                      )}
                                    </td>
                                    {filterParams.role === "student" && (
                                      <td>
                                        {item.lastAttempt && (
                                          <p>
                                            {moment(item.lastAttempt).fromNow()}
                                          </p>
                                        )}
                                      </td>
                                    )}
                                    <td className="d-flex gap-xs justify-content-end">
                                      <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() =>
                                          openModal("editUser", 2, item)
                                        }
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() =>
                                          openModal("passManagement", 3, item)
                                        }
                                      >
                                        Manage Password
                                      </button>
                                      <div
                                        className="btn-group  open show"
                                        ref={(el) =>
                                          (dropdownRefs.current[index] = el)
                                        }
                                      >
                                        <button
                                          id="button-basic"
                                          type="button"
                                          className="btn btn-primary dropdown-toggle btn-sm"
                                          aria-controls="dropdown-basic"
                                          onClick={(e) =>
                                            handleShowDropMenu(index)
                                          }
                                        >
                                          <span className="caret text-white">
                                            More
                                          </span>
                                          <span className="sr-only">
                                            Split button!
                                          </span>
                                        </button>
                                        {showDropMenu[index] && (
                                          <ul
                                            id="dropdown-basic"
                                            className="dropdown-menu dropdown-menu-right user-dropdown"
                                            role="menu"
                                            aria-labelledby="button-basic"
                                            style={{
                                              display: "block",
                                            }}
                                          >
                                            <li role="menuitem">
                                              <a
                                                className="dropdown-item"
                                                onClick={() => {
                                                  handleShowDropMenu(index);
                                                  changeStatus(item, index);
                                                }}
                                              >
                                                {item.isActive
                                                  ? "Deactivate"
                                                  : "Activate"}
                                              </a>
                                            </li>
                                            <li role="menuitem">
                                              <Link
                                                className="dropdown-item"
                                                href={`./user/recent-activity/${item._id}`}
                                              >
                                                Recent Activity
                                              </Link>
                                            </li>
                                            {item.role == "student" &&
                                              settings?.features
                                                .timeAccommodation &&
                                              item.showAccommodation && (
                                                <li role="menuitem">
                                                  <a
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                      openTimeAccom(item);
                                                    }}
                                                  >
                                                    Time Accommodation
                                                  </a>
                                                </li>
                                              )}
                                          </ul>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-data">
                            <figure>
                              <img
                                src="/assets/images/userEmptyPageImage.svg"
                                alt=""
                              />
                              <h3>No user found</h3>
                            </figure>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="row">
                        {users.map((item, i) => (
                          <div className="subject-card col-lg-4" key={i}>
                            <div
                              className={`admin-box1 mt-0 mb-3 w-100 h-auto p-4 ${
                                !item.isActive ? "border border-danger" : ""
                              }`}
                            >
                              <div className="d-flex">
                                <div>
                                  <figure className="user_img_circled_wrap m-0">
                                    <img
                                      src={avatar(item)}
                                      alt=""
                                      className="user_img_circled"
                                    />
                                  </figure>
                                </div>
                                <div className="ml-2">
                                  <div className="admin-user-info ml-0 mt-0">
                                    <div className="cArDnameUser">
                                      {item.name}
                                    </div>
                                    <div className="cArDroleUser">
                                      {item.role}{" "}
                                      <span className="cArDMail_phn">
                                        {settings?.requiredUserFields
                                          .rollNumber && item.rollNumber
                                          ? item.rollNumber
                                          : null}
                                      </span>
                                    </div>
                                    <div className="cArDMail_phn">
                                      {item.userId
                                        ? item.userId
                                        : item.phoneNumber}
                                    </div>
                                  </div>
                                  <div className="dropdown-edit-delete drop_edit_new-delete">
                                    <div className="dropdown">
                                      <a
                                        role="button"
                                        id="dropdown-profile-box-btn"
                                        data-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                      >
                                        <span className="material-icons">
                                          more_vert
                                        </span>
                                      </a>
                                      <ul
                                        className="dropdown-menu dropdown-menu-right py-0 border-0"
                                        aria-labelledby="dropdown-profile-box-btn"
                                      >
                                        <li>
                                          <a
                                            onClick={() =>
                                              openModal("editUser", 2, item)
                                            }
                                          >
                                            <span
                                              style={{ marginRight: "6px" }}
                                            >
                                              <i className="fas fa-edit"></i>
                                            </span>
                                            Edit
                                          </a>
                                        </li>
                                        {item._id !== currentUser._id && (
                                          <li>
                                            <a
                                              onClick={() =>
                                                changeStatus(item, i)
                                              }
                                            >
                                              <span
                                                style={{ marginRight: "9px" }}
                                              >
                                                <i className="fas fa-save"></i>
                                              </span>
                                              {item.isActive
                                                ? "Deactivate"
                                                : "Activate"}
                                            </a>
                                          </li>
                                        )}
                                        <li>
                                          <a
                                            onClick={() =>
                                              openModal(
                                                "passManagement",
                                                3,
                                                item
                                              )
                                            }
                                          >
                                            <span
                                              style={{ marginRight: "9px" }}
                                            >
                                              <i className="fa fa-key"></i>
                                            </span>
                                            Manage password
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href={`/recent-activity/${item._id}`}
                                          >
                                            <span
                                              style={{ marginRight: "9px" }}
                                            >
                                              <i className="fa fa-tasks"></i>
                                            </span>
                                            Recent Activity
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {users.length < 1 && (
                          <div className="col-lg-12 empty-data">
                            <figure>
                              <img
                                src="/assets/images/userEmptyPageImage.svg"
                                alt=""
                              />
                              <h3>
                                {!isAfterSearch
                                  ? "Search user to manage"
                                  : "No user found"}
                              </h3>
                            </figure>
                          </div>
                        )}
                      </div>
                    )}

                    {totalStudents > filterParams.limit && (
                      <div className="text-center mt-3">
                        <div className="d-inline-block">
                          <CustomPagination
                            totalItems={totalStudents}
                            limit={filterParams.limit}
                            currentPage={filterParams.page}
                            onPageChange={(e) => onPageChanged(e)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        show={addUserModal}
        onHide={() => {
          setAddUserModal(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <div role="document">
          <div className="modal-content form-boxes">
            <div className="modal-header modal-header-bg justify-content-center">
              <h6 className="form-box_title">Add User </h6>
            </div>
            <div className="modal-body admiN_ModAlAlL cusTomMargin_modalAlL">
              <div>
                {errors.map((err, i) => (
                  <p className="label label-danger text-danger" key={i}>
                    {err}
                  </p>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div style={{ display: "none" }}>
                  <input
                    type="file"
                    onChange={(e) => onFileSelected(e.target.files)}
                    name="user_profile_image"
                    accept="image/*"
                  />
                </div>
                <div className="row mb-2">
                  <div className="col-auto">
                    <div className="profile-user_with_edit">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={avatar(user)}
                          alt=""
                          className="user_img_circled"
                        />
                        <img
                          style={{ zIndex: "0" }}
                          src="/assets/images/profile-edit1.png"
                          alt=""
                          className="ah-cursor edit_image"
                          onClick={() =>
                            document
                              .querySelector('input[name="user_profile_image"]')
                              .click()
                          }
                        />
                      </figure>
                    </div>
                  </div>

                  <div className="col">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">Name</h4>
                      <input
                        type="text"
                        maxLength="60"
                        placeholder="Enter Name"
                        name="name"
                        value={user.name}
                        onChange={(e) => {
                          setUser({
                            ...user,
                            name: e.target.value,
                          });
                        }}
                        required
                        pattern="^[a-zA-Z'& ]*$"
                        className={`form-control ${
                          !user.name ? "is-invalid" : ""
                        }`}
                      />
                      <hr />
                      {/* {user?.name?.length > 0 && !user.name && (
                        <p className="label label-danger text-danger">
                          Name is required
                        </p>
                      )} */}
                      {user?.name?.length > 60 && (
                        <p className="label label-danger text-danger">
                          Name must be smaller than 60 characters
                        </p>
                      )}
                      {!/^[a-zA-Z'& ]*$/.test(user.name) && (
                        <p className="label label-danger text-danger">
                          Name contains invalid characters.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">
                        Email OR Phone Number
                      </h4>
                      <input
                        required
                        name="userId"
                        value={user.userId}
                        onChange={(e) => {
                          setUser({
                            ...user,
                            userId: e.target.value,
                          });
                        }}
                        // pattern="^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$"
                        placeholder="Email or Phone Number"
                        type="text"
                        className={`form-control ${
                          !user.userId ||
                          !/^[^<>()[\]\\.,;:\s@\"]+@[^<>()[\]\\.,;:\s@\"]+\.[^<>()[\]\\.,;:\s@\"]+$|^\d{10}$/.test(
                            user.userId
                          )
                            ? "is-invalid"
                            : ""
                        }`}
                      />
                      <hr />
                      {/* {!user.userId && (
                        <p className="label label-danger text-danger">
                          Email or Phone Number is required
                        </p>
                      )} */}
                      {user.userId &&
                        !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/.test(
                          user.userId
                        ) && (
                          <p className="label label-danger text-danger">
                            Invalid email or phone number entered.
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">Role</h4>
                      <select
                        className="form-control"
                        name="role"
                        value={user.role || ""}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            role: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select Role
                        </option>
                        {currentUser.role === "publisher" ? (
                          <>
                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}

                            {settings?.roles.support && (
                              <option value="support">Support</option>
                            )}
                            {settings?.roles.operator && (
                              <option value="operator">Operator</option>
                            )}
                          </>
                        ) : currentUser.role === "admin" ? (
                          <>
                            <option value="student">Student</option>
                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}
                            {settings?.roles.mentor && (
                              <option value="mentor">Parent/Mentor</option>
                            )}
                            {settings?.roles.publisher && (
                              <option value="publisher">Publisher</option>
                            )}
                            {settings?.roles.support && (
                              <option value="support">Support</option>
                            )}
                            {settings?.roles.operator && (
                              <option value="operator">Operator</option>
                            )}
                            {settings?.roles.director &&
                              currentUser.role === "director" && (
                                <option value="director">Director</option>
                              )}
                            {currentUser.role === "admin" && (
                              <>
                                {settings?.roles.director && (
                                  <option value="director">Director</option>
                                )}
                                <option value="admin">Admin</option>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {settings?.roles.student && (
                              <option value="student">Student</option>
                            )}

                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}
                            {settings?.roles.director && (
                              <option value="director">Director</option>
                            )}
                          </>
                        )}
                      </select>
                      <hr />
                    </div>
                  </div>
                </div>
                {user.role !== "teacher" && (
                  <div className="class-board-info mb-2">
                    <h4 className="form-box_subtitle mb-0">
                      Which program is this user enrolled for?
                    </h4>
                    <div className="border-bottom">
                      <Multiselect
                        options={programList}
                        selectedValues={user.programs}
                        onSelect={(e) => setUser({ ...user, programs: e })}
                        onRemove={(e) => setUser({ ...user, programs: e })}
                        displayValue="name"
                        placeholder="Select one or more programs"
                        // style={styleForMultiSelect}
                        showArrow={true}
                      />
                    </div>
                  </div>
                )}
                {user.role == "teacher" && (
                  <div className="class-board-info mb-2">
                    <h4 className="form-box_subtitle mb-0">
                      Which subject is this user enrolled for?
                    </h4>
                    <div className="border-bottom">
                      <Multiselect
                        options={subjectList}
                        selectedValues={user.subjects}
                        onSelect={(e) => setUser({ ...user, subjects: e })}
                        onRemove={(e) => setUser({ ...user, subjects: e })}
                        displayValue="name"
                        placeholder="Select one or more subjects"
                        // style={styleForMultiSelect}
                        showArrow={true}
                      />
                    </div>
                  </div>
                )}
                {currentUser.role === "admin" &&
                  (!user.role || user.role != "publisher") && (
                    <div className="class-board-info mb-2">
                      <h4 className="form-box_subtitle mb-0">
                        From which location is this user ?
                      </h4>
                      <div className="border-bottom">
                        <Multiselect
                          options={locationList}
                          selectedValues={user.locations}
                          onSelect={(e) => setUser({ ...user, locations: e })}
                          onRemove={(e) => setUser({ ...user, locations: e })}
                          displayValue="name"
                          placeholder="Enter location"
                          // style={styleForMultiSelect}
                          showArrow={true}
                        />
                      </div>
                    </div>
                  )}
                {user.role == "student" && (
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="class-board-info">
                        <h4 className="form-box_subtitle mb-0">
                          Date of Birth
                        </h4>
                        <div className="date">
                          <DatePicker
                            selected={user.birthdate}
                            onChange={(date) =>
                              setUser({
                                ...user,
                                birthdate: date,
                              })
                            }
                            minDate={minDob}
                            maxDate={maxDob}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Enter Date of Birth"
                            className="form-control border-0 p-0"
                          />
                          <hr />
                        </div>
                      </div>
                    </div>

                    {settings?.requiredUserFields.registrationNo && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Registration Number
                          </h4>
                          <input
                            type="text"
                            placeholder="Enter Registration Number"
                            value={user.registrationNo}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                registrationNo: e.target.value,
                              })
                            }
                            maxLength="100"
                            className="form-control"
                          />
                          <hr />
                        </div>
                      </div>
                    )}

                    {settings?.requiredUserFields.rollNumber && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Roll Number
                          </h4>
                          <input
                            type="text"
                            placeholder="Enter roll number"
                            value={user.rollNumber}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                rollNumber: e.target.value,
                              })
                            }
                            maxLength="100"
                            className="form-control"
                          />
                          <hr />
                        </div>
                      </div>
                    )}

                    {settings?.requiredUserFields.passingYear && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Passing Year
                          </h4>
                          <select
                            className="form-control"
                            value={user.passingYear || ""}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                passingYear: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            {masterData?.passingYear.map((year) => (
                              <option key={year.name} value={year.name}>
                                {year.name}
                              </option>
                            ))}
                          </select>
                          <hr />
                        </div>
                      </div>
                    )}

                    {/* {settings?.features.timeAccommodation && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Time Accommodation
                          </h4>
                          <select
                            className="form-control"
                            value={user.timeAccommodation}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                timeAccommodation: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select Time Accommodation
                            </option>
                            <option value="0">None</option>
                            <option value="50">Time and One-Half (50%)</option>
                            <option value="100">Time and Double (100%)</option>
                          </select>
                          <hr />
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
                {(user.role == "teacher" ||
                  user.role == "mentor" ||
                  user.role == "publisher") && (
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="class-board-info">
                        <div className="d-flex align-items-center">
                          <h4 className="form-box_subtitle mb-0">
                            Identity verified?
                          </h4>
                          <div
                            className="switch-item mt-0 float-none ml-auto d-block"
                            style={{ zIndex: "0" }}
                          >
                            <label className="switch my-0">
                              <input
                                type="checkbox"
                                checked={user.isVerified}
                                onChange={(e) =>
                                  setUser({
                                    ...user,
                                    isVerified: e.target.checked,
                                  })
                                }
                                name="isVerified"
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="class-board-info">
                  <h4 className="form-box_subtitle mb-0">Password</h4>
                  <div className="d-flex align-items-center">
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control border-bottom flex-grow-1"
                      value={user.password}
                      onChange={(e) => {
                        setUser({
                          ...user,
                          password: e.target.value,
                        });
                      }}
                      minLength={8}
                      maxLength={20}
                      name="password"
                      placeholder="Keep empty to let system generate"
                      autoComplete="new-password"
                      pattern="(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*"
                    />
                    <a onClick={() => setShowPass(!showPass)}>
                      <i
                        className={`far ${
                          showPass ? "fa-eye" : "fa-eye-slash"
                        }`}
                      ></i>
                    </a>
                  </div>

                  {user?.password?.length > 0 && ( // Display errors only if the password field is touched or submitted
                    <div className="mt-2">
                      {(user?.password?.length < 8 ||
                        user?.password?.length > 20) && (
                        <p className="label label-danger text-danger">
                          Password must be 8-20 characters.
                        </p>
                      )}
                      {!/(?=.*\d)(?=.*[A-Za-z])/.test(user?.password) && (
                        <p className="label label-danger text-danger">
                          Password must contain at least one number and one
                          alphabet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <label className="container2">
                    <h4 className="form-box_subtitle mb-0">
                      Force user to change password
                    </h4>
                    <input type="checkbox" name="forcePasswordReset" />
                    <span className="checkmark1 translate-middle-y"></span>
                  </label>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={() => cancel("addUser")}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary ml-2"
                    type="submit"
                    onClick={saveUser}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={edigUserModal}
        onHide={() => {
          setEditUserModal(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <div role="document">
          <div className="modal-content form-boxes">
            <div className="modal-header modal-header-bg justify-content-center">
              <h6 className="form-box_title">Edit User </h6>
            </div>
            <div className="modal-body admiN_ModAlAlL cusTomMargin_modalAlL">
              <div>
                {errors.map((err, i) => (
                  <p className="label label-danger text-danger" key={i}>
                    {err}
                  </p>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div style={{ display: "none" }}>
                  <input
                    type="file"
                    onChange={(e) => onFileSelected(e.target.files)}
                    name="user_profile_image"
                    accept="image/*"
                  />
                </div>
                <div className="row mb-2">
                  <div className="col-auto">
                    <div className="profile-user_with_edit">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={avatar(user)}
                          alt=""
                          className="user_img_circled"
                        />
                        <img
                          style={{ zIndex: "0" }}
                          src="/assets/images/profile-edit1.png"
                          alt=""
                          className="ah-cursor edit_image"
                          onClick={() =>
                            document
                              .querySelector('input[name="user_profile_image"]')
                              .click()
                          }
                        />
                      </figure>
                    </div>
                  </div>

                  <div className="col">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">Name</h4>
                      <input
                        type="text"
                        maxLength="60"
                        placeholder="Enter Name"
                        name="name"
                        value={user.name}
                        onChange={(e) => {
                          setUser({
                            ...user,
                            name: e.target.value,
                          });
                        }}
                        required
                        pattern="^[a-zA-Z'& ]*$"
                        className={`form-control ${
                          !user.name ? "is-invalid" : ""
                        }`}
                      />
                      <hr />
                      {/* {user?.name?.length > 0 && !user.name && (
                        <p className="label label-danger text-danger">
                          Name is required
                        </p>
                      )} */}
                      {user?.name?.length > 60 && (
                        <p className="label label-danger text-danger">
                          Name must be smaller than 60 characters
                        </p>
                      )}
                      {!/^[a-zA-Z'& ]*$/.test(user.name) && (
                        <p className="label label-danger text-danger">
                          Name contains invalid characters.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">
                        Email OR Phone Number
                      </h4>
                      <input
                        required
                        name="userId"
                        value={user.userId}
                        onChange={(e) => {
                          setUser({
                            ...user,
                            userId: e.target.value,
                          });
                        }}
                        // pattern="^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$"
                        placeholder="Email or Phone Number"
                        type="text"
                        className={`form-control ${
                          !user.userId ||
                          !/^[^<>()[\]\\.,;:\s@\"]+@[^<>()[\]\\.,;:\s@\"]+\.[^<>()[\]\\.,;:\s@\"]+$|^\d{10}$/.test(
                            user.userId
                          )
                            ? "is-invalid"
                            : ""
                        }`}
                      />
                      <hr />
                      {/* {!user.userId && (
                        <p className="label label-danger text-danger">
                          Email or Phone Number is required
                        </p>
                      )} */}
                      {user.userId &&
                        !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/.test(
                          user.userId
                        ) && (
                          <p className="label label-danger text-danger">
                            Invalid email or phone number entered.
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="class-board-info">
                      <h4 className="form-box_subtitle mb-0">Role</h4>
                      <select
                        className="form-control"
                        name="role"
                        value={user.role || ""}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            role: e.target.value,
                          })
                        }
                        disabled={user?.role == "student"}
                        required
                      >
                        <option value="" disabled>
                          Select Role
                        </option>
                        {currentUser.role === "publisher" ? (
                          <>
                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}

                            {settings?.roles.support && (
                              <option value="support">Support</option>
                            )}
                            {settings?.roles.operator && (
                              <option value="operator">Operator</option>
                            )}
                          </>
                        ) : currentUser.role === "admin" ? (
                          <>
                            <option value="student">Student</option>
                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}
                            {settings?.roles.mentor && (
                              <option value="mentor">Parent/Mentor</option>
                            )}
                            {settings?.roles.publisher && (
                              <option value="publisher">Publisher</option>
                            )}
                            {settings?.roles.support && (
                              <option value="support">Support</option>
                            )}
                            {settings?.roles.operator && (
                              <option value="operator">Operator</option>
                            )}
                            {settings?.roles.director &&
                              currentUser.role === "director" && (
                                <option value="director">Director</option>
                              )}
                            {currentUser.role === "admin" && (
                              <>
                                {settings?.roles.director && (
                                  <option value="director">Director</option>
                                )}
                                <option value="admin">Admin</option>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {settings?.roles.student && (
                              <option value="student">Student</option>
                            )}

                            {settings?.roles.teacher && (
                              <option value="teacher">Teacher</option>
                            )}
                            {settings?.roles.director && (
                              <option value="director">Director</option>
                            )}
                          </>
                        )}
                      </select>
                      <hr />
                    </div>
                  </div>
                </div>
                {user.role !== "teacher" && (
                  <div className="class-board-info mb-2">
                    <h4 className="form-box_subtitle mb-0">
                      Which program is this user enrolled for?
                    </h4>
                    <div className="border-bottom LibraryChange_new">
                      <Multiselect
                        options={programList}
                        selectedValues={user.programs}
                        onSelect={(e) => setUser({ ...user, programs: e })}
                        onRemove={(e) => setUser({ ...user, programs: e })}
                        displayValue="name"
                        placeholder="Select one or more programs"
                        className="multiSelectLocCls"
                        // style={styleForMultiSelect}
                        showArrow={true}
                      />
                    </div>
                  </div>
                )}
                {user.role == "teacher" && (
                  <div className="class-board-info mb-2">
                    <h4 className="form-box_subtitle mb-0">
                      Which subject is this user enrolled for?
                    </h4>
                    <div className="border-bottom rounded-0 custom LibraryChange_new">
                      <Multiselect
                        options={subjectList}
                        selectedValues={user.subjects}
                        onSelect={(e) => setUser({ ...user, subjects: e })}
                        onRemove={(e) => setUser({ ...user, subjects: e })}
                        displayValue="name"
                        placeholder="Select one or more subjects"
                        // style={styleForMultiSelect}
                        showArrow={true}
                      />
                    </div>
                  </div>
                )}
                {currentUser.role === "admin" &&
                  (!user.role || user.role != "publisher") && (
                    <div className="class-board-info mb-2">
                      <h4 className="form-box_subtitle mb-0">
                        From which location is this user ?
                      </h4>
                      <div className="border-bottom">
                        <Multiselect
                          options={locationList}
                          selectedValues={user.locations}
                          onSelect={(e) => setUser({ ...user, locations: e })}
                          onRemove={(e) => setUser({ ...user, locations: e })}
                          displayValue="name"
                          placeholder="Enter location"
                          // style={styleForMultiSelect}
                          showArrow={true}
                        />
                      </div>
                    </div>
                  )}

                {user.role == "student" && (
                  <div className="row">
                    {settings?.requiredUserFields.registrationNo && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Registration Number
                          </h4>
                          <input
                            type="text"
                            placeholder="REG34562021"
                            value={user.registrationNo}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                registrationNo: e.target.value,
                              })
                            }
                            maxLength="100"
                            className="form-control"
                          />
                          <hr />
                        </div>
                      </div>
                    )}
                    <div className="col-lg-6">
                      <div className="class-board-info">
                        <h4 className="form-box_subtitle mb-0">
                          Date of Birth
                        </h4>
                        <div className="date">
                          <DatePicker
                            selected={user.birthdate ? user.birthdate : null}
                            onChange={(date) =>
                              setUser({
                                ...user,
                                birthdate: date,
                              })
                            }
                            minDate={minDob}
                            maxDate={maxDob}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Enter Date of Birth"
                            className="form-control border-0 p-0"
                          />
                          <hr />
                        </div>
                      </div>
                    </div>

                    {settings?.requiredUserFields.rollNumber && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Roll Number
                          </h4>
                          <input
                            type="text"
                            placeholder="Enter roll number"
                            value={user.rollNumber}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                rollNumber: e.target.value,
                              })
                            }
                            maxLength="100"
                            className="form-control"
                          />
                          <hr />
                        </div>
                      </div>
                    )}

                    {settings?.requiredUserFields.placementStatus && (
                      <div className="col-lg-6">
                        <h4 className="form-box_subtitle mb-0">
                          Describe this user&apos;s placement status
                        </h4>
                        <select
                          className="form-control"
                          name="placementStatus"
                          value={user.placementStatus || ""}
                          onChange={(e) =>
                            setUser({
                              ...user,
                              placementStatus: e.target.value,
                            })
                          }
                        >
                          <option value="" style={{ display: "none" }}></option>
                          <option value="placed">Placed</option>
                          <option value="optedOut">Opted Out</option>
                          <option value="locked">Locked</option>
                          <option value="placementReady">
                            Placement Ready
                          </option>
                          <option value="unqualified">Unqualified</option>
                        </select>
                        <hr />
                      </div>
                    )}

                    {settings?.requiredUserFields.passingYear && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Passing Year
                          </h4>
                          <select
                            className="form-control"
                            value={user.passingYear || ""}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                passingYear: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            {masterData?.passingYear.map((year) => (
                              <option key={year.name} value={year.name}>
                                {year.name}
                              </option>
                            ))}
                          </select>
                          <hr />
                        </div>
                      </div>
                    )}

                    {/* {settings?.features.timeAccommodation && (
                      <div className="col-lg-6">
                        <div className="class-board-info">
                          <h4 className="form-box_subtitle mb-0">
                            Time Accommodation
                          </h4>
                          <select
                            className="form-control"
                            value={user.timeAccommodation}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                timeAccommodation: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select Time Accommodation
                            </option>
                            <option value="0">None</option>
                            <option value="50">Time and One-Half (50%)</option>
                            <option value="100">Time and Double (100%)</option>
                          </select>
                          <hr />
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
                {(user.role == "teacher" ||
                  user.role == "mentor" ||
                  user.role == "publisher") && (
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="class-board-info">
                        <div className="d-flex align-items-center">
                          <h4 className="form-box_subtitle mb-0">
                            Identity verified?
                          </h4>
                          <div
                            className="switch-item mt-0 float-none ml-auto d-block"
                            style={{ zIndex: "0" }}
                          >
                            <label className="switch my-0">
                              <input
                                type="checkbox"
                                checked={user.isVerified}
                                onChange={(e) =>
                                  setUser({
                                    ...user,
                                    isVerified: e.target.checked,
                                  })
                                }
                                name="isVerified"
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row mt-2">
                  <div className="col-lg-6">
                    <label className="container2">
                      <h4 className="form-box_subtitle mb-0">
                        Force user to change password
                      </h4>
                      <input
                        type="checkbox"
                        name="forcePasswordReset"
                        value={user.forcePasswordReset}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            forcePasswordReset: e.target.checked,
                          })
                        }
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                  </div>
                  {user.role === "director" && currentUser.role === "admin" && (
                    <div className="col-lg-6">
                      <div className="d-flex align-items-center">
                        <span className=" switch-item-label">
                          Allow multiple institutes
                        </span>
                        <div
                          className="switch-item mt-0 float-none ml-4 d-block"
                          style={{ zIndex: "0" }}
                        >
                          <label className="switch my-0">
                            <input
                              type="checkbox"
                              checked={user.canCreateMultiLocations}
                              onChange={(e) =>
                                setUser({
                                  ...user,
                                  canCreateMultiLocations: e.target.checked,
                                })
                              }
                              name="chkMultiLoc"
                            />
                            <span className="slider round translate-middle-y"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentUser.primaryInstitute?.activeOpenAI &&
                    user.role == "teacher" && (
                      <div className="col">
                        <div className="class-board-info">
                          <div className="d-flex align-items-center">
                            <h4 className="form-box_subtitle mb-0">
                              Access to Generative AI
                            </h4>
                            <div className="switch-item mt-0 float-none ml-auto d-block">
                              <label className="switch my-0">
                                <input
                                  type="checkbox"
                                  checked={user.openAI}
                                  onChange={(e) =>
                                    setUser({
                                      ...user,
                                      openAI: e.target.checked,
                                    })
                                  }
                                  name="openAI"
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <div className="row mt-2 align-items-center">
                  {user.provider === "local" && user.createdBy && (
                    <div className="col">
                      <em>
                        Added by {user.createdBy.name}{" "}
                        {moment(user.createdAt).fromNow()}
                      </em>
                    </div>
                  )}
                  {user.provider !== "local" && (
                    <div className="col">
                      <em>
                        Registered with {user.provider}{" "}
                        {moment(user.createdAt).fromNow()}
                      </em>
                    </div>
                  )}
                  <div className="col text-right">
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => cancel("editUser")}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary ml-2"
                      onClick={() => updateUser()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={timeAccommodationModal}
        onHide={() => {
          setTimeAccommodationModal(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <div role="document">
          <div className="modal-content form-boxes">
            <div className="modal-header modal-header-bg justify-content-center">
              <h6 className="form-box_title">Manage Time Accommodations</h6>
            </div>
            <div className="modal-body admiN_ModAlAlL cusTomMargin_modalAlL">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mt-1">
                  <h6 className="form-box_subtitle mb-0">
                    Reading: Extended Time
                  </h6>
                  <select
                    className="form-control border"
                    name="reading"
                    value={timeAccommodation.reading}
                    onChange={(e) => {
                      setTimeAccommodation({
                        ...timeAccommodation,
                        reading: e.target.value,
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select Time Accommodation
                    </option>
                    <option value={0}>None</option>
                    <option value={50}>Time and One-Half (50%)</option>
                    <option value={100}>Time and Double (100%)</option>
                  </select>
                </div>

                <div className="mt-3">
                  <h4 className="form-box_subtitle mb-0">
                    Math: Extended Time
                  </h4>
                  <select
                    className="form-control border"
                    name="math"
                    value={timeAccommodation.math}
                    onChange={(e) => {
                      setTimeAccommodation({
                        ...timeAccommodation,
                        math: e.target.value,
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select Time Accommodation
                    </option>
                    <option value={0}>None</option>
                    <option value={50}>Time and One-Half (50%)</option>
                    <option value={100}>Time and Double (100%)</option>
                  </select>
                </div>

                <div className="mt-3">
                  <h4 className="form-box_subtitle mb-0">Breaks</h4>
                  <div className="">
                    {["extra", "extended", "normal"].map((option) => (
                      <div
                        className="d-flex align-items-center my-2"
                        key={option}
                      >
                        <div className="container1 my-0">
                          <div className="radio my-0">
                            <input
                              type="radio"
                              value={option}
                              name="break"
                              id={option}
                              checked={timeAccommodation.break === option}
                              onChange={(e) => {
                                setTimeAccommodation({
                                  ...timeAccommodation,
                                  math: e.target.checked,
                                });
                              }}
                            />
                            <label htmlFor={option} className="my-0"></label>
                          </div>
                        </div>
                        <div className="rights mt-0">
                          {option.charAt(0).toUpperCase() + option.slice(1)}{" "}
                          Breaks
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row mt-2 align-items-center">
                  <div className="col text-right">
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => cancel("timeAccomandation")}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary ml-2"
                      onClick={() => updateTimeAcc()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={passManagement}
        onHide={() => {
          setPassManagement(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <div role="document">
          <div className="modal-content form-boxes">
            <div className="modal-header modal-header-bg justify-content-center">
              <h4 className="form-box_title">Manage Password</h4>
            </div>
            <div className="modal-body admiN_ModAlAlL cusTomMargin_modalAlL PassWdsManagment">
              <form onSubmit={(e) => e.preventDefault()}>
                <div>
                  <h4 className="form-box_subtitle mb-0">New Password</h4>
                  {errors.length > 0 && (
                    <div type="danger">
                      {errors.map((error, index) => (
                        <p
                          key={index}
                          className="label label-danger text-danger"
                        >
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="d-flex align-items-center">
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control border-bottom flex-grow-1"
                      required
                      name="password"
                      minLength="8"
                      maxLength="20"
                      placeholder="Password"
                      value={user.password}
                      onChange={(e) => {
                        setUser({
                          ...user,
                          password: e.target.value,
                        });
                      }}
                      pattern="(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*"
                    />
                    <a onClick={() => setShowPass(!showPass)}>
                      <i
                        className={`far ${
                          showPass ? "fa-eye" : "fa-eye-slash"
                        }`}
                      ></i>
                    </a>
                  </div>
                  {user.password &&
                    !user.password.match(
                      /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*$/
                    ) && (
                      <div className="mt-2">
                        <p className="label label-danger text-danger">
                          New Password must be 8-20 characters with at least one
                          number and one alphabet.
                        </p>
                      </div>
                    )}
                </div>

                <div className="mt-2">
                  <label className="container2">
                    <h4 className="form-box_subtitle mb-0">
                      Force user to change password
                    </h4>
                    <input
                      type="checkbox"
                      name="forcePasswordReset"
                      checked={user.forcePasswordReset}
                      onChange={(e) => {
                        setUser({
                          ...user,
                          forcePasswordReset: e.target.checked,
                        });
                      }}
                    />
                    <span className="checkmark1 translate-middle-y"></span>
                  </label>
                </div>

                {user?.emailVerifyToken && (
                  <div className="admin-user-head p-0 m-0">
                    <div className="d-flex align-items-center">
                      <h4 className="form-box_subtitle mb-0 mr-3">
                        Confirmation Code
                      </h4>
                      <span className="question-tag">
                        {user?.emailVerifyToken}
                      </span>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={() => cancel("passManagement")}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary ml-2" onClick={updateUser}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
