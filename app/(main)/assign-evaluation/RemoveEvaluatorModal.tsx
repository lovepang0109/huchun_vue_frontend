"use client";
import { useEffect, useState, useRef } from "react";
import * as evalSvc from "@/services/evaluationService";
import alertify from "alertifyjs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import Multiselect from "multiselect-react-dropdown";

export default function RemoveEvaluatorModal({
  test,
  evaluator,
  closeEvent,
  setRemoveEvaluatorModal,
}: any) {
  const [newEvaluators, setNewEvaluators] = useState<any>([]);
  const [teachers, setTeachers] = useState<any>(null);
  const [evaluatorName, setEvaluatorName] = useState<string>("");
  const [selectedOp, setSelectedOp] = useState<string>("existing");
  //  const   suggestions$: Observable<User[]>;
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    evalSvc
      .findEvaluators({ test: test._id })
      .then((res: []) => {
        setTeachers(res);
      })
      .catch((err) => {
        setTeachers([]);
        alertify.alert("Message", "Failt to get evaluators");
      });
  }, []);

  const onEvaluatorSelected = (event: any): void => {
    // this.selectedOption = event.item;
    const tmp = newEvaluators;
    tmp.push(event.item);
    setNewEvaluators(tmp);
    setEvaluatorName("");
  };

  const remove = () => {
    if (selectedOp == "new" && newEvaluators.length == 0) {
      return;
    }
    const data = newEvaluators.map((e) => e._id);
    evalSvc
      .removeEvaluators(test._id, {
        evaluator: evaluator._id,
        option: selectedOp,
        newEvaluators: data,
      })
      .then((res) => {
        alertify.success("Evaluator is removed for this test successfully.");
        closeEvent({ test: test._id, option: selectedOp });
        setRemoveEvaluatorModal(false);
      })
      .catch((err) => {
        alertify.alert("Message", "Fail to remove evaluator for this test.");
      });
  };
  return (
    <div className="form-boxes">
      <div className="modal-header modal-header-bg justify-content-center">
        <div className="text-center">
          <h4 className="form-box_title">Remove evaluator?</h4>
          <h4 className="form-box_subtitle">
            Are you sure you want to remove {evaluator.name} as evaluator?
          </h4>
        </div>
      </div>
      <div className="modal-body remove-evalModal_new">
        <div>
          <div className="profile-info">
            <div className="d-flex">
              <div className="container1 mt-0">
                <div className="radio">
                  <input
                    type="radio"
                    value="existing"
                    name="option"
                    id="existing"
                    checked={selectedOp === "existing"}
                    onChange={() => setSelectedOp("existing")}
                  />
                  <label htmlFor="existing" className="my-0"></label>
                </div>
              </div>
              <div>Assign the remaining questions to existing evaluators</div>
            </div>

            <div className="d-flex mt-2">
              <div className="container1 mt-0">
                <div className="radio">
                  <input
                    type="radio"
                    value="new"
                    name="option"
                    id="new"
                    checked={selectedOp === "new"}
                    onChange={() => setSelectedOp("new")}
                  />
                  <label htmlFor="new" className="my-0"></label>
                </div>
              </div>
              <div>Assign the remaining questions to new evaluators</div>
            </div>
            {selectedOp === "new" && (
              <div className="my-2 mx-4 p-2 border">
                <h6>
                  <strong className="text-dark">Evaluator</strong>
                </h6>
                <br />
                {!newEvaluators.length && <h6>No one to Evaluate..</h6>}

                {teachers ? (
                  <Multiselect
                    options={teachers}
                    displayValue="name"
                    onSelect={(selectedList) => setNewEvaluators(selectedList)}
                    onRemove={(selectedList) => setNewEvaluators(selectedList)}
                    selectedValues={newEvaluators}
                    placeholder="+ Add Evaluator"
                  />
                ) : (
                  <div className="mt-3">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                  </div>
                )}
              </div>
            )}

            <div className="d-flex mt-2">
              <div className="container1 mt-0">
                <div className="radio">
                  <input
                    type="radio"
                    value="unassigned"
                    name="option"
                    id="unassigned"
                    checked={selectedOp === "unassigned"}
                    onChange={() => setSelectedOp("unassigned")}
                  />
                  <label htmlFor="unassigned" className="my-0"></label>
                </div>
              </div>
              <div>Keep remaining questions unassigned</div>
            </div>
          </div>
        </div>

        <div className="text-right mt-2">
          <button
            className="btn btn-light"
            onClick={() => setRemoveEvaluatorModal(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary ml-2" onClick={remove}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
