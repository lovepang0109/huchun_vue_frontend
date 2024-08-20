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
import * as subjectService from "@/services/subjectService";
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
import { avatar } from "@/lib/pipe";

const ProfileSummary = ({ onEdit, user }: any) => {
  // const user: any = useSession()?.data?.user?.info || {};
  const [subjects, setSubjects] = useState<any>([]);
  const [getClientData, setClientData] = useState<any>({});

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc();
    subjectService.getMine().then((data) => {
      setSubjects(data);
    });
  }, []);

  const edit = (item: any) => {
    onEdit({ _id: item });
  };

  return (
    <div className="mentor-homepage-profile Stu_profile">
      <div className="institute-onboarding">
        <div className="container p-0">
          <div className="container6 rounded-boxes bg-white m-0">
            <figure className="pro-wall">
              {!user?.coverImageUrl ? (
                <img src="assets/images/wall.png" alt="" />
              ) : (
                <img src={user.coverImageUrl} alt="" />
              )}
            </figure>
            <div className="pro-dp_wrap">
              <figure className="pro-dp-remove">
                <img
                  src={avatar(user)}
                  alt=""
                  className="dp-on_wall object-cover"
                />
              </figure>
            </div>

            <div className="row">
              <div className="col">
                <h3 className="admin-head pl-0">{user?.name}</h3>
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

            <div className="row">
              <div className="col-lg-7">
                <p className="admin-head2 pl-2">{user?.institute}</p>
                <p className="admin-head2 pl-2">{user?.coreBranch}</p>
              </div>
              <div className="col-lg-5">
                <p className="admin-head1">Find me on</p>
                <div className="row">
                  {user.facebook && (
                    <a
                      href={
                        user.facebook.includes("https://")
                          ? user.facebook
                          : `https://www.facebook.com/${user.facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="facebook"
                    >
                      <img
                        src="assets/images/student-profile/facebook.svg"
                        alt=""
                      />
                    </a>
                  )}
                  {user.instagram && (
                    <a
                      href={
                        user.instagram.includes("https://")
                          ? user.instagram
                          : `https://www.instagram.com/${user.instagram}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="assets/images/student-profile/instagram.svg"
                        alt=""
                      />
                    </a>
                  )}
                  {user.linkedIn && (
                    <a
                      href={
                        user.linkedIn.includes("https://")
                          ? user.linkedIn
                          : `https://www.linkedin.com/${user.linkedIn}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="linkedin"
                    >
                      <img
                        src="assets/images/student-profile/linkedin.svg"
                        alt=""
                      />
                    </a>
                  )}
                  {user.youtube && (
                    <a
                      href={
                        user.youtube.includes("https://")
                          ? user.youtube
                          : `https://www.youtube.com/${user.youtube}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube"
                    >
                      <i
                        className="fab fa-youtube"
                        style={{ color: "#fe0000", fontSize: "24px" }}
                      ></i>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {user.role === "teacher" && (
              <div className="row">
                <div className="col-lg-9 d-flex align-items-center">
                  <p className="admin-head-pro-1 mt-0 pt-0 pl-0 ml-0 mr-3">
                    Share Profile
                  </p>
                  <div className="form-row">
                    <figure
                      className="col-auto pro-icon"
                      onClick={() =>
                        window.open(
                          `${getClientData.baseUrl}public/profile/teacher/${user._id}`,
                          "_blank"
                        )
                      }
                    >
                      <img src="assets/images/logos_facebook.png" alt="" />
                    </figure>
                    <figure
                      className="col-auto pro-icon"
                      onClick={() =>
                        window.open(
                          `${getClientData.baseUrl}public/profile/teacher/${user._id}`,
                          "_blank"
                        )
                      }
                    >
                      <img src="assets/images/logos_linkedin-icon.png" alt="" />
                    </figure>
                    <figure
                      className="col-auto pro-icon"
                      onClick={() =>
                        window.open(
                          `${getClientData.baseUrl}public/profile/teacher/${user._id}`,
                          "_blank"
                        )
                      }
                    >
                      <img src="assets/images/logos_whatsapp.png" alt="" />
                    </figure>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="summary-edit-btn-remove">
                    <a
                      className="btn btn-outline-black"
                      href={`/public/profile/teacher/${user._id}`}
                      target="_blank"
                    >
                      <div className="d-flex align-items-center">
                        <span className="material-icons mr-1">visibility</span>
                        View Public Profile
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="container6 rounded-boxes bg-white m-0">
            <div className="row">
              <div className="col">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Description</h3>
                  <p className="section_bottom_heading">All about yourself</p>
                  <p className="section_sub_heading">{user?.knowAboutUs}</p>
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

          <div className="container6 rounded-boxes bg-white m-0">
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
                    onClick={() => edit("subject")}
                  >
                    edit
                  </span>
                </div>
              </div>
            </div>
            <div>
              {subjects.map((item) => (
                <div className="content-tag" key={item.name}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          <div className="container6 rounded-boxes bg-white m-0">
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
              {user?.specialization.map((item) => (
                <div className="content-tag" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
};
export default ProfileSummary;
