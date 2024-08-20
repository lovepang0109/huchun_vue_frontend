"use client";
import { useState, useEffect, useRef } from "react";
import * as instituteSvc from "@/services/instituteService";
import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { avatar } from "@/lib/pipe";

const InstituteSummary = ({ institute, onEdit, user }: any) => {
  const [subjects, setSubjects] = useState<any>([]);
  const [getClientData, setClientData] = useState<any>({});

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
    setSubjects(institute.subjects);
  }, []);

  const edit = (item: any) => {
    onEdit({ _id: item });
  };

  return (
    <div className="mentor-homepage-profile">
      <div className="institute-onboarding">
        <div className="container p-0">
          <div className="rounded-boxes bg-white">
            <div className="row">
              <div className="col-md">
                <div className="section_heading_wrapper mb-md-0">
                  <h3 className="section_top_heading">Institute Profile</h3>
                  <p className="section_sub_heading">
                    See the summary of your institute and edit as you wish
                  </p>
                </div>
              </div>
              <div className="col-auto ml-auto">
                <div className="summary-edit-btn-remove">
                  <Link
                    href={`/public/profile/institute/${institute._id}`}
                    className="btn btn-outline-black"
                  >
                    <div className="d-flex align-items-center">
                      <span className="material-icons mr-1">visibility</span>
                      View Public Profile
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-boxes bg-white">
            <figure className="pro-wall">
              <img
                src={institute?.coverImageUrl || "/assets/images/wall.png"}
                // alt="Cover"
              />
            </figure>
            <div className="row">
              <div className="col-lg-7">
                <div className="d-md-flex">
                  <div className="pro-dp_wrap">
                    <figure className="pro-dp-remove">
                      <img
                        className="dp-on_wall object-cover"
                        src={
                          institute?.imageUrl ||
                          "/assets/images/defaultProfile.png"
                        }
                        alt="Profile"
                      />
                    </figure>
                  </div>
                  <div className="pro-dp-sideinfo">
                    <h3 className="admin-head pl-0">{institute?.name}</h3>
                  </div>
                </div>
              </div>
              {(!user.primaryInstitute ||
                user.primaryInstitute.preferences.general.socialSharing) &&
                user.role === "teacher" && (
                  <div className="col-lg-5 pro-dp-sideinfo_adjust">
                    <p className="admin-head">Share Profile</p>
                    <div className="form-row socials-icon_theme_color">
                      {institute?.facebook && (
                        <a
                          href={`https://www.facebook.com/${institute.facebook}`}
                          className="col-auto"
                        >
                          <i className="fab fa-facebook-square"></i>
                        </a>
                      )}
                      {institute?.linkedIn && (
                        <a
                          href={`https://www.linkedin.com/${institute.linkedIn}`}
                          className="col-auto"
                        >
                          <i className="fab fa-linkedin"></i>
                        </a>
                      )}
                      {institute?.youtube && (
                        <a
                          href={`https://www.youtube.com/${institute.youtube}`}
                          className="col-auto"
                        >
                          <i className="fab fa-youtube"></i>
                        </a>
                      )}
                      {institute?.instagram && (
                        <a
                          href={`https://www.instagram.com/${institute.instagram}`}
                          className="col-auto"
                        >
                          <i className="fab fa-instagram"></i>
                        </a>
                      )}
                      <div className="col-auto ml-auto">
                        <span
                          className="material-icons edit_icon"
                          onClick={() => edit("basic")}
                        >
                          edit
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="rounded-boxes bg-white">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Dashboard</h3>
            </div>
            <div className="border-box" style={{ minHeight: "unset" }}>
              <div className="row text-center text-black">
                <div className="col-lg-4">
                  <h4 className="f-16">{institute?.teachers?.length}</h4>
                  <h4 className="f-14">Teachers</h4>
                </div>
                <hr />
                <div className="col-lg-4">
                  <h4 className="f-16">{institute?.students || 0}</h4>
                  <h4 className="f-14">Students</h4>
                </div>
                <hr />
                <div className="col-lg-4">
                  <h4 className="f-16">{institute?.programs?.length}</h4>
                  <h4 className="f-14">Programs</h4>
                </div>
              </div>
            </div>
          </div>

          {institute && institute.teachers && institute.teachers.length > 0 && (
            <div className="rounded-boxes bg-white">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">
                  Active Teachers ({institute.teachers.length})
                </h3>
              </div>
              <div className="form-row">
                {institute.teachers.map((item, index) => (
                  <div className="col-2" key={index}>
                    <div className="profile_box_below_info text-center">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={avatar(item.avatar)}
                          className="user_img_circled"
                          alt="teacher avatar"
                        />
                      </figure>
                      <h4 className="profile_name">{item.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {institute?.description && (
            <div className="rounded-boxes bg-white">
              <div className="row">
                <div className="col">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Description</h3>
                    <p className="section_sub_heading">
                      {institute.description}
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="pro-mat-remove">
                    <span
                      className="material-icons edit_icon"
                      onClick={() => edit("basic")}
                    >
                      edit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {subjects && subjects.length > 0 && (
            <div className="rounded-boxes bg-white">
              <div className="row">
                <div className="col">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Subjects</h3>
                    <p className="section_sub_heading">
                      Tell us about the subjects you learn
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="pro-mat-remove">
                    <span
                      className="material-icons edit_icon"
                      onClick={() => edit("programs")}
                    >
                      edit
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {subjects.map((item, index) => (
                  <div className="content-tag" key={index}>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {institute?.specialization && institute.specialization.length > 0 && (
            <div className="rounded-boxes bg-white">
              <div className="row">
                <div className="col">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Specialization</h3>
                    <p className="section_sub_heading">
                      Tell us about your specialization areas
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="pro-mat-remove">
                    <span
                      className="material-icons edit_icon"
                      onClick={() => edit("basic")}
                    >
                      edit
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {institute.specialization.map((item, index) => (
                  <div className="content-tag" key={index}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default InstituteSummary;
