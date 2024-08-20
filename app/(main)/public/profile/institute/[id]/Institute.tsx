"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import * as instituteSvc from "@/services/instituteService";
import { avatar } from "@/lib/pipe";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

const Institute = () => {
  const { id } = useParams();
  const [institute, setInstitute] = useState<any>(null);
  const [viewTeachers, setViewTeachers] = useState<any>(null);

  useEffect(() => {
    instituteSvc.getInstitutePublicProfile(id).then((ins) => {
      setInstitute(ins);
      for (const teacher of ins.teachers) {
        teacher.avatarLink = avatar(teacher);
      }

      setViewTeachers(ins.teachers.slice(0, 6));
    });
  }, []);

  const viewAllTeachers = () => {
    setViewTeachers(institute.teachers);
  };

  const track = (idx, item) => {
    return item._id;
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="mentor-homepage-profile Stu_profile pt-3">
          {institute ? (
            <div className="container">
              <div className="col-lg-12">
                <div className="rounded-boxes bg-white">
                  <figure className="pro-wall">
                    <img
                      src={institute.coverImageUrl || "/assets/images/wall.png"}
                      alt="Institute cover"
                    />
                  </figure>
                  <div className="row">
                    <div className="col-lg-7">
                      <div className="d-md-flex">
                        <div className="pro-dp_wrap">
                          <figure className="pro-dp-remove">
                            <img
                              src={
                                institute.imageUrl ||
                                "/assets/images/profile-img.png"
                              }
                              alt="Institute"
                              className="dp-on_wall object-cover"
                            />
                          </figure>
                        </div>
                        <div className="pro-dp-sideinfo">
                          <h3 className="admin-head">{institute.name}</h3>
                          <p className="admin-head2">{institute.code}</p>
                        </div>
                      </div>
                    </div>
                    {institute.preferences?.general.socialSharing &&
                      (institute.facebook ||
                        institute.linkedIn ||
                        institute.youtube ||
                        institute.instagram) && (
                        <div className="col-lg-5 pro-dp-sideinfo_adjust">
                          <p className="admin-head">Find me on</p>
                          <div className="form-row socials-icon_theme_color">
                            {institute.facebook && (
                              <a
                                href={`https://www.facebook.com/${institute.facebook}`}
                                className="col-auto"
                              >
                                <i className="fab fa-facebook-square"></i>
                              </a>
                            )}
                            {institute.linkedIn && (
                              <a
                                href={`https://www.linkedin.com/${institute.linkedIn}`}
                                className="col-auto"
                              >
                                <i className="fab fa-linkedin"></i>
                              </a>
                            )}
                            {institute.youtube && (
                              <a
                                href={`https://www.youtube.com/${institute.youtube}`}
                                className="col-auto"
                              >
                                <i className="fab fa-youtube"></i>
                              </a>
                            )}
                            {institute.instagram && (
                              <a
                                href={`https://www.instagram.com/${institute.instagram}`}
                                className="col-auto"
                              >
                                <i className="fab fa-instagram"></i>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {viewTeachers && viewTeachers.length > 0 && (
                  <div className="rounded-boxes bg-white">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        Our Prestigious Teachers ({institute.teachers.length})
                      </h3>
                    </div>
                    <div className="form-row">
                      {viewTeachers.map((teacher, index) => (
                        <div className="col-2" key={index}>
                          <div className="profile_box_below_info text-center">
                            <figure className="user_img_circled_wrap">
                              <img
                                src={teacher.avatarLink}
                                className="mx-auto rounded-circle teacher-avatar"
                                alt={teacher.name}
                              />
                            </figure>
                            <h4 className="profile_name">{teacher.name}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                    {viewTeachers.length < institute.teachers.length && (
                      <div className="pb-3 text-center">
                        <button
                          className="btn btn-outline mx-auto"
                          onClick={viewAllTeachers}
                        >
                          View all teachers
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {institute.description && (
                  <div className="rounded-boxes bg-white">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Description</h3>
                      <p className="section_sub_heading">
                        {institute.description}
                      </p>
                    </div>
                  </div>
                )}

                {institute.programs && institute.programs.length > 0 && (
                  <div className="rounded-boxes bg-white">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Programs we offer</h3>
                    </div>
                    <div>
                      {institute.programs.map((p, index) => (
                        <div className="content-tag" key={index}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {institute.subjects && institute.subjects.length > 0 && (
                  <div className="rounded-boxes bg-white">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Subjects we teach</h3>
                    </div>
                    <div>
                      {institute.subjects.map((sub, index) => (
                        <div className="content-tag" key={index}>
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {institute.specialization &&
                  institute.specialization.length > 0 && (
                    <div className="rounded-boxes bg-white">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Specialization areas include
                        </h3>
                      </div>
                      <div>
                        {institute.specialization.map((spec, index) => (
                          <div className="content-tag" key={index}>
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <br />
              </div>
            </div>
          ) : (
            <div className="container">
              <div className="col-lg-12">
                <div className="rounded-boxes bg-white">
                  <figure className="pro-wall">
                    <img src="/assets/images/wall.png" alt="Wall" />
                  </figure>
                  <figure className="pro-dp">
                    <img src="/assets/images/profile-img.png" alt="Profile" />
                  </figure>
                  <h3 className="admin-head">
                    <SkeletonLoaderComponent width={30} height={22} />
                  </h3>
                  <div className="row">
                    <div className="col-lg-7">
                      <p className="admin-head2">
                        <SkeletonLoaderComponent width={30} height={22} />
                      </p>
                    </div>
                    <div className="col-lg-5">
                      <SkeletonLoaderComponent width={90} height={45} />
                    </div>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Our Prestigious Teachers
                    </h3>
                    <p className="section_sub_heading">
                      <SkeletonLoaderComponent width={100} height={30} />
                    </p>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Description</h3>
                    <p className="section_sub_heading">
                      <SkeletonLoaderComponent width={100} height={30} />
                    </p>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Programs we offer</h3>
                    <p className="section_sub_heading">
                      <SkeletonLoaderComponent width={100} height={30} />
                    </p>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Subjects we teach</h3>
                    <p className="section_sub_heading">
                      <SkeletonLoaderComponent width={100} height={30} />
                    </p>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Specialization areas include
                    </h3>
                    <p className="section_sub_heading">
                      <SkeletonLoaderComponent width={100} height={30} />
                    </p>
                  </div>
                </div>
                <br />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Institute;
