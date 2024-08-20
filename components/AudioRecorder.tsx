import React, { useState, useEffect, useRef } from "react";
import { getAudioDuration } from "@/lib/helpers";
import { alert, success, error, confirm } from "alertifyjs";

const AudioRecorder = ({ recordSelected }: any) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [recorder, setRecorder] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [audioCtx, setAudioCtx] = useState<any>(null);
  const [audioAnalyzer, setAudioAnalyzer] = useState<any>(null);
  const [canvasCtx, setCanvasCtx] = useState<any>(null);
  const visualizerRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const audioAnalyzerRef = useRef(null);
  const audioCtxRef = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const recorderRef = useRef(null);
  const mainControlsRef = useRef(null);
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioAnalyzer.disconnect();
        audioCtx.close();
        setAudioAnalyzer(null);
        setAudioCtx(null);
      }
      records.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [audioCtx, audioAnalyzer, records]);

  useEffect(() => {
    const initializeRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log("getUserMedia supported.");

        let chunks = [];

        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        const audioAnalyzer = audioCtx.createAnalyser();
        audioAnalyzer.fftSize = 2048;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(audioAnalyzer);

        const canvasCtx = visualizerRef.current.getContext("2d");
        setCanvasCtx(canvasCtx);

        const newRecorder = new MediaRecorder(stream);
        recorderRef.current = newRecorder; // Update the recorderRef.current
        setRecorder(newRecorder);
        setRecord(newRecorder);
        console.log(newRecorder);

        newRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        newRecorder.onstop = () => {
          console.log("stop recording");
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          chunks = [];

          const audioURL = window.URL.createObjectURL(blob);

          const audioEle = {
            url: audioURL,
            blob: blob,
            selected: false,
            duration: 0,
          };

          getAudioDuration(audioURL, (d) => {
            audioEle.duration = d;
            setRecords((prevRecords) => [...prevRecords, audioEle]);
            if (prevRecords.length === 0) {
              selectRecord(audioEle);
            }
          });
        };

        // Start recording
        // newRecorder.start();
      } catch (err) {
        alert("Message", "The following error occurred: " + err);
      }
    };

    initializeRecording();

    return () => {
      // Clean up recorder and stream
      if (record) {
        record.stop();
      }
    };
  }, []);

  const selectRecord = (rec) => {
    const updatedRecords = records.map((record) => {
      if (record === rec) {
        return { ...record, selected: true };
      } else {
        return { ...record, selected: false };
      }
    });
    setRecords(updatedRecords);
    recordSelected({ blob: rec.blob, url: rec.url, duration: rec.duration });
  };

  const visualize = (stream: any) => {
    if (!audioCtx) {
      const temp_audioCtx = new AudioContext();
      setAudioCtx(temp_audioCtx);
    }

    const source = audioCtx.createMediaStreamSource(stream);

    setAudioAnalyzer(audioCtx.createAnalyser());
    setAudioAnalyzer({
      ...audioAnalyzer,
      fftSize: 2048,
    });

    source.connect(audioAnalyzer);
    //analyser.connect(this.audioCtx.destination);

    draw();
  };

  const draw = () => {
    if (!audioAnalyzerRef.current) {
      return;
    }

    const bufferLength = audioAnalyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = visualizerRef.current.width;
    const HEIGHT = visualizerRef.current.height;

    requestAnimationFrame(draw);

    audioAnalyzerRef.current.getByteTimeDomainData(dataArray);

    canvasCtxRef.current.fillStyle = "#f4f4f7";
    canvasCtxRef.current.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtxRef.current.lineWidth = 2;
    canvasCtxRef.current.strokeStyle = "#7572fe";

    canvasCtxRef.current.beginPath();

    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtxRef.current.moveTo(x, y);
      } else {
        canvasCtxRef.current.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtxRef.current.lineTo(
      visualizerRef.current.width,
      visualizerRef.current.height / 2
    );
    canvasCtxRef.current.stroke();
  };

  useEffect(() => {
    const resizeCanvas = () => {
      if (!visualizerRef.current || waiting) {
        return;
      }

      setWaiting(true);
      setTimeout(() => {
        setWaiting(false);
        visualizerRef.current.width = mainControlsRef.current.offsetWidth;
      }, 300);
    };

    window.addEventListener("resize", resizeCanvas);

    // Call resizeCanvas initially to set the initial canvas size
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [waiting]);

  const startRecord = () => {
    audioCtxRef.current.resume();
    // recorderRef.current.start();
    record.start();
    console.log(record, "record");
    setRecording(true);
  };

  const stopRecord = () => {
    audioCtxRef.current.suspend();
    // recorderRef.current.stop();
    record.stop();
    setRecording(false);
  };

  const removeRecord = (rIdx) => {
    window.alert("Are you sure you want to remove this audio?");
    setRecords((prevRecords) => {
      const updatedRecords = [...prevRecords];
      updatedRecords.splice(rIdx, 1);
      updatedRecords.forEach((record) =>
        window.URL.revokeObjectURL(record.url)
      );
      return updatedRecords;
    });
  };

  return (
    <>
      <div>
        <section className="main-controls" ref={mainControlsRef}>
          <canvas
            ref={visualizerRef}
            className="visualizer w-100"
            height="60px"
          ></canvas>
          <div className="row">
            <div className="col">
              <button
                className="btn btn-light btn-block"
                disabled={!recording}
                onClick={stopRecord}
              >
                Stop
              </button>
            </div>
            <div className="col">
              <button
                className="btn btn-primary btn-block"
                disabled={recording}
                onClick={startRecord}
              >
                Record
              </button>
            </div>
          </div>
        </section>

        <section className="sound-clips">
          {records.map((rec, i) => (
            <div key={i} className="mt-2 d-flex align-items-center">
              <div>
                <a onClick={() => selectRecord(rec)}>
                  <i
                    className={`far fa-2x ${
                      rec.selected ? "fa-dot-circle" : "fa-circle"
                    }`}
                  ></i>
                </a>
              </div>
              <div className="flex-grow-1 mx-3">
                <audio controls src={rec.url} className="w-100"></audio>
              </div>
              <div>
                <a onClick={() => removeRecord(i)}>
                  <figure>
                    <img src="assets/images/close.png" alt="" />
                  </figure>
                </a>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default AudioRecorder;
