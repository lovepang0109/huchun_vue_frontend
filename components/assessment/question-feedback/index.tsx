import clientApi from "@/lib/clientApi";
import { useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { alert, success, error } from "alertifyjs";
import alertify from "alertifyjs";

interface Props {
  reloadQuestions?: any;
  show: boolean;
  practiceId: any;
  teacherId: any;
  questionId: any;
  userId: any;
  attemptId: any;
  courseId?: any;
  isReviewing?: any;
  onClose: (feedbackSubmitted: boolean) => void;
  ishasFeedback?: any
  setIsHasFeedback?: any
  index?: any
  setQuestionStates?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { issueReported: boolean; userId: string | undefined };
    }>
  >;
}

const QuestionFeedback: React.FC<Props> = ({
  reloadQuestions,
  show,
  practiceId,
  teacherId,
  questionId,
  userId,
  attemptId,
  courseId,
  isReviewing,
  onClose,
  setQuestionStates,
  setIsHasFeedback,
  ishasFeedback,
  index
}: Props) => {
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>();
  const [qfeedbackForm, setQfeedbackForm] = useState<any>({
    ckFrame: false,
    ckMore: false,
    ckAnother: false,
    ckExp: false,
    ckVideo: false,
    txtAnother: "",
  });

  alertify.set("notifier", "position", "top-right");

  const feedbackSubmit = async () => {
    if (feedbackSubmitting) {
      return;
    }

    let feedbackErrors = "";
    if (
      !qfeedbackForm.ckFrame &&
      !qfeedbackForm.ckMore &&
      !qfeedbackForm.ckAnother &&
      !qfeedbackForm.ckExp &&
      !qfeedbackForm.ckVideo
    ) {
      feedbackErrors = "Please select at least one option.";
      error(feedbackErrors);
      return;
    }
    if (qfeedbackForm.ckAnother && !qfeedbackForm.txtAnother) {
      feedbackErrors = "Please enter your comment.";
      error(feedbackErrors);
      return;
    }

    setFeedbackError(feedbackErrors);
    let qfeedback: any = {
      teacherId: teacherId,
      practicesetId: practiceId,
      attemptId: attemptId,
      questionId: questionId,
      studentId: userId,
      feedbacks: [],
      comment: "",
      isReviewing: isReviewing || false,
    };

    if (courseId) {
      qfeedback.courseId = courseId;
    }

    if (qfeedbackForm.ckFrame) {
      qfeedback.feedbacks.push("The question isn't framed correctly");
    }
    if (qfeedbackForm.ckMore) {
      qfeedback.feedbacks.push("Problem with one or more options");
    }
    if (qfeedbackForm.ckExp) {
      qfeedback.feedbacks.push(
        "Explanation is correct, unclear, or needs improvement"
      );
    }
    if (qfeedbackForm.ckVideo) {
      qfeedback.feedbacks.push(
        "Learning video is irrelevant, not loading, or inappropriate"
      );
    }
    if (qfeedbackForm.ckAnother && !!qfeedbackForm.txtAnother) {
      qfeedback.comment = qfeedbackForm.txtAnother;
    }
    setFeedbackSubmitting(true);
    try {
      const { data } = await clientApi.post(
        "/api/feedbacks/questionFeedback",
        qfeedback
      );
      if (reloadQuestions) {
        await reloadQuestions(true);
      }
      setFeedbackSubmitting(false);
      success("Your feedback is submitted.");
      onClose(true);

      // Update the questionStates object to mark the issue as reported
       setQuestionStates((prevStates) => ({
         ...prevStates,
         [questionId]: {
           issueReported: true,
           userId: userId,
         },
       }));
      {/*setIsHasFeedback({
        ...ishasFeedback,
         [index]: true
      })*/}
    } catch (e) {
      setFeedbackSubmitting(false);
      console.error
      error("Failed to submit your feedback.");
      onClose(false);
    }
  };

  const onFeedbackCheck = (
    event: React.ChangeEvent<HTMLInputElement>,
    checkProp: string
  ) => {
    setQfeedbackForm({
      ...qfeedbackForm,
      [checkProp]: event.target.checked,
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQfeedbackForm({
      ...qfeedbackForm,
      txtAnother: event.target.value,
    });
  };

  return (
    <Modal show={show} onHide={() => onClose(false)}>
      <Modal.Header>
        <h5>
          What’s <span className="text-danger">wrong</span> with this question?
        </h5>
      </Modal.Header>
      <Modal.Body>
        <h5 className="error mb-2">{feedbackError}</h5>
        <div className="answer-box p-0">
          <ul>
            <li className="clearfix">
              <div className="answer clearfix d-flex align-items-center">
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="ckFrame"
                      value={qfeedbackForm.ckFrame}
                      onChange={(e: any) => onFeedbackCheck(e, "ckFrame")}
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
                      value={qfeedbackForm.ckMore}
                      onChange={(e: any) => onFeedbackCheck(e, "ckMore")}
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
                      value={qfeedbackForm.ckExp}
                      onChange={(e: any) => onFeedbackCheck(e, "ckExp")}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>

                <span>
                  Explanation is correct, unclear, or needs improvement
                </span>
              </div>
            </li>

            <li className="clearfix">
              <div className="answer clearfix d-flex align-items-center">
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="ckVideo"
                      // checked={qfeedbackForm.ckFrame}
                      onChange={(e) => onFeedbackCheck(e, "ckVideo")}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>

                <span>
                  Learning video is irrelevant, not loading, or inappropriate
                </span>
              </div>
            </li>

            <li className="clearfix">
              <div className="answer clearfix d-flex align-items-center">
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="ckAnother"
                      value={qfeedbackForm.ckAnother}
                      onChange={(e: any) => onFeedbackCheck(e, "ckAnother")}
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
                    onChange={handleTextChange}
                  ></textarea>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-light mr-2"
          onClick={() => onClose(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={feedbackSubmit}
        >
          Report
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionFeedback;
