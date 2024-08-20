import { formatQuestion, numberToAlpha } from "@/lib/pipe";
import MathJax from "../mathjax";
import { useTakeTestStore } from "@/stores/take-test-store";

interface props {
  question: any;
  setQuestion: any;
  userAnswers?: any;
  answerChanged: any;
  lockedAnswers?: any;
  showCrossOut?: any;
  testView?: any;
  answerText?: any;
}

const McqQuestion = ({
  question,
  setQuestion,
  userAnswers,
  answerChanged,
  lockedAnswers,
  showCrossOut,
  answerText,
  testView = "default",
  answerMasking,
}: props) => {
  const { clientData } = useTakeTestStore();

  const selectAnswer = (answer: any, index: number) => {
    let result = question;
    if (result.questionType === "single") {
      result = {
        ...result,
        answers: result.answers.map((a: any) => ({
          ...a,
          isChecked: a._id !== answer._id ? false : !a.isChecked,
        })),
      };
    } else {
      result = {
        ...result,
        answers: result.answers.map((a: any) =>
          a._id === answer._id ? { ...a, isChecked: !a.isChecked } : a
        ),
      };
    }
    console.log(result, "this is updated question before set question");
    setQuestion(result);
    answerChanged({
      answer: { ...answer, isChecked: !answer.isChecked, index: index },
      question: result,
    });
  };

  const satViewAnswerSelection = (answer: any, index: number) => {
    if (lockedAnswers && lockedAnswers[answer._id]) {
      return;
    }
    selectAnswer(
      { ...answer, isChecked: !answer.isChecked, index: index },
      index
    );
  };

  return (
    <>
      {testView == "default" ? (
        <div className="question-box bg-white min-h-auto mathjax-over-initial">
          <div className="question-item mb-3">
            <span>
              <MathJax
                value={formatQuestion(
                  clientData.baseUrl,
                  question.questionText
                )}
              />
            </span>

            <div className="row">
              {question.audioFiles?.map((audio: any, i: number) => (
                <div
                  className="position-relative my-2 col-lg-6 col-12"
                  key={"audio" + i}
                >
                  <label>{audio.name}</label>
                  <audio controls src={audio.url} className="w-100"></audio>
                </div>
              ))}
            </div>
          </div>

          <div className="question-answers mb-0">
            {question.answers.map((answer: any, index: number) => (
              <div
                className={`${answer.isChecked ? "" : ""}`}
                key={"questio-answers" + index}
              >
                <div className="row">
                  <label className="col-auto answer-checkbox">
                    <input
                      name={`answer_${index}`}
                      type="checkbox"
                      value={answer.isChecked}
                      onChange={() => selectAnswer(answer, index)}
                      disabled={lockedAnswers && lockedAnswers[answer._id]}
                    />
                    <span
                      className={
                        answer.isChecked
                          ? "checkmark checked"
                          : "checkmark unchecked"
                      }
                    ></span>
                  </label>

                  <span className="col answer-text">
                    <MathJax value={answer.answerText} />
                  </span>
                </div>
                <div className="row">
                  {answer.audioFiles?.map((audio: any, i: number) => (
                    <div
                      className="position-relative my-2 col-lg-6 col-12"
                      key={"audio_file" + i}
                    >
                      <label>{audio.name}</label>
                      <audio controls src={audio.url} className="w-100"></audio>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
      {testView == "SAT" ? (
        <div className="question-box bg-white min-h-auto mathjax-over-initial">
          <div className="question-item mb-3">
            {userAnswers?.annotation?.questionText ? (
              <div
                id={`question-item-${question._id}`}
                dangerouslySetInnerHTML={{
                  __html: userAnswers.annotation.questionText,
                }}
              ></div>
            ) : (
              <></>
            )}
            {!userAnswers ||
            !userAnswers.annotation ||
            !userAnswers.annotation.questionText ? (
              <div id={`question-item-${question._id}`}>
                <span>
                  <MathJax
                    value={formatQuestion(
                      clientData.baseUrl(question.questionText)
                    )}
                  />
                </span>
              </div>
            ) : (
              <></>
            )}
            {question.audioFiles?.length ? (
              <div className="row">
                {question.audioFiles.map((audio: any, i: number) => (
                  <div
                    className="position-relative my-2 col-lg-6 col-12"
                    key={"audio_files" + i}
                  >
                    <label>{audio.name}</label>
                    <audio controls src={audio.url} className="w-100"></audio>
                  </div>
                ))}
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="question-answers mb-0">
            {question.answers.map((answer: any, index: number) => (
              <div className="d-flex gap-xs" key={"question_answer" + index}>
                <div className="position-relative flex-grow-1">
                  <div
                    className={`answer-item cursor-pointer ${
                      answer.crossedOut ? "crossedOut" : ""
                    } ${answer.isChecked ? "answered" : ""}`}
                    onClick={() => satViewAnswerSelection(answer, index)}
                  >
                    <div className="row mb-2">
                      <label className="col-auto answer-checkbox">
                        <input
                          name={`answer_${index}`}
                          disabled
                          type="checkbox"
                          value={answer.isChecked}
                        />
                        <span className="checkmark"></span>
                      </label>

                      <span className="col answer-text">
                        <MathJax value={answer.answerText} />
                      </span>
                    </div>
                    {answer.audioFiles?.length ? (
                      <div className="row">
                        {answer.audioFiles.map((audio: any, i: number) => (
                          <div
                            className="position-relative my-2 col-lg-6 col-12"
                            key={"audio" + i}
                          >
                            <label>{audio.name}</label>
                            <audio
                              controls
                              src={audio.url}
                              className="w-100"
                            ></audio>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  {answer.crossedOut ? (
                    <div className="answer-crossedOut"></div>
                  ) : (
                    <></>
                  )}
                </div>
                {showCrossOut ? (
                  <div className="text-center pt-4">
                    <a
                      onClick={() =>
                        setQuestion((prev: any) => ({
                          ...prev,
                          answers: prev.answers.map((a: any, i: number) =>
                            i === index
                              ? { ...a, crossedOut: !a.crossedOut }
                              : a
                          ),
                        }))
                      }
                      style={{ minWidth: "40px", display: "inline-block" }}
                    >
                      {!answer.crossedOut ? (
                        <span className="line-through answer-index">
                          {" "}
                          {numberToAlpha(index)}
                        </span>
                      ) : (
                        <span className="bold underline"> Undo</span>
                      )}
                    </a>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default McqQuestion;
