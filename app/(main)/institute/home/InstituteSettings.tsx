"use client";
import { useState, useEffect, useRef } from "react";
import * as instituteSvc from "@/services/instituteService";
import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const InstituteSettings = ({ institute, setIinstitute, user }: any) => {
  const { push } = useRouter();
  const [subjects, setSubjects] = useState<any>([]);
  const [getClientData, setClientData] = useState<any>({});
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { update } = useSession();

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
  }, []);

  const updateFunc = async () => {
    setSaving(true);
    await instituteSvc.updadteInstitute(institute._id, {
      openAI: {
        key: institute.openAI.key,
        active: institute.openAI.active,
      },
    });
    alertify.success("Institute updated successfully.");
    await update();
    setSaving(false);
    push(`/institute/home?menu=settings`);
  };

  const validateKey = () => {
    setIsCheckPassed(true);
  };

  return (
    <div className="institute-onboarding">
      <div className="rounded-boxes bg-white">
        <div className="section_heading_wrapper mb-0">
          <h3 className="section_top_heading">Settings</h3>
          <p className="section_sub_heading">
            Manage all settings of your institute.
          </p>
        </div>
      </div>

      <div className="rounded-boxes bg-white">
        <div className="row">
          <div className="col section_heading_wrapper">
            <h3 className="section_top_heading tr">OpenAI (ChatGPT) Key</h3>
            <p className="institute-font-1">
              Enabling this feature may incur cost. Enable the feature, enter
              the key and validate. If the key is valid, it will be saved
            </p>
          </div>
          <div className="col-auto ml-auto">
            <div className="switch-item">
              <label className="switch">
                <input
                  type="checkbox"
                  name="chkOpenAI"
                  checked={institute.openAI.active}
                  onChange={(e) => {
                    setIinstitute({
                      ...institute,
                      openAI: {
                        ...institute.openAI,
                        active: e.target.checked,
                      },
                    });
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-7">
            <div className="form-group">
              <div className="position-relative">
                <input
                  type="text"
                  value={institute.openAI.key}
                  onChange={(e) => {
                    setIinstitute({
                      ...institute,
                      openAI: {
                        ...institute.openAI,
                        key: e.target.value,
                      },
                    });
                  }}
                  name="txtKey"
                  style={{ border: "none" }}
                  className="form-control border-bottom pr-5"
                />
                {isCheckPassed && (
                  <span className="check-in-input">
                    <i
                      className="fas fa-check fa-2x"
                      style={{ color: "#7472FE" }}
                    ></i>
                  </span>
                )}
              </div>
              {error && (
                <div>
                  <p className="label label-danger text-danger">{error}</p>
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-5">
            <button
              className={`btn btn-secondary px-5 ${
                !institute.openAI.key ? "disabled" : ""
              }`}
              type="button"
              onClick={validateKey}
            >
              Validate
            </button>
          </div>
        </div>
      </div>

      <div className="text-right mb-3">
        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={updateFunc}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default InstituteSettings;
