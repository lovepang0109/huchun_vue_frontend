"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify from "alertifyjs";
import { useForm } from "react-hook-form";
import { toQueryString } from "@/lib/validator";
import Camera from "@/components/camera";
import _ from "lodash";
import { Form } from "react-bootstrap";
import DropzoneContainer from "@/components/dropzone";

const Demographic = () => {
  const param = useParams();
  const cameraRef: any = useRef(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const { update } = useSession();
  const { push } = useRouter();
  const [webcamImage, setWebcamImage]: any = useState(null);
  // const [errors,setErrors] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleCameraPermission = () => {};

  const triggerSnapshot = () => {
    //call functions in camera component
    cameraRef.current.capture();
  };

  const reTakeSnapshot = () => {
    setWebcamImage(null);
    cameraRef.current.toggleWebcam();
  };

  const handleImage = (data: any) => {
    setWebcamImage(data);
    uploadImage(data.blob);
    // cameraRef.current.toggleWebcam();
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [reqDemographicRollNumber, setReqDemographicRollNumber]: any =
    useState(false);
  const [
    reqDemographicIdentificationNumber,
    setReqDemographicIdentificationNumber,
  ]: any = useState(false);
  const [reqDemographicState, setReqDemographicState]: any = useState(false);
  const [reqDemographicCity, setReqDemographicCity]: any = useState(false);
  const [reqDemographicGender, setReqDemographicGender]: any = useState(false);
  const [reqDemographicDob, setReqDemographicDob]: any = useState(false);
  const [reqDemographicPassingYear, setReqDemographicPassingYear]: any =
    useState(false);
  const [reqDemographicCoreBranch, setReqDemographicCoreBranch]: any =
    useState(false);
  const [reqDemographicCollegeName, setReqDemographicCollegeName]: any =
    useState(false);
  const [
    reqDemographicIdentityVerification,
    setReqDemographicIdentityVerification,
  ]: any = useState(false);
  const [reqDemographicField1, setReqDemographicField1]: any = useState(false);
  const [reqDemographicField2, setReqDemographicField2]: any = useState(false);

  const [practice, setPractice]: any = useState([]);
  const [user, setUser]: any = useState({});
  const [userDetails, setUserDetails]: any = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [maxDate, setMaxDate]: any = useState();
  const [states, setStates] = useState([]);
  const [masterData, setMasterData]: any = useState({});
  const [identityVerification, setIdentityVerification] = useState({});
  const [fileUrl, setFileUrl] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [avatar, setAvatar] = useState({});
  const [idNumHeader, setIdNumHeader]: any = useState();
  const [rollNumHeader, setRollNumHeader]: any = useState();
  const [stateHeader, setStateHeader]: any = useState();
  const [dobHeader, setDobHeader]: any = useState();
  const [cityHeader, setCityHeader]: any = useState();
  const [genderHeader, setGenderHeader]: any = useState();
  const [passingYearHeader, setPassingYearHeader]: any = useState();
  const [collegeNameHeader, setCollegeNameHeader]: any = useState();
  const [coreBranchHeader, setCoreBranchHeader]: any = useState();
  const [submittedModal, setSubmittedModal]: any = useState();
  const [getClientData, setClientData]: any = useState();
  const [status, setStatus] = useState({});
  const [isRequiredIdentity, setIsRequiredIdentity] = useState(false);
  const [maxDob, setMaxDob]: any = useState();
  const [minDob, setMinDob]: any = useState();
  const [requiredDemographicData, setRequiredDemographicData]: any = useState();
  const [uploadingCard, setUploadingCard]: any = useState(false);

  const updateUserInfo = async (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    user.isRequiredIdentity = isRequiredIdentity;

    if (getClientData.identityInfo.identityVerification == "system") {
      setFileUrl(user.identityInfo.fileUrl || user.avatarPath);
      if (fileUrl) {
        user.identityInfo.fileUrl = fileUrl;
      }
    }
    if (reqDemographicIdentityVerification && (!imageUrl || !fileUrl)) {
      return alertify.alert(
        "Message",
        "Identity verification required. Please take the picture with only you in the camera and upload most current identity verification document"
      );
    }

    if (getClientData.identityInfo.dob == "system") {
      if (
        new Date(user.birthdate).getTime() !=
        new Date(userDetails.birthdate).getTime()
      ) {
        return alertify.alert(
          "Message",
          "Identity verification failed, Date of birth did not match with system record"
        );
      }
    }
    if (getClientData.identityInfo.identificationNumber == "system") {
      if (user.identificationNumber != userDetails.identificationNumber) {
        return alertify.alert(
          "Message",
          "Identity verification failed, Identification Number did not match with system record"
        );
      }
    }
    if (getClientData.identityInfo.rollNumber == "system") {
      if (user.rollNumber != userDetails.rollNumber) {
        return alertify.alert(
          "Message",
          "Identity verification failed, Roll Number did not match with system record"
        );
      }
    }
    let dataUpdate = { ...user };
    dataUpdate = _.omit(dataUpdate, "avatarUrlSM");
    try {
      await clientApi.put(`/api/users/${dataUpdate._id}`, dataUpdate);
      await update();
      alertify.success("Profile updated successfully.");
      push(`/assessment/instruction/${param.id}`);
    } catch (err: any) {
      setSubmitted(false);
      window.scrollTo(0, 1000);
      let msg = "";
      console.log(err.response.data);
      if (err.response.data) {
        for (const d of err.response.data) {
          msg += d.msg + "\n";
        }
      }
      if (msg) {
        alertify.alert("Message", msg);
      } else {
        alertify.alert("Message", "Fail to update your profile");
      }
    }
  };

  const dropped = async (files: any) => {
    if (uploadingCard) {
      return;
    }

    for (const droppedFile of files) {
      // Is it a file?
      setUploadingCard(true);
      try {
        const data = (await uploadFile(droppedFile, droppedFile.name, "file"))
          .data;
        if (data) {
          user.identityInfo.fileUrl = data.fileUrl;
          setFileUrl(data.fileUrl);
          setTimeout(() => {
            alertify.success("File uploaded successfully.");
          }, 500);
        }
      } catch (err) {
        console.log(err);
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      } finally {
        setUploadingCard(false);
      }

      break;
    }
  };

  const uploadImage = async (file: any) => {
    const fileName = Date.now() + ".jpg";
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    var url = file;
    let converted = await (await fetch(url)).blob();

    try {
      const res = (await uploadFile(converted, fileName, "file")).data;
      setImageUrl(res.fileUrl);
      let temp = { path: res.path, fileUrl: res.fileUrl };
      user.identityInfo.imageUrl = res.fileUrl;
      setAvatar(temp);
      setTimeout(() => {
        alertify.success("File uploaded successfully.");
      }, 500);
    } catch (err) {
      console.log(err);
      alertify.alert(
        "Message",
        "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
      );
    }
    // await clientApi.put(`/api/users/${user.info._id}`, user.info);
    // await update();
  };

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
    return data;
  };
  const getPractice = async () => {
    const { data } = await clientApi.get(
      `/api/tests/${param.id}${toQueryString({
        hasAccessMode: true,
        home: true,
      })}`
    );
    setPractice(data);
    return data;
  };

  const checkRequiredDemographicData = (param: any) => {
    let result = false;
    if (param.demographicData) {
      if (
        param.demographicData.identificationNumber &&
        !user.identificationNumber
      ) {
        setReqDemographicIdentificationNumber(true);
        result = true;
      }
      if (param.demographicData.rollNumber && !user.rollNumber) {
        setReqDemographicRollNumber(true);
        result = true;
      }
      if (param.demographicData.state && !user.state) {
        setReqDemographicState(true);
        result = true;
      }
      if (param.demographicData.city && !user.city) {
        setReqDemographicCity(true);
        result = true;
      }
      if (param.demographicData.gender && !user.gender) {
        setReqDemographicGender(true);
        result = true;
      }
      if (param.demographicData.dob && !user.birthdate) {
        setReqDemographicDob(true);
        result = true;
      }
      if (param.demographicData.passingYear && !user.passingYear) {
        setReqDemographicPassingYear(true);
        result = true;
      }
      if (param.demographicData.coreBranch && !user.coreBranch) {
        setReqDemographicCoreBranch(true);
        result = true;
      }

      if (param.demographicData.collegeName && !user.collegeName) {
        setReqDemographicCollegeName(true);
        result = true;
      }
      if (
        param.demographicData.field1 &&
        param.demographicData.field1.label &&
        (!user.field1 || !user.field1.value)
      ) {
        result = true;
        if (!user.field1 || (user.field1 && !user.field1.label)) {
          user["field1"] = {
            label: param.demographicData.field1.label,
            value: "",
          };
        }
        setReqDemographicField1(true);
      }
      if (
        param.demographicData.field2 &&
        param.demographicData.field2.label &&
        (!user.field2 || !user.field2.value)
      ) {
        result = true;
        if (!user.field2 || (user.field2 && !user.field2.label)) {
          user["field2"] = {
            label: param.demographicData.field2.label,
            value: "",
          };
        }
        setReqDemographicField2(true);
      }
      if (param.demographicData.identityVerification) {
        setReqDemographicIdentityVerification(true);
        setIsRequiredIdentity(true);
      }
    }
    return result;
  };

  const handleInitError = () => {};

  useEffect(() => {
    const startFunc = async () => {
      const yearMS = 365 * (1000 * 60 * 60 * 24); // 365 days
      const now = new Date().getTime();
      const maxDobMS = now - 13 * yearMS;
      const minDobMS = now - 122.5 * yearMS;
      setMaxDob(new Date(maxDobMS));
      setMinDob(new Date(minDobMS));
      const session = (await clientApi.get("/api/me")).data;
      setUserDetails({ ...session });
      setUser(session);
      if (!session.gender) {
        session.gender = "male";
      }
      setMaxDate(new Date());
      const temp = (
        await clientApi.get(
          `/api/countries/findAllStates/${session.country.code}`
        )
      ).data;
      setStates(temp);
      if (!session.state) {
        session.state = "";
        setUser(session);
        setUserDetails(session);
      }
      const tmp = (await clientApi.get(`/api/settings/find-one/masterdata`))
        .data;
      setMasterData(tmp);
      const setting: any = getClientDataFunc();
      setIdNumHeader("Identification Number");
      setRollNumHeader("Roll Number");
      setStateHeader("State");
      setDobHeader("Date of Birth");
      setCityHeader("City");
      setGenderHeader("Gender");
      setPassingYearHeader("Passing Year");
      setCollegeNameHeader("College Name");
      setCoreBranchHeader("Branch Name");

      if (setting.shortProfile) {
        if (setting.shortProfile.registrationNumber) {
          setIdNumHeader(setting.shortProfile.registrationNumber.label);
        }
        if (setting.shortProfile.rollNumber) {
          setRollNumHeader(setting.shortProfile.rollNumber.label);
        }
        if (setting.shortProfile.state) {
          setStateHeader(setting.shortProfile.state.label);
        }
        if (setting.shortProfile.dob) {
          setDobHeader(setting.shortProfile.dob.label);
        }
        if (setting.shortProfile.city) {
          setCityHeader(setting.shortProfile.city.label);
        }
        if (setting.shortProfile.gender) {
          setGenderHeader(setting.shortProfile.gender.label);
        }
        if (setting.shortProfile.passingYear) {
          setPassingYearHeader(setting.shortProfile.passingYear.label);
        }
        if (setting.shortProfile.coreBranch) {
          setCoreBranchHeader(setting.shortProfile.coreBranch.label);
        }
        if (setting.shortProfile.collegeName) {
          setCollegeNameHeader(setting.shortProfile.collegeNameHeader.label);
        }
        if (setting.shortProfile.identityVerification) {
          setIdentityVerification(
            setting.shortProfile.identityVerification.label
          );
        }
      }
      let practiceData = await getPractice();
      setRequiredDemographicData(checkRequiredDemographicData(practiceData));
    };
    startFunc();
  }, []);

  return (
    <section className="camera-sec">
      <div className="container">
        <div className="camera-sec-area">
          <div className="form-area mx-auto pb-5 pt-0">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">
                Before you can proceed, we need these details from you
              </h3>
              <p className="section_sub_heading">
                These details are required to process your examination
              </p>
            </div>
            <div className="container">
              <form name="profileUpdate" onSubmit={updateUserInfo}>
                <div className="row">
                  {requiredDemographicData && (
                    <div className={requiredDemographicData ? "col-lg-8" : ""}>
                      <div className="row">
                        <div className="col-xl-5 col-md-6">
                          <div className="form-group">
                            <label>
                              {rollNumHeader}
                              {practice?.demographicData?.rollNumber ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>
                            <input
                              type="text"
                              placeholder={rollNumHeader}
                              className="form-control border-0"
                              maxLength={100}
                              defaultValue={user.rollNumber}
                              {...register("rollNumber", {
                                required: practice?.demographicData?.rollNumber,
                                maxLength: 100,
                              })}
                            />
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.rollNumber &&
                                  errors.rollNumber.type == "required" &&
                                  `${rollNumHeader} is required`}
                              </p>
                              <p className="label label-danger text-danger">
                                {errors.rollNumber &&
                                  errors.rollNumber.type != "required" &&
                                  `${rollNumHeader} must be smaller than 50 characters.`}
                              </p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {idNumHeader}
                              {practice?.demographicData
                                ?.identificationNumber ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>
                            <input
                              type="text"
                              placeholder={idNumHeader}
                              className="form-control border-0"
                              maxLength={100}
                              {...register("identificationNumber", {
                                required:
                                  practice?.demographicData
                                    ?.identificationNumber,
                                maxLength: 100,
                              })}
                            />
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.identificationNumber &&
                                  errors.identificationNumber.type ==
                                    "required" &&
                                  `${idNumHeader} is required`}
                              </p>
                              <p className="label label-danger text-danger">
                                {errors.identificationNumber &&
                                  errors.identificationNumber.type !=
                                    "required" &&
                                  `${idNumHeader} must be smaller than 50 characters.`}
                              </p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {genderHeader}
                              {practice?.demographicData?.gender ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <div className="radio-row">
                              <div className="row">
                                <div className="col-3">
                                  <div className="custom-control custom-radio custom-control-inline">
                                    <input
                                      type="radio"
                                      id="customRadioInline1"
                                      name="gender"
                                      value={"male"}
                                      className="custom-control-input"
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="customRadioInline1"
                                    >
                                      MALE
                                    </label>
                                  </div>
                                </div>

                                <div className="col-3">
                                  <div className="custom-control custom-radio custom-control-inline">
                                    <input
                                      type="radio"
                                      id="customRadioInline2"
                                      name="gender"
                                      value={"female"}
                                      className="custom-control-input"
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="customRadioInline2"
                                    >
                                      FEMALE
                                    </label>
                                  </div>
                                </div>

                                <div className="col-3">
                                  <div className="custom-control custom-radio custom-control-inline">
                                    <input
                                      type="radio"
                                      id="customRadioInline3"
                                      name="gender"
                                      value={"other"}
                                      className="custom-control-input"
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="customRadioInline3"
                                    >
                                      OTHER
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {dobHeader}
                              {practice?.demographicData?.dob ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>
                            <div className="input-group date">
                              <Form.Group controlId="dob">
                                <Form.Label>Select Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="dob"
                                  placeholder="Date of Birth"
                                />
                              </Form.Group>
                            </div>
                          </div>
                          {practice.demographicData.field1 &&
                            practice.demographicData.field1.value && (
                              <div className="form-group">
                                <label>
                                  {practice?.demographicData?.field1?.label}
                                  <sup> *</sup>
                                </label>

                                <input
                                  type="text"
                                  placeholder={
                                    practice?.demographicData?.field1?.label
                                  }
                                  className="form-control"
                                  {...register(
                                    practice?.demographicData?.field1?.label,
                                    {
                                      required:
                                        practice?.demographicData?.field1
                                          ?.value,
                                    }
                                  )}
                                />
                                <div>
                                  {/* <p className="label label-danger text-danger">
                                    {errors[
                                      practice?.demographicData?.field1?.label
                                    ] &&
                                      errors[
                                        practice?.demographicData?.field1?.label
                                      ].type == "required" &&
                                      `${practice?.demographicData?.field1?.label} is required`}
                                  </p> */}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="col-xl-5 offset-xl-2 col-md-6">
                          <div className="form-group">
                            <label>
                              {stateHeader}
                              {practice?.demographicData?.state ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <select
                              className="form-control border-0"
                              {...register("state", {
                                required: practice?.demographicData?.state,
                              })}
                              defaultValue={user.state}
                            >
                              <option value="" disabled={true}>
                                Select {stateHeader}
                              </option>
                              {states &&
                                states.map((state: any, index: any) => {
                                  return (
                                    <option
                                      key={index}
                                      // selected={state == user.state}
                                      value={state}
                                    >
                                      {state}
                                    </option>
                                  );
                                })}
                            </select>
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.state &&
                                  errors.state.type == "required" &&
                                  stateHeader + " is required"}
                              </p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {cityHeader}
                              {practice?.demographicData?.city ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <input
                              type="text"
                              placeholder={cityHeader}
                              className="form-control"
                              {...register("city", {
                                required: practice?.demographicData?.city,
                                maxLength: 100,
                              })}
                            />
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.city &&
                                  errors.city.type == "required" &&
                                  cityHeader + " is required"}
                              </p>
                              {/* <p *ngIf="city.errors.maxlength" className="label label-danger text-danger">
                                                {{cityHeader}} must be smaller
                                                than 100
                                                characters.</p> */}
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {collegeNameHeader}
                              {practice?.demographicData?.collegeName ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <input
                              type="text"
                              placeholder={collegeNameHeader}
                              className="form-control border-0"
                              {...register("collegeName", {
                                required:
                                  practice?.demographicData?.collegeName,
                                maxLength: 250,
                              })}
                            />

                            <div>
                              <p className="label label-danger text-danger">
                                {errors.collegeName &&
                                  errors.collegeName.type == "required" &&
                                  collegeNameHeader + " is required"}
                              </p>
                              <p className="label label-danger text-danger">
                                {errors.collegeName &&
                                  errors.collegeName.type != "required" &&
                                  collegeNameHeader +
                                    " must be smaller than 250 characters."}
                              </p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {coreBranchHeader}
                              {practice?.demographicData?.coreBranch ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <select
                              className="form-control border-0"
                              {...register("coreBranch", {
                                required: practice?.demographicData?.coreBranch,
                              })}
                            >
                              <option value="undefined" disabled={true}>
                                Select {coreBranchHeader}
                              </option>
                              {masterData.coreBranches &&
                                masterData.coreBranches.map(
                                  (branch: any, index: any) => {
                                    return (
                                      <option
                                        key={index}
                                        selected={
                                          branch.name == user?.coreBranch
                                        }
                                      >
                                        {branch.name}
                                      </option>
                                    );
                                  }
                                )}
                            </select>
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.coreBranches &&
                                  errors.coreBranches.type == "required" &&
                                  coreBranchHeader + " is required"}
                              </p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              {passingYearHeader}
                              {practice?.demographicData?.passingYear ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </label>

                            <select
                              className="form-control border-0"
                              {...register("passingYear", {
                                required:
                                  practice?.demographicData?.passingYear,
                              })}
                            >
                              <option value={undefined} disabled={true}>
                                Select {passingYearHeader}
                              </option>
                              {masterData.passingYear &&
                                masterData.passingYear.map(
                                  (year: any, index: any) => {
                                    return (
                                      <option
                                        key={index}
                                        selected={
                                          year.name == user?.passingYear
                                        }
                                      >
                                        {year.name}
                                      </option>
                                    );
                                  }
                                )}
                            </select>
                            <div>
                              <p className="label label-danger text-danger">
                                {errors.passingYear &&
                                  errors.passingYear.type == "required" &&
                                  passingYearHeader + " is required"}
                              </p>
                            </div>
                          </div>
                          {practice.demographicData.field2 &&
                            practice.demographicData.field2.value && (
                              <div className="form-group">
                                <label>
                                  {practice?.demographicData?.field2?.label}
                                  <sup> *</sup>
                                </label>

                                <input
                                  type="text"
                                  placeholder={
                                    practice?.demographicData?.field2?.label
                                  }
                                  className="form-control"
                                  {...register(
                                    practice?.demographicData?.field2?.label,
                                    {
                                      required:
                                        practice?.demographicData?.field2
                                          ?.value,
                                    }
                                  )}
                                />
                                <div>
                                  {/* <p className="label label-danger text-danger">
                                    {errors[
                                      practice?.demographicData?.field2?.label
                                    ] &&
                                      errors[
                                        practice?.demographicData?.field2?.label
                                      ].type == "required" &&
                                      practice?.demographicData?.field2?.label +
                                        " is required"}
                                  </p> */}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      requiredDemographicData ? "col-lg-4 ml-auto" : "col-lg-4"
                    }
                  >
                    <div className="ml-lg-5">
                      <div className="camera-sec-box mw-100">
                        <div className="heading">
                          <h6>Photo</h6>
                        </div>
                        <div>
                          {webcamImage && (
                            <div>
                              <figure
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <img src={webcamImage} alt="" />
                              </figure>
                            </div>
                          )}
                          <Camera
                            onPictureTaken={handleImage}
                            permissionErrors={handleInitError}
                            resizeQuality={1}
                            width={230}
                            height={150}
                            ref={cameraRef}
                            hidden={webcamImage}
                            onAccessAllowed={handleCameraPermission}
                          />
                          {showWebcam && permissionGranted && (
                            <div>
                              <h3 className="text-center">
                                <span className="success">Say Cheese!</span>
                              </h3>

                              <div className="info mx-auto">
                                <p className="text-center">
                                  We are capturing your Image
                                </p>
                              </div>
                            </div>
                          )}
                          {!webcamImage && (
                            <div className="camera-btn mx-auto">
                              <a
                                className="text-center text-white"
                                onClick={triggerSnapshot}
                              >
                                {" "}
                                Take Picture
                              </a>
                            </div>
                          )}
                          {webcamImage && (
                            <div className="camera-btn mx-auto">
                              <a
                                className="text-center text-white"
                                onClick={reTakeSnapshot}
                              >
                                {" "}
                                Retake Picture
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {getClientData?.identityInfo.identityVerification !=
                        "system" && (
                        <div className="camera-sec-box mw-100">
                          <div className="heading">
                            <h6>
                              Identity card
                              {practice?.demographicData
                                ?.identityVerification ? (
                                <sup>*</sup>
                              ) : (
                                <span>(optional)</span>
                              )}
                            </h6>
                          </div>

                          <div className=" p-3">
                            <DropzoneContainer onDropped={dropped} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    className="btn bg-color2 btn-lg text-white px-5"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Demographic;
