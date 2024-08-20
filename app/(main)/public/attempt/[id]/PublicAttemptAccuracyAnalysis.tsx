import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useEffect, useState } from "react";
import moment from "moment";

interface props {
  attempt: any;
}
const PublciAttemptAccuracyAnalysis = ({ attempt }: props) => {
  const [previousAccuracyBySub, setPreviousAccuracyBySub] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      if (attempt.subjects) {
        const subjectIds = attempt.subjects.map((d: any) => d._id);
        const condObj = {
          subjects: subjectIds.join(","),
          practicesetId: attempt.practicesetId,
          currentAttempt: attempt._id,
          user: attempt.user._id,
          attemptDate: attempt.createdAt,
        };
        let { data } = await clientApi.get(
          `/api/attempts/accuracyBySubject/${
            attempt.practicesetId
          }${toQueryString(condObj)}`
        );
        if (data) {
          data.forEach((el) => {
            const sub = attempt.units.find((d: any) => d.name == el.unit);
            if (sub) {
              el.cAcc = sub.accuracy;
            } else {
              el.cAcc = 0;
            }
          });
        }

        const temp = data.filter((s) => s.cAcc * 100 < s.accuracy);

        setPreviousAccuracyBySub(
          temp.sort((s1, s2) => s2.accuracy - s1.accuracy)
        );
      }
    };
    fetchData();
  }, []);

  const millisecondsToTime = (time: any, args?: any) => {
    const sign = time < 0 ? "- " : "";
    time = Math.abs(time);
    if (args == "short") {
      if (time == 0) {
        return "0 sec";
      }
      time = Math.floor(time / 1000);
      if (time == 0) {
        return sign + "1 sec";
      }

      const hours = Math.floor(time / 60 / 60);
      const mins = Math.floor(time / 60);
      const secs = time % 60;

      if (hours > 0) {
        return sign + hours + " hrs";
      }

      if (mins == 0) {
        return sign + secs + " secs";
      }

      if (secs == 0) {
        return sign + mins + " mins";
      }

      return sign + mins + " mins " + secs + " secs";
    }
    if (args == "minutes") {
      if (time == 0) {
        return "0 min";
      }

      time = Math.floor(time / 1000);

      const mins = Math.floor(time / 60);

      if (mins == 0) {
        return sign + "1 min";
      }

      const hours = Math.floor(mins / 60);

      let result = sign;
      if (hours > 0) {
        result += hours + " hrs";
      }

      if (mins % 60 > 0) {
        result += (mins % 60) + " mins";
      }

      return result;
    } else {
      const toFormat = moment()
        .utcOffset(0)
        .set({ h: 0, m: 0, s: 0, ms: 0 })
        .add(time, "ms");
      return sign + toFormat.format("HH:mm:ss");
    }
  };

  return (
    <div className="show active" id="accuracy">
      <div className="error-analysis clearfix mx-auto mw-100 pt-0">
        <div className="error-analysis-area">
          <div className="wrap mb-3">
            <div className="accordation-area pt-0">
              <div className="accordion">
                <div className="section_heading_wrapper mb-0">
                  <h3 className="section_top_heading">Unit wise</h3>
                </div>
              </div>
            </div>
            {attempt.units
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((item: any, index: number) => (
                <div className="accuracy-area" key={item.name + index}>
                  <div className="title">
                    <h4 className="f-14">
                      {item.name} ({item.subject})
                    </h4>
                  </div>

                  <div className="row">
                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/bow-arrow2.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Accuracy</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center pb-2">
                            {(item.accuracy * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/close-icon.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Incorrect Answer</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center pb-2">
                            {item.incorrect}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/stopwatch.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Unproductive Underrun/Overrun Time</h4>
                          </div>
                        </div>

                        <div className="content pt-0">
                          <span className="text-center">
                            {millisecondsToTime(item.wastedTime || 0, "short")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <span className="missed-icon">!</span>
                          </figure>

                          <div className="title ml-2">
                            <h4>Missed Questions</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center pb-2">
                            {item.missed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {previousAccuracyBySub?.length > 1 && (
            <div className="wrap">
              <div className="accordation-area pt-0">
                <div className="accordion">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Units that you’ve struggled with before
                    </h3>
                  </div>
                </div>
              </div>
              {previousAccuracyBySub.map((item: any, i: number) => (
                <div className="accuracy-area" key={item.unit}>
                  <div className="title">
                    <h4 className="f-14">
                      {item.unit} ({item.subject})
                    </h4>
                  </div>

                  <div className="row">
                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/bow-arrow3.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Previous Accuracy</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center">
                            {item.accuracy.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/bow-arrow2.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Current Accuracy</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center">
                            {(item.cAcc * 100).toFixed(2) + ""}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="item mx-0">
                        <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                          <figure>
                            <img src="/assets/images/stopwatch.png" alt="" />
                          </figure>

                          <div className="title ml-2">
                            <h4>Avg. Time Per Qst.</h4>
                          </div>
                        </div>

                        <div className="content">
                          <span className="text-center">
                            {(item.avgTimeDoQuestion / 1000).toFixed(2) + " "}
                            sec
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <em>
            *Time Wasted = Time lost on missed questions where the student spent
            extra time above expected average time.
          </em>
        </div>
      </div>
    </div>
  );
};

export default PublciAttemptAccuracyAnalysis;
