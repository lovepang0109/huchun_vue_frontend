import { Modal } from "react-bootstrap";
import { useState } from "react";

interface props {
  show: boolean;
  onClose: () => void;
  feedbackSubmit: () => void;
  feedbackError: string;
  qfeedbackForm: any;
  onFeedbackCheck: any;
  setQFeedbackForm: any;
}

const LearningTestReportModal = ({
  show,
  onClose,
  feedbackSubmit,
  feedbackError,
  qfeedbackForm,
  onFeedbackCheck,
  setQFeedbackForm,
}: props) => {
  const [feedback, setFeedback] = useState<any>({
    ckFrame: false,
    ckMore: false,
    ckAnother: false,
    ckVideo: false,
    ckExp: false,
    txtAnother: "",
  });

  const feedbackChange = (event: any, checkProp: any) => {
    let qfeedbackF: any = { ...feedback };
    // if this prop is checked, uncheck others
    qfeedbackF[checkProp] = !qfeedbackF[checkProp]
    for (const prop in qfeedbackF) {
      if (prop != checkProp && qfeedbackF[checkProp] == true) {
        qfeedbackF[prop] = false
      }
    }
    setFeedback(qfeedbackF)
    onFeedbackCheck(event, checkProp)
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <h5>
          What’s <span className="text-danger">wrong</span> with this question?
        </h5>
      </Modal.Header>
      <form onSubmit={() => feedbackSubmit()}>
        <Modal.Body>
          <h5 className="error mb-2" hidden={!feedbackError}>
            {feedbackError}
          </h5>
          <div className="answer-box p-0">
            <ul>
              <li className="clearfix">
                <div className="answer clearfix d-flex align-items-center">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="ckFrame"
                        checked={feedback.ckFrame}
                        onChange={(e: any) => feedbackChange(e, "ckFrame")}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <span>The question isn’t framed correctly</span>
                </div>
              </li>

              <li className="clearfix">
                <div className="answer clearfix d-flex align-items-center">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="ckMore"
                        checked={feedback.ckMore}
                        onChange={(e: any) => feedbackChange(e, "ckMore")}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <span>Problem with one or more options</span>
                </div>
              </li>

              <li className="clearfix">
                <div className="answer clearfix d-flex align-items-center">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="ckExp"
                        checked={feedback.ckExp}
                        onChange={(e: any) => feedbackChange(e, "ckExp")}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <span>Explanation is correct, unclear, or needs improvement</span>
                </div>
              </li>

              <li className="clearfix">
                <div className="answer clearfix d-flex align-items-center">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="ckVideo"
                        checked={feedback.ckVideo}
                        onChange={(e) => feedbackChange(e, 'ckVideo')}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <span>Learning video is irrelevant, not loading, or inappropriate</span>
                </div>
              </li>

              <li className="clearfix">
                <div className="answer clearfix d-flex align-items-center">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="ckAnother"
                        checked={feedback.ckAnother}
                        onChange={(e: any) => feedbackChange(e, "ckAnother")}
                      />
                      <span
                        data-toggle="collapse"
                        data-target="#collapseQuestionFeedback"
                        aria-expanded="true"
                        aria-controls="collapseQuestionFeedback"
                        className="checkmark"
                      ></span>
                    </label>
                  </div>

                  <span>Another problem:</span>
                </div>

                <div id="collapseQuestionFeedback" className="collapse">
                  <div className="form-group mb-0">
                    <textarea
                      className="form-control"
                      required
                      name="txtAnother"
                      placeholder="Write your problem"
                      value={qfeedbackForm.txtAnother}
                      onChange={(e) =>
                        setQFeedbackForm((prev: any) => ({
                          ...prev,
                          txtAnother: e.target.value,
                        }))
                      }
                    ></textarea>
                  </div>
                </div>
              </li>
            </ul>
            <div className="w-100">
              <button
                type="button"
                className="btn btn-primary float-right mr-3 mb-3"
                // disabled={qfeedbackForm.txtAnother && qfeedbackForm.ckAnother}
                onClick={feedbackSubmit}
              >
                Report
              </button>
              <button
                type="button"
                className="btn btn-light mr-3 float-right mb-3"
                onClick={onClose}
              >
                Cancel
              </button>

            </div>

          </div>
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default LearningTestReportModal;
