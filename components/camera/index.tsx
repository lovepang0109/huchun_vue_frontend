import { useRef, useState, useCallback,forwardRef, useImperativeHandle } from 'react'
import Webcam from 'react-webcam'

interface props {
  width?: number
  height?: number
  resizeQuality?: number
  onPictureTaken: any
  permissionErrors: any
  hidden?: boolean
  onAccessAllowed?: any
  // allowCameraPermission: any
}
const Camera = forwardRef(({
  width = 500,
  height = 500,
  resizeQuality = 0.7,
  onPictureTaken,
  permissionErrors,
  hidden,
  onAccessAllowed,
}: // allowCameraPermission,
props,ref) => {
  // toggle webcam on/off
  const [showWebcam,setShowWebCam] = useState(false);
  const [allowCameraSwitch,setAllowCameraSwitch] = useState(false);
  const [permissionGranted,setPermissionGranted] = useState(false);
  const [multipleWebcamsAvailable,setMultipleWebcamsAvailable] = useState(false);
  const [deviceId,setDeviceId] = useState(false);

  useImperativeHandle(ref, () => ({
    //the functions to call on parent level
    toggleWebcam(): void {
      setShowWebCam(!showWebcam)
    },
    capture() {
      const imageSrc = webcamRef?.current?.getScreenshot()
      onPictureTaken(imageSrc)
    }
  }))

  const webcamRef = useRef<Webcam>(null)
  // const capture = useCallback(() => {
  //   const imageSrc = webcamRef?.current?.getScreenshot()
  //   onPictureTaken(imageSrc)
  // }, [webcamRef]);
  return (
    <div style={{ textAlign: 'center' }}>
      <Webcam
        audio={false}
        height={height}
        ref={webcamRef!}
        screenshotFormat="image/jpeg"
        width={width}
        hidden={hidden}
        onUserMedia={onAccessAllowed}
        onUserMediaError={permissionErrors}
        videoConstraints={{ width, height, facingMode: 'user' }}
      />
      {/* <button onClick={capture}>Capture photo</button> */}
    </div>
  )
})

Camera.displayName = "Camera";

export default Camera
