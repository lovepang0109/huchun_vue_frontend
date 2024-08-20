"use client";
import { useState, useEffect, useRef } from "react";
import * as eventSvc from "@/services/eventBusService";
import * as authService from "@/services/auth";
import * as instituteSvc from "@/services/instituteService";
import { sortByName } from "@/lib/helpers";
import * as alertify from "alertifyjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const InstituteSubject = ({ institute, setIinstitute, user }: any) => {
  const [programsSate, setProgramsState] = useState<any>([]);
  const { update } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    instituteSvc
      .getProfilePrograms(user.activeLocation)
      .then((res: any[]) => {
        sortByName(res);
        for (const program of res) {
          sortByName(program.subjects);
          if (institute.programs) {
            const found = institute.programs.find(
              (fs) => fs._id === program._id
            );

            program.checked = !!found;
          }
        }

        setProgramsState(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const submitFunc = async () => {
    const programs = [];
    let subjects = [];
    for (const p of programsSate) {
      if (p.checked) {
        programs.push(p._id);
        subjects = [...subjects, ...p.subjects.map((s) => s._id)];
      }
    }
    try {
      await authService.updateInstitute(institute._id, {
        programs,
        subjects,
      });
      alertify.success("Institute updated successfully.");
      await update();
      push(`/institute/home?menu=subject`);
    } catch (err) {
      // window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const handleCheckboxChange = (index) => {
    const newPrograms = [...programsSate];
    newPrograms[index].checked = !newPrograms[index].checked;
    setProgramsState(newPrograms);
  };
  return (
    <>
      <div className="institute-onboarding">
        <div className="rounded-boxes bg-white">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">
              What Program you want to teach?
            </h3>
            <p className="section_sub_heading">
              Select the Program you want to teach. You can add your own
              programs by visiting{` `}
              {user.role === "director" && (
                <Link href="/administration">Administration Module.</Link>
              )}
              {user.role === "publisher" && (
                <Link href="/administration/curriculum">
                  Curriculum Module.
                </Link>
              )}
            </p>
          </div>
          <hr />
          <div className="column-3">
            {programsSate.map((program, index) => (
              <div key={program.name} className="onboarding-1 break-avoid pb-3">
                <div className="card shadow border-0">
                  <div className="card-header bg-white">
                    <h3 className="box_heading">
                      <label className="container2">
                        {program.name}
                        <input
                          type="checkbox"
                          checked={program.checked}
                          onChange={() => handleCheckboxChange(index)}
                          disabled={
                            !institute.preferences.general.editProfileSubject &&
                            user._id !== institute.user
                          }
                        />
                        <span className="checkmark1 translate-middle-y left-0"></span>
                      </label>
                    </h3>
                  </div>
                  <div className="card-body">
                    {program.subjects.map((subject) => (
                      <label key={subject.name} className="my-3">
                        {!program.checked ? (
                          <i className="mx-1 empty-check fas fa-dot-circle"></i>
                        ) : (
                          <i className="fas fa-check mx-1 check-primary"></i>
                        )}
                        {subject.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr />
          <div className="text-right">
            <button
              className={`btn btn-primary ${
                !user.activeLocation ? "disabled" : ""
              }`}
              onClick={submitFunc}
              disabled={!user.activeLocation}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstituteSubject;
