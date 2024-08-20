"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as sessionService from "@/services/SessionService";
import * as practicesetService from "@/services/practiceService";
import alertify from "alertifyjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useRouter } from "next/navigation";
import { TagsInput } from "react-tag-input-component";
import Multiselect from "multiselect-react-dropdown";
import { Accordion, Card, Button } from "react-bootstrap";
import Link from "next/link";
import moment from "moment";
import { fromNow } from "@/lib/pipe";
import { avatar } from "@/lib/pipe";

export default function ManageStudents() {
  const { id } = useParams();
  const { practiceId } = useParams();
  const { push } = useRouter();
  const [students, setStudents] = useState<any>([]);
  const [pClassRooms, setPClassRooms] = useState<any>([]);
  const [allStudents, setAllStudents] = useState<any>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [practice, setPractice] = useState<any>({});
  const [selectedActiveFilter, setSelectedActiveFilter] =
    useState<string>("Status");
  const [selectedClassroom, setSelectedClassroom] =
    useState<string>("Classroom");
  const [isClassroomFilter, setIsClassroomFilter] = useState<boolean>(false);
  const [filter, setFfilter] = useState<boolean>(false);

  useEffect(() => {
    practicesetService.findOneForSession(practiceId).then((d) => {
      setPractice(d);
      setPClassRooms(d.classRooms);
    });
    sessionService
      .getStudentsByPractice(id, { practiceId: practiceId })
      .then((data: any[]) => {
        setStudents(data);
        setAllStudents(data);
      });
  }, []);

  const search = (text: string, allc?: any) => {
    setSearchText(text);
    if (!allc) {
      allc = allStudents;
    }
    if (text) {
      setStudents(
        allc.filter(
          (d) =>
            d.studentName
              .toLowerCase()
              .toString()
              .indexOf(text.toLowerCase()) != -1
        )
      );
    } else {
      setStudents(allc);
    }
  };

  const updateStatus = (s: any, val: any) => {
    let status = false;
    if (val) {
      status = true;
    }
    sessionService
      .updateStudentStatus(id, { student: s, isActive: status })
      .then((data) => {
        sessionService
          .getStudentsByPractice(id, { practiceId: practiceId })
          .then((data: any[]) => {
            setAllStudents(data);
            if (selectedActiveFilter === "Active") {
              setStudents(data.filter((d) => d.studentStatus === true));
            } else if (selectedActiveFilter === "Inactive") {
              setStudents(data.filter((d) => d.studentStatus === false));
            } else {
              setStudents(data);
            }
            search(searchText, data);
            alertify.success("Successfully Updated");
          });
      });
  };

  const filterStatus = (status: any, filter: any) => {
    setSelectedActiveFilter(filter);
    if (isClassroomFilter) {
      console.log("ddd");
      if (status === "active") {
        setStudents(allStudents.filter((d) => d.studentStatus === true));
        const tmp_students = allStudents.filter(
          (d) => d.studentStatus === true
        );
        setStudents(
          tmp_students.filter(
            (d) =>
              d.classroomName.toLowerCase() === selectedClassroom.toLowerCase()
          )
        );
      } else if (status === "inactive") {
        setStudents(allStudents.filter((d) => d.studentStatus === false));
        const tmp_students = allStudents.filter(
          (d) => d.studentStatus === false
        );
        setStudents(
          tmp_students.filter(
            (d) =>
              d.classroomName.toLowerCase() === selectedClassroom.toLowerCase()
          )
        );
      } else {
        setStudents(allStudents);
      }
    } else {
      if (status === "active") {
        setStudents(allStudents.filter((d) => d.studentStatus === true));
      } else if (status === "inactive") {
        setStudents(allStudents.filter((d) => d.studentStatus === false));
      } else {
        setStudents(allStudents);
      }
    }
  };

  const filterClassroom = (cls: any, filter: any) => {
    setSelectedClassroom(filter);
    setIsClassroomFilter(!isClassroomFilter);
    setStudents(allStudents.filter((d) => d.classroomId === cls._id));
    const tmp_students = allStudents.filter((d) => d.classroomId === cls._id);
    if (selectedActiveFilter === "Active") {
      setStudents(tmp_students.filter((d) => d.studentStatus === true));
    }
    if (selectedActiveFilter === "Inactive") {
      setStudents(tmp_students.filter((d) => d.studentStatus === false));
    }
  };

  const onFilter = () => {
    setSearchText("");
    setFfilter(!filter);
    setSelectedClassroom("Classroom");
    setSelectedActiveFilter("Status");
    setStudents(allStudents);
  };

  return (
    <main className="pt-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <section className="rounded-boxes details mt-0">
            <div className="container">
              <div className="details-area course mx-auto pl-0">
                <div className="row">
                  <div className="col-md-8">
                    <div className="asses-info1">
                      <div className="title-wrap clearfix">
                        <div className="title">
                          <h3 className="f-18 admin-head1 text-white mr-2 mb-2 d-inline-block">
                            {practice.title}
                          </h3>
                          <div className="tag-type status_published text-black d-inline-block">
                            <span>{practice?.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="asses-user">
                        <div className="inner">
                          {practice &&
                            practice.subjects &&
                            practice.subjects.length > 0 && (
                              <p className="text-white">
                                {practice.subjects[0].name}
                              </p>
                            )}
                          {practice &&
                            practice.subjects &&
                            practice.subjects.length > 1 && (
                              <p className="text-white">
                                + {practice.subjects.length - 1} more
                              </p>
                            )}
                        </div>
                      </div>

                      <span className="text-white">
                        <div className="assess-demo-head">
                          <div className="asses-right overview clearfix border-0">
                            <div className="asses-item border-0 pl-0">
                              <div className="d-flex">
                                <figure className="mb-0">
                                  <img
                                    src="/assets/images/classroom.png"
                                    alt=""
                                  />
                                </figure>
                                <span className="f-14 d-flex align-items-center">
                                  <span className="f-14 mx-2">
                                    {practice &&
                                      practice.classRooms &&
                                      practice.classRooms.length}
                                  </span>
                                  Classrooms
                                </span>
                              </div>
                            </div>

                            <div className="asses-item border-white">
                              <div className="d-flex">
                                <figure className="mb-0">
                                  <img
                                    src="/assets/images/Students.png"
                                    alt=""
                                  />
                                </figure>
                                <span className="f-14 d-flex align-items-center">
                                  <span className="f-14 mx-2">
                                    {students && students.length > 0
                                      ? students.length
                                      : "No"}
                                  </span>
                                  Students
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-boxes bg-white">
            <div className="title mb-3 p-0">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Search For Student</h3>
              </div>
              <div className="admin-filter d-none d-lg-block">
                <div className="filter">
                  <a className="text-center px-2" onClick={onFilter}>
                    <span>Filters</span>
                  </a>
                </div>
                {filter && (
                  <>
                    <div className="dropdown">
                      <a
                        className="btn dropdown-toggle text-left d-block"
                        role="button"
                        id="filterLavel"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <div className="form-row">
                          <span className="col text-truncate">
                            {selectedClassroom}
                          </span>
                          <span className="col-auto ml-auto ml-0 mt-0 material-icons">
                            expand_more
                          </span>
                        </div>
                      </a>

                      <div
                        className="dropdown-menu border-0 py-0"
                        aria-labelledby="filterLavel"
                      >
                        {pClassRooms.map((c, index) => (
                          <a
                            key={c.index}
                            className="dropdown-item"
                            onClick={() => filterClassroom(c, c.name)}
                          >
                            {c.name}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="dropdown">
                      <a
                        className="btn dropdown-toggle text-left d-block"
                        role="button"
                        id="filterLavel"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <div className="form-row">
                          <span className="col text-truncate admin-drop">
                            {selectedActiveFilter}
                          </span>
                          <span className="col-auto ml-auto ml-0 mt-0 material-icons">
                            expand_more
                          </span>
                        </div>
                      </a>

                      <div
                        className="dropdown-menu border-0 py-0"
                        aria-labelledby="filterLavel"
                      >
                        <a
                          className="dropdown-item"
                          onClick={() => filterStatus("active", "Active")}
                        >
                          Active
                        </a>
                        <a
                          className="dropdown-item"
                          onClick={() => filterStatus("inactive", "Inactive")}
                        >
                          Inactive
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="search-form-wrap d-block">
                <div className="member-search clearfix">
                  <div className="search-form my-3 w-100">
                    <div className="d-flex align-items-center my-2 ">
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
                            {searchText !== "" && (
                              <div
                                onClick={() => {
                                  search("");
                                }}
                              >
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
                              onChange={(e) => {
                                search(e.target.value);
                              }}
                            />
                          </div>
                        </form>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="folder-area clearfix table-responsive">
              <div className="table-wrap">
                <table className="table vertical-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0 ml-66px d-block pl-0">Name</th>
                      <th className="border-0">Classroom</th>
                      <th className="border-0 text-center widthmatch_to_btn">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s, index) => (
                      <tr key={index}>
                        <td className="px-0">
                          <div className="folder mb-0 p-0">
                            <a className="p-0 border-0 d-flex align-items-center">
                              <figure className="user_img_circled_wrap">
                                <img
                                  className="avatar"
                                  src={avatar(s)}
                                  alt=""
                                />
                              </figure>
                              <div className="inner ml-2 pl-0">
                                <div className="inners">
                                  <h4>{s.studentName}</h4>
                                  <p>{s.studentUserId}</p>
                                </div>
                              </div>
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="admin-table">
                            <strong>{s.classroomName}</strong>
                          </div>
                        </td>
                        <td className="text-right">
                          {!s.studentStatus ? (
                            <a
                              className="btn btn-sm btn-primary"
                              onClick={() => updateStatus(s.studentId, 1)}
                            >
                              Activate
                            </a>
                          ) : (
                            <a
                              className="btn btn-sm btn-deactivate"
                              onClick={() => updateStatus(s.studentId, 0)}
                            >
                              Deactivate
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
