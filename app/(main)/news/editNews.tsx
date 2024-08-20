"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import { getSession } from "next-auth/react";
import * as adminSvc from "@/services/adminService";
import clientApi from "@/lib/clientApi";
import _ from "lodash";
import { FileDrop } from "react-file-drop";

const EditNews = ({
  isShow,
  setIsShow,
  isNew,
  onClose,
  news,
  setNews,
}: any) => {
  const [file, setFile] = useState<any>(null);
  const [updatingNews, setUpdatingNews] = useState<any>({});
  const fileBrowseRef = useRef(null);

  useEffect(() => {
    setUpdatingNews(news);
  }, []);

  const dropped = (files: any) => {
    setFile(files[0]);
  };
  const uploadImage = async () => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("uploadType", "file");

    const session = await getSession();

    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((data: any) => {
        setUpdatingNews({
          ...updatingNews,
          imageUrl: data.data.fileUrl,
        });
        setFile(null);
        alertify.success("File uploaded successfully.");
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      });
  };

  const removeImage = () => {
    setUpdatingNews({
      ...updatingNews,
      imageUrl: "",
    });
  };

  const onSubmit = () => {
    if (isNew) {
      adminSvc
        .createNews(updatingNews)
        .then((res) => {
          onClose(res);
          setIsShow(false);
        })
        .catch((res) => {
          if (res.response.data && res.response.data.message) {
            alertify.alert("Message", res.response.data.message);
          } else {
            alertify.alert("Message", "Failed to create news");
          }
        });
    } else {
      adminSvc
        .updateNews(updatingNews._id, updatingNews)
        .then((res) => {
          onClose(res);
          setIsShow(false);
          _.merge(news, res);
        })
        .catch((res) => {
          if (res.response.data && res.response.data.message) {
            alertify.alert("Message", res.response.data.message);
          } else {
            alertify.alert("Message", "Failed to create news");
          }
        });
    }
  };

  const close = () => {
    onClose(false);
    setIsShow(false);
  };
  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <Modal
      show={isShow}
      onHide={() => setIsShow(false)}
      backdrop="static"
      keyboard={false}
    >
      <div className="modal-header justify-content-center">
        <strong className="modal-title text-dark">
          {isNew ? "Add" : "Update"} What&apos;s New
        </strong>
      </div>
      <div className="modal-body text-dark px-4">
        <div className="create-course-modal">
          <div className="class-board-info">
            <div className="row">
              <div className="col-lg-12 mx-auto">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <strong className="form-box_subtitle">
                      What&apos;s New Name
                    </strong>
                    <input
                      style={{ border: "none" }}
                      className="form-control form-control-sm px-0"
                      name="title"
                      placeholder="What's New Name"
                      required
                      type="text"
                      value={updatingNews.title}
                      onChange={(e) => {
                        setUpdatingNews({
                          ...updatingNews,
                          title: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <strong className="form-box_subtitle">Summary</strong>
                    <input
                      style={{ border: "none" }}
                      className="form-control form-control-sm px-0"
                      name="description"
                      placeholder="What's New Summary"
                      type="text"
                      value={updatingNews.description}
                      onChange={(e) => {
                        setUpdatingNews({
                          ...updatingNews,
                          description: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <strong className="form-box_subtitle">Add Link</strong>
                    <input
                      style={{ border: "none" }}
                      className="form-control form-control-sm px-0"
                      name="link"
                      placeholder="Copy & Past link here"
                      type="text"
                      value={updatingNews.link}
                      onChange={(e) => {
                        setUpdatingNews({
                          ...updatingNews,
                          link: e.target.value,
                        });
                      }}
                    />
                    <hr />
                  </div>

                  <div className="form-group">
                    <strong className="form-box_subtitle">
                      Upload Picture
                    </strong>
                    <div className="standard-upload-box mt-2">
                      {!updatingNews.imageUrl && (
                        <FileDrop
                          onDrop={(f) => {
                            dropped(files);
                          }}
                        >
                          <div>
                            <h2 className="upload_icon text-center">
                              <span className="material-icons setting-image">
                                file_copy
                              </span>
                            </h2>
                            <p className="pro-text-drug text-center d-block text-primary">
                              {file?.name}
                            </p>
                            <span className="title text-center helPer_txT">
                              Drag and drop or{" "}
                              <a
                                className="active text-primary"
                                onClick={() => filePicker()}
                              >
                                Browse
                              </a>{" "}
                              your files.
                            </span>
                            <p className="text-dark">
                              For optimal view, we recommend size{" "}
                              <span className="text-danger">190px * 200px</span>
                            </p>
                            <input
                              type="file"
                              id="fileInput"
                              style={{ display: "none" }}
                              accept=".jpg,.png,.jpeg"
                              onChange={(e) => {
                                dropped(e.target.files);
                              }}
                              ref={fileBrowseRef}
                            />
                            <div className="text-center">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm mx-2"
                                onClick={() => filePicker()}
                              >
                                Browse
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={uploadImage}
                              >
                                Upload
                              </button>
                            </div>
                          </div>
                        </FileDrop>
                      )}

                      {updatingNews.imageUrl && (
                        <div className="uploaded-image bg-white mt-2">
                          <button
                            type="button"
                            className="close btn p-0 mb-2"
                            onClick={removeImage}
                          >
                            <img
                              src="/assets/images/close.png"
                              alt=""
                              className="remove-uploaded-image_btn"
                            />
                          </button>
                          <figure>
                            <img
                              src={updatingNews.imageUrl}
                              className="actual-uploaded-image"
                            />
                          </figure>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="btn btn-light mr-2"
                      onClick={close}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={onSubmit}>
                      {isNew ? "Add" : "Update"} What&apos;s New
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditNews;
