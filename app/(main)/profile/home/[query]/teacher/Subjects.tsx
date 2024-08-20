"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import clientApi from "@/lib/clientApi";
import * as programService from "@/services/programService";
import * as userService from "@/services/userService";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import DropzoneContainer from "@/components/dropzone";
import { sortByName } from "@/lib/helpers";

const SubjectsProfile = ({ user }: any) => {
  // const user: any = useSession()?.data?.user?.info || {};
  const { push } = useRouter();
  const { update } = useSession();
  const [getClientData, setClientData] = useState();
  const [programs, setPrograms] = useState<any>([]);
  const [userSubject, setUserSubject] = useState<any>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allPrograms, setAllPrograms] = useState<any>([]);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
    programService
      .findAll()
      .then((res: any[]) => {
        sortByName(res);
        for (const p of res) {
          sortByName(p.subjects);
        }
        // setPrograms(res);
        setAllPrograms(res);
        setSelected(res);
      })
      .catch((ex) => {
        console.log(ex);
      });
  }, []);

  console.log(programs, "rrrr");

  const setSelected = (pro: any) => {
    userService.get().then((user) => {
      pro.forEach((p) => {
        if (user.programs.indexOf(p._id) !== -1) {
          p.selected = true;
        }
        for (const s of p.subjects) {
          if (user.subjects.indexOf(s._id) !== -1) {
            s.selected = true;
          }
        }
      });
      setPrograms(pro);
    });
  };

  const submit = async () => {
    alertify.confirm(
      "Are you sure you want to update your profile?",
      (success) => {
        const pro: any = [];
        let subjects: any = [];
        let dataUpdate = { ...user };
        const tmp_programs = [...programs];

        tmp_programs.forEach((p) => {
          if (p.selected) {
            pro.push(p._id);
            subjects = [...subjects, ...p.subjects.map((s) => s._id)];
          } else {
            for (const s of p.subjects) {
              if (s.selected) {
                subjects.push(s._id);
              }
            }
          }
        });
        setPrograms(tmp_programs);
        dataUpdate.programs = pro;
        dataUpdate.subjects = subjects;
        // dataUpdate = _.omit(dataUpdate, "avatarUrlSM");
        userService.update(dataUpdate).then((us) => {
          update().then((res) => {
            alertify.success("Profile updated successfully.");
            push(`/profile/home/basic`);
          });
        });
      }
    );
  };

  const search = () => {
    if (searchText) {
      const pro = allPrograms.filter(
        (d) =>
          d.name.toLowerCase().toString().indexOf(searchText.toLowerCase()) !=
          -1
      );
      setPrograms(pro);
      if (pro && pro.length == 0) {
        const prg = [];
        const allpro = [...allPrograms];
        allpro.forEach((d) => {
          if (d.subjects) {
            d.subjects.forEach((s) => {
              if (
                s.name
                  .toLowerCase()
                  .toString()
                  .indexOf(searchText.toLowerCase()) != -1 &&
                prg.findIndex((p) => p.name == d.name) == -1
              ) {
                prg.push(d);
              }
            });
          }
        });
        setAllPrograms(allpro);
        setPrograms(prg);
      }
    } else {
      setPrograms(allPrograms);
    }
  };

  const onProgramSelectionChanged = (pro) => {
    const updatedPrograms = programs.map((program) => {
      if (program.name === pro.name) {
        const updatedSubjects = program.subjects.map((subject) => ({
          ...subject,
          selected: pro.selected,
        }));
        return {
          ...program,
          selected: !program.selected,
          subjects: updatedSubjects,
        };
      }
      return program;
    });
    setPrograms(updatedPrograms);
  };

  const onSubjectSelectionChanged = (pro, sub) => {
    const updatedPrograms = programs.map((program) => {
      if (program.name === pro.name) {
        const updatedSubjects = program.subjects.map((subject) =>
          subject.name === sub.name
            ? { ...subject, selected: !subject.selected }
            : subject
        );

        const allSelected = updatedSubjects.every(
          (subject) => subject.selected
        );
        return {
          ...program,
          selected: allSelected,
          subjects: updatedSubjects,
        };
      }
      return program;
    });

    setPrograms(updatedPrograms);
  };

  return (
    <div className="institute-onboarding Stu_profile">
      <div className="container6 rounded-boxes bg-white m-0">
        <div className="section_heading_wrapper d-flex justify-content-between">
          <div>
            <h3 className="section_top_heading">
              What Program you want to teach?
            </h3>
            <p className="section_sub_heading">
              We have a wide variety of programs for students to learn. Select
              the programs you want to teach.
            </p>
          </div>
          <div className="filter-item w-50">
            <div className="asses-search nOnStp-1">
              <form
                className="common_search-type-1 form-half ml-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
              >
                <div className="form-group mb-0">
                  <span>
                    <figure>
                      <img src="assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search By Programs/Subjects."
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        <hr />
        <div className="column-3">
          {user.role !== "teacher"
            ? programs.map((program) => (
                <div
                  className="onboarding-1 break-avoid pb-3"
                  key={program.name}
                >
                  <div className="card shadow border-0 container5-remove">
                    <div className="card-header bg-white">
                      <h3 className="box_heading">
                        <label className="container2">
                          {program.name}
                          <input
                            type="checkbox"
                            checked={program.selected}
                            onChange={() => onProgramSelectionChanged(program)}
                          />
                          <span className="checkmark1 translate-middle-y left-0"></span>
                        </label>
                      </h3>
                    </div>
                    <div className="card-body test-graph-area-1 py-2">
                      {program.subjects.map((subject) => (
                        <label key={subject.name} className="my-3">
                          <i
                            className={`mx-1 ${
                              program.selected
                                ? "fas fa-check check-primary"
                                : "empty-check fas fa-dot-circle"
                            }`}
                          ></i>
                          {subject.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : programs.map((program) => (
                <div className="onboarding-1 break-avoid" key={program.name}>
                  <div className="card mb-3">
                    <div className="card-header bg-white">
                      <h3>
                        <label className="container2">
                          {program.name}
                          <input
                            type="checkbox"
                            checked={program.selected}
                            onChange={() => onProgramSelectionChanged(program)}
                            name="chkSub"
                          />
                          <span className="checkmark1 translate-middle-y left-0"></span>
                        </label>
                      </h3>
                    </div>
                    <div className="card-body test-graph-area-1 py-2">
                      {program.subjects.map((subject) => (
                        <label className="container2" key={subject.name}>
                          {subject.name}
                          <input
                            type="checkbox"
                            checked={subject.selected}
                            onChange={() =>
                              onSubjectSelectionChanged(program, subject)
                            }
                            name="chkSub"
                          />
                          <span className="checkmark1 translate-middle-y left-0"></span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
        </div>
        <hr />
        <div className="text-right">
          <button className="btn btn-primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubjectsProfile;
