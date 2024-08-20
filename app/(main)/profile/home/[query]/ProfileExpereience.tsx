"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import _ from "lodash";
import { success } from "alertifyjs";
import SVG from "@/components/svg";
import { Modal, Form } from "react-bootstrap";

const ProfileExperience = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();

  const [modalShow, setModalShow] = useState(false);
  const [experience, setexperience]: any = useState({});

  const openModal = (data?: any) => {
    if (data) {
      setexperience({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
    }
    setModalShow(true);
  };

  const cancel = () => {
    setModalShow(false);
    setexperience({});
  };

  const addExperience = async () => {
    if (validate()) {
      if (experience && experience._id) {
        await clientApi.put(
          `/api/users/updateExperience/${user._id}`,
          experience
        );
        await update();
      } else {
        await clientApi.put(`/api/users/addExperience/${user._id}`, experience);
        await update();
      }
      setModalShow(false);
    }
  };

  const validate = () => {
    if (experience.currentlyWorking) {
      setexperience({
        ...experience,
        endDate: null,
      });
    }
    if (!experience.title || experience.title == "") {
      alertify.alert("Message", "Please add the title of the experience");
      return false;
    }
    if (!experience.employmentType) {
      alertify.alert("Message", "Please specify the employment type");
      return false;
    }
    if (!experience.company) {
      alertify.alert("Message", "Please add the company");
      return false;
    }
    if (!experience.location) {
      alertify.alert("Message", "Please add the location ");
      return false;
    }
    if (!experience.startDate) {
      alertify.alert("Message", "Please select the start date");
      return false;
    }
    if (!experience.currentlyWorking && !experience.endDate) {
      alertify.alert("Message", "Please select the end date");
      return false;
    }
    if (
      experience.startDate &&
      experience.endDate &&
      !experience.currentlyWorking
    ) {
      const start = new Date(experience.startDate).getTime();
      const end = new Date(experience.endDate).getTime();
      if (start > end) {
        alertify.alert(
          "Message",
          "Please select the end date after the start date"
        );
        return false;
      }
    }
    return true;
  };

  return (
    <div>
      <div className="institute-onboarding">
        <div>
          <div className="container6 rounded-boxes bg-white m-0">
            <div className="row">
              <div className="col-lg">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Work Experience</h3>
                  <p className="section_sub_heading">
                    Add your work experience, which will be add value to the
                    profile
                  </p>
                </div>
              </div>
              <div className="col-auto ml-auto">
                <div className="create-btn-remove">
                  <a
                    className="btn btn-primary"
                    onClick={() => setModalShow(true)}
                  >
                    Add Experience
                  </a>
                </div>
              </div>
            </div>
          </div>
          {user && user.experiences && user.experiences.length ? (
            <div className="container6 rounded-boxes bg-white m-0">
              <div className="experiences-box_timeline">
                {user.experiences.map((ex: any, index: any) => {
                  return (
                    <div className="experiences-box" key={index}>
                      <h1 className="experiences_title">
                        {ex.title}
                        <a onClick={() => openModal(ex)}>
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 19 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.375 13.6563V16.625H5.34375L14.0996 7.86919L11.1308 4.90044L2.375 13.6563ZM16.3954 5.57336C16.7042 5.26461 16.7042 4.76586 16.3954 4.45711L14.5429 2.60461C14.2342 2.29586 13.7354 2.29586 13.4267 2.60461L11.9779 4.05336L14.9467 7.02211L16.3954 5.57336Z"
                              fill="black"
                            />
                          </svg>
                        </a>
                      </h1>
                      <p className="ex_experiences_company">{ex.company}</p>
                      {ex.startDate && (
                        <p className="experiences_start_date">
                          {ex.startDate} -
                          {ex.endDate && !ex.currentlyWorking && (
                            <span>{ex.endDate}</span>
                          )}
                          {ex.currentlyWorking && <span>Present</span>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <></>
          )}
          {!user ||
            !user.experiences ||
            (!user.experiences.length && (
              <div className="text-center">
                <SVG.NoExperience />
                <p>No Experiences found</p>
              </div>
            ))}
        </div>
      </div>

      <Modal
        show={modalShow}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <Modal.Header className="transparent-heading">
          <Modal.Title>Add Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="pl-0">
            <div>
              <div>
                <div className="clearfix">
                  <div className="class-board-info">
                    <form>
                      <h4 className="form-box_subtitle mb-0">Title</h4>
                      <input
                        type="text"
                        name="search"
                        placeholder="Add Title"
                        value={experience.title}
                        onChange={(e) =>
                          setexperience({
                            ...experience,
                            title: e.target.value,
                          })
                        }
                      />
                    </form>
                    <hr />
                    <form>
                      <h4 className="form-box_subtitle mb-0">
                        Employement Type
                      </h4>
                      <input
                        type="text"
                        name="search"
                        placeholder="Type"
                        value={experience.employmentType}
                        onChange={(e) =>
                          setexperience({
                            ...experience,
                            employmentType: e.target.value,
                          })
                        }
                      />
                    </form>
                    <hr />
                    <form>
                      <h4 className="form-box_subtitle mb-0">Company</h4>
                      <input
                        type="text"
                        name="search"
                        placeholder="Add Company"
                        value={experience.company}
                        onChange={(e) =>
                          setexperience({
                            ...experience,
                            company: e.target.value,
                          })
                        }
                      />
                    </form>
                    <hr />
                    <form>
                      <h4 className="form-box_subtitle mb-0">Location</h4>
                      <input
                        type="text"
                        name="search"
                        placeholder="Location"
                        value={experience.location}
                        onChange={(e) =>
                          setexperience({
                            ...experience,
                            location: e.target.value,
                          })
                        }
                      />
                    </form>

                    <hr />
                    <label className="container2 pt-1">
                      I&apos;m currently working on this role
                      <input
                        type="checkbox"
                        value={experience.currentlyWorking}
                        onChange={(e) => {
                          console.log(e.target.value);
                          setexperience({
                            ...experience,
                            currentlyWorking: e.target.value ? true : false,
                          });
                        }}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>

                    <div className="row">
                      <div className="col-lg-6">
                        <div>
                          <div>
                            <div className="profile-info">
                              <h4 className="form-box_subtitle mb-0">
                                Start Date
                              </h4>
                              <p className="input-group datepicker-box date">
                                <Form.Group controlId="startDate">
                                  <Form.Label>Select Date</Form.Label>
                                  <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={experience.startDate}
                                    onChange={(e) =>
                                      setexperience({
                                        ...experience,
                                        startDate: e.target.value,
                                      })
                                    }
                                  />
                                </Form.Group>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!experience.currentlyWorking && (
                        <div className="col-lg-6">
                          <div className="profile-info">
                            <h4 className="form-box_subtitle mb-0">End Date</h4>
                            <p className="input-group datepicker-box">
                              <Form.Group controlId="endDate">
                                <Form.Label>Select Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="endDate"
                                  value={experience.endDate}
                                  onChange={(e) =>
                                    setexperience({
                                      ...experience,
                                      endDate: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <form>
                      <h4 className="form-box_subtitle mb-0">Description</h4>
                      <input
                        type="text"
                        name="search"
                        placeholder="Add Description"
                        value={experience.description}
                        onChange={(e) =>
                          setexperience({
                            ...experience,
                            description: e.target.value,
                          })
                        }
                      />
                    </form>
                    <hr />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-2">
            <a className="btn btn-light" onClick={cancel}>
              Cancel
            </a>
            <a className="btn btn-primary ml-2" onClick={addExperience}>
              Save
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default ProfileExperience;
