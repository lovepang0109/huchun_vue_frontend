import React, { useState, useEffect, useRef } from "react";
import * as courseService from "@/services/courseService";
import * as classroomService from "@/services/classroomService";
import * as chatSvc from "@/services/chatService";
import * as studentService from "@/services/student-service";
import * as serviceSvc from "@/services/suportService";
import { alert, success, error, confirm } from "alertifyjs";
import { slugify } from "@/lib/validator";
import { jsonToCsv } from "@/lib/common";
import { copyText } from "@/lib/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import moment from "moment";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
const ClassroomStudents = ({ classroom, settings, user }: any) => {
  const [members, setMembers] = useState<any>([]);
  const [membersLoaded, setMembersLoaded] = useState<any>(false);
  const [searchText, setSearchText] = useState<any>("");
  const [clsCourse, setClsCourse] = useState<any>({});
  const [userOnlineStatus, setUserOnlineStatus] = useState<any>({});
  const [params, setParams] = useState<any>({
    limit: 15,
    page: 1,
    classRoom: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<any>("active");
  const [studentParams, setStudentParams] = useState<any>({
    limit: 10,
    page: 1,
    status: "active",
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [temp, setTemp] = useState<any>({});
  const [switchValue, setSwitchValue] = useState<any>({
    type: "email",
    selectedCountry: "in",
    defaultCountry: "in",
    countryCodes: ["in"],
    errors: null,
  });
  const [totalStudents, setTotalStudents] = useState<any>(0);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<any>({});
  const fileBrowseRef = useRef(null);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    courseService
      .getClassroomCourse(classroom._id, { stats: "published", limit: 1 })
      .then((dat) => {
        setClsCourse(dat[0]);
      });
    loadStudents();
  }, []);

  const loadStudents = (refresh = true, params?: any) => {
    let para = params;
    if (refresh) {
      setStudentParams({
        ...studentParams,
        page: 1,
      });
      if (params) {
        para = {
          ...para,
          page: 1,
        };
      }

      setTotalStudents(0);
      setMembers([]);

      classroomService.studentStats(classroom._id).then((res) => setStats(res));
    }
    setMembersLoaded(false);
    if (!params) {
      para = studentParams;
    }
    classroomService
      .getClassroomStudents(classroom._id, { ...para, count: refresh })
      .then(({ students, count }: any) => {
        if (refresh) {
          setTotalStudents(count);
        }
        students.forEach((d) => {
          d.userProgress = d.completedCourseContents + d.totalAttempt;
          d.total = d.totalPractice + d.allCourseContents;
          d.progress =
            d.total > 0 ? Math.round((d.userProgress / d.total) * 100) : 0;
        });

        if (refresh) {
          setMembers(students);
        } else {
          setMembers(members.concat(students));
        }

        setServicesFunc(students);
        setMembersLoaded(true);
      });
  };

  const loadMore = () => {
    setStudentParams({
      ...studentParams,
      page: studentParams.page + 1,
    });
    const params = {
      ...studentParams,
      page: studentParams.page + 1,
    };
    loadStudents(false, params);
  };

  const filterFunc = (filter: any) => {
    let parmasData: any;

    if (filter == "all") {
      delete studentParams.status;
    } else {
      parmasData = {
        ...parmasData,
        status: filter,
      };
      setStudentParams({
        ...studentParams,
        status: filter,
      });
    }
    loadStudents(true, parmasData);
  };

  const search = (text: string) => {
    setSearchText(text);
    let parmasData: any;
    if (text) {
      setIsSearch(true);
      parmasData = {
        ...studentParams,
        name: text,
      };
      setStudentParams({
        ...studentParams,
        name: text,
      });
    } else {
      setIsSearch(false);

      delete studentParams["name"];
      // delete parmasData['name']
    }
    if (selectedStatus == "all") {
      delete studentParams.status;
      // delete parmasData.status
    } else {
      parmasData = {
        ...parmasData,
        status: selectedStatus,
      };
      setStudentParams({
        ...studentParams,
        status: selectedStatus,
      });
    }
    loadStudents(true, parmasData);
  };

  const clearSearch = () => {
    setSearchText("");
    search("");
  };

  const setServicesFunc = (sList: any) => {
    const registeredUsers = sList.filter((r) => r.userData && r.userData._id);
    if (registeredUsers.length) {
      serviceSvc
        .getTaggingServicesForStudents(
          registeredUsers.map((r) => r.userData._id)
        )
        .then((serviceMap) => {
          for (const r of registeredUsers) {
            if (serviceMap[r.userData._id]) {
              r.services = serviceMap[r.userData._id].services;
            }
          }
        });
    }
  };
  const openChat = (studentId, name) => {
    // this.chatSvc.openChat(studentId, name)
  };
  const cancel = () => {
    setTemp({
      ...temp,
      email: "",
      phoneNumber: "",
    });
    setShowStudentModal(false);
  };

  const uploadStudentModal = (template: any) => {
    // this.modalRef = this.modalService.show(template);
    if (template === "addStudentModal") {
      setShowStudentModal(true);
    }

    if (template === "uploadStudentTemplate") {
      setShowUploadModal(true);
    }
  };

  const addStudent = (form: any) => {
    if (!temp.phoneNumber && switchValue.type === "phone") {
      alert("Message", "Please enter the phone number");
      return;
    }
    if (!temp.email && switchValue.type === "email") {
      alert("Message", "Please enter the email");
      return;
    }
    if (temp.email && temp.email === "" && switchValue.type === "email") {
      alert("Message", "Please enter the email");
      return;
    }
    if (
      temp.phoneNumber &&
      temp.phoneNumber.length < 10 &&
      switchValue.type === "phone"
    ) {
      alert("Message", "Please enter the correct phone number");
      return;
    }

    let itemAdd = "";
    if (switchValue.type === "email") {
      itemAdd = temp.email;
    }
    if (switchValue.type === "phone") {
      const phone = temp.phoneNumber.replace(/ /g, "").replace("+" + "91", "");

      itemAdd = phone;
    }
    studentService
      .checkAllowAdd({
        classroom: classroom._id,
        studentId: itemAdd,
      })
      .then((st) => {
        const student = {
          classRoom: classroom._id,
          studentUserId: itemAdd,
          isMentee: false,
          isMyCircle: false,
        };
        studentService
          .addStudent(student)
          .then((data) => {
            success(
              "Student added successfully. Now you can start Classroom Course"
            );
            cancel();
            loadStudents();
          })
          .catch((err) => {
            alert("Message", err.error[0].msg);
          });
      })
      .catch((err: any) => {
        alert("Message", err.response.data.message);
      });
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const upload = (file: any) => {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);

    formData.append("classRoom", classroom._id);
    formData.append("createdBy", user._id);
    formData.append("mentorEmail", user.userId);
    studentService
      .uploadStudent(formData)
      .then((data: any) => {
        // this.modalRef.hide();
        setShowUploadModal(false);
        setUploadFile({});
        if (data.addedStudentCount) {
          loadStudents();
        }

        if (data.totalStudentCount > data.addedStudentCount) {
          alert(
            "Message",
            "One or more validation issues found in the file. An email has been sent. Please review email, fix issues in the file and resubmit"
          );
        } else {
          if (data.notRegisterStudents) {
            alert(
              "Message",
              "One or more students don't exist in our platform. Please ask student to check email (including spam folder) and sign up on our platform. An email has been sent to each student in the list."
            );
          } else {
            success("Students added successfully. Now you can start course");
          }
        }
      })
      .catch((err) => {
        alert("Message", err.error);
      });
  };

  const exportCSV = () => {
    const csvFileName = slugify(classroom.name) + ".csv";

    const dataPush = [
      [
        "Student Name",
        "Email",
        "Status",
        "Last Activity",
        "Completed Contents",
        "Total Contents",
        "Progress (%)",
      ],
    ];

    // if this is individual classroom then send classroom id
    classroomService.getAllStudents(classroom._id, {}).then((data: any[]) => {
      setTimeout(() => {
        data.forEach((student: any) => {
          const tempArray = [];
          // student name
          if (!student.userData || !student.userData.name) {
            tempArray.push("");
          } else {
            tempArray.push(student.userData.name.toUpperCase());
          }

          // student userId
          tempArray.push(student.userId);

          if (!student.userData) {
            tempArray.push("pending");
          } else if (student.status) {
            tempArray.push("active");
          } else {
            tempArray.push("inactive");
          }

          // Added date
          if (student.userData?.lastLogin) {
            // tslint:disable-next-line:no-unused-expression
            tempArray.push(student.userData.lastLogin);
          } else {
            tempArray.push("");
          }

          tempArray.push(student.totalAttempt + student.completedContents);

          const totalContents = student.totalPractice + student.totalContents;

          tempArray.push(totalContents);

          let progress = 0;
          if (totalContents > 0) {
            progress = Math.round(
              ((student.totalAttempt + student.completedContents) /
                totalContents) *
                100
            );
          }
          tempArray.push(progress);

          dataPush.push(tempArray);
        });
        jsonToCsv(dataPush, csvFileName);
      }, 200);
    });
  };

  const isUserOnline = (user: any) => {
    if (!user) {
      return false;
    }

    // Get user online status
    chatSvc.userOnline(user).then((isOnline) => {
      userOnlineStatus[user] = isOnline;
      // user.asking = false;
      return isOnline;
    });
  };

  const removeError = (e: any) => {
    if (e.target.value == "") {
      setSwitchValue({
        ...switchValue,
        erros: null,
      });
    }
  };

  const remove = (student: any) => {
    confirm("Are you sure to remove this student from the classroom?", (ev) => {
      const studentParams = setStudentParamsFunc(student.userData);

      studentService.removeStudent(studentParams).then((data) => {
        success("Student has been removed successfully.");
        student.status = false;
        loadStudents();
      });
    });
  };

  const activate = (student: any) => {
    const studentParams = setStudentParamsFunc(student.userData);

    studentService.readdStudent(studentParams).then((data) => {
      success("Student has been re-added successfully.");
      student.status = true;
      loadStudents();
    });
  };

  const setStudentParamsFunc = (student: any) => {
    const studentParams: any = {};
    studentParams.classRoomId = classroom._id;
    // studentParams.autoAdd = student.autoAdd
    studentParams.className = classroom.name;
    studentParams.studentUserId = student.userId;
    if (student._id) {
      studentParams.studentId = student._id;
    }
    return studentParams;
  };

  const copyTextFunc = () => {
    copyText(classroom.seqCode);
    success("Successfully Copied");
  };

  const remindStudent = (student: any) => {
    classroomService
      .remindStudent(classroom._id, student.userData.userId)
      .then((res) => {
        success("New email has been sent to student.");
      });
  };

  const cancelInvitation = (student: any) => {
    confirm("Are you sure to cancel invitation for this student?", (ev) => {
      const studentParams = setStudentParamsFunc(student.userData);

      studentService.removeStudent(studentParams).then((data) => {
        success("Student has been removed successfully.");
        student.status = false;
        loadStudents();
      });
    });
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      <main className="pt-0">
        <div className="dashboard-area memberClassroomMain1 classroom mx-auto">
          <div className="rounded-boxes class-board bg-white">
            <div className="row align-items-center">
              <div className="col-md">
                <div className="square_profile_info d-flex align-items-center">
                  <div className="squared-rounded_wrap_80">
                    <img
                      src={classroom.imageUrl}
                      alt="classroom-img"
                      height={80}
                      width={100}
                    />
                  </div>

                  <div className="class-board-info assignment-top-detail ml-2">
                    <h3 className="top-title text-truncate">
                      {classroom.name}
                    </h3>
                    {stats && (
                      <div className="my-1">
                        <span>{stats.active} Active</span>
                        {" | "}
                        <span>{stats.deactive} Deleted</span>
                        {" | "}
                        <span>{stats.pending} Pending</span>
                      </div>
                    )}
                    <p className="bottom-title mt-1 d-flex">
                      <span
                        className="material-icons-two-tone"
                        style={{
                          fontFamily: "Material Icons",
                          fontSize: "14px",
                        }}
                      >
                        portrait
                      </span>
                      {classroom.user && (
                        <Link
                          href={`/public/profile/${classroom.user._id}`}
                          className="mr-2"
                        >
                          {classroom.user.name}
                        </Link>
                      )}
                      {classroom.user && classroom.user._id !== user._id && (
                        <a
                          href="#"
                          className="mr-3"
                          onClick={() =>
                            openChat(classroom.user._id, classroom.user.name)
                          }
                        >
                          <i className="fas fa-comments"></i>
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md">
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
                      placeholder="Search assessment or student"
                      name="txtSearch"
                      value={searchText}
                      onChange={(e) => search(e.target.value)}
                    />
                    {searchText !== "" && (
                      <span
                        className="search-pause"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "3px",
                        }}
                        onClick={() => {
                          setSearchText("");

                          search("");
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
            </div>
          </div>
          <div className="rounded-boxes folder-board bg-white">
            <div className="row">
              <div className="col-6">
                <span>Filter by status</span>
                <select
                  className="ml-2 border-top-0 border-left-0 border-right-0 outline-0"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    filterFunc(e.target.value);
                  }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="deleted">Deleted</option>
                </select>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;<b>{totalStudents}</b> student(s)
                </span>
              </div>

              <div className="col-lg-6 text-right">
                {(user.role === "admin" ||
                  classroom.user?._id === user._id ||
                  user.role === "support" ||
                  user.role === "director") && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => uploadStudentModal("addStudentModal")}
                    >
                      Add Students
                    </button>
                    <button
                      className="btn btn-outline ml-1"
                      onClick={() =>
                        uploadStudentModal("uploadStudentTemplate")
                      }
                    >
                      Upload
                    </button>
                    <button
                      className="btn btn-outline ml-1"
                      onClick={exportCSV}
                    >
                      <i className="fa fa-download"></i> Export Student Details
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="folder-area clearfix">
              {members && members.length > 0 && (
                <div className="table-responsive-md vertical-middle table-wrap">
                  <table className="table mb-0 memberDetailsClass1 ml-0">
                    <thead>
                      <tr>
                        <th className="border-0 tableClshead1 ml-50px d-block">
                          Name
                        </th>
                        <th className="border-0 tableClshead1">Status</th>
                        <th className="border-0 tableClshead1">Progress</th>
                        <th className="border-0 tableClshead1"></th>
                        <th className="border-0 tableClshead1"></th>
                        {settings?.features?.myPerformance && (
                          <th className="border-0 tableClshead1"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((mem, index) => (
                        <tr key={index}>
                          <td className="px-0">
                            <div className="d-flex align-items-center mb-0 p-0">
                              {mem.userData?._id ? (
                                <div className="p-0 border-0 clearfix d-flex align-items-center">
                                  <figure className="user_img_circled_wrap">
                                    {mem.userData.avatar > length ? (
                                      <img
                                        className="user_img_circled"
                                        src={`${mem.userData.avatar}`}
                                        alt="user-img"
                                      />
                                    ) : (
                                      <img
                                        className="user_img_circled"
                                        src="/assets/images/defaultProfile.png"
                                        alt="user-img"
                                      />
                                    )}
                                  </figure>
                                </div>
                              ) : (
                                <figure className="user_img_circled_wrap">
                                  <img
                                    className="user_img_circled"
                                    src={mem.userData.avatar}
                                    alt=""
                                  />
                                </figure>
                              )}

                              <div className="inner ml-2">
                                {mem.userData && (
                                  <div className="inners">
                                    <div className="d-flex align-items-center">
                                      {mem.userData.name && (
                                        <h4>{mem.userData.name}</h4>
                                      )}
                                      {mem.services && (
                                        <div className="d-flex align-items-center">
                                          {mem.services.map(
                                            (service, index) => (
                                              <span
                                                key={index}
                                                className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                                container="body"
                                                tooltip={`Membership: ${
                                                  service.title
                                                } (${service.duration} ${
                                                  service.durationUnit
                                                } ${
                                                  service.duration > 1
                                                    ? "s"
                                                    : ""
                                                })`}
                                              ></span>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {mem.userData.userId && (
                                      <p>{mem.userData.userId}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {!mem.userData._id && <h4>Pending</h4>}
                            {mem.userData._id && mem.status && <h4>Active</h4>}
                            {mem.userData._id && !mem.status && (
                              <h4>Deleted</h4>
                            )}
                            <div>Added {moment(mem.createdAt).fromNow()}</div>
                            {mem.invitationCode && (
                              <div>
                                <i
                                  className={
                                    mem.invitationCode.length === 6
                                      ? "far fa-circle"
                                      : "fas fa-circle"
                                  }
                                ></i>
                                <span>&nbsp;{mem.invitationCode}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="progresss">
                              {mem.userProgress > 0 ? (
                                <h4>
                                  <strong>
                                    {mem.userProgress}/{mem.total} (
                                    {mem.progress}%)
                                  </strong>
                                </h4>
                              ) : (
                                <h4>
                                  <strong>No Progress Yet</strong>
                                </h4>
                              )}

                              {mem.userData?.lastLogin && (
                                <p>
                                  Last activity{" "}
                                  {moment(mem.userData.lastLogin).fromNow()}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="text-right">
                            {mem.userData._id &&
                              (user.role === "admin" ||
                                user.role === "director" ||
                                classroom.user?._id === user._id) && (
                                <>
                                  {mem.status ? (
                                    <a
                                      className="btn btn-danger btn-sm btn-block"
                                      onClick={() => remove(mem)}
                                    >
                                      Remove
                                    </a>
                                  ) : (
                                    <a
                                      className="btn btn-warning btn-sm btn-block"
                                      onClick={() => activate(mem)}
                                    >
                                      Re-Add
                                    </a>
                                  )}
                                </>
                              )}
                            {!mem.userData._id &&
                              (user.role === "admin" ||
                                user.role === "director" ||
                                classroom.user?._id === user._id) && (
                                <a
                                  className="btn btn-danger btn-sm btn-block"
                                  onClick={() => cancelInvitation(mem)}
                                >
                                  Cancel
                                </a>
                              )}
                          </td>
                          <td className="text-right">
                            {mem.userData?._id && (
                              <a
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  openChat(mem.userData._id, mem.userData.name)
                                }
                              >
                                Message
                              </a>
                            )}
                            {!mem.userData?._id && (
                              <a
                                className="btn btn-outline btn-sm"
                                onClick={() => remindStudent(mem)}
                              >
                                Remind
                              </a>
                            )}
                          </td>

                          {settings?.features?.myPerformance && (
                            <td className="text-right">
                              {mem.userData?._id && (
                                <Link
                                  className="btn btn-primary btn-sm"
                                  href={`/student-performance/${mem.userData._id}`}
                                >
                                  View Overall Performance
                                </Link>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!membersLoaded && (
              <>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                </div>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                </div>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                </div>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                </div>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                </div>
                <div className="my-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                </div>
              </>
            )}
            {members &&
              members.length > 0 &&
              members.length < totalStudents && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={loadMore}
                  >
                    Load More
                  </button>
                </div>
              )}

            {membersLoaded && (!members || !members.length > 0) && (
              <div className="empty-data addNoDataFullpageImgs">
                <figure>
                  <img src="/assets/images/members.svg" alt="Not Found" />
                </figure>
                <h3>No Members Yet</h3>
              </div>
            )}
          </div>
        </div>
      </main>
      <Modal
        show={showStudentModal}
        onHide={() => {
          cancel();
        }}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="modal-dark classroom-modalAddStd1 form-boxes">
          <div className="modal-header no-borders">
            <div className="d-flex align-items-center">
              <h4 className="form-box_title">
                <span className="material-icons mr-1">person_add_alt</span> Add
                Student
              </h4>
            </div>
            <h3 className="form-box_subtitle">
              Add new student by either email or phone number.
            </h3>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addStudent(e);
            }}
            noValidate
          >
            <div className="modal-body pt-2">
              <div className="form-whites clearfix mb-2">
                <div className="profile-info clearfix">
                  <div className="form-row mb-2">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio h-26">
                          <input
                            className="h-auto"
                            type="radio"
                            value="email"
                            name="type"
                            checked={switchValue.type === "email"}
                            onChange={(e) =>
                              setSwitchValue({
                                ...switchValue,
                                type: e.target.value,
                              })
                            }
                            id="semester"
                          />
                          <label htmlFor="semester" className="my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">Email</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio h-26">
                          <input
                            className="h-auto"
                            type="radio"
                            value="phone"
                            name="type"
                            checked={switchValue.type === "phone"}
                            onChange={(e) =>
                              setSwitchValue({
                                ...switchValue,
                                type: e.target.value,
                              })
                            }
                            id="other"
                          />
                          <label htmlFor="other" className="my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">Phone</div>
                    </div>
                  </div>
                </div>

                {switchValue.type === "email" && (
                  <div className="col-sm-12 px-0">
                    <input
                      type="email"
                      name="name"
                      className="form-control border-bottom rounded-0 my-0"
                      autoFocus
                      placeholder="Enter email for new student"
                      value={temp.email}
                      onChange={(e) =>
                        setTemp({
                          ...temp,
                          email: e.target.value,
                        })
                      }
                      maxLength={50}
                      required
                    />
                    {/* <div>
                      {(name.invalid && (name.dirty || name.touched || submitted)) && (
                        <>
                          {name.errors.pattern && <p className="label label-danger text-danger">Email contains invalid characters.</p>}
                          {name.errors.required && <p className="label label-danger text-danger">Email is required</p>}
                          {name.errors.maxlength && <p className="label label-danger text-danger">Email must be smaller than 50 characters.</p>}
                        </>
                      )}
                    </div> */}
                  </div>
                )}

                {switchValue.type === "phone" && (
                  <div className="col-sm-12 px-0">
                    <div className="form-group mb-0">
                      <input
                        className="form-control border-bottom rounded-0 my-0"
                        type="tel"
                        placeholder="Enter phone number"
                        id="student_phone"
                        name="phone_number"
                        minLength={10}
                        maxLength={10}
                        value={temp.phoneNumber}
                        onChange={(e) =>
                          setTemp({
                            ...temp,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
                      />
                      <div
                        className="label label-danger"
                        style={{
                          display: switchValue.errors ? "block" : "none",
                        }}
                      >
                        {switchValue.errors}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => cancel()}
                  className="btn btn-light"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary ml-1">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* upload modal */}
      <Modal
        show={showUploadModal}
        onHide={() => {
          setShowUploadModal(false);
        }}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="form-boxes">
          <div className="modal-header uploadModalheader-1cls">
            <h3 className="form-box_title">Upload Students</h3>
            <button
              type="button"
              className="close color-black"
              onClick={() => {
                setUploadFile({});
                setShowUploadModal(false);
              }}
              data-dismiss="modal"
              aria-label="Close"
            >
              <span className="closeModalPopCls1" aria-hidden="true">
                &times;
              </span>
            </button>
          </div>

          <div className="modal-body clsModalupldBdy1">
            <FileDrop
              onDrop={(f: any) => dropped(f)}
              className="standard-upload-box"
            >
              <div className="upload_icon text-center">
                <span className="material-icons setting-image">file_copy</span>
              </div>
              <p className="pro-text-drug text-center d-block active text-primary">
                {uploadFile && uploadFile.name}
              </p>
              <span className="title">Drag and drop or browse your files.</span>
              <div className="text-center">
                {!uploadFile?.name && (
                  <button
                    className="btn btn-primary btn-sm mx-2"
                    onClick={(e) => {
                      openFileSelector();
                    }}
                  >
                    Browse
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!uploadFile.name}
                  onClick={() => upload(uploadFile)}
                >
                  Upload
                </button>
              </div>
              <input
                accept=".xlsx"
                value=""
                style={{ display: "none", opacity: 0 }}
                ref={fileBrowseRef}
                type="file"
                onChange={(e) => dropped(e.target.files)}
              />
            </FileDrop>
            <div>
              <div className="d-flex align-items-center justify-content-center text-black text-center">
                <a
                  href="/assets/media/Student upload Template.xlsx"
                  target="_blank"
                  className="d-flex align-items-center btn btn-outline mt-2"
                >
                  <span className="material-icons mr-2">download</span>
                  Students upload Template
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClassroomStudents;
