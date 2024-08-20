import { embedVideo } from "@/lib/helpers";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOngoingClasses,
  getClassesTimeSpent,
  removeClassroom,
  withdraw,
} from "@/services/courseService";
import * as courseService from "@/services/courseService";
import * as userService from "@/services/userService";
import * as classSvc from "@/services/classroomService";
import { openChat } from "@/services/chatService";
import PImage from "@/components/PImage";
import { success, error } from "alertifyjs";
import { Modal, Carousel } from "react-bootstrap";
import { CourseStatusType } from "@/interfaces/interface";
import MathJax from "@/components/assessment/mathjax";
import { avatar, date, elipsis, fromNow } from "@/lib/pipe";
import VideoPlayer from "@/components/course/video-player";
import PImageComponent from "@/components/AppImage";
import * as alertify from "alertifyjs";

const SummaryComponent = ({
  course,
  setCourse,
  ongoingClasses,
  setOngoingClasses,
  user,
  clientData,
  selectedSideMenu,
}: any) => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [disableAccess, setDisableAccess] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<string>("");
  const [notificationModal, setNotificationModal] = useState<boolean>(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [hasClasses, setHasClasses] = useState<boolean>(false);
  const [classes, setClasses] = useState<any>(null);
  const [showClassList, setShowClassList] = useState<any>(null);
  useEffect(() => {
    if (course.videoUrl && course.videoUrl !== "") {
      const link = embedVideo(course.videoUrl);
      if (link) {
        setVideoUrl(link);
      }
    } else {
      setVideoUrl("");
    }

    userService.get().then((usr) => {
      classSvc
        .getClassRoomByLocation([usr.activeLocation])
        .then((allClasses) => {
          setClasses(allClasses);
          setHasClasses(allClasses.length);
        });
    });
  }, []);

  useEffect(() => {
    if (selectedSideMenu == "summary") {
      loadClassrooms();
    }
  }, [selectedSideMenu]);

  const loadClassrooms = async () => {
    const onGoingClassesData = await getOngoingClasses(course._id);
    const classesTimeSpent = await getClassesTimeSpent(course._id);

    if (classesTimeSpent && classesTimeSpent.length > 0) {
      onGoingClassesData.forEach((element: any) => {
        classesTimeSpent.forEach((c: any) => {
          if (c.classroomId === element.classroomId) {
            element.timeSpent = c.time;
          } else {
            element.timeSpent = 0;
          }
        });
      });
    } else if (classesTimeSpent.length === 0 || !classesTimeSpent) {
      onGoingClassesData.forEach((element: any) => {
        element.timeSpent = 0;
      });
    }
    setOngoingClasses(onGoingClassesData);
  };

  const viewDetails = (item: any) => {
    router.push(`/course/details/${item._id}`);
  };

  const removeClassrooms = async (itemId: string) => {
    await removeClassroom(course._id, itemId).then(() => {
      loadClassrooms();
    });
  };

  const openTeacherChat = (teacherId: string, name: string) => {
    openChat(teacherId, name);
  };

  const viewCls = (id: string) => {
    router.push(`/classroom/details/${id}`);
  };

  const copyText = (i: any) => {
    copyText(
      (user.primaryInstitute?.site
        ? user.primaryInstitute.site
        : clientData.baseUrl) +
        "start/" +
        course.courseCode +
        ongoingClasses[i].seqcode
    );
    success("Successfully Copied");
  };

  const openNotificationModal = () => {
    setNotificationModal(true);
  };

  const cancel = () => {
    setNotificationModal(false);
  };

  const withdrawCourse = () => {
    withdraw(course._id, {
      notificationMsg: notificationMsg,
      disableAccess: disableAccess,
    })
      .then((data: any) => {
        setCourse({ ...course, status: CourseStatusType.REVOKED });
        success("Withdrawn Successfully");
        cancel();
      })
      .catch(() => {
        error("Unable to withdraw the course");
      });
  };

  const cancelClassroomList = () => {
    setShowClassList(false);
  };

  const showClassroomList = async () => {
    setShowClassList(true);
    const tmp = [...classes];
    for (const cls of tmp) {
      cls.selected = !!course.classrooms.find((pc) => pc._id == cls._id);
    }
    setClasses(tmp);
  };

  const saveClassroomList = () => {
    setShowClassList(false);

    setCourse({
      ...course,
      classrooms: classes.filter((c) => c.selected),
    });
    const updatedCourse = course;
    updatedCourse.classrooms = classes.filter((c) => c.selected);
    courseService
      .updateClassroomList(
        updatedCourse._id,
        updatedCourse.classrooms.map((c) => c._id)
      )
      .then((r) => {
        if (updatedCourse.status == "draft") {
          alertify.alert(
            "Message",
            "This course is in draft mode. To make this available to students for use, please publish it"
          );
        } else {
          alertify.success("Classroom list is updated");
        }
        loadClassrooms();
      });
  };

  return (
    <>
      {course.accessMode === "invitation" &&
        user.role != "publisher" &&
        user.primaryInstitute.type != "publisher" && (
          <div className="rounded-boxes bg-white">
            <div className="d-flex justify-content-between">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Classroom(s)</h3>
              </div>

              {hasClasses && !showClassList ? (
                <button className="btn btn-primary" onClick={showClassroomList}>
                  Select Classroom
                </button>
              ) : null}

              {showClassList && (
                <div>
                  <button
                    className="btn btn-outline mr-2"
                    onClick={cancelClassroomList}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={saveClassroomList}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!showClassList ? (
              ongoingClasses.length ? (
                <div className="d-flex flex-wrap gap-xs mt-2">
                  {ongoingClasses.map((item, index) => (
                    <div
                      className="box box_new bg-white pt-0 border rounded"
                      key={index}
                    >
                      <div
                        className="image-wrap course-img_class_new cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/classroom/details/${item.classroomId}`)
                        }
                      >
                        <PImageComponent
                          height={102}
                          fullWidth
                          imageUrl={item.imageUrl}
                          backgroundColor={item.colorCode}
                          text={item.title}
                          radius={9}
                          fontSize={8}
                          type="classroom"
                          testMode={item.testMode}
                        />
                      </div>
                      <div className="box-inner box-inner_new has-shdow no-bottom-info custSum-mary">
                        <div
                          className="info p-0 m-0 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/classroom/details/${item.classroomId}`)
                          }
                        >
                          <h4>{item.title}</h4>
                        </div>
                        <div>
                          <div className="d-flex align-items-center">
                            <span className="material-icons course">
                              people
                            </span>
                            <span className="icon-text couNtBoLd">
                              {" "}
                              {item.students}
                            </span>
                            <span className="icon-text pl-0">
                              student(s) joined
                            </span>
                          </div>
                          <div className="d-flex align-items-center mt-1">
                            <span className="material-icons course">
                              timelapse
                            </span>
                            <span className="icon-text couNtBoLd">
                              {item.timeSpent}
                            </span>
                            <span className="icon-text">hrs spent</span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end">
                          <a
                            onClick={() => copyText(index)}
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Copy"
                          >
                            <i className="material-icons button_icons">
                              file_copy
                            </i>
                          </a>
                          {user.role !== "publisher" && (
                            <a
                              href={`/classroom/details/${item.classroomId}`}
                              className="ml-1"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="View"
                            >
                              <i className="material-icons button_icons">
                                preview
                              </i>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="not-found-image">
                  <figure>
                    <img
                      src="/assets/images/undraw_predictive_analytics_kf9n.svg"
                      alt="Not Found"
                    />
                  </figure>
                  <h4 className="text-center mt-3">No Classroom Added</h4>
                </div>
              )
            ) : (
              <div className="d-flex justify-content-start flex-wrap gap-xs mt-3">
                {classes.map((item, index) => (
                  <div
                    className="box box_new bg-white pt-0 border rounded"
                    key={index}
                  >
                    <div className="image-wrap cursor-pointer">
                      <PImageComponent
                        height={102}
                        fullWidth
                        imageUrl={item.imageUrl}
                        backgroundColor={item.colorCode}
                        text={item.title}
                        radius={9}
                        fontSize={8}
                        type="classroom"
                        testMode={item.testMode}
                      />
                    </div>
                    <div className="box-inner box-inner_new bg-transparent">
                      <div className="info p-0 m-0 cursor-pointer">
                        <h4>{item.name}</h4>
                      </div>
                      <div className="my-2">
                        <div className="d-flex align-items-center my-2 top-0 left-0">
                          <span className="material-icons course position-relative">
                            people
                          </span>
                          <span className="icon-text couNtBoLd px-2">
                            {" "}
                            {item.students.length}
                          </span>
                          <span className="icon-text pl-0">Student(s)</span>
                        </div>
                      </div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={item.selected}
                            onChange={(e) => {
                              const newClasses = [...classes];
                              newClasses[index].selected = e.target.checked;
                              setClasses(newClasses);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      <div className="course-summery-area rounded-boxes bg-white">
        <div className="course-summery-wrap">
          <div className="row">
            <div className="col-lg-8">
              <div className="course-summery-info">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Description</h3>
                  {course &&
                    course.description &&
                    course.description.length > 450 && (
                      <>
                        <div className={isCollapsed ? "collapsed" : ""}>
                          <MathJax value={course.description} />
                        </div>
                        <a
                          className="pull-right my-2"
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                          onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                          {isCollapsed ? "Read more" : "Read less"}
                        </a>
                      </>
                    )}
                  {course &&
                    course.description &&
                    course.description.length < 450 && (
                      <MathJax value={course.description} />
                    )}
                  {(!course?.description ||
                    course.description.length === 0) && (
                    <p className="section_sub_heading">No Description Yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-12 col-lg-4">
              <div className="border-box item">
                <div className="inner">
                  <h4 className="border-box_title">Course Start Date</h4>
                  {course.startDate ? (
                    <h5 className="f-14 mt-1">
                      {date(course.startDate, "yy/MM")}
                    </h5>
                  ) : (
                    <h5 className="f-14 mt-1">Not selected yet</h5>
                  )}
                </div>

                <div className="inner m-0">
                  <h4 className="border-box_title">Level</h4>
                  <h5 className="f-14 mt-1">{course.level}</h5>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="row">
                <div className="col-lg-6">
                  {course && course.videoUrl ? (
                    <div className="video-frame">
                      <VideoPlayer _link={course.videoUrl} _height={400} />
                    </div>
                  ) : (
                    <div className="border-box video-frame item">
                      <img
                        src="/assets/images/emptyVideoImage.png"
                        alt="There emptyVideo"
                      />
                      <h3 className="text-center text-dark">No Video yet</h3>
                      <p className="text-center">
                        Please add some from Course Settings.
                      </p>
                    </div>
                  )}
                </div>

                <div className="col-lg-6">
                  <div className="border-box item credt">
                    <h4 className="border-box_title">Credits</h4>
                    <p className="f-14">
                      You will earn {course.credits} credits upon successfully
                      completing this course
                    </p>
                  </div>

                  {course.offeredBy?.name && (
                    <div className="border-box item credt">
                      <h4 className="border-box_title">Offered By</h4>
                      <div className="google-imgs">
                        {course.offeredBy?.imageUrl && (
                          <figure className="mb-2">
                            <img src={course.offeredBy?.imageUrl} alt="image" />
                          </figure>
                        )}

                        <h4 className="border-box_subtitle">
                          {course?.offeredBy.name}
                        </h4>
                        <p>{course.offeredBy.description}</p>
                      </div>

                      <div className="highlight ml-auto">
                        <span className="text-center">{course.credits}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-12 col-lg-4">
              <div className="d-flex flex-column">
                <div className="border-box item">
                  <h4 className="border-box_title">Instructors</h4>

                  {course.instructors && course.instructors.length ? (
                    <div className="inner-wrap custom_scrollbar">
                      {course.instructors.map((item: any, index: number) => (
                        <div key={index} className="profile-item clearfix">
                          <div className="profile-item-inner d-flex align-items-center clearfix my-1 p-0 w-100 float-none">
                            <figure className="user_img_circled_wrap">
                              <img
                                src={avatar(item)}
                                alt=""
                                className="user_img_circled"
                              />
                            </figure>

                            <div
                              className="profile-name ml-2 w-100 float-none p-0"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="{inst.name}"
                            >
                              <h5 className="f-14 text-black">
                                {elipsis(item.name, 15, true)}
                              </h5>
                            </div>

                            {item._id !== user._id &&
                              clientData?.feature &&
                              clientData?.features.chat && (
                                <div className="ml-auto mr-2">
                                  <a
                                    className="btn btn-outline btn-sm"
                                    onClick={() =>
                                      openTeacherChat(item._id, item.name)
                                    }
                                  >
                                    Message
                                  </a>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="inner-wrap">
                      <p> No Instructors yet</p>
                    </div>
                  )}
                </div>

                <div className="border-box item">
                  <div className="inner">
                    <h4 className="border-box_title">Created By</h4>
                    <h5 className="f-14 mt-1">
                      {course?.owner?.name} {fromNow(course.createdAt)}
                    </h5>
                  </div>

                  <div className="inner m-0">
                    <h4 className="border-box_title">Last Updated By</h4>
                    <h5 className="f-14 mt-1">
                      {course?.lastModifiedBy?.name} {fromNow(course.updatedAt)}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {course?.status === "published" && course?.canEdit && (
            <div className="text-right">
              <button
                className="btn btn-danger"
                onClick={() => openNotificationModal()}
              >
                Withdraw
              </button>
            </div>
          )}
        </div>
      </div>

      {ongoingClasses &&
        ongoingClasses.length !== 0 &&
        course.accessMode === "invitation" && (
          <div className="rounded-boxes bg-white course-summery-slider">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Ongoing ClassName(es)</h3>
            </div>
            <Carousel indicators={false} controls={false}>
              {ongoingClasses.map((item: any, index: number) => (
                <Carousel.Item key={index}>
                  <div className="box-item">
                    <div className="box box_new course-item_new has-border bg-white pt-0">
                      <a
                        onClick={() => viewCls(item.classroomId)}
                        className="btn btn-link btn-sm"
                      >
                        <PImage
                          imageUrl={item.imageUrl}
                          text={item.title}
                          radius={9}
                          fontSize={15}
                          type={"classroom"}
                        />
                      </a>
                    </div>

                    <div className="box-inner box-inner_new has-shdow no-bottom-info custSum-mary">
                      <a href={`classroom/details/${item.classroomId}`}>
                        <h4>{item.title}</h4>
                      </a>

                      <div className="">
                        <div className="d-flex align-items-center">
                          <span className="material-icons course">people</span>
                          <span className="icon-text couNtBoLd">
                            {" "}
                            {item.students}
                          </span>
                          <span className="icon-text pl-0">
                            student(s) joined
                          </span>
                        </div>

                        <div className="d-flex align-items-center mt-1">
                          <span className="material-icons course">
                            timelapse
                          </span>
                          <span className="icon-text couNtBoLd">
                            {item.timeSpent}
                          </span>
                          <span className="icon-text">hrs spent</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <div>
                          <a
                            onClick={() => {
                              copyText(index);
                              setTooltipVisible(true);
                              setTimeout(() => setTooltipVisible(false), 2000);
                            }}
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Copy"
                          >
                            <i className="material-icons button_icons">
                              file_copy
                            </i>
                          </a>
                          {tooltipVisible && <div>Copy tooltip</div>}
                        </div>
                        {user.rol !== "publisher" && (
                          <a
                            onClick={() => viewCls(item.classroomId)}
                            className="ml-1"
                          >
                            <i className="material-icons button_icons">
                              preview
                            </i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}

      <Modal
        show={notificationModal}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h3 className="form-box_title">Confirm Withdrawal of Course</h3>
          </div>
          <div className="modal-body">
            <div className="create-course-modal">
              <div className="className-board-info">
                <div className=" mx-auto">
                  <form onSubmit={() => withdrawCourse()}>
                    <div className="form-group">
                      <div className="d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio">
                            <input
                              type="radio"
                              value="false"
                              name="ckDisable"
                              id="ckDisable1"
                              onChange={(e: any) =>
                                setDisableAccess(e.target.value)
                              }
                              className="custom-control-input"
                            />
                            <label
                              htmlFor="ckDisable1"
                              className="my-0 translate-middle-y"
                            ></label>
                          </div>
                        </div>
                        <h4 className="form-box_subtitle">
                          New Student will not be able to register to this coure
                          anymore. However, enrolled students will continue to
                          use it.
                        </h4>
                      </div>
                      <br />
                      <div className="d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio">
                            <input
                              type="radio"
                              value="true"
                              name="ckDisable"
                              id="ckDisable2"
                              onChange={(e: any) =>
                                setDisableAccess(e.target.value)
                              }
                              className="custom-control-input"
                            />
                            <label
                              htmlFor="ckDisable2"
                              className="my-0 translate-middle-y"
                            ></label>
                          </div>
                        </div>
                        <h4 className="form-box_subtitle">
                          Student can no longer use this course.
                        </h4>
                      </div>
                      <br />
                      <h4 className="form-box_subtitle">
                        Once withdrawn, system will send email notification to
                        all enrolled students.
                        <br />
                        Do you want to continue?
                      </h4>

                      <div className="my-3">
                        <input
                          type="text"
                          name="name"
                          placeholder="Specify a reason or message to students"
                          onChange={(e: any) =>
                            setNotificationMsg(e.target.value)
                          }
                          className="form-control form-control-sm border-bottom"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <a onClick={() => cancel()} className="btn btn-light">
                        Cancel
                      </a>
                      <button type="submit" className="btn btn-primary ml-2">
                        OK
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SummaryComponent;
