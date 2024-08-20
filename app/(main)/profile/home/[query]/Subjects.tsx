"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import DropzoneContainer from "@/components/dropzone";

const SubjectsProfile = ({user}: any) => {
  // const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData] = useState();
  const [programs, setPrograms] = useState([]);
  const [userSubject, setUserSubject] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allPrograms, setAllPrograms] = useState([]);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const getAllPrograms = async () => {
    clientApi.get(`/api/program`).then((data: any) => {
      setAllPrograms(data.data);
      setSelected(data.data);
    });
  };

  const submit = () => {
    alertify
      .confirm(
        "Are you sure you want to update your profile?",
        (success: any) => {
          let dataUpdate = { ...user };
          // dataUpdate.subjects = [];
          // programs.forEach((p: any) => {
          //   p.subjects.forEach((s: any) => {
          //     if (s.checked) {
          //       dataUpdate.subjects.push(s._id)
          //     }
          //   })
          // });

          dataUpdate = _.omit(dataUpdate, "avatarUrlSM");
          try {
            clientApi.put(`/api/users/${dataUpdate._id}`, dataUpdate);
            update();
            alertify.success("Profile updated successfully.");
          } catch (err: any) {
            alertify.alert("Message", "Fail to update profile");
          }
        }
      )
      .setHeader("Message");
  };

  const setSelected = (data: any) => {
    console.log(data, user, ">>>>>>>>>>");
    setPrograms((prev: any) => {
      return data.map((program: any) => {
        return {
          ...program,
          subjects: program.subjects.map((s: any) => {
            if (user?.subjects.indexOf(s._id) !== -1) {
              return { ...s, checked: true };
            } else {
              return s;
            }
          }),
        };
      });
    });
  };

  const onSubjectClick = (sub: any) => {
    console.log(sub);
    // this.programs = this.programs.map(program => {
    //   program.subjects = program.subjects.map(s => {
    //     if (s._id == sub._id) {
    //       s.checked = !s.checked
    //     }
    //     return s;
    //   })

    //   return program;
    // })
    // user.subjects.push(sub._id)
    let temp = user;
    console.log(temp.subjects.indexOf(sub._id));
    if (user.subjects.indexOf(sub._id) == -1) {
      temp.subjects.push(sub._id);
    } else {
      temp.subjects = temp.subjects.filter((s: string) => s !== sub._id);
    }
  };

  // const search = () => {
  //     if (searchText) {
  //         setPrograms(allPrograms.filter((d: any) => (d.name.toLowerCase()).toString().indexOf(searchText.toLowerCase()) != -1))
  //         if(programs && programs.length ==0){
  //           let prg: any = [];
  //           allPrograms.forEach((d: any) =>{
  //             if(d.subjects){
  //               d.subjects.forEach((s: any)=>{
  //                 if((s.name.toLowerCase()).toString().indexOf(searchText.toLowerCase()) != -1
  //                 && prg.findIndex((p: any)=>p.name== d.name)==-1){
  //                   prg.push(d)
  //                 }
  //               })
  //             }
  //           })
  //           setPrograms(prg);
  //         }

  //     }else {
  //         setPrograms(allPrograms)
  //     }
  // }

  useEffect(() => {
    getClientDataFunc();
    getAllPrograms();
  }, []);

  return (
    <div className="institute-onboarding Stu_profile">
      <div>
        <div>
          <div className="container6 rounded-boxes bg-white m-0">
            <div className="section_heading_wrapper d-flex justify-content-between">
              <div>
                <h3 className="section_top_heading">
                  What Subject you want to learn?
                </h3>
                <p className="section_sub_heading">
                  {" "}
                  Select from our wide variety of subjects.
                </p>
              </div>
              {/* <div className="filter-item w-50">
                            <div className="asses-search nOnStp-1">
                                <form className="common_search-type-1 form-half ml-auto">
                                    <div className="form-group mb-0">
                                        <span>
                                            <figure><img src="/assets/images/search-icon-2.png" alt=""/></figure>
                                        </span>
                                        <input type="text" className="form-control border-0"
                                            onKeyUp={(e: any)=> {e.keyCode == 13 ? search(): '';}}
                                            name="searchText" placeholder="Search By Programs/Subjects."/>
                                    </div>
                                </form>
                            </div>
                        </div> */}
            </div>
            <hr />
            <div className="column-3">
              {programs?.map((program: any) => (
                <div
                  className="onboarding-1 break-avoid pb-3"
                  key={program._id}
                >
                  <div className="card shadow border-0 container5-remove">
                    <div className="card-header bg-white">
                      <h3 className="box_heading"> {program?.name}</h3>
                    </div>
                    <div className="card-body test-graph-area-1">
                      {program?.subjects.map((subject: any) => {
                        return (
                          <label className="container2" key={subject._id}>
                            {subject?.name}
                            <input
                              type="checkbox"
                              checked={
                                user.subjects.indexOf(subject._id) !== -1
                              }
                              onClick={() => onSubjectClick(subject)}
                            />
                            <span className="checkmark1 translate-middle-y left-0"></span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr />
            <div className="create-btn-program-remove text-right">
              <a className="btn btn-primary" onClick={submit}>
                Save
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubjectsProfile;
