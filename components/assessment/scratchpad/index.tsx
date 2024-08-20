import { clear } from 'console'
import { Modal, ModalBody } from 'react-bootstrap'
import { useEffect, useState, useRef } from "react";
import { useTakeTestStore } from "@/stores/take-test-store";
import { EventEmitter } from 'events';

interface props {
  show?: boolean
  onClose?: any,
  question?: any
}

const ScratchPad = ({ show, onClose, question }: props) => {
  const [selectedColor, setSelectedColor] = useState<string>("4bf")
  const [waiting, setWaiting] = useState<boolean>(false)
  const [drawing, setDrawing] = useState<boolean>(false)
  const [eraser, setEraser] = useState<boolean>(false)
  const [lastX, setLastX] = useState<number>(0)
  const [lastY, setLastY] = useState<number>(0)
  const [change, setChange] = useState<boolean>(false)
  const [imgs, setImgs] = useState<any>({})
  const [currentQ, setCurrentQ] = useState<string>('')
  const [cvContext, setCVContext] = useState<any>()
  const canvasRef = useRef(null)
  const onDrawing = useRef(new EventEmitter());
  const {
    updateAnswersOfUser,
    answersOfUser,
    localStartTime,
    updateLocalStartTime,
    serverStartTime,
    updateServerStartTime,
    adjustLocalTime,
    updateTestStarted,
    updateClientData,
    previousUrl,
    updateIsCoding,
    codingQuestion,
  } = useTakeTestStore();

  const downEvent = (event: any) => {
    if (event.offsetX !== undefined) {
      setLastX(event.screenX)
      setLastY(event.screenY)
    } else {
      setLastX(event.screenX - event.movementX)
      setLastY(event.screenY - event.movementY)
    }

    // begins new line
    cvContext.beginPath();

    setDrawing(true)
  }

  const dragEvent = (event: any) => {
    if (drawing) {
      let currentX = 0;
      let currentY = 0;
      // get current mouse position
      if (event.movementX !== undefined) {
        currentX = event.screenX;
        currentY = event.screenY;
      } else {
        currentX = event.screenX - event.movementX;
        currentY = event.screenY - event.movementY;
      }
      draw(lastX, lastY, currentX, currentY);

      // set current coordinates to last one
      setLastX(currentX)
      setLastY(currentY)
      setChange(true)
    }
  }

  const upEvent = (event: any) => {
    setDrawing(false);
    setChange(false)
    logImg();
  }

  const logImg = () => {
    const dataSrc = canvasRef.current.toDataURL("image/png", 0.8)
    const elem = document.createElement("img");
    elem.setAttribute("src", dataSrc);
    elem.setAttribute("height", canvasRef.current.height);
    elem.setAttribute("width", canvasRef.current.width);
    elem.setAttribute("style", 'position:absolute;');

    setImgs((prevImgs: any) => ({
      ...prevImgs,
      [currentQ]: [elem],
    }));
    onDrawing.current.emit({ q: currentQ, data: dataSrc });
  }

  const leaveEvent = (e: any) => { }

  const clear = () => {
    cvContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    logImg();
  }

  const showEraser = () => {
    setSelectedColor('')
    setEraser(true)
  }

  const getTouchPos = (canvasDom: any, touchEvent: any) => {
    const rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }

  const draw = (lX: any, lY: any, cX: any, cY: any) => {
    if (eraser) {
      cvContext.globalCompositeOperation = "destination-out";
      cvContext.arc(lastX, lastY, 8, 0, Math.PI * 2, false);
      cvContext.fill();
    } else {
      cvContext.globalCompositeOperation = "source-over";
      // line from
      cvContext.moveTo(lX, lY);
      // to
      cvContext.lineTo(cX, cY);
      // color
      cvContext.strokeStyle = selectedColor;
      cvContext.lineJoin = "round";
      cvContext.lineWidth = 5;
      // draw it
      cvContext.stroke();

    }
  }

  const changeColor = (color: string) => {
    setEraser(false);
    setSelectedColor(color);
  }

  const resizeCanvas = (() => {
    if (!canvasRef.current || waiting) return;

    setWaiting(true);
    setTimeout(() => {
      setWaiting(false);

      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;

      if (imgs[currentQ] && imgs[currentQ].length) {
        cvContext.drawImage(imgs[currentQ][imgs[currentQ].length - 1], 0, 0);
      }
    }, 200)
  })

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const cvContext = canvas.getContext('2d');
      setCVContext(cvContext)

      resizeCanvas();

      if (answersOfUser && answersOfUser.QA) {
        answersOfUser.QA.forEach((q) => {
          if (q && q.scratchPad) {
            setImgs((prevImgs: any) => ({
              ...prevImgs,
              [q.question]: q.scratchPad.map((sp) => {
                const elem = new Image();
                elem.src = sp;
                elem.height = canvas.current.height;
                elem.width = canvas.current.width;
                elem.style.position = 'absolute';
                return elem;
              }),
            }));
          }
        })
      }

      if (question) {
        setCurrentQ(question);
        if (!imgs[currentQ]) {
          setImgs((prevImgs: any) => ({
            ...prevImgs,
            [currentQ]: [],
          }));
        }
      }

      canvas.addEventListener("touchstart", (e: any) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      }, false);

      canvas.addEventListener("touchmove", (e: any) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      }, false);

      canvas.addEventListener("touchend", (e: any) => {
        const mouseEvent = new MouseEvent("mouseup", {
        });
        canvas.dispatchEvent(mouseEvent);
      }, false);
    }
  })

  useEffect(() => {
    if (change && currentQ) {
      if (!imgs[currentQ]) {
        setImgs((prevImgs: any) => ({
          ...prevImgs,
          [currentQ]: [],
        }));
      }
      cvContext.globalCompositeOperation = "source-over";
      cvContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (imgs[currentQ].length) {
        // load last image of this question
        cvContext.drawImage(imgs[currentQ][imgs[currentQ].length - 1], 0, 0);
      }
    }
  }, [change])

  return (
    <div className='m-sm scratchpad'>
      <div className='drawing_mesh' style={{ position: 'absolute', top: "5px" }}></div>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: "5px", zIndex: 10 }} onMouseDown={downEvent} onMouseMove={dragEvent} onMouseUp={upEvent} onMouseLeave={leaveEvent}></canvas>
      <ul className="drawing_tools" style={{ fontSize: "30px", zIndex: 11 }}>
        <li title="Clear" onClick={() => clear()} style={{ marginLeft: "5px" }}>
          <a>
            <i className="fa fa-fire" style={{ color: 'black' }}></i>
          </a>
        </li>
        <li title="Eraser" onClick={() => showEraser()} style={{ fontSize: "28px" }}>
          <a>
            <i className={"fa fa-eraser " + (eraser ? "fa-2x" : '')} style={{ color: 'black' }}></i>
          </a>
        </li>
        <li onClick={() => changeColor('white')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'white' ? "fa-2x" : '')} style={{ color: 'white' }}></i>
          </a >
        </li >
        <li onClick={() => changeColor('black')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'black' ? "fa-2x" : '')} style={{ color: 'black' }} ></i>
          </a >
        </li >
        <li onClick={() => changeColor('#4bf')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == '#4bf' ? "fa-2x" : '')} style={{ color: "#4bf" }}></i>
          </a >
        </li >
        <li onClick={() => changeColor('red')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'red' ? "fa-2x" : '')} style={{ color: 'red' }}></i>
          </a >
        </li >
        <li onClick={() => changeColor('yellow')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'yellow' ? "fa-2x" : '')} style={{ color: "yellow" }}></i>
          </a >
        </li >
        <li onClick={() => changeColor('green')}>
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'green' ? "fa-2x" : '')} style={{ color: "green" }}></i>
          </a >
        </li >
        <li onClick={() => changeColor('blue')} >
          <a>
            <i className={"fa fa-circle " + (selectedColor == 'blue' ? "fa-2x" : '')} style={{ color: "blue" }}></i>
          </a >
        </li >
        <li title="Close" onClick={onClose} >
          <a>
            <i className="fa fa-times" style={{ color: "black" }}></i>
          </a>
        </li >
      </ul >
    </div >
  )
}

export default ScratchPad
