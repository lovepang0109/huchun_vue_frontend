import { useState } from 'react'
import { Player } from "@lottiefiles/react-lottie-player";
import { Modal } from "react-bootstrap";

interface props {
  show: boolean;
  onClose: any,
  userCourse: any;
  setUserCourse: any;
  setRating: any;
  sendFeedback: any;
  progress: number;
  askFeedbackLater: any;
}

const CourseStageFeedback = ({
  show,
  onClose,
  userCourse,
  setUserCourse,
  setRating,
  sendFeedback,
  progress,
  askFeedbackLater,
}: props) => {
  const [feedback, setFeedback] = useState<string>(userCourse?.feedback || '')

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Body>
        <section className="py-4">
          <h4 className="rating-title">
            How would you rate your experience with the course so far?
          </h4>
          <div className="ratings-area bg-white mx-auto">
            <div className="heading">
              <h4 className="text-center">
                {userCourse?.rating == "1" ? "VERY BAD" : ""}
                {userCourse?.rating == "2" ? "BAD" : ""}
                {userCourse?.rating == "3" ? "AVERAGE" : ""}
                {userCourse?.rating == "4" ? "GOOD" : ""}
                {userCourse?.rating == "5" ? "AMAZING" : ""}
              </h4>
            </div>
            {userCourse?.rating ? (
              <div className="stars mx-auto">
                <ul className="nav">
                  <li className="mx-0">
                    <a onClick={() => setRating(1)}>
                      {userCourse?.rating == 1 ? (
                        <>
                          <Player
                            src="https://assets6.lottiefiles.com/private_files/lf30_uuirhaey.json"
                            background="transparent"
                            className="star"
                            speed={1}
                            autoplay
                            id="star_one"
                          />
                          <Player
                            src="https://assets4.lottiefiles.com/private_files/lf30_digrehtx.json"
                            background="transparent"
                            className="star"
                            speed={1}
                            style={{ display: "none" }}
                            loop
                            autoplay
                            id="star_two"
                          />
                        </>
                      ) : userCourse?.rating > 1 ? (
                        <figure>
                          <img
                            src="/assets/images/star-active.png"
                            alt=""
                          />
                        </figure>
                      ) : <></>}
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 2,
                        }))
                      }
                    >
                      {userCourse?.rating < 2 ? (
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      ) : <></>}
                      {userCourse?.rating == 2 ? (
                        <Player
                          className="star"
                          src="https://assets7.lottiefiles.com/private_files/lf30_yt0dbfaw.json"
                          background="transparent"
                          speed={1}
                          loop
                          autoplay
                        />
                      ) : userCourse?.rating > 2 ? (
                        <figure>
                          <img
                            src="/assets/images/star-active.png"
                            alt=""
                          />
                        </figure>
                      ) : <></>}
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 3,
                        }))
                      }
                    >
                      {userCourse?.rating < 3 ? (
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      ) : <></>}
                      {userCourse?.rating == 3 ? (
                        <Player
                          className="star"
                          src="https://assets10.lottiefiles.com/private_files/lf30_ae1w5qve.json"
                          background="transparent"
                          speed={1}
                          loop
                          autoplay
                        />
                      ) : userCourse?.rating > 3 ? (
                        <figure>
                          <img
                            src="/assets/images/star-active.png"
                            alt=""
                          />
                        </figure>
                      ) : <></>}
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 4,
                        }))
                      }
                    >
                      {userCourse?.rating < 4 ? (
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      ) : <></>}
                      {userCourse?.rating == 4 ? (
                        <Player
                          className="star"
                          src="https://assets5.lottiefiles.com/private_files/lf30_x4i7ykiv.json"
                          background="transparent"
                          speed={1}
                          loop
                          autoplay
                        />
                      ) : userCourse?.rating > 4 ? (
                        <figure>
                          <img
                            src="/assets/images/star-active.png"
                            alt=""
                          />
                        </figure>
                      ) : <></>}
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 5,
                        }))
                      }
                    >
                      {userCourse?.rating < 5 ? (
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      ) : <></>}

                      {userCourse?.rating == 5 ? (
                        <Player
                          className="star"
                          src="https://assets2.lottiefiles.com/private_files/lf30_zxj3gzwi.json"
                          background="transparent"
                          speed={1}
                          loop
                          autoplay
                        />
                      ) : <></>}
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="stars ratingOne mx-auto">
                <ul className="nav">
                  <li>
                    <a onClick={() => setRating(1)}>
                      <figure>
                        <img src="/assets/images/star.png" alt="" />
                      </figure>
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 2,
                        }))
                      }
                    >
                      <figure>
                        <img src="/assets/images/star.png" alt="" />
                      </figure>
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 3,
                        }))
                      }
                    >
                      <figure>
                        <img src="/assets/images/star.png" alt="" />
                      </figure>
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 4,
                        }))
                      }
                    >
                      <figure>
                        <img src="/assets/images/star.png" alt="" />
                      </figure>
                    </a>
                  </li>

                  <li>
                    <a
                      onClick={() =>
                        setUserCourse((prev: any) => ({
                          ...prev,
                          rating: 5,
                        }))
                      }
                    >
                      <figure>
                        <img src="/assets/images/star.png" alt="" />
                      </figure>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {userCourse?.rating ? (
            <form className="text-center" onSubmit={() => {
              sendFeedback(feedback)
              setUserCourse((prev: any) => ({ ...prev, feedback: feedback }))
            }}>
              <textarea
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                maxLength={4000}
                className="w-100 p-2"
                placeholder="Tell us more..."
                required
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={false}
              >
                {" "}
                Send Feedback
              </button>
            </form>
          ) : <></>}
          {progress < 100 ? (
            <div className="text-center mt-3">
              <a
                onClick={askFeedbackLater}
                role="button"
                className="btn btn-link"
              >
                {" "}
                Ask me at the end of the course
              </a>
            </div>
          ) : <></>}
        </section>
      </Modal.Body>
    </Modal>
  );
};

export default CourseStageFeedback;
