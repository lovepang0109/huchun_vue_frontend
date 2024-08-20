"use client";
import React, { useEffect, useState } from "react";
import * as supercoinsService from "@/services/supercoinsService";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import { avatar } from "@/lib/pipe";

const RequestTab = () => {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<any>({});
  const [searchText, setSearchText] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [students, setStudents] = useState<any>([]);
  useEffect(() => {
    supercoinsService
      .requestStudents({ activityType: "inprocess" })
      .then((d) => {
        setStudents(d);
      });
  }, []);

  const search = (text: string) => {
    setSearchText(text);
    supercoinsService
      .requestStudents({ activityType: "inprocess", searchText: text })
      .then((d) => {
        setStudents(d);
      });
  };

  const openModal = (status: any, stud: any) => {
    setCurrentStudent({ ...stud, updateType: status });
    setIsShowModal(true);
  };

  const cancel = () => {
    setIsShowModal(false);
    setNote("");
    setCurrentStudent({});
  };

  const sendNote = () => {
    if (currentStudent._id) {
      const obj = {
        _id: currentStudent._id,
        activityType: currentStudent.updateType,
        teacherMsg: note,
        email: currentStudent.userId,
        studentId: currentStudent.studentId,
        name: currentStudent.name,
      };
      supercoinsService
        .updateStatus(currentStudent._id, obj)
        .then((d) => {
          const index = students.findIndex((e) => e._id == currentStudent._id);
          console.log(index);
          if (index > -1) {
            const updatedStudents = students;
            updatedStudents.splice(index, 1);
            setStudents(updatedStudents);
          }
          alertify.success("Updated Successfully ");

          cancel();
        })
        .catch((err) => {
          alertify.alert("Message", err.error);
          cancel();
        });
    }
  };
  return (
    <>
      <div className="rounded-boxes bg-white">
        <div className="d-flex align-items-center">
          <div className="UserCardAdmiN-AlL1">
            <section className="my-2">
              <form
                className="common_search-type-1"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="form-group">
                  <figure>
                    <span>
                      <img
                        alt=""
                        className="searchBoxIcon-5"
                        src="https://www.practiz.xyz/assets/images/search-icon-2.png"
                      />
                    </span>
                  </figure>
                  <input
                    className="form-control border-0"
                    value={searchText}
                    onChange={(e) => search(e.target.value)}
                    name="txtSearch"
                    placeholder="Search for User"
                    type="text"
                  />
                </div>
              </form>
            </section>
          </div>
        </div>

        {students.length ? (
          students.map((stud) => (
            <div
              key={stud.userId}
              className="rounded-boxes course-content dropShadowProgrammE bg-white"
            >
              <div className="row">
                <div className="col-12 col-lg-10">
                  <div className="folder mb-0">
                    <a className="border-0 clearfix">
                      <div className="d-flex align-items-center">
                        <figure className="user_img_circled_wrap">
                          <img alt="" src={avatar(stud)} />
                        </figure>
                        <div className="inner ml-2">
                          <h4 className="profile_user_name">{stud.name}</h4>
                          <p className="f-14 admin-info1 mt-0 ml-0">
                            {stud.userId}
                          </p>
                          <p className="f-14 admin-info1 mt-0 ml-0">
                            {stud.studentMsg}
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="mt-2 col-lg-auto ml-auto text-right">
                  {stud.activityType === "inprocess" && (
                    <>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openModal("rejected", stud)}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-success btn-sm ml-2"
                        onClick={() => openModal("redeemed", stud)}
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="container">
            <div className="course addNoDataFullpageImgs">
              <figure>
                <img
                  src="/assets/images/undraw_Online_learning_re_qw08.svg"
                  alt="Not Found"
                />
              </figure>
              <h4 className="text-center">No requests found!</h4>
            </div>
          </div>
        )}
      </div>
      <Modal
        show={isShowModal}
        onHide={close}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-content form-boxes">
          {/* Modal Header */}
          <div className="modal-header modal-header-bg justify-content-center">
            <h4 className="form-box_title mb-0 text-center">Add Note</h4>
          </div>
          {/* Modal body */}
          <div className="modal-body">
            <div className="create-course-modal">
              <div className="class-board-info">
                <div className="mx-auto">
                  <div className="form-group">
                    <textarea
                      className="form-control form-control-sm"
                      placeholder="Write Note.."
                      style={{ height: "100px" }}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <hr />
                  </div>

                  <div className="text-right">
                    <button className="btn btn-light" onClick={cancel}>
                      Cancel
                    </button>
                    <button className="btn btn-primary ml-2" onClick={sendNote}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RequestTab;
