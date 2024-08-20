"use client";
import React, { useEffect, useState } from "react";
import * as supercoinsService from "@/services/supercoinsService";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";

const RedeemTab = () => {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [currentRedeem, setCurrentRedeem] = useState<any>({
    title: "",
    summary: "",
    value: "",
    type: "offer",
  });
  const [searchText, setSearchText] = useState<string>("");
  const [redeems, setRedeems] = useState<any>([]);
  const [isSearch, setIsSearch] = useState<boolean>(false);

  useEffect(() => {
    load();
  }, []);

  const openEditModal = (coins?: any) => {
    if (coins && coins._id) {
      setCurrentRedeem(coins);
    }
    setIsShowModal(true);
  };

  const cancel = () => {
    setIsShowModal(false);
    setCurrentRedeem({ type: "offer" });
  };

  const updateAction = () => {
    if (currentRedeem && currentRedeem._id) {
      setCurrentRedeem({
        ...currentRedeem,
        full: true,
      });
      supercoinsService
        .update(currentRedeem._id, currentRedeem)
        .then((d) => {
          alertify.success("Successfully Updated");
          load();
          cancel();
        })
        .catch((err) => {
          alertify.alert("Message", err.error);
        });
    } else {
      supercoinsService
        .create(currentRedeem)
        .then((d) => {
          alertify.success("Successfully Updated");
          load();
          cancel();
        })
        .catch((err) => {
          alertify.alert("Message", err.error);
        });
    }
  };

  const load = () => {
    supercoinsService.getLists({ type: "offer" }).then((d) => {
      setRedeems(d);
    });
  };

  const updateStatus = (id: any, status: any) => {
    supercoinsService.update(id, { status: status }).then((d) => {
      if (status) {
        alertify.success("Successfully Activated");
      } else {
        alertify.success("Successfully Deactivated");
      }
      load();
    });
  };

  const search = (text: string) => {
    setSearchText(text);
    supercoinsService
      .getLists({ type: "offer", searchText: text })
      .then((d) => {
        setRedeems(d);
      });
  };
  return (
    <>
      <div className="rounded-boxes bg-white">
        <div className="row align-items-center">
          <div className="col">
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
                      placeholder="Search for Redeem"
                      type="text"
                    />
                  </div>
                </form>
              </section>
            </div>
          </div>
          <div className="col-auto ml-auto">
            <div className="admin-filter d-lg-block">
              <button
                className="btn btn-primary"
                onClick={() => openEditModal(null)}
              >
                Add Redeem
              </button>
            </div>
          </div>
        </div>

        {redeems.map((red) => (
          <div
            key={red._id}
            className="rounded-boxes course-content dropShadowProgrammE bg-white"
          >
            <div className="row">
              <div className="col-3 col-lg-1">
                <img
                  src="/assets/images/iconRedeem.png"
                  className="mt-1"
                  alt="task-icone"
                />
              </div>
              <div className="col-9 col-lg-9">
                <div className="row">
                  <div className="col-lg-9">
                    <div className="assess-tags ml-0 mt-3">
                      <h4 className="f-16 mb-1">{red.title}</h4>
                      <p className="f-14 admin-info1 mt-0 ml-0">
                        {red.summary}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 text-right">
                    <div className="assess-tags ml-0 mt-3">
                      <h4 className="f-16 mb-1">- {red.value}</h4>
                      <p className="f-14 admin-info1 mt-0 ml-0">EduCoins</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 col-lg-auto ml-auto text-right">
                {red.status ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateStatus(red._id, false)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateStatus(red._id, true)}
                  >
                    Activate
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm ml-2"
                  onClick={() => openEditModal(red)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
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
            <h4 className="form-box_title mb-0 text-center">EduCoins</h4>
          </div>

          {/* Modal body */}
          <div className="modal-body">
            <div className="create-course-modal">
              <div className="class-board-info">
                <div className="mx-auto">
                  <div className="form-group">
                    <h4 className="form-box_subtitle">Action Name</h4>
                    <input
                      className="form-control form-control-sm"
                      placeholder="EduCoin Action Name"
                      required
                      type="text"
                      name="title"
                      value={currentRedeem.title}
                      onChange={(e) => {
                        setCurrentRedeem({
                          ...currentRedeem,
                          title: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <h4 className="form-box_subtitle">Summary</h4>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Action Summary"
                      required
                      type="text"
                      name="summary"
                      value={currentRedeem.summary}
                      onChange={(e) => {
                        setCurrentRedeem({
                          ...currentRedeem,
                          summary: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <h4 className="form-box_subtitle">Point to be Redeemed</h4>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Enter Points"
                      required
                      type="number"
                      name="value"
                      value={currentRedeem.value}
                      onChange={(e) => {
                        setCurrentRedeem({
                          ...currentRedeem,
                          value: e.target.value,
                        });
                      }}
                      appNumberOnly
                    />
                    <hr />
                  </div>

                  <div className="text-right">
                    <button className="btn btn-light" onClick={cancel}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary ml-2"
                      onClick={updateAction}
                    >
                      Update
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

export default RedeemTab;
