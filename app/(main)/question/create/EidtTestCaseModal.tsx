import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";

const EidtTestCaseModal = ({
  show,
  setShow,
  onClose,
  question,
  setQuestion,
  testCase,
  idx,
  isNew,
  setIsNew,
}: any) => {
  const [testcase, setTestcase] = useState<any>([]);
  const [editingCase, setEditingCase] = useState<any>({
    args: "",
    input: "",
    output: "",
    isSample: false,
  });
  const [error, setError] = useState<any>({
    arg: false,
    input: false,
    output: false,
  });

  useEffect(() => {
    console.log("dddd");
    if (isNew) {
      setEditingCase({
        args: "",
        input: "",
        output: "",
        isSample: false,
      });
    } else if (testCase) {
      console.log("Test");
      setIsNew(false);
      setEditingCase({
        ...testCase,
      });
    }
  }, [show]);

  const save = (more = false) => {
    setError({
      arg: false,
      input: false,
      output: false,
    });
    if (question.hasArg && !editingCase.args) {
      setError({
        ...error,
        arg: true,
      });
      return;
    }
    if (question.hasUserInput && !editingCase.input) {
      setError({
        ...error,
        input: true,
      });
      return;
    }
    if (!editingCase.output) {
      setError({
        ...error,
        output: true,
      });
      return;
    }
    if (error.arg || error.input || error.output) {
      return;
    }

    if (isNew) {
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        testcases: [...prevQuestion.testcases, { ...editingCase }],
      }));
    } else {
      setQuestion((prevQuestion) => {
        // Create a new array with the updated test case
        const updatedTestcases = prevQuestion.testcases.map((testcase, i) => {
          if (i === idx) {
            // Return a new object with the updated args
            return {
              ...testcase,
              args: editingCase.args,
              input: editingCase.input,
              output: editingCase.output,
              isSample: editingCase.isSample,
            };
          }
          return testcase;
        });

        // Return the updated question object
        return {
          ...prevQuestion,
          testcases: updatedTestcases,
        };
      });
      console.log("con");
    }
    if (more) {
      setIsNew(true);
      setEditingCase({
        args: "",
        input: "",
        output: "",
        isSample: false,
      });
    } else {
      setShow(false);
    }
  };
  const close = () => {
    // this.bsModalRef.hide();
    setShow(false);
  };

  return (
    <>
      <div className="form-boxes">
        <Modal show={show} onHide={onClose}>
          <div className="modal-header modal-header-bg justify-content-center">
            <h6 className="form-box_title">ADD TEST CASE</h6>
          </div>
          <div className="modal-body text-black">
            <div className="assess-create-align ml-0">
              <div className="profile-box clearfix p-0">
                <h6 className="form-box_subtitle">
                  Command Line Arguments
                  <span className="switch-item ml-3 float-none">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={question.hasArg}
                        onChange={(e) =>
                          setQuestion({
                            ...question,
                            hasArg: e.target.checked,
                          })
                        }
                        name="hasArg"
                      />
                      <span className="slider round"></span>
                    </label>
                  </span>
                </h6>
                {question.hasArg && (
                  <div>
                    <h6 className="form-box_subtitle">
                      Describe command line argument (each in separate line)
                    </h6>
                    <div className="assignment mx-auto bg-white">
                      <div className="assignment-content-area p-0">
                        <div className="box2 bg-white p-0 mw-100 min-h-auto my-2">
                          <textarea
                            style={{ border: "0" }}
                            className="form-control min-h-0 mt-2 border-bottom"
                            value={question.argumentDescription}
                            onChange={(e) =>
                              setQuestion({
                                ...question,
                                argumentDescription:
                                  !question.argumentDescription,
                              })
                            }
                            name="argumentDescription"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              {question.hasArg && (
                <div className="assess-create-align ml-0">
                  <div className="profile-box clearfix p-0">
                    <h6 className="form-box_subtitle">Argument</h6>
                    <div className="assignment mx-auto bg-white">
                      <div className="assignment-content-area p-0">
                        <div className="box2 bg-white p-0 mw-100 min-h-auto my-2">
                          <textarea
                            style={{ border: "0" }}
                            className="form-control min-h-0 mt-2 border-bottom"
                            value={editingCase.args}
                            onChange={(e) =>
                              setEditingCase({
                                ...editingCase,
                                args: e.target.value,
                              })
                            }
                            name="args"
                            placeholder="Each argument in a separate line"
                          ></textarea>
                        </div>
                        {error.arg && (
                          <em className="mcq-status2">Argument is required</em>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="assess-create-align ml-0">
              <div className="profile-box clearfix p-0">
                <h6 className="form-box_subtitle">
                  User Input
                  <span className="switch-item ml-3 float-none">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={question.hasUserInput}
                        onChange={(e) =>
                          setQuestion({
                            ...question,
                            hasUserInput: !question.hasUserInput,
                          })
                        }
                        name="hasUserInput"
                      />
                      <span className="slider round"></span>
                    </label>
                  </span>
                </h6>
                {question.hasUserInput && (
                  <div>
                    <h6 className="form-box_subtitle">
                      Describe user input (each in separate line)
                    </h6>
                    <div className="assignment mx-auto bg-white">
                      <div className="assignment-content-area p-0">
                        <div className="box2 bg-white p-0 mw-100 min-h-auto my-2">
                          <textarea
                            style={{ border: "0" }}
                            className="form-control min-h-0 mt-2 border-bottom"
                            value={question.userInputDescription}
                            onChange={(e) =>
                              setQuestion({
                                ...question,
                                userInputDescription: e.target.value,
                              })
                            }
                            name="userInputDescription"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              {question.hasUserInput && (
                <div className="assess-create-align ml-0">
                  <div className="profile-box clearfix p-0">
                    <h4 className="form-box_subtitle">Input</h4>
                    <div className="assignment mx-auto bg-white">
                      <div className="assignment-content-area p-0">
                        <div className="box2 bg-white p-0 mw-100 min-h-auto my-2">
                          <textarea
                            style={{ border: "0" }}
                            className="form-control min-h-0 mt-2 border-bottom"
                            value={editingCase.input}
                            onChange={(e) =>
                              setEditingCase({
                                ...editingCase,
                                input: e.target.value,
                              })
                            }
                            name="input"
                            placeholder="Each input in a separate line"
                          ></textarea>
                        </div>
                        {error.input && (
                          <em className="mcq-status2">Input is required</em>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="assess-create-align ml-0">
              <div className="profile-box clearfix p-0">
                <h6 className="form-box_subtitle">Expected Output</h6>
                <div className="assignment mx-auto bg-white">
                  <div className="assignment-content-area p-0">
                    <div className="box2 bg-white p-0 mw-100 min-h-auto my-2">
                      <textarea
                        style={{ border: "0" }}
                        className="form-control min-h-0 mt-2 border-bottom"
                        value={editingCase.output}
                        onChange={(e) =>
                          setEditingCase({
                            ...editingCase,
                            output: e.target.value,
                          })
                        }
                        name="output"
                      ></textarea>
                    </div>
                    {error.output && (
                      <em className="mcq-status2">Output is required</em>
                    )}
                    <label className="container2">
                      Mark as Sample Test Case
                      <input
                        type="checkbox"
                        checked={editingCase.isSample}
                        onChange={(e) =>
                          setEditingCase({
                            ...editingCase,
                            isSample: e.target.checked,
                          })
                        }
                        name="chkSample"
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap justify-content-end">
              <button className="btn btn-light" onClick={close}>
                Cancel
              </button>
              <button
                className="btn btn-outline-black ml-2"
                onClick={() => save(true)}
              >
                Save and Add More
              </button>
              <button className="btn btn-primary ml-2" onClick={() => save()}>
                Save
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EidtTestCaseModal;
