"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as eventSvc from "@/services/eventBusService";
import * as authService from "@/services/auth";
import * as instituteSvc from "@/services/instituteService";
import clientApi from "@/lib/clientApi";
import * as alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { copyText } from "@/lib/helpers";
import { FileDrop } from "react-file-drop";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";

const InstituteAppearance = ({ institute, setIinstitute }: any) => {
  const user: any = useSession()?.data?.user?.info || {};
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<any>([]);
  const [getClientData, setClientData] = useState<any>(null);
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [insuploading, setInsuploading] = useState<boolean>(false);
  const [coveruploading, setCoveruploading] = useState<boolean>(false);
  const ckeOptionswithToolbar = {
    placeholder: "Message...",
    fontSize: {
      options: [9, 11, 13, "default", 17, 19, 21],
    },
  };
  const [isWelcomeModal, setIsWelcomeModal] = useState<boolean>(false);
  const { update } = useSession();
  const { push } = useRouter();
  const [bannerUploading, setBannerUploading] = useState<boolean>(false);
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [bannerType, setBannerType] = useState<string>("dashboard");
  const fileBrowseRef = useRef(null);
  const coverfileBrowseRef = useRef(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
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
      }
    }
    push(`/institute/home?menu=appearance`);
  };

  const dropped = (files: any, type) => {
    setFileToUpload((prevState) => ({
      ...prevState,
      coverImage: files[0],
    }));
  };

  const bannerDrop = (files: any) => {
    setBannerFile(files[0]);
  };

  const uploadBanner = async () => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", bannerFile, bannerFile.name);
    formData.append("uploadType", "file");

    setBannerUploading(true);
    const session = await getSession();

    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((data: any) => {
        setBannerFile(null);
        instituteSvc
          .addBannerImage(
            institute._id,
            bannerType,
            data.data.originalname,
            data.data.fileUrl
          )
          .then((d) => {
            alertify.success("File uploaded successfully.");
            setIinstitute({
              ...institute,
              bannerImages: [...institute.bannerImages, d],
            });
          });
      })
      .catch((err) => {
        console.log(err);
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      })
      .finally(() => setBannerUploading(false));
  };
  const deleteBanner = (i, id) => {
    instituteSvc.deleteBannerImage(institute._id, id).then((d) => {
      alertify.success("Successfully Deleted");
      setIinstitute((prevInstitute) => {
        const newBannerImages = [...prevInstitute.bannerImages];

        newBannerImages.splice(i, 1, 0);

        return {
          ...prevInstitute,
          bannerImages: newBannerImages,
        };
      });
    });
  };

  const upload = async (type) => {
    if (fileToUpload[type] && fileToUpload[type].name) {
      if (type == "coverImage") {
        setCoveruploading(true);
      } else {
        setInsuploading(true);
      }
      const formData: FormData = new FormData();
      formData.append("file", fileToUpload[type], fileToUpload[type].name);
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
          if (type === "image") {
            setIinstitute({
              ...institute,
              imageUrl: res.data.fileUrl,
            });
          } else {
            setIinstitute({
              ...institute,
              coverImageUrl: res.data.fileUrl,
            });
          }
          setCoveruploading(false);
          setInsuploading(false);
          alertify.success("Uploaded successfully");
        })
        .catch((err) => {
          setCoveruploading(false);
          setInsuploading(false);
          alertify.error("upload failed");
        });
    }
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const openCoverFileSelector = () => {
    coverfileBrowseRef?.current?.click();
  };

  const removeImage = (e) => {
    if (e == "cover") {
      setIinstitute({
        ...institute,
        coverImageUrl: "",
      });
      setFileToUpload({
        ...fileToUpload,
        cover: {},
      });
    } else {
      setIinstitute({
        ...institute,
        imageUrl: "",
      });
      setFileToUpload({
        ...fileToUpload,
        image: {},
      });
    }
  };
  const copyCode = () => {
    copyText(institute.code);
    alertify.success("Successfully Copied");
  };
  const add = (ev) => {
    if (typeof ev === "object") {
      const index = institute.specialization?.findIndex(
        (e) => e.value === ev.value
      );
      if (index !== -1) {
        const newSpecializations = [...institute.specialization];
        newSpecializations[index] = {
          ...newSpecializations[index],
          value: ev.value,
        };
        setIinstitute({
          ...institute,
          specialization: newSpecializations,
        });
      }
    }
  };

  return (
    <>
      <div className="institute-onboarding">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFunc(e);
          }}
        >
          <div className="container p-0">
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper mb-0">
                <h3 className="section_top_heading">Appearance</h3>
                <p className="section_sub_heading">
                  Set images, colors and fonts to match your brand.
                </p>
              </div>
            </div>

            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Cover Photo</h3>
                <p className="section_sub_heading">Add institute cover photo</p>
              </div>

              <div className="mt-2 position-relative">
                {!institute.coverImageUrl ? (
                  <div className="standard-upload-box my-3">
                    <FileDrop onDrop={(files) => dropped(files, "coverImage")}>
                      <div>
                        <h2 className="upload_icon">
                          <span className="material-icons">file_copy</span>
                        </h2>
                        <p
                          className="pro-text-drug text-center"
                          style={{ color: "#0782d0" }}
                        >
                          {fileToUpload.coverImage?.name}
                        </p>
                        <span className="title">
                          Drag and drop or{" "}
                          <a
                            className="text-primary"
                            onClick={openCoverFileSelector}
                          >
                            browse
                          </a>{" "}
                          your file
                        </span>
                        <p className="text-dark">
                          For optimal view, we recommend size{" "}
                          <span className="text-danger">190px * 200px</span>
                        </p>

                        <div className="d-flex justify-content-center gap-xs">
                          <a
                            className="btn btn-primary btn-sm mx-2"
                            onClick={openCoverFileSelector}
                          >
                            Browse
                          </a>
                          <a
                            className="btn btn-secondary btn-sm"
                            onClick={() => upload("coverImage")}
                            disabled={!fileToUpload.coverImage}
                          >
                            Upload{" "}
                            {coveruploading && (
                              <i className="fa fa-pulse fa-spinner"></i>
                            )}
                          </a>
                        </div>
                      </div>
                      <input
                        accept="image/*"
                        value=""
                        style={{ display: "none", opacity: 0 }}
                        ref={coverfileBrowseRef}
                        type="file"
                        onChange={(e) => dropped(e.target.files, "image")}
                      />
                    </FileDrop>
                  </div>
                ) : (
                  <div className="standard-upload-box my-3 uploaded-image bg-white">
                    <button
                      type="reset"
                      className="close btn p-0 mb-2 mt-0"
                      onClick={() => removeImage("cover")}
                      aria-label="cancel"
                    >
                      <img src="/assets/images/close.png" alt="" />
                    </button>
                    <figure>
                      <img
                        src={institute.coverImageUrl}
                        className="actual-uploaded-image"
                        alt="cover-logo"
                      />
                    </figure>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Page Messages</h3>
                <p className="section_sub_heading">
                  Customize your messages to students
                </p>
              </div>
              <div className="login-area">
                <div className="bg-white p-0">
                  <div className="form-group">
                    <label>Signup Message</label>
                    <CKEditorCustomized
                      defaultValue={institute.signupMsg}
                      className="form-control ml-2"
                      style={{
                        border: "1px solid #ced4da",
                        width: "90%",
                      }}
                      config={{
                        placeholder: "Message...",

                        toolbar: {
                          items: [],
                        },
                        mediaEmbed: {
                          previewsInData: true,
                        },
                      }}
                      onChangeCon={(data: any) => {
                        setIinstitute((prev) => ({ ...prev, signupMsg: data }));
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instruction for Assessment</label>
                    <CKEditorCustomized
                      defaultValue={institute.assessmentInstructions}
                      className="form-control ml-2"
                      style={{
                        border: "1px solid #ced4da",
                        width: "90%",
                      }}
                      config={{
                        placeholder: "Message...",

                        toolbar: {
                          items: [],
                        },
                        mediaEmbed: {
                          previewsInData: true,
                        },
                      }}
                      onChangeCon={(data: any) => {
                        setIinstitute((prev) => ({
                          ...prev,
                          assessmentInstructions: data,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Banners</h3>
                <p className="section_sub_heading">Customize your banners</p>
              </div>

              <div>
                <select
                  className="form-control"
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value)}
                >
                  <option value="testseries">Test Series</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="course">Course</option>
                  <option value="assessment">Assessment</option>
                  <option value="classroom">Classroom</option>
                </select>
              </div>
              <div className="standard-upload-box my-3">
                <FileDrop onDrop={bannerDrop}>
                  <h2 className="upload_icon">
                    <span className="material-icons">file_copy</span>
                  </h2>
                  <p
                    className="pro-text-drug text-center"
                    style={{ color: "#0782d0" }}
                  >
                    {bannerFile?.name}
                  </p>
                  <span className="title">
                    Drag and drop or{" "}
                    <a className="text-primary" onClick={openFileSelector}>
                      browse
                    </a>{" "}
                    your file
                  </span>
                  <p className="text-dark">
                    For optimal view, we recommend size{" "}
                    <span className="text-danger">1280px * 350px</span>
                  </p>
                  <div className="d-flex justify-content-center gap-xs">
                    <button
                      className="btn btn-primary btn-sm mx-2"
                      onClick={openFileSelector}
                    >
                      Browse
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={uploadBanner}
                      disabled={!bannerFile}
                    >
                      Upload{" "}
                      {bannerUploading && (
                        <i className="fa fa-pulse fa-spinner"></i>
                      )}
                    </button>
                  </div>

                  <input
                    accept="image/*"
                    value=""
                    style={{ display: "none", opacity: 0 }}
                    ref={fileBrowseRef}
                    type="file"
                    onChange={(e) => bannerDrop(e.target.files)}
                  />
                </FileDrop>
              </div>

              <div className="row">
                <div className="col-lg-6 mb-lg-0 my-2">
                  {institute?.bannerImages?.map((im, i) => (
                    <div key={i}>
                      <img src={im.url} alt={im.title} />
                      <b>{im.type}</b> {im.title}
                      <a
                        className="mx-2"
                        onClick={() => deleteBanner(i, im._id)}
                      >
                        X
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button
              className="btn btn-primary"
              type="submit"
              // disabled={Object.keys(errors).length > 0}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InstituteAppearance;
