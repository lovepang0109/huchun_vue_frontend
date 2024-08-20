"use client";
import { useEffect, useState, useRef } from "react";
import * as evalSvc from "@/services/evaluationService";
import alertify from "alertifyjs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import Multiselect from "multiselect-react-dropdown";

export default function AddEvaluatorModal({
  test,
  closeEvent,
  setAddEvaluatorModal,
}: any) {
  const [evaluators, setEvaluators] = useState<any>([]);
  const [teachers, setTeachers] = useState<any>(null);
  const [evaluatorName, setEvaluatorName] = useState<string>("");
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

  const findEvaluators = () => {
    if (!evaluatorName) {
      return;
    }
  };

  const onEvaluatorSelected = (event: any): void => {
    const tmp = evaluators;
    tmp.push(event.item);
    setEvaluators(tmp);
    setEvaluatorName("");
  };

  const removeEvaluator = (evaluator: any) => {
    const idx = evaluators.indexOf(evaluator);
    if (idx > -1) {
      const tmp = evaluators;
      tmp.splice(idx, 1);
      setEvaluators(tmp);
    }
  };

  const assign = () => {
    if (evaluators.length == 0) {
      return;
    }
    const data = evaluators.map((e) => e._id);
    evalSvc
      .assignEvaluators(test._id, { evaluators: data })
      .then((res) => {
        alertify.success("Evaluators are assigned for this test successfully.");
        closeEvent(test._id);
        setAddEvaluatorModal(false);
      })
      .catch((err) => {
        alertify.alert("Message", "Fail to assign evaluators for this test.");
      });
  };

  const cancel = () => {
    closeEvent(null);
    setAddEvaluatorModal(false);
  };

  const onEvaluatorsSelectionChanged = (item: any) => {
    setEvaluators(item);
    console.log(evaluators);
  };

  return (
    <div className="form-boxes">
      <div className="modal-header modal-header-bg justify-content-center">
        <h4 className="form-box_title">Assign evaluator</h4>
      </div>
      <div className="modal-body">
        <div className="mb-3 text-black">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <span className="material-icons mr-1">receipt_long</span>
                <span>{test.testTitle}</span>
              </div>
            </div>
            <div className="col-auto">
              <div className="form-row">
                <div className="col-auto d-flex align-items-center">
                  <span className="material-icons mr-1">assignment</span>
                  <span className="text-dark">
                    {test.pendingQuestions} Questions
                  </span>
                </div>
                <div className="col-auto d-flex align-items-center">
                  <span className="material-icons mr-1">people</span>
                  <span className="text-dark">
                    {test.pendingAttempts} Attempts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="form-box_subtitle mb-0">Evaluator</h4>
          {teachers?.length > 0 && (
            <h6 className="form-box_subtitle mb-0">No one to Evaluate..</h6>
          )}
          {teachers ? (
            <Multiselect
              options={teachers}
              displayValue="name"
              onSelect={onEvaluatorsSelectionChanged}
              onRemove={onEvaluatorsSelectionChanged}
              selectedValues={evaluators}
              placeholder="+ Add Evaluator"
            />
          ) : (
            <div className="mt-3">
              <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
            </div>
          )}

          <hr />
          {errorMessage && <div className="text-danger">{errorMessage}</div>}
        </div>
        <div className="text-right mt-2">
          <button className="btn btn-light" onClick={cancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary ml-2"
            disabled={!evaluators.length}
            onClick={assign}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
