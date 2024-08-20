import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CircleProgress = ({
  xValue,
  yValue,
  value,
  text,
  innerStrokeColor,
  outerStrokeColor,
}: {
  xValue?: any;
  yValue?: any;
  value: any;
  text: any;
  innerStrokeColor?: string;
  outerStrokeColor?: string;
}) => {
  // return <CircularProgressbar value={value} text={text} strokeWidth={4} styles={buildStyles({
  //   textSize: '10px',
  //   textColor: '#000',
  //   ...(innerStrokeColor && { trailColor: innerStrokeColor }),
  //   ...(outerStrokeColor && { pathColor: outerStrokeColor }),
  // })} />
  return (
    <>
      {/* <div className="svg-pi-group">
        <svg className="svg-pi svg-pi-73">
          <circle className="svg-pi-track" style={{ stroke: outerStrokeColor }} />
          <text x="80" y="75"
            text-anchor="middle"
            stroke="#9d9d9d"
            stroke-width="1px"
            alignment-baseline="middle"
            rotate="-90deg"
          > {text}
          </text>
          <circle className="svg-pi-indicator" style={{ stroke: innerStrokeColor, strokeDasharray: "0px" }} />
        </svg>
      </div> */}
      <div className="svg-pi-group">
        <svg className="svg-pi svg-pi-25" style={{ scale: 0.8 }}>
          <circle
            className="svg-pi-track"
            style={{ stroke: innerStrokeColor, strokeDashoffset: "250px" }}
          />
          {value == 1 ? (
            <text
              x={xValue ? xValue : `40`}
              y={yValue ? yValue : `50`}
              fill="#000"
              transform="rotate(90 53,43)"
              className="svg-text"
              style={{ fontSize: "17px" }}
            >
              {text}
            </text>
          ) : (
            <text
              x={xValue ? xValue : `40`}
              y={yValue ? yValue : `50`}
              fill="#000"
              transform="rotate(90 50,45)"
              className="svg-text"
              style={{ fontSize: "15px" }}
            >
              {text}
            </text>
          )}
          {value != 0 && (
            <circle
              className="svg-pi-indicator"
              style={{
                stroke: outerStrokeColor,
                strokeDasharray: 200 + (value / 100) * 314,
                strokeDashoffset: "250px",
                strokeWidth: "5px",
              }}
            />
          )}
        </svg>
      </div>
    </>
  );
};

export default CircleProgress;
