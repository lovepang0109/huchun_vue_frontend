"use client";
import { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify from "alertifyjs";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-regular-svg-icons";
import DropzoneContainer from "@/components/dropzone";
import { ProgressBar } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { WithContext as ReactTags } from "react-tag-input";

const ProfileBasic = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(useSession()?.data?.user?.info || {});
  const { data: session, update } = useSession();
  const [selected, setSelected] = useState([]);
  const [files, setFiles]: any = useState([]);
  const [coverfiles, setCoverFiles]: any = useState([]);
  const [getClientData, setClientData]: any = useState();
  const [errors, setErrors]: any = useState({});
  const [fileToUpload, setFileToUpload]: any = useState({});
  const [submitted, setSubmitted]: any = useState(false);
  const [submittedPassword, setSubmittedPassword]: any = useState(false);
  const [masterData, setMasterData]: any = useState({});
  const [prouploading, setProuploading]: any = useState(false);
  const [coveruploading, setCoveruploading]: any = useState(false);
  const [uploading, setUploading] = useState<Boolean>(false);
  const [facebook, setFacebook] = useState<string>(user?.facebook);
  const [youtube, setYoutube] = useState<string>(user?.youtube);
  const [linkedIn, setLinkedIn] = useState<string>(user?.linkedIn);
  const [instagram, setInstagram] = useState<string>(user?.instagram);
  const [effectflag, setEffectflag] = useState<boolean>(false);
  const KeyCodes = {
    comma: 188,
    enter: 13,
    space: 32,
  };
  const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.space];

  alertify.set("notifier", "position", "top-right");

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    async function fetchData() {
      const sessionData = await getSession();
      if (sessionData) {
        // setUser(sessionData.user?.info || {});
        setSelected(sessionData.user?.info?.specialization || {});
        const session = (await clientApi.get("/api/users/me")).data;
        setUser(session);
        setFacebook(session.facebook);
        setLinkedIn(session.linkedIn);
        setYoutube(session.youtube);
        setInstagram(session.instagram);
      }
    }
    if (!effectflag) {
      fetchData();
      setEffectflag(true);
    }
  });

  useEffect(() => {
    getClientDataFunc();
  }, []);

  const [tags, setTags] = useState([
    { id: "React", text: "React" },
    { id: "JavaScript", text: "JavaScript" },
  ]);

  const handleDelete = (i: any) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag: any) => {
    setTags([...tags, tag]);
  };

  const lettersOnly = (ev: any) => {
    const charCode = ev.keyCode;
    if (
      (charCode > 64 && charCode < 91) ||
      (charCode > 96 && charCode < 123) ||
      charCode == 8 ||
      charCode == 32
    )
      return true;
    else return false;
  };

  const dropped = async (files: any, type: any) => {
    if (files && files.length > 0) {
      // setFileToUpload({ ...fileToUpload, [type]: droppedFile })
      upload(type, files);
    }
  };

  const setSocialLink = (val: any, type: any) => {
    if (type == "facebook") {
      setFacebook(val);
    } else if (type == "linkedIn") {
      setLinkedIn(val);
    } else if (type == "youtube") {
      setYoutube(val);
    } else if (type == "instagram") {
      setInstagram(val);
    }
  };

  const uploadImage = (type: any) => {
    if (type == "image") {
      if (files && files.length > 0) {
        setProuploading(true);
        for (const droppedFile of files) {
          // Is it a file?
          if (droppedFile.fileEntry.isFile) {
            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
            fileEntry.file((file: File) => {
              fileToUpload[type] = file;
              setFileToUpload(fileToUpload);
              upload(type);
            });
          } else {
            // It was a directory (empty directories are added, otherwise only files)
            const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
          }
        }
      }
    } else if (type == "coverImage") {
      if (coverfiles && coverfiles.length > 0) {
        setCoveruploading(true);
        for (const droppedFile of coverfiles) {
          // Is it a file?
          if (droppedFile.fileEntry.isFile) {
            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
            fileEntry.file((file: File) => {
              fileToUpload[type] = file;
              setFileToUpload(fileToUpload);
              upload(type);
            });
          } else {
            // It was a directory (empty directories are added, otherwise only files)
            const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
          }
        }
      }
    } else {
      return;
    }
  };

  //file upload End
  const upload = async (type: any, files?: any) => {
    ///  You could upload it like this:
    if (!files || !files.length) return;
    setUploading(false);

    uploadFile(files[0], files[0].path, "file")
      .then((res) => {
        if (type == "coverImage") {
          setUser({ ...user, coverImageUrl: res.data.fileUrl });
        } else {
          setUser({
            ...user,
            avatar: res.data,
            avatarUrl: res.data.fileUrl,
            avatarUrlSM: res.data.fileUrl,
          });
        }
        setUploading(false);
        alertify.success("Uploaded Successfully");
      })
      .catch((err) => {
        alertify.error(err.message);
        setUploading(false);
      });
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    alertify
      .confirm(
        "Are you sure you want to update your profile?",
        (success: any) => {
          upload("image", files);
          upload("coverImage", coverfiles);

          let dataUpdate = user;
          dataUpdate.facebook = facebook || "";
          dataUpdate.linkedIn = linkedIn || "";
          dataUpdate.youtube = youtube || "";
          dataUpdate.instagram = instagram || "";
          if (selected) {
            dataUpdate.specialization = selected?.map((d: any) => d.value || d);
          }
          if (dataUpdate.specialization) {
            dataUpdate.specialization = user.specialization?.map(
              (d: any) => d.value || d
            );
          }

          let tempsession = session;
          if (tempsession && tempsession.user && tempsession.user.info) {
            tempsession.user.info.avatar = user.avatar;
            tempsession.user.info.facebook = facebook || "";
            tempsession.user.info.instagram = instagram || "";
            tempsession.user.info.youtube = youtube || "";
            tempsession.user.info.linkedIn = linkedIn || "";
          }
          update(tempsession);

          // let tempsession = session;
          // if (tempsession && tempsession.user && tempsession.user.info) {
          //   tempsession.user.info.avatar = user.avatar;
          // }
          // update(tempsession)

          dataUpdate = _.omit(dataUpdate, "avatarUrlSM");
          clientApi
            .put(`/api/user/update/${user._id}`, dataUpdate)
            .then(async () => {
              setSubmitted(false);
              alertify.success("Profile updated successfully.");
              const session = (await clientApi.get("/api/users/me")).data;

              setUser(session);
            })
            .catch((error) => {
              setSubmitted(false);
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              let msg = "";
              if (error) {
                for (const d of error) {
                  msg += d.msg + "\n";
                }
              }
              if (msg) {
                alertify.alert("Message", "Fail to update profile" + msg);
              } else {
                alertify.alert("Message", "Fail to update profile");
              }
            });
        }
      )
      .set({ title: "Message" });
  };

  const numberOnly = (event: any): boolean => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  };

  const removeImage = (e: any) => {
    if (e == "cover") {
      setUser({ ...user, coverImageUrl: "" });
    } else {
      setUser({ ...user, avatar: {} });
    }
  };

  const changeField = (e: any) => {
    if (e.target.name === "primaryInstitute") {
      setUser({
        ...user,
        primaryInstitute: { ...user.primaryInstitute, name: e.target.value },
      });
      sessionStorage.setItem("primaryInstitute", {
        ...user.primaryInstitute,
        name: e.target.value,
      });
      const ses = sessionStorage;
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
      sessionStorage.setItem(e.target.name, e.target.value);
      const ses = sessionStorage;
    }
  };

  return (
    <div>
      <div className="mentor-homepage-profile Stu_profile">
        <div className="institute-onboarding">
          <form name="profileUpdate" onSubmit={submit}>
            <div className="container p-0">
              <div className="container6 rounded-boxes bg-white m-0">
                <div className="row">
                  <div className="col">
                    <div className="section_heading_wrapper mb-md-0">
                      <h3 className="section_top_heading">
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}{" "}
                        Information
                      </h3>
                      <p className="section_sub_heading">
                        Basic information of your role
                      </p>
                    </div>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="summary-edit-btn-remove">
                      <a
                        className="btn btn-outline-black"
                        href={`/public/profile/${user._id}`}
                      >
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faEye} className="mr-2" /> View
                          Public Profile
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {(user.role == "student" || user.role == "teacher") &&
                user?.profileCompleted !== 100 && (
                  <div className="container6 rounded-boxes bg-white m-0">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        Profile Completion Progress
                      </h3>
                    </div>
                    <div className="progress mb-2">
                      <ProgressBar
                        now={user?.profileCompleted}
                        style={{ width: "100%" }}
                        min={0}
                        max={100}
                        variant="primary"
                        striped
                        label={`${Math.round(user?.profileCompleted)}%`}
                      />
                    </div>
                  </div>
                )}
              {user.role == "teacher" && (
                <div className="container6 rounded-boxes bg-white m-0">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Complete your profile
                    </h3>
                  </div>
                  <div className="progress mb-2" style={{ height: 6 }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${user?.profileCompleted}%`,
                        backgroundColor: "#8C89F9",
                      }}
                      aria-valuenow={50}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="progress-bar"
                    ></div>
                  </div>
                </div>
              )}

              <div className="container6 rounded-boxes bg-white m-0">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Basic Details</h3>
                  <p className="section_sub_heading">
                    Fill your personal information
                  </p>
                </div>
                <div className="row mt-2">
                  <div className="col-lg-6">
                    <div className="login-area">
                      <div className="bg-white p-0">
                        <div className="form-group">
                          <label>
                            <strong className="text-danger font-bolder f-16">
                              *
                            </strong>
                            Name
                          </label>
                          <input
                            className="form-control bg-grey"
                            disabled={!getClientData?.features?.editProfile}
                            type="text"
                            placeholder="Name"
                            name="name"
                            defaultValue={user.name}
                            required
                            onKeyUp={lettersOnly}
                            onChange={changeField}
                          />
                          {/* {
                                              name.invalid && (name.dirty || name.touched || submitted) && 
                                              <div>
                                                {
                                                  name.errors.required && <p className="label label-danger text-danger">Name is required</p>
                                                }
                                                {
                                                  name.errors.maxlength && <p className="label label-danger text-danger">Name must be smaller than 60 characters.</p>
                                                }
                                              </div>
                                            } */}
                        </div>
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label>
                                <strong className="text-danger font-bolder f-16">
                                  *
                                </strong>
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                placeholder="Email Id"
                                required
                                defaultValue={user.email}
                                className="form-control"
                                disabled={
                                  !getClientData?.features?.editProfile ||
                                  user.email == user.userId
                                }
                                onChange={changeField}
                              />
                              {/* {
                                                      email.invalid && (email.dirty || email.touched || submitted) && 
                                                      <div>
                                                          <p *ngIf="email.errors.required" className="label label-danger text-danger">EmailId is required
                                                          </p>
                                                          <p *ngIf="email.errors" className="label label-danger text-danger">
                                                              Please enter valid Email</p>
                                                      </div>
                                                    } */}
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label>
                                {" "}
                                <strong className="text-danger font-bolder f-16">
                                  *
                                </strong>
                                Phone Number
                              </label>
                              <input
                                className="form-control"
                                type="phoneNumber"
                                placeholder="Phone Number"
                                name="phoneNumber"
                                onKeyUp={numberOnly}
                                minLength={10}
                                maxLength={10}
                                defaultValue={user.phoneNumber}
                                required
                                disabled={
                                  !getClientData?.features?.editProfile ||
                                  user.phoneNumber == user.userId
                                }
                                onChange={changeField}
                              />
                              {/* <div *ngIf="phoneNumber.invalid && (phoneNumber.dirty || phoneNumber.touched || submitted)">
                                                        <p *ngIf="phoneNumber.errors.required" className="label label-danger text-danger">Phone number is required
                                                        </p>
                                                        <p *ngIf="phoneNumber.errors.maxlength ||phoneNumber.errors.minlength" className="label label-danger text-danger">Phone number must be 10 digit.
                                                        </p>
                                                    </div> */}
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>
                            <strong className="text-danger font-bolder f-16">
                              *
                            </strong>
                            Country
                          </label>
                          <input
                            className="form-control"
                            aria-label="teacher selecting country"
                            type="text"
                            name="country"
                            placeholder="Country"
                            defaultValue={user.country?.name}
                            readOnly
                          />
                        </div>
                        <div className="form-group pb-2">
                          <label>
                            <strong className="text-danger font-bolder f-16">
                              *
                            </strong>
                            Institute Name
                          </label>
                          <input
                            className="form-control  bg-grey"
                            type="text"
                            name="primaryInstitute"
                            onKeyUp={lettersOnly}
                            defaultValue={user?.primaryInstitute?.name}
                            placeholder="Institute"
                            disabled={!getClientData?.features?.editProfile}
                            onChange={changeField}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            <strong className="text-danger font-bolder f-16">
                              *
                            </strong>
                            Designation
                          </label>
                          <input
                            className="form-control"
                            aria-label="teacher selecting designation"
                            type="text"
                            name="designation"
                            placeholder="Designation"
                            defaultValue={user.designation}
                            readOnly
                          />
                        </div>
                        
                        
                        <div className="form-group-1">
                          <label className="mb-0">Summary</label>
                          <p className="f-12">
                            Describe your interest, associations and expertise,
                            in words or less. This data contributes towards your
                            profile completion
                          </p>
                          <textarea
                            aria-label="teacher description text area"
                            rows={5}
                            className="form-control mt-2"
                            name="knowAboutUs"
                            defaultValue={user.knowAboutUs}
                            disabled={!getClientData?.features?.editProfile}
                            onChange={changeField}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="login-area">
                      <div className="bg-white p-0">
                        {(user.role === "student" || user.role === "teacher") ? (
                          <div>
                            <div className="form-group pb-2">
                              <label>Core Branch</label>
                              <input
                                className="form-control  bg-grey"
                                type="text"
                                name="institute"
                                onKeyUp={lettersOnly}
                                defaultValue={user.institute}
                                placeholder="Core Branch"
                                disabled={!getClientData?.features?.editProfile}
                                onChange={changeField}
                              />
                            </div>
                            <div className="form-group pb-2">
                              <label>
                                <strong className="text-danger font-bolder f-16">
                                  *
                                </strong>
                                Roll Number
                              </label>
                              <input
                                className="form-control  bg-grey"
                                type="text"
                                name="rollNumber"
                                onKeyUp={lettersOnly}
                                defaultValue={user.rollNumber}
                                placeholder="Roll Number"
                                disabled={!getClientData?.features?.editProfile}
                                onChange={changeField}
                              />
                            </div>
                            <div className="form-group">
                              <label>
                                <strong className="text-danger font-bolder f-16">
                                  *
                                </strong>
                                Passing Year
                              </label>

                              <input
                                className="form-control  bg-grey"
                                type="number"
                                name="passingYear"
                                defaultValue={user.passingYear}
                                placeholder="Passing Year"
                                disabled={!getClientData?.features?.editProfile}
                                onChange={changeField}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <figure className="pro-basic-img">
                                <img src="/assets/images/profile-basics.png"  alt=""/>
                            </figure>
                            <p className="admin-head-pro text-center ml-0">Your expertise and knowledge for all</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container6 rounded-boxes bg-white m-0">
                <div className="section_heading_wrapper mb-0">
                  <h3 className="section_top_heading">Specialization</h3>
                  <p className="section_sub_heading">
                    Add your specialization. This data contributes towards your
                    profile completion
                  </p>
                </div>
                <div className="color-tags new-specialization-input">
                  <TagsInput
                    //@ts-ignore
                    value={selected}
                    //@ts-ignore
                    onChange={setSelected}
                    name="specialization"
                    placeHolder="+ Add specialization"
                    separators={[" "]}
                  />
                </div>
              </div>

              <div className="container6 rounded-boxes bg-white m-0">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Images</h3>
                  {!user.avatar?.fileUrl ||
                    (!user.coverImageUrl && (
                      <p className="section_sub_heading">
                        Add your profile and cover image
                      </p>
                    ))}
                </div>

                {uploading ? (
                  <Spinner animation="border" variant="primary" />
                ) : (
                  <div className="row mt-2">
                    <div className="col-lg-4 mb-lg-0 mb-2">
                      <p className="admin-head2 mt-4 mb-1">
                        <strong>Profile Image</strong>
                      </p>
                      <div className="mt-3 position-relative">
                        {
                          getClientData?.features?.editProfile &&
                            !user?.avatar?.fileUrl && (
                              <DropzoneContainer
                                onDropped={(e: any) => dropped(e, "profile")}
                              />
                            )
                          // <div className="standard-upload-box">
                          //     <ngx-file-drop dropZoneLabel="Drop files here" [showBrowseBtn]="true" (onFileDrop)="dropped($event,'image' )" (onFileOver)="fileOver($event)" acce (onFileLeave)="fileLeave($event)" accept="image/*">
                          //         <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
                          //             <h2 className="upload_icon"><span className="material-icons">file_copy</span></h2>
                          //             <span className="pro-text-drug text-center" *ngIf="files && files[0]">{{files[0]?.fileEntry?.name}}
                          //             </span><br>
                          //             <span className="title">Drag and drop or <a (click)="openFileSelector() "
                          //                     className="text-primary">Browse</a> your files.</span>
                          //             <p className="text-dark">For optimal view, we recommend size <span className="text-danger">190px * 200px</span></p>

                          //             <div className="upload-btn-remove">
                          //                 <a className="btn btn-secondary btn-sm" (click)="uploadImage('image')" [class.disabled]="files && files.length ==0">Upload
                          //                     <i *ngIf="prouploading" className="fa fa-pulse fa-spinner"></i>
                          //                 </a>
                          //             </div>
                          //         </ng-template>

                          //     </ngx-file-drop>
                          // </div>
                        }
                        {user.avatar?.fileUrl && (
                          <>
                            <div className=" standard-upload-box uploaded-image bg-white">
                              {getClientData?.features?.editProfile && (
                                <button
                                  type="reset"
                                  aria-label="Remove for profile picture"
                                  className="close btn p-0 mb-2"
                                  onClick={() => removeImage("profile")}
                                >
                                  <img
                                    src="/assets/images/close.png"
                                    alt="Remove button for profile picture"
                                    className="remove-uploaded-image_btn"
                                  />
                                </button>
                              )}
                              <figure>
                                <img
                                  src={user.avatar.fileUrl}
                                  className="actual-uploaded-image"
                                  alt="profile picture"
                                />
                              </figure>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-8 mb-lg-0 mb-2 mb-1">
                      <p className="admin-head2 mt-4">
                        <strong>Cover photo</strong>
                      </p>
                      <div className="mt-3 position-relative">
                        {getClientData?.features?.editProfile &&
                          !user.coverImageUrl && (
                            <DropzoneContainer
                              onDropped={(e: any) => dropped(e, "coverImage")}
                            />
                          )}
                        {user?.coverImageUrl && (
                          <>
                            <div className="standard-upload-box uploaded-image bg-white">
                              {getClientData?.features?.editProfile && (
                                <button
                                  type="reset"
                                  aria-label="Remove button for cover photo"
                                  className="close btn p-0 mb-2"
                                  onClick={() => removeImage("cover")}
                                >
                                  <img
                                    src="/assets/images/close.png"
                                    alt="Remove button for cover photo"
                                    className="remove-uploaded-image_btn"
                                  />
                                </button>
                              )}

                              <figure>
                                <img
                                  src={user.coverImageUrl}
                                  className="actual-uploaded-image"
                                  alt="cover photo"
                                />
                              </figure>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="container6 rounded-boxes bg-white m-0">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Social Media</h3>
                  <p className="section_sub_heading">
                    Your social presence that matters
                  </p>
                </div>
                <div className="login-area">
                  <div className="bg-white p-0">
                    <div className="row mt-2">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Facebook <span> (Optional)</span>
                          </label>
                          <input
                            type="url"
                            aria-label="facebookurl_Teacher"
                            name="facebook"
                            defaultValue={user.facebook}
                            className="form-control"
                            onChange={(e: any) =>
                              setSocialLink(e.target.value, "facebook")
                            }
                            disabled={!getClientData?.features?.editProfile}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Linkedin <span> (Optional)</span>
                          </label>
                          <input
                            type="url"
                            aria-label="linkedInurl_Teacher"
                            name="linkedIn"
                            defaultValue={user.linkedIn}
                            onChange={(e: any) =>
                              setSocialLink(e.target.value, "linkedIn")
                            }
                            className="form-control"
                            disabled={!getClientData?.features?.editProfile}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Youtube <span> (Optional)</span>
                          </label>
                          <input
                            type="url"
                            aria-label="youtubeurl_Teacher"
                            name="youtube"
                            defaultValue={user.youtube}
                            onChange={(e: any) =>
                              setSocialLink(e.target.value, "youtube")
                            }
                            className="form-control"
                            disabled={!getClientData?.features?.editProfile}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Instagram <span> (Optional)</span>
                          </label>
                          <input
                            type="url"
                            aria-label="instagramurl_Teacher"
                            name="instagram"
                            defaultValue={user.instagram}
                            onChange={(e: any) =>
                              setSocialLink(e.target.value, "instagram")
                            }
                            className="form-control"
                            disabled={!getClientData?.features?.editProfile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {getClientData?.features?.editProfile && (
              <div className="text-right">
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfileBasic;
