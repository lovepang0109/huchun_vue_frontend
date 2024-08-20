"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import Camera from "@/components/camera";
import { isRequiredDemographic } from "@/services/auth";
import { apiVersion } from "@/lib/clientApi";

const CameraInstruction = () => {
  const param = useParams();
  const router = useRouter();
  const queryParams = useSearchParams();
  const { user }: any = useSession()?.data || {};
  const { update } = useSession();

  const [avatar, setAvatar] = useState({});
  const [showWebcam, setShowWebcam] = useState(false);
  const [imageUrl, setImageUrl] = useState(false);
  const [webcamImage, setWebcamImage]: any = useState(null);
  const [errors, setErrors] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setClientData] = useState<any>();
  const [practice, setPractice] = useState<any>();
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const getPractice = async () => {
    const { data } = await clientApi.get(
      `/api/tests/${param.id}${toQueryString({
        hasAccessMode: true,
        home: true,
      })}`
    );
    setPractice(data);
    setLoaded(true);
    return data;
  };

  const getClientData = useCallback(async () => {
    const { data } = await clientApi.get("/api/settings");
    setClientData(data);
  }, []);

  useEffect(() => {
    getPractice();
    getClientData();
  }, []);

  const cameraRef: any = useRef(null);

  // const toggleCamera = () => {
  //   setPermissionGranted(true);
  //   setShowWebcam(!showWebcam);
  //   //call functions in camera component
  //   cameraRef.current.toggleWebcam();
  // }

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

  const uploadImage = async (file: any) => {
    if (uploading) {
      return;
    }
    setUploading(true);
    const fileName = Date.now() + ".jpg";
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    var url = file;
    let converted = await (await fetch(url)).blob();

    const res = (await uploadFile(converted, fileName, "file")).data;
    setImageUrl(res.fileUrl);
    let temp = { path: res.path, fileUrl: res.fileUrl };
    user.info.identityInfo.imageUrl = res.fileUrl;
    setAvatar(temp);
    await clientApi.put(`/api/users/${user.info._id}`, user.info);
    await update();
    setUploading(false);
  };

  const handleInitError = (error: any) => {
    //@ts-ignore
    const terror = errors;
    terror.push(error);
    setErrors(terror);
  };

  const handleCameraPermission = (data: any) => {
    setPermissionGranted(true);
    setErrors([]);
    setShowWebcam(true);
  };

  const goToNext = async () => {
    try {
      setProcessing(true);
      if (practice.testMode == "proctored" && settings.features.faceDetect) {
        const result: any = (
          await clientApi.get("/api/users/validateUserPicture")
        ).data;

        if (!result.valid) {
          let message =
            "Cannot detect you in the picture. Please take another camera snapshot.";
          if (result.reason == "more-than-one") {
            message =
              "Detect more than one student. Please take another picture with you only.";
          }
          alertify.alert("Message", message);
          return;
        }
      }
      if (isRequiredDemographic(practice.demographicData, user)) {
        router.push(`/assessment/demographic-data/${practice._id}`);
      } else {
        router.push(`/assessment/instruction/${practice._id}`);
      }
    } catch (ex) {
      console.log(ex);
      alertify.alert("Message", "Failed to detect user.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <section className="camera-sec">
        <div className="container">
          <div className="camera-sec-area">
            <div className="camera-sec-wrap mx-auto">
              {(showWebcam === false || !permissionGranted) && (
                <div>
                  <figure>
                    <img src="/assets/images/camera-frame.png" alt="" />
                  </figure>
                </div>
              )}
              {webcamImage && (
                <div>
                  <figure>
                    <img src={webcamImage} />
                  </figure>
                </div>
              )}
              <Camera
                onPictureTaken={handleImage}
                permissionErrors={handleInitError}
                resizeQuality={1}
                width={625}
                height={325}
                ref={cameraRef}
                hidden={webcamImage !== null || !showWebcam}
                onAccessAllowed={handleCameraPermission}
              />

              {/* <app-camera [height]="350" [width]="625" [hidden]="webcamImage || errors.length>0 || !permissionGranted" (pictureTaken)="handleImage($event)"
                          (permissionErrors)="handleInitError($event)" (allowCameraPermission)="handleCameraPermission($event)"></app-camera> */}

              <div className="camera-sec-content">
                {showWebcam && permissionGranted && (
                  <div>
                    <h3 className="text-center">
                      <span
                        className="success"
                        style={{ background: "none", paddingRight: "0px" }}
                      >
                        We need to access your camera
                      </span>
                    </h3>

                    <div className="info mx-auto">
                      <p className="text-center">
                        We need to turn your camera on to take a proctored
                        examination
                        {uploading && (
                          <i className="fa fa-spinner fa-pulse"></i>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {permissionGranted === false && (
                  <div className="camera-sec-content">
                    <h3 className="text-center">
                      Getting your camera ready...
                    </h3>

                    <div className="info mx-auto">
                      <p className="text-center">
                        Please give us permission to access your camera
                      </p>
                    </div>

                    <div className="lodar mx-auto">
                      <figure>
                        <img
                          src="/assets/images/animation_500_kh7o1537.gif"
                          alt=""
                        />
                      </figure>
                    </div>
                  </div>
                )}

                {showWebcam &&
                  !webcamImage &&
                  errors.length == 0 &&
                  permissionGranted && (
                    <div className="camera-btn-remove mx-auto text-center mt-2">
                      <a className="btn btn-primary" onClick={triggerSnapshot}>
                        {" "}
                        Turn On
                      </a>
                    </div>
                  )}
                {showWebcam && webcamImage && permissionGranted && (
                  <div className="button-group clearfix mx-auto mt-2 text-center">
                    <div className="form-row">
                      <div className="col">
                        <button
                          disabled={processing || (uploading && true)}
                          className="btn btn-primary"
                          onClick={goToNext}
                        >
                          Continue
                        </button>
                      </div>

                      <div className="wrap">
                        <div className="col">
                          <button
                            disabled={processing || (uploading && true)}
                            className="btn btn-outline"
                            onClick={reTakeSnapshot}
                          >
                            Retake Picture
                          </button>
                        </div>

                        <div className="take-again">
                          <a>Not satisfied? Take it again</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="camera-sec-content">
                    <h3 className="text-center">
                      <span className="not-access">
                        We couldn’t access your Camera
                      </span>
                    </h3>

                    <div className="info mx-auto">
                      <p className="text-center">
                        You might not have given us permission to access your
                        camera or your camera might not be functioning
                      </p>
                    </div>

                    <div className="help-link mx-auto">
                      <a
                        type="button"
                        data-toggle="modal"
                        data-target="#helpModal"
                      >
                        I need help
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="modal fade"
        id="helpModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="helpModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 py-3">
              <h5 className="modal-title">
                Setup Help{" "}
                <span>
                  Based on your browser you can troubleshoot your issue
                </span>
              </h5>

              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="video-box">
                    <figure>
                      <img src="/assets/images/help.png" alt="" />
                    </figure>

                    <h4>Enable Camera in Chrome</h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="video-box">
                    <figure>
                      <img src="/assets/images/help.png" alt="" />
                    </figure>

                    <h4>Enable Camera in Firefox</h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="video-box">
                    <figure>
                      <img src="/assets/images/help.png" alt="" />
                    </figure>

                    <h4>Enable Camera in Internet Explorer</h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="video-box">
                    <figure>
                      <img src="/assets/images/help.png" alt="" />
                    </figure>

                    <h4>Enable Camera in Safari</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CameraInstruction;
