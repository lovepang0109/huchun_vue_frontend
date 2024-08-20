"use client";

import React, { useState, useEffect } from "react";
import alertify from "alertifyjs";

interface Student {
  user: string;
  name: string;
  rollNumber: string;
  admitted: boolean;
  attendantId: string;
  status: string;
  updatedAt: string;
}

interface Classroom {
  _id: string;
}

interface AttendanceProps {
  classroom: Classroom;
}

const Attendance: React.FC<AttendanceProps> = ({ classroom }) => {
  const [params, setParams] = useState({ limit: 15, page: 1 });
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [test, setTest] = useState<any>(null);

  useEffect(() => {
    loadStudents(true);
    ongoingTestByClass(classroom._id, { testOnly: true }).then((d: any) => {
      setTest(d.test);
    });
  }, []);

  const loadStudents = async (isRefresh = false) => {
    if (isRefresh) {
      setParams((prevParams) => ({ ...prevParams, page: 1 }));
    }
    const data = await getClassroomAttendants(classroom._id, params);
    setStudents(data);
    if (isRefresh) {
      const countData = await countClassroomAttendants(classroom._id, params);
      setTotalStudents(countData.count);
    }
  };

  const search = () => {
    setParams((prevParams) => ({ ...prevParams, name: searchText }));
    loadStudents(true);
  };

  const updateAttendance = async (student: Student) => {
    setProcessing((prevProcessing) => ({
      ...prevProcessing,
      [student.user]: true,
    }));
    const data = await updateClassroomAttendants(student.attendantId, {
      classId: classroom._id,
      admitted: !student.admitted,
    });
    const updatedStudents = students.map((s) =>
      s.user === student.user ? { ...s, ...data } : s
    );
    setStudents(updatedStudents);
    setProcessing((prevProcessing) => ({
      ...prevProcessing,
      [student.user]: false,
    }));
  };

  const chat = (student: Student) => {
    openChat(student.user, student.name);
  };

  // Placeholder functions for service methods
  const getClassroomAttendants = async (classId: string, params: any) => {
    // Implement the logic to fetch classroom attendants
    return [];
  };

  const countClassroomAttendants = async (classId: string, params: any) => {
    // Implement the logic to count classroom attendants
    return { count: 0 };
  };

  const updateClassroomAttendants = async (attendantId: string, data: any) => {
    // Implement the logic to update classroom attendants
    return {};
  };

  const ongoingTestByClass = async (classId: string, params: any) => {
    // Implement the logic to fetch ongoing test by class
    return { test: null };
  };

  const openChat = (userId: string, userName: string) => {
    // Implement the logic to open chat
  };

  return (
    <div className="rounded-boxes bg-white">
      <div className="section_heading_wrapper">
        <h3 className="section_top_heading">Attendance</h3>
      </div>
      <div className="row align-items-center">
        {test && (
          <div className="col-md mb-md-0 mb-2">
            <h3>
              <i className="fas fa-file-signature"></i> {test.title}
            </h3>
          </div>
        )}
        <div className="col-md align-self-end mb-3">
          <form className="common_search-type-1 form-half ml-auto">
            <div className="form-group mb-0">
              <span>
                <figure>
                  <img
                    src="assets/images/search-icon-2.png"
                    alt="this search for attendance"
                  />
                </figure>
              </span>
              <input
                type="text"
                className="form-control border-0"
                name="txtSearch"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search for Students"
                maxLength={50}
                onBlur={search}
              />
            </div>
          </form>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table vertical-middle border-top-none border-bottom_yes table-avatar mb-0">
          <tbody>
            {students.map((student) => (
              <tr key={student.user}>
                <td>
                  <div className="d-flex align-items-center">
                    <figure className="avatar_wrapper">
                      <img
                        className="avatar"
                        src="/assets/images/defaultProfile.png"
                        alt="this is user picture"
                      />
                    </figure>
                    <div className="ml-2">
                      <h2>{student.name}</h2>
                      <p>{student.rollNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => chat(student)}
                  >
                    Message
                  </button>
                </td>
                <td className="text-right">
                  <button
                    className={`btn btn-sm ${
                      student.admitted ? "btn-danger" : "btn-primary"
                    }`}
                    onClick={() => updateAttendance(student)}
                  >
                    {student.admitted ? "Revoke" : "Admit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalStudents > params.limit && (
        <div className="text-center mt-3">
          <div className="d-inline-block">
            {/* Replace with appropriate pagination component */}
            <button onClick={() => loadStudents(false)}>Load More</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
