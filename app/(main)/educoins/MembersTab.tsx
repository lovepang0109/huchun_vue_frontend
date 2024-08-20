"use client";
import React, { useEffect, useState } from "react";
import * as supercoinsService from "@/services/supercoinsService";
import * as chatSvc from "@/services/chatService";
import * as userService from "@/services/userService";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { avatar } from "@/lib/pipe";
import Link from "next/link";

const MembersTab = () => {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<any>({});
  const [searchText, setSearchText] = useState<string>("");
  const [members, setMembers] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [params, setParams] = useState<any>({
    limit: 12,
    page: 1,
    name: "",
  });
  const { user }: any = useSession()?.data || {};
  const { push } = useRouter();
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setParams({
      ...params,
      page: 1,
    });
    const updatedParams = {
      ...params,
      page: 1,
    };
    setLoading(true);
    setMembers([]);

    supercoinsService
      .getMembers({ ...updatedParams, count: true })
      .then((res: any) => {
        setMembers(res.members);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Failed to load data");
        setLoading(false);
      });
  };

  const loadMore = () => {
    setParams({
      ...params,
      page: params.page + 1,
    });
    const updatedParams = {
      ...params,
      page: params.page + 1,
    };
    setLoading(true);
    supercoinsService
      .getMembers(updatedParams)
      .then((res: any) => {
        setMembers([...members, ...res.members]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Failed to load data");
        setLoading(false);
      });
  };

  const openStudentChat = (std: any) => {
    chatSvc
      .getRoom(user.activeLocation, std.studentId, std.name)
      .then((chatInstance: any) => {
        push(`/chat?id=${chatInstance.uid}`);
      })
      .catch((err) => {
        alertify.alert("Message", err.error);
      });
  };

  const cancel = () => {
    setIsShowModal(false);
    setCurrentStudent({});
  };

  const openEditModal = (student?: any) => {
    if (student) {
      setCurrentStudent({
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        educoins: 0,
        reason: "",
      });
      setIsShowModal(true);
    }
  };

  const updateAction = (val: boolean) => {
    if (!currentStudent.educoins && !currentStudent.reason) {
      alertify.alert(
        "Message",
        "Please enter number of educoins and justification."
      );
      return;
    } else if (!currentStudent.educoins) {
      alertify.alert("Message", "Please enter number of educoins.");
      return;
    } else if (!currentStudent.reason) {
      alertify.alert("Message", "Please enter justification.");
      return;
    }

    if (val && currentStudent.studentId) {
      const data = {
        educoins: Number(currentStudent.educoins),
        reason: currentStudent.reason,
        studentId: currentStudent.studentId,
      };
      userService
        .awardEducoins(data)
        .then((d) => {
          const index = members.findIndex(
            (e) => e.studentId.toString() == currentStudent.studentId
          );
          if (index > -1) {
            const updatedMembers = members;

            updatedMembers[index].earned += Number(data.educoins);
            setMembers(updatedMembers);
          }
          cancel();
          alertify.success("Successfully updated");
        })
        .catch((err) => {
          alertify.alert("Message", err.error);
        });
    } else if (!val && currentStudent.studentId) {
      const data = {
        educoins: Number(currentStudent.educoins),
        reason: currentStudent.reason,
        studentId: currentStudent.studentId,
      };
      userService
        .deductEducoins(data)
        .then((d) => {
          const index = members.findIndex(
            (e) => e.studentId.toString() == currentStudent.studentId
          );
          if (index > -1) {
            const updatedMembers = members;

            updatedMembers[index].redeem =
              updatedMembers[index].redeem + Number(data.educoins);
            setMembers(updatedMembers);
          }
          cancel();
          alertify.success("Successfully updated");
        })
        .catch((err) => {
          cancel();
          alertify.alert("Message", err.error);
        });
    }
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  return (
    <>
      <div className="rounded-boxes bg-white">
        <section className="mb-2">
          <form
            className="common_search-type-1"
            onSubmit={(e) => {
              e.preventDefault();
              loadData();
            }}
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
                value={params.name}
                onChange={(e) =>
                  setParams({
                    ...params,
                    name: e.target.value,
                  })
                }
                name="txtSearch"
                placeholder="Search for Members"
                type="text"
              />
            </div>
          </form>
        </section>

        {members.length ? (
          <div className="table-wrap table-responsive mt-2">
            <table className="table vertical-middle mb-0">
              <thead>
                <tr>
                  <th className="border-0">Name</th>
                  <th className="border-0">Available</th>
                  <th className="border-0">Processing</th>
                  <th className="border-0">Redeemed</th>
                  <th className="border-0"></th>
                  <th className="border-0"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((mem, index) => (
                  <tr key={mem.id}>
                    <td className="px-0 disabled">
                      <div className="folder mb-0 p-0">
                        <a className="p-0 border-0 clearfix">
                          <div className="d-flex align-items-center">
                            <figure className="user_img_circled_wrap">
                              <img
                                alt=""
                                className="avatar"
                                src={avatar(mem)}
                              />
                            </figure>
                            <div className="inner ml-2">
                              <h4 className="profile_user_name">{mem.name}</h4>
                              <p className="f-14 admin-info1 mt-0 ml-0">
                                {mem.email}
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="assess-tags ml-0 mt-2">
                        <h4 className="f-14 mb-1">
                          {mem.earned - (mem.redeem + mem.inprocess)}
                        </h4>
                      </div>
                    </td>
                    <td>
                      <div className="assess-tags ml-0 mt-2">
                        <h4 className="f-14 mb-1">{mem.inprocess}</h4>
                      </div>
                    </td>
                    <td>
                      <div className="assess-tags ml-0 mt-2">
                        <h4 className="f-14 mb-1">{mem.redeem}</h4>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="msg-btn-remove">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openStudentChat(mem)}
                        >
                          Message
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="assess-tags ml-0 mt-2">
                        <div className="dropdown">
                          <i
                            className="fa fa-ellipsis-h dropdown-toggle cursor-pointer"
                            id="dropdownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          ></i>
                          <div
                            className="dropdown-menu"
                            aria-labelledby="dropdownMenuButton"
                            style={{ top: "10%" }}
                          >
                            <Link
                              className="dropdown-item"
                              href={`/educoins/student-history/${mem.studentId}`}
                            >
                              History
                            </Link>
                            <a
                              className="dropdown-item"
                              onClick={() => openEditModal(mem)}
                            >
                              Action
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {loading ? (
          <div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="mb-1">
                <SkeletonLoaderComponent Cwidth="100" Cheight="75" />
              </div>
            ))}
          </div>
        ) : null}

        {total > members.length && !loading ? (
          <div className="mt-4 text-center">
            <button className="btn btn-light" onClick={loadMore}>
              Load More
            </button>
          </div>
        ) : null}

        {!loading && !members.length ? (
          <div className="empty-data">
            <figure>
              <img src="/assets/images/userEmptyPageImage.svg" alt="" />
              <h3>No User Found</h3>
            </figure>
          </div>
        ) : null}
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
            <h4 className="form-box_title mb-0 text-center">Adjust EduCoins</h4>
          </div>

          {/* Modal body */}
          <div className="modal-body">
            <div className="create-course-modal">
              <div className="class-board-info">
                <div className="mx-auto">
                  <p className="text-dark">
                    You can reward a student with bonus educoins or remove for a
                    given reason
                  </p>
                  <p>
                    User -{" "}
                    <b>
                      {currentStudent.name}{" "}
                      {currentStudent.email && (
                        <span>({currentStudent.email})</span>
                      )}
                    </b>
                  </p>
                  <div className="form-group pt-2">
                    <h4 className="form-box_subtitle">Educoins</h4>
                    <input
                      className="form-control form-control-sm"
                      placeholder="*10-1000, can't be more than total available when deducted"
                      required
                      type="text"
                      name="educoins"
                      value={currentStudent.educoins}
                      onChange={(e) => {
                        setCurrentStudent({
                          ...currentStudent,
                          educoins: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <h4 className="form-box_subtitle">Justification</h4>
                    <input
                      className="form-control form-control-sm"
                      placeholder="comment"
                      required
                      type="text"
                      name="reason"
                      value={currentStudent.reason}
                      onChange={(e) => {
                        setCurrentStudent({
                          ...currentStudent,
                          reason: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="text-right">
                    <button className="btn btn-light" onClick={cancel}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-outline ml-2"
                      onClick={() => updateAction(false)}
                    >
                      Deduct
                    </button>
                    <button
                      className="btn btn-primary ml-2"
                      onClick={() => updateAction(true)}
                    >
                      Award
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

export default MembersTab;
