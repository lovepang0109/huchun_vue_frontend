import React, { useState, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import * as userService from "@/services/userService";
import * as authService from "@/services/auth";
import * as instituteSvc from "@/services/instituteService";
import clientApi from "@/lib/clientApi";
import * as alertify from "alertifyjs";
import { useSession, getSession } from "next-auth/react";
import { copyText } from "@/lib/helpers";
import { TagsInput } from "react-tag-input-component";
import { FileDrop } from "react-file-drop";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";

const InstituteBasic = ({ institute, setIinstitute }: any) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<any>([]);
  const [getClientData, setClientData] = useState<any>(null);
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  let sub: Subscription;
  const [logoUploading, setLogoUploading] = useState<boolean>(false);
  const [coveruploading, setCoveruploading] = useState<boolean>(false);
  const [referredCode, setReferredCode] = useState<string>("");
  const [referredCodeAlreadySet, setReferredCodeAlreadySet] =
    useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [isWelcomeModal, setIsWelcomeModal] = useState<boolean>(false);
  const fileBrowseRef = useRef(null);
  const { push } = useRouter();

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
  }, []);

  useEffect(() => {
    userService.get().then((us) => {
      if (user.referredCode) {
        setReferredCode(user.referredCode);
        setReferredCodeAlreadySet(true);
      }
    });
  }, []);

  const start = () => {
    setIsWelcomeModal(false);
  };

  const updateFunc = async () => {
    const dataUpdate = { ...institute };
    dataUpdate.programs = dataUpdate.programs.map((d) => d._id);
    dataUpdate.subjects = dataUpdate.subjects.map((d) => d._id);
    if (dataUpdate.specialization) {
      dataUpdate.specialization = dataUpdate.specialization.map(
        (d) => d.value || d
      );
    }
    await instituteSvc.updadteInstitute(institute._id, dataUpdate);
    alertify.success("Institute updated successfully.");
    if (user.primaryInstitute) {
      if (dataUpdate.name != undefined) {
        user.primaryInstitute.name = dataUpdate.name;
      }
      if (institute.imageUrl) {
        if (institute.imageUrl != user.primaryInstitute.logo) {
          user.primaryInstitute.logo = institute.imageUrl;
          await update();
        }
      } else {
        user.primaryInstitute.logo = "";
        await update();

        // this.appInit.resetLogo();
      }
    }

    if (!referredCodeAlreadySet && referredCode) {
      setReferredCodeAlreadySet(true);
      const res = await authService.addReferral(referredCode);
      setReferredCode(res.code);
      user.referredCode = res.code;
      await update();
    }
    // location.reload();
    push(`/institute/home`);
  };

  const dropped = (files: any, type) => {
    setFileToUpload((prevState) => ({
      ...prevState,
      [type]: files[0],
    }));
  };

  const upload = async (type) => {
    if (fileToUpload[type] && fileToUpload[type].name) {
      setLogoUploading(true);
      const session = await getSession();
      const formData: FormData = new FormData();
      formData.append("file", fileToUpload[type], fileToUpload[type].name);
      formData.append("uploadType", "file");
      // const temp = { ...this.institute }
      clientApi
        .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        })
        .then((res: any) => {
          setIinstitute({
            ...institute,
            imageUrl: res.data.fileUrl,
          });
          setLogoUploading(false);

          alertify.success("Uploaded successfully");
        })
        .catch((err) => {
          setLogoUploading(false);
          alertify.error("upload failed");
        });
    }
  };

  const removeImage = (e) => {
    setIinstitute({
      ...institute,
      imageUrl: "",
    });
    delete fileToUpload.image;
  };

  const add = (ev) => {
    // if (typeof ev === "object") {
    console.log(institute.specialization, "Dddd");
    const index = institute.specialization?.findIndex((e) => e.value === ev);
    console.log(index, "index");
    // if (index !== -1) {
    //   const updatedInstitute = institute;
    //   updatedInstitute.specialization[index] = ev;
    //   setIinstitute(updatedInstitute);
    // }
  };

  const copyCode = () => {
    console.log("here?");
    copyText(institute.code);
    alertify.success("Successfully Copied");
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const validateName = (name) => {
    const pattern = /^[a-zA-Z0-9-@! ]*$/;
    if (!name) return "Institute Name is required";
    if (name.length < 3)
      return "Institute Name must have at least 3 characters.";
    if (name.length > 36)
      return "Institute Name must be smaller than 36 characters.";
    if (!pattern.test(name))
      return "Institute Name contains invalid characters.";
    return "";
  };

  const validateEmails = (emails) => {
    if (!emails) {
      return [];
    }

    const emailValidate =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/;
    const items = emails.split("\n");
    for (const item of items) {
      if (!emailValidate.test(item.trim())) {
        alertify.alert("Message", "Invalid email: " + item);
        return false;
      }
    }

    return items;
  };

  return (
    <>
      <div className="institute-onboarding login-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="container p-0">
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper mb-0">
                <h3 className="section_top_heading">Institute Information</h3>
                <p className="section_sub_heading">
                  Basic information of your institute
                </p>
              </div>
            </div>
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Basic Details</h3>
                <p className="section_sub_heading">
                  Fill your Institute information
                </p>
              </div>

              <div className="bg-white p-0">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Institute Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        minLength="3"
                        maxLength="36"
                        pattern="^[a-zA-Z0-9-@! ]*$"
                        required
                        onChange={(e) =>
                          setIinstitute({ ...institute, name: e.target.value })
                        }
                        value={institute.name || ""}
                      />
                      <div className="text-danger">
                        {validateName(institute.name)}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label>Institute Code</label>
                          <input
                            type="text"
                            name="instituteId"
                            placeholder="Institute Identifier/Code"
                            className="form-control"
                            value={institute.code || ""}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-lg-2">
                        <label>&nbsp;</label>
                        <a
                          className="btn btn-primary"
                          onClick={() => copyCode()}
                        >
                          <i className="fas fa-copy"></i>
                        </a>
                      </div>
                    </div>

                    <div className="form-group-1">
                      <label className="mb-0">Description</label>
                      <p className="f-12">
                        Tell the people about your institute
                      </p>
                      <textarea
                        rows="5"
                        className="form-control mt-2"
                        name="description"
                        onChange={(e) =>
                          setIinstitute({
                            ...institute,
                            description: e.target.value,
                          })
                        }
                        value={institute.description || ""}
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <label>Institute Logo</label>
                    <div className="position-relative">
                      {!institute.imageUrl ? (
                        <div className="standard-upload-box my-0">
                          <FileDrop
                            onDrop={(files) => dropped(files, "image")}
                            accept="image/*"
                          >
                            <h2 className="upload_icon">
                              <span className="material-icons">file_copy</span>
                            </h2>
                            <p className="pro-text-drug text-center">
                              {fileToUpload.image?.name}
                            </p>
                            <span className="title">
                              Drag and drop or
                              <a
                                className="text-primary"
                                onClick={openFileSelector}
                              >
                                {" "}
                                browse{" "}
                              </a>
                              your file
                            </span>
                            <p className="text-dark">
                              For optimal view, we recommend size
                              <span className="text-danger">190px * 200px</span>
                            </p>

                            <div className="d-flex justify-content-center gap-xs">
                              {!fileToUpload?.image?.name && (
                                <a
                                  className="btn btn-primary btn-sm mx-2"
                                  onClick={openFileSelector}
                                >
                                  Browse
                                </a>
                              )}

                              <a
                                className="btn btn-secondary btn-sm"
                                onClick={() => upload("image")}
                                disabled={!fileToUpload.image}
                              >
                                Upload
                                {logoUploading && (
                                  <i className="fa fa-pulse fa-spinner"></i>
                                )}
                              </a>
                            </div>
                            <input
                              accept="image/*"
                              value=""
                              style={{ display: "none", opacity: 0 }}
                              ref={fileBrowseRef}
                              type="file"
                              onChange={(e) => dropped(e.target.files, "image")}
                            />
                          </FileDrop>
                        </div>
                      ) : (
                        <div className="standard-upload-box my-0 uploaded-image bg-white">
                          <a
                            type="reset"
                            className="close btn p-0 mb-2 mt-0"
                            onClick={() => removeImage("image")}
                            aria-label="cancel"
                          >
                            <img src="/assets/images/close.png" alt="" />
                          </a>
                          <figure>
                            <img
                              src={institute.imageUrl}
                              className="actual-uploaded-image"
                              alt="institue-logo"
                            />
                          </figure>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="mb-0">
                        Who should we thank for referring?
                      </label>
                      <input
                        type="text"
                        name="referral"
                        placeholder="Referral code"
                        className="form-control"
                        value={referredCode || ""}
                        disabled={referredCodeAlreadySet}
                        onChange={(e) => setReferredCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Institute contact Number"
                        name="instituteContact"
                        pattern="^[0-9]{10}$"
                        onChange={(e) =>
                          setIinstitute({
                            ...institute,
                            contactNumber: e.target.value,
                          })
                        }
                        value={institute.contactNumber || ""}
                      />
                      {institute.contactNumber &&
                        !/^[0-9]{10}$/.test(institute.contactNumber) && (
                          <p className="label label-danger text-danger">
                            Invalid phone number.
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="form-control"
                        type="email"
                        name="instituteEmail"
                        pattern="^[^@]+@[^@]+\.[^@]+$"
                        placeholder="Institute email"
                        onChange={(e) =>
                          setIinstitute({ ...institute, email: e.target.value })
                        }
                        value={institute.email || ""}
                      />

                      {institute.email &&
                        !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                          institute.email
                        ) && (
                          <p className="label label-danger text-danger">
                            Invalid email.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper mb-0">
                <h3 className="section_top_heading">Specialization</h3>
                <p className="section_sub_heading">
                  Add your institute specialization
                </p>
              </div>
              {getClientData && institute?.specialization && (
                <div className="color-tags">
                  <TagsInput
                    //@ts-ignore
                    value={institute?.specialization}
                    //@ts-ignore
                    onChange={(e) => {
                      setIinstitute({
                        ...institute,
                        specialization: e,
                      });
                    }}
                    name="specialization"
                    placeHolder="+ Enter a new tag"
                    separators={[" "]}
                  />
                </div>
              )}
            </div>
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Social Media</h3>
                <p className="section_sub_heading">
                  Your social presence that matters. Please enter url for each.
                </p>
              </div>
              <div>
                <div className="bg-white p-0">
                  <div className="row mt-2">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Facebook <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="facebook"
                          value={institute.facebook}
                          onChange={(e) => {
                            setIinstitute({
                              ...institute,
                              facebook: e.target.value,
                            });
                          }}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Linkedin <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="linkedIn"
                          value={institute.linkedIn}
                          onChange={(e) =>
                            setIinstitute({
                              ...institute,
                              linkedIn: e.target.value,
                            })
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Youtube <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="youtube"
                          value={institute.youtube}
                          onChange={(e) =>
                            setIinstitute({
                              ...institute,
                              youtube: e.target.value,
                            })
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Instagram <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="instagram"
                          value={institute.instagram}
                          onChange={(e) =>
                            setIinstitute({
                              ...institute,
                              instagram: e.target.value,
                            })
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Twitter <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="twitter"
                          value={institute.twitter}
                          onChange={(e) =>
                            setIinstitute({
                              ...institute,
                              twitter: e.target.value,
                            })
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>
                          Web <span> (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="Enter url"
                          name="blog"
                          value={institute.blog}
                          onChange={(e) =>
                            setIinstitute({
                              ...institute,
                              blog: e.target.value,
                            })
                          }
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <a
              className={`btn btn-primary `}
              onClick={updateFunc}
              type="button"
              // disabled={instituteUpdate.invalid}
            >
              Save
            </a>
          </div>
        </form>
      </div>
      <Modal
        show={isWelcomeModal}
        onHide={() => setIsWelcomeModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div role="document" className="modal-dialog modal-lg">
          <div className="welcome-pop">
            <div className="modal-content">
              <div className="modal-body p-0">
                <div className="row no-gutters">
                  <div className="col-lg-6">
                    <figure className="p-4">
                      <img src="assets/images/i-welcome1.png" alt="" />
                    </figure>
                  </div>
                  <div className="col-lg-6 p-5">
                    <h4 className="admin-user-head1">
                      <strong>
                        Congratulations! You have successfully Created Your
                        institute
                      </strong>
                    </h4>
                    <p>
                      Use perfectice to create course, assessments and tests and
                      share with your students.
                    </p>
                    <div className="save-ch-btn">
                      <button
                        className="text-center text-white px-2"
                        onClick={start}
                      >
                        Let’s get started
                      </button>
                    </div>
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

export default InstituteBasic;
