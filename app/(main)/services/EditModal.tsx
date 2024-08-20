"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import MathJax from "@/components/assessment/mathjax";
import ItemPrice from "@/components/ItemPrice";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import SVG from "@/components/svg";
import { addItem } from "@/services/shopping-cart-service";
import * as authSvc from "@/services/auth";
import * as serviceSvc from "@/services/suportService";
import * as userSvc from "@/services/userService";
import * as paymentService from "@/services/paymentService";
import * as shoppingCartService from "@/services/shopping-cart-service";
import alertify from "alertifyjs";
import { slugify } from "@/lib/validator";
import { getSession } from "next-auth/react";
import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";

const EditModal = ({ onClose, isShow, setIsShow }: any) => {
  const user: any = useSession()?.data?.user?.info || {};
  const [file, setFile] = useState<any>(null);
  const [service, setService] = useState<any>({
    title: "",
    shortDescription: "",
    description: "",
    imageUrl: "",
    type: "support",
    durationString: "",
    tags: [],
    highlights: [],
  });
  const [isNew, setIsNew] = useState<boolean>(true);
  const fileBrowseRef = useRef(null);

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
        setService({
          ...service,
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
    setService({
      ...service,
      imageUrl: "",
    });
  };

  const onSubmit = (form: any) => {
    // convert duration data
    const newSvc = {
      ...service,
      type: service.type,
      imageUrl: service.imageUrl,
    };
    if (service.durationString) {
      newSvc.duration = Number(service.durationString.split("_")[0]);
      newSvc.durationUnit = service.durationString.split("_")[1];
    }

    if (isNew) {
      serviceSvc
        .createService(newSvc)
        .then((res) => {
          onClose(res);
          setIsShow(false);
        })
        .catch((res) => {
          if (res.error && res.error.message) {
            alertify.alert("Message", res.error.message);
          } else {
            alertify.alert("Message", "Failed to create service");
          }
        });
    } else {
      serviceSvc
        .updateService(newSvc)
        .then((res) => {
          onClose(res);
          setIsShow(false);
        })
        .catch((res) => {
          if (res.error && res.error.message) {
            alertify.alert("Message", res.error.message);
          } else {
            alertify.alert("Message", "Failed to update service");
          }
        });
    }
  };

  const close = () => {
    setIsShow(false);
  };

  const handleSelectChange = (value) => {
    setService((prevService) => ({
      ...prevService,
      durationString: value,
    }));
  };

  const openFileSelector = () => {
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
        <h6 className="modal-title text-dark">Add Membership</h6>
      </div>
      <div className="modal-body text-dark px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <strong>Membership Name</strong>
            <input
              style={{ border: "none" }}
              className="form-control p-0 border-bottom"
              type="text"
              name="title"
              value={service.title}
              onChange={(e) => {
                setService({
                  ...service,
                  title: e.target.value,
                });
              }}
              required
              placeholder="Membership name"
            />
          </div>

          <div className="mt-3">
            <strong>Duration</strong>
            <div className="btn-group w-100 service-dropdown">
              <button
                type="button"
                className="dropdown-toggle btn border-bottom"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div className="d-flex justify-content-between">
                  {!service.durationString ? (
                    <div>Select Duration</div>
                  ) : (
                    <div className="d-flex">
                      <span
                        className={`${service.type}_${service.durationString} mr-2`}
                      ></span>
                      <span>{service.durationString.replace("_", " ")}</span>
                    </div>
                  )}
                  <img
                    src="/assets/images/angle-down-2.png"
                    className="caret"
                    alt="caret"
                  />
                </div>
              </button>
              <div className="dropdown-menu w-100">
                {["1_month", "3_month", "6_month", "1_year"].map((duration) => (
                  <button
                    key={duration}
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleSelectChange(duration)}
                  >
                    <span className={`${service.type}_${duration} mr-2`}></span>
                    <span>{duration.replace("_", " ")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <strong>Summary</strong>
            <input
              style={{ border: "none" }}
              className="form-control p-0 border-bottom"
              type="text"
              name="shortDescription"
              value={service.shortDescription}
              onChange={(e) => {
                setService({
                  ...service,
                  shortDescription: e.target.value,
                });
              }}
              placeholder="Membership summary"
            />
          </div>

          <div className="mt-3 mb-3">
            <strong>Upload Membership Picture</strong>
            {service.status !== "revoked" && (
              <div className="standard-upload-box mt-2">
                {!service.imageUrl ? (
                  <FileDrop onDrop={(f: any) => dropped(f)}>
                    <h2 className="upload_icon mb-0">
                      <span className="material-icons">file_copy</span>
                    </h2>
                    <p className="pro-text-drug text-center d-block active text-primary">
                      {file?.name}
                    </p>
                    <span className="title">
                      Drag and Drop or{" "}
                      <a onClick={openFileSelector} className="text-primary">
                        {" "}
                        browse{" "}
                      </a>{" "}
                      your file
                    </span>
                    <p className="text-dark">
                      For optimal view, we recommend size
                      <span className="text-danger">190px * 200px</span>
                    </p>
                    <div className="d-flex justify-content-center gap-xs mb-2">
                      {!file?.name && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            openFileSelector();
                          }}
                        >
                          Browse
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          uploadImage();
                        }}
                      >
                        Upload
                      </button>
                    </div>
                    <input
                      accept=".jpg,.png,.jpeg"
                      value=""
                      style={{ display: "none", opacity: 0 }}
                      ref={fileBrowseRef}
                      type="file"
                      onChange={(e) => dropped(e.target.files)}
                    />
                  </FileDrop>
                ) : (
                  <div className="uploaded-image bg-white mt-2">
                    <button
                      type="reset"
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
                        src={service.imageUrl}
                        className="actual-uploaded-image"
                        alt="uploaded"
                      />
                    </figure>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              className="btn btn-light mr-2"
              onClick={close}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Membership
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
export default EditModal;
