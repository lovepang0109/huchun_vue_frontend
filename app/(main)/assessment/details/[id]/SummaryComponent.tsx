import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { success, error, alert } from "alertifyjs";
import * as practicesetService from "@/services/practice-service";
import * as classSvc from "@/services/classroomService";
import clientApi from "@/lib/clientApi";
import { getSession } from "next-auth/react";
import PImageComponent from "@/components/AppImage";
import PQuestionChart from "@/components/assessment/p-question-chart";
import Chart from "react-apexcharts";
import RatingComponent from "@/components/rating";
import { Modal } from "react-bootstrap";

import { randomColor } from "@/lib/validator";

const SummaryComponent = ({
  practice,
  setPractice,
  user,
  clientData,
  selectedSideMenu,
  classroom,
  setClassrom,
}: any) => {
  const router = useRouter();
  const [classrooms, setClassroms] = useState<any>([]);
  const [expanded, setExpanded] = useState<boolean>(false);

  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [massMail, setMassMail] = useState<{
    subject: string;
    message: string;
  }>({ subject: "", message: "" });
  const [sendingMail, setSendingMail] = useState<boolean>(false);
  const [sendMailTemplate, setSendMailTemplate] = useState<boolean>(false);
  const [summarySubject, setSummarySubject] = useState<any>([]);
  const [questionDistributionByCategory, setQuestionDistributionByCategory] =
    useState<any>([]);
  const [questionByCategoryChartOptions, setQuestionByCategoryChartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          height: 300,
          type: "donut",
        },
        fill: {
          colors: [],
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: false,
              },
            },
          },
        },
        legend: {
          show: false,
        },
        labels: [],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    });

  const [deleting, setDeleting] = useState<boolean>(false);
  const [hasClasses, setHasClasses] = useState<boolean>(false);
  const [showClassList, setShowClassList] = useState<boolean>(false);
  const [classes, setClasses] = useState<any>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [graphSeries, setGraphSeries] = useState<number[]>([]);
  const [graphLabel, setGraphLabel] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [getClientData, setClientData]: any = useState();

  console.log(classes, "classes");

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    getClientData();
  }, []);

  useEffect(() => {
    if (selectedSideMenu === "summary" && practice) {
      if (practice.accessMode === "invitation") {
        getClassrooms();
      }
      if (
        practice.status === "published" &&
        new Date(practice.expiresOn) < new Date()
      ) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    }
  }, [selectedSideMenu, practice]);

  function extendQuestionCategory(category: string): string {
    let result: string = "";

    switch (category) {
      case "fib":
        result = "Fill in the blanks";
        break;

      case "mcq":
        result = "Multiple Choice";
        break;

      case "code":
        result = "Coding";
        break;

      case "descriptive":
        result = "Descriptive";
        break;

      default:
        result = category;
        break;
    }

    return result;
  }

  useEffect(() => {
    const fetchData = async () => {
      // Load summary subject data
      const updatedSummarySubject: any[] = [];
      for (const q of practice.questions) {
        let summarysub = updatedSummarySubject.find(
          (ss: any) => ss._id === q.question.subject._id
        );
        if (!summarysub) {
          summarysub = {
            _id: q.question.subject._id,
            name: q.question.subject.name,
            count: 0,
            units: [],
          };
          updatedSummarySubject.push(summarysub);
          // setSummarySubject(updatedSummarySubject)
        }
        summarysub.count++;

        let sumUnit = summarysub.units.find(
          (st: any) => st._id === q.question.unit._id
        );
        if (!sumUnit) {
          sumUnit = {
            _id: q.question.unit._id,
            name: q.question.unit.name,
            count: 0,
          };
          summarysub.units.push(sumUnit);
        }
        sumUnit.count++;
      }
      console.log(updatedSummarySubject, "summarysubject");
      setSummarySubject(updatedSummarySubject);

      // Load distribution by question type data
      const updatedQuestionDistributionByCategory: any[] = [];
      for (const q of practice.questions) {
        let sumcat = updatedQuestionDistributionByCategory.find(
          (ss: any) => ss.category === q.question.category
        );
        if (!sumcat) {
          sumcat = {
            category: q.question.category,
            count: 0,
            questions: [],
          };
          updatedQuestionDistributionByCategory.push(sumcat);
          setQuestionDistributionByCategory(
            updatedQuestionDistributionByCategory
          );
        }
        sumcat.count++;

        let markItem = sumcat.questions.find(
          (sq: any) => sq.marks === q.question.plusMark
        );
        if (!markItem) {
          markItem = {
            marks: q.question.plusMark,
            count: 0,
          };
          sumcat.questions.push(markItem);
        }
        markItem.count++;
      }

      const graphSeries_temp: any = [];
      const graphLabel_temp: any = [];
      const colors: any = [];

      if (updatedQuestionDistributionByCategory?.length > 0) {
        const res = updatedQuestionDistributionByCategory.map((d, index) => {
          const c = randomColor();
          d.category = extendQuestionCategory(d.category);
          graphSeries_temp.push(parseInt(d.count));
          graphLabel_temp.push(d.category);
          colors.push(c);
          return { ...d, color: c };
        });
        setGraphLabel(graphLabel_temp);
        setGraphSeries(graphSeries_temp);
        console.log(res, "rese");
        setQuestionDistributionByCategory(res);
      }
      console.log(updatedQuestionDistributionByCategory, "upate");

      setQuestionByCategoryChartOptions((prev: any) => ({
        ...prev,
        series: graphSeries_temp,
        options: {
          ...prev.options,
          labels: graphLabel_temp,
          fill: {
            ...prev.options.fill,
            colors: colors,
          },
        },
      }));

      let totalMarksCalculated = 0;
      if (practice.isMarksLevel) {
        totalMarksCalculated = practice.plusMark * practice.questions?.length;
      } else {
        practice.questions.forEach((element: any) => {
          totalMarksCalculated += element.question.plusMark;
        });
      }
      setTotalMarks(totalMarksCalculated);

      getClassrooms();

      if (user?.activeLocation) {
        const params = {};
        const allClasses = await classSvc.getClassRoomByLocation(
          [user.activeLocation],
          params
        );

        setClasses(allClasses);
        setHasClasses(allClasses?.length);
      }
    };

    fetchData();
  }, []);

  const getClassrooms = async () => {
    const res = await practicesetService.getPracticesetClassroom(practice._id);
    console.log(res?.data, "classromss");
    setClassroms(res?.data);
  };

  const commonCopyText = (text: any) => {
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  };

  const copyText = (classroom: any) => {
    if (!classroom.joinByCode) {
      alert(
        "Allow student to join by code is off in classroom setting. Please turn it on and try again."
      );
      return;
    }
    const val =
      "https://react.practiz.xyz/start/" +
      practice.testCode +
      classroom.seqCode;
    commonCopyText(val);
    success("Successfully Copied");
  };

  const getBaseUrl = () => {
    return user.primaryInstitute?.site
      ? user.primaryInstitute.site
      : getClientData.baseUrl;
  };

  const viewDetails = (id: any) => {
    router.push(`/classroom/details/${id}`);
  };

  const viewCourse = (course: any) => {
    router.push(`/${user.role}/course/details/${course._id}`);
  };

  const viewTestseries = (series: any) => {
    router.push(`/${user.role}/testseries/details/${series._id}`);
  };

  const openSendMailModal = (classroom: any) => {
    setClassrom(classroom);
    // this.modalRef = this.modalSvc.show(template)
    setSendMailTemplate(true);
  };

  const close = () => {
    setMassMail({
      ...massMail,
      subject: "",
      message: "",
    });
    // this.modalRef.hide()
    setSendMailTemplate(false);
  };

  const testMassMail = async () => {
    const data: any = { ...massMail };
    data.date = moment(practice.startDate).format("dddd, MMMM Do YYYY");
    data.time = moment(practice.startDate).format("h:mm a");
    data.fullDate = moment(practice.startDate).format(
      "dddd, MMMM Do YYYY, h:mm a"
    );
    data.assessment_link =
      "https://react.practiz.xyz/start/" +
      practice.testCode +
      classroom.seqCode;
    data.user_name = user.name;
    data.userId = user.userId;

    setSendingMail(true);
    const session = await getSession();

    try {
      const res = await clientApi.post(
        `${process.env.NEXT_PUBLIC_API}/api/v1/admin/testMailByKey/remind-proctored-test`,
        data,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );
      setSendingMail(false);
      success("Test mail is sent.");
    } catch (err) {
      error("Failed to send test mail.");
      setSendingMail(false);
    }
  };
  const sendMassMail = async () => {
    const testData: any = { ...massMail };
    testData.date = moment(practice.startDate).format("dddd, MMMM Do YYYY");
    testData.time = moment(practice.startDate).format("h:mm a");
    testData.fullDate = moment(practice.startDate).format(
      "dddd, MMMM Do YYYY, h:mm a"
    );
    testData.assessment_link =
      getBaseUrl() + "start/" + practice.testCode + classroom.seqCode;

    setSendingMail(true);

    try {
      const session = await getSession();
      console.log(classroom._id, "classroom._id");
      const res = await clientApi.post(
        `https://newapi.practiz.xyz/api/v1/admin/sendRemindProctoredTestMail/${classroom._id}`,
        testData,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );
      setSendingMail(false);
      success("Mass mail is sent to this classroom.");
    } catch (err) {
      error("Failed to send mass mail to this classroom.");
      setSendingMail(false);
    }
  };

  const showClassroomList = async () => {
    setShowClassList(true);
    const updatedClasses = [...classes];
    updatedClasses.map((cls: any) => {
      cls.selected = !!practice.classRooms.find((pc) => pc == cls._id);
    });
    setClasses(updatedClasses);
  };

  const saveClassroomList = async () => {
    setShowClassList(false);

    const temp_classrooms = classes.filter((c) => c.selected).map((c) => c._id);
    setPractice({
      ...practice,
      classRooms: temp_classrooms,
    });

    try {
      await practicesetService.updateClassroomList(
        practice._id,
        temp_classrooms
      );
      if (practice.status == "draft") {
        alert(
          "Message",
          "This assessment is in draft mode. To make this available to students for use, please publish it"
        );
      } else {
        success("Classroom list is updated");
      }
      getClassrooms();
    } catch (err) {
      console.error(err, "error");
    }
  };

  const cancelClassroomList = () => {
    setShowClassList(false);
  };

  return (
    <>
      <main className="pt-0">
        <div className="assessment-settings non-stepper">
          <div className="dashboard-area classroom mx-auto">
            {practice.readonly && (
              <div className="rounded-boxes bg-white mt-3 mb-0">
                <p className="bold text-danger h6">
                  This assessment is removed from your institute possibly
                  because it was withdrawn. You can still review student result
                  (historic). Please contact administrator if you need access.
                </p>
              </div>
            )}
            {!practice.readonly && practice.accessMode === "invitation" && (
              <>
                <div className="rounded-boxes bg-white mt-3 mb-0">
                  <div className="d-flex justify-content-between">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Classroom(s)</h3>
                    </div>

                    {hasClasses && !showClassList && (
                      <button
                        className="btn btn-primary"
                        onClick={showClassroomList}
                      >
                        Select Classroom
                      </button>
                    )}
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
                  {!showClassList && (
                    <>
                      {classrooms?.length > 0 && (
                        <div className="d-flex flex-wrap gap-xs">
                          {classrooms.map((item: any, index: any) => (
                            <div
                              key={index}
                              className="box box_new bg-white pt-0 border rounded select-class-list"
                            >
                              <div
                                className="image-wrap cursor-pointer"
                                onClick={() => viewDetails(item._id)}
                              >
                                <PImageComponent
                                  height={102}
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  type="classroom"
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />
                              </div>

                              <div className="box-inner box-inner_new bg-transparent">
                                <div
                                  className="info p-0 m-0 cursor-pointer"
                                  onClick={() => viewDetails(item._id)}
                                >
                                  <h4>{item.name}</h4>
                                </div>

                                <div className="my-2">
                                  <div className="d-flex align-items-center">
                                    <span className="material-icons course position-relative top-0 left-0">
                                      timelapse
                                    </span>
                                    <span className="icon-text couNtBoLd px-2">
                                      {item.attemptsCount}
                                    </span>
                                    <span className="icon-text pl-0">
                                      Attempt(s)
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center my-2 top-0 left-0">
                                    <span className="material-icons course position-relative">
                                      people
                                    </span>
                                    <span className="icon-text couNtBoLd px-2">
                                      {item.studentsCount}
                                    </span>
                                    <span className="icon-text pl-0">
                                      Student(s)
                                    </span>
                                  </div>
                                </div>

                                <div className="d-flex justify-content-end">
                                  <a
                                    onClick={() => copyText(item)}
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
                                      onClick={() => viewDetails(item._id)}
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title="View"
                                      className="ml-1"
                                    >
                                      <i className="material-icons button_icons">
                                        preview
                                      </i>
                                    </a>
                                  )}
                                  {practice.isProctored &&
                                    (user.role == "admin" ||
                                      user.role == "director") && (
                                      <a
                                        onClick={() => openSendMailModal(item)}
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="Send Mail"
                                        className="ml-1"
                                      >
                                        <i className="material-icons button_icons">
                                          forward_to_inbox
                                        </i>
                                      </a>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {classrooms?.length === 0 && (
                        <div className="not-found-image">
                          <figure>
                            <img
                              src="/assets/images/undraw_predictive_analytics_kf9n.svg"
                              alt="Not Found"
                            />
                          </figure>
                          <h6 className="text-center mt-3">
                            No Classroom Added
                          </h6>
                        </div>
                      )}
                    </>
                  )}
                  {showClassList && (
                    <div className="d-flex justify-content-start flex-wrap gap-xs mt-3">
                      {classes.map((item, index) => (
                        <div
                          key={index}
                          className="box box_new bg-white pt-0 border rounded select-class-list"
                        >
                          <div className="image-wrap cursor-pointer">
                            <PImageComponent
                              height={102}
                              imageUrl={item.imageUrl}
                              backgroundColor={item.colorCode}
                              type="classroom"
                              text={item.title}
                              radius={9}
                              fontSize={15}
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
                                  {item.students?.length}
                                </span>
                                <span className="icon-text pl-0">
                                  Student(s)
                                </span>
                              </div>
                            </div>
                            <div
                              className="form-group switch-item mt-1"
                              style={{ float: "left" }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="align-self-center">
                                  <label className="switch col-auto ml-auto my-0 align-middle">
                                    <input
                                      type="checkbox"
                                      checked={item.selected}
                                      onChange={(e) => {
                                        const updatedClasses = classes.map(
                                          (item, idx) => {
                                            if (idx === index) {
                                              return {
                                                ...item,
                                                selected: e.target.checked,
                                              };
                                            }
                                            return item;
                                          }
                                        );
                                        setClasses(updatedClasses);
                                      }}
                                    />
                                    <span
                                      className="slider round translate-middle-y"
                                      style={{ top: 0 }}
                                    ></span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* <app-toggle value={item.selected} onChange={(value) => item.selected = value} /> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="class-board bg-white rounded-boxes text-black">
              {practice &&
                practice.description &&
                practice.description?.length > 0 && (
                  <div className="d-none d-lg-block">
                    <div className="section_heading_wrapper clearfix">
                      <h3 className="section_top_heading">Description</h3>

                      {/* <read-more *ngIf="practice && practice.description &&practice.description.length > 325">
                        <p class="section_sub_heading">
                            {{practice.description}}
                        </p>
                    </read-more> */}
                      {practice &&
                      practice.description &&
                      practice.description?.length > 325 ? (
                        <p className="section_sub_heading">
                          {practice.description}
                        </p>
                      ) : (
                        <p className="section_sub_heading">
                          {practice.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              <div className="course-summery-area p-0">
                <div className="row mb-lg-3">
                  <div className="col-lg-4">
                    <div className="item h-lg-100 p-3 mb-lg-0">
                      <div className="inner mb-2">
                        <div className="row">
                          <div className="col">
                            <h5 className="f-16 text-black">
                              Assessement Type
                            </h5>
                          </div>
                          <div className="col-auto ml-auto">
                            <span className="left_arrow_tag">
                              {/* {practice.testType | titlecase} */}
                              {practice.testType}
                            </span>
                          </div>
                        </div>
                      </div>
                      {practice.testType === "standard" && (
                        <div className="inner m-0">
                          <p className="f-13">
                            This assessment is in standard mode where questions
                            will come in a standard manner without difficulty
                            variation
                          </p>
                        </div>
                      )}
                      {practice.testType === "adaptive" && (
                        <div className="inner m-0">
                          <p>
                            In this assessment question difficulty will come
                            based on the responses provided by student{" "}
                          </p>
                        </div>
                      )}
                      {practice.testType === "random" && (
                        <div className="inner m-0">
                          <p>
                            In this assessment N number of question will come
                            from total question added in Assessment
                          </p>
                        </div>
                      )}

                      {practice.testType === "random" && (
                        <div className="inner m-0">
                          <p>
                            This is full-length Digital SAT. The first section
                            is static and based on the performance of first
                            section, second section quetions are created.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="item h-lg-100 p-3 mb-lg-0">
                      <div className="inner mb-2">
                        <div className="row">
                          <div className="col">
                            <h5 className="f-16 text-black">Marks</h5>
                          </div>
                          {practice && practice._id && (
                            <div className="col-auto ml-auto">
                              <div className="assess-tag-pro">
                                <span className="green left_arrow_tag tag-pro-remove">
                                  {totalMarks} Marks
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {practice?.testType === "section-adaptive" && (
                        <div className="inner m-0">
                          <p className="f-13">
                            The marks are based on the difficulty level of the
                            questions, and it increases (“Easy” is lowest and
                            “Hard” is highest). The composite score is
                            calculated based on overall marks.
                          </p>
                        </div>
                      )}
                      {practice?.testType !== "section-adaptive" && (
                        <div>
                          {practice && practice.questions && (
                            <div className="inner m-0">
                              {practice.isMarksLevel ? (
                                <p className="f-13">
                                  The positive marks are{" "}
                                  <b>+ {practice.plusMark} </b> while the
                                  negative marks are <b>{practice.minusMark}</b>{" "}
                                  for every question.
                                </p>
                              ) : (
                                <p className="f-13">
                                  Different questions have different marks.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="item h-lg-100 p-3 mb-lg-0">
                      <div className="inner mb-2">
                        <div className="row">
                          <div className="col">
                            <h5 className="f-16 text-black">Delivery Mode</h5>
                          </div>
                          <div className="col-auto ml-auto">
                            <span className="left_arrow_tag">
                              {/* {practice.testMode | titlecase} */}
                              {practice.testMode}
                            </span>
                          </div>
                          <br />
                        </div>
                      </div>
                      {practice.testMode == "proctored" && (
                        <div className="inner m-0">
                          <p className="f-13">
                            Proctored mode are timed exams that students take
                            while proctoring with restrictions
                          </p>
                        </div>
                      )}
                      {practice.testMode == "learning" && (
                        <div className="inner m-0">
                          <p className="f-13">
                            In Learning mode questions and answers come one by
                            one
                          </p>
                        </div>
                      )}
                      {practice.testMode == "practice" && (
                        <div className="inner m-0">
                          {practice.testType !== "section-adaptive" ? (
                            <p className="f-13">
                              In Practice mode are normal assessment where
                              solution come after attempting all the question.
                            </p>
                          ) : (
                            <p className="f-13">
                              This mode is meant for mock tests in which
                              students must finish all questions before he/she
                              can see the answers, marks, and detailed analysis.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  {((getClientData?.features?.course &&
                    (!user?.primaryInstitute ||
                      user?.primaryInstitute.preferences?.course?.isShow)) ||
                    (getClientData?.features?.testseries &&
                      (!user?.primaryInstitute ||
                        user?.primaryInstitute.preferences?.testSeries
                          ?.isShow))) && (
                    <div className="col-lg-4">
                      <div className="item h-lg-100 p-3 mb-lg-0">
                        <div className="inner mb-2">
                          <h5 className="f-16 text-black">
                            Course/Test Series Linked
                          </h5>
                          <br />
                        </div>
                        {practice &&
                          practice.courses &&
                          practice.courses?.length > 0 && (
                            <div className="inner m-0">
                              <div>
                                <img
                                  className="d-inline mr-1"
                                  src="/assets/images/bottom-tabs/course.svg"
                                  alt="buy-checkout"
                                />
                                {practice.courses.map(
                                  (course: any, index: number) => (
                                    <p
                                      key={index}
                                      className="d-inline f-13 cursor-pointer"
                                      onClick={() => viewCourse(course)}
                                    >
                                      {course.title}{" "}
                                      {index === practice?.courses?.length - 1
                                        ? ""
                                        : ","}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {practice &&
                          practice.testseries &&
                          practice?.testseries?.length > 0 && (
                            <div className="inner m-0 mt-2">
                              <div>
                                <img
                                  className="d-inline mr-1"
                                  src="/assets/images/bottom-tabs/testseries.svg"
                                  alt="buy-checkout"
                                />
                                {practice.testseries.map(
                                  (testseries: any, index: number) => (
                                    <p
                                      key={index}
                                      className="d-inline f-13 cursor-pointer"
                                      onClick={() => testseries(testseries)}
                                    >
                                      {testseries.title}{" "}
                                      {index ===
                                      practice?.testseries?.length - 1
                                        ? ""
                                        : ","}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {practice &&
                          ((!practice.courses && !practice.testseries) ||
                            (practice.courses &&
                              practice?.courses?.length === 0 &&
                              practice?.testseries &&
                              practice?.testseries?.length === 0)) && (
                            <div className="inner m-0">
                              <p> No course/test series linked</p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  {practice.userInfo && (
                    <div className="col-lg-4">
                      <div className="item h-lg-100 p-3 mb-lg-0">
                        <div className="inner mb-2">
                          <h5 className="f-16 text-black">Created By</h5>
                          <p className="m-0">
                            {practice?.owner?.name} (
                            {practice?.createdAt &&
                              moment(practice.createdAt).fromNow()}
                            )
                          </p>
                        </div>
                        {practice.lastModifiedBy &&
                          practice.lastModifiedBy?.name && (
                            <div>
                              <div className="inner mb-2">
                                <h5 className="f-16 text-black">Updated by</h5>
                              </div>

                              <div className="inner m-0">
                                <p>
                                  {practice?.lastModifiedBy?.name} (
                                  {practice.lastModifiedDate &&
                                    moment(practice.lastModifiedDate).fromNow()}
                                  )
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  {(practice.status !== "draft" ||
                    practice.startDate ||
                    practice.endDate) && (
                    <div className="col-lg-4">
                      <div className="item p-3 mb-lg-0">
                        {practice.status !== "draft" && (
                          <div className="inner">
                            <h5 className="f-16 text-black">Published Date</h5>
                            <p className="m-0">
                              {practice.statusChangedAt &&
                                moment(practice.statusChangedAt).format(
                                  "MMMM Do YYYY, h:mm:ss a"
                                )}
                            </p>
                          </div>
                        )}
                        {practice.startDate && (
                          <div className="row">
                            <div className="col-lg-6">
                              <p>Start Date</p>
                              <p className="m-0">
                                {moment(practice.startDate).format(
                                  "MMMM Do YYYY"
                                )}
                              </p>
                            </div>
                            <div className="col-lg-6">
                              <p>Time</p>
                              <p className="m-0">
                                {moment(practice.startDate).format("h:mm A")}
                              </p>
                            </div>
                          </div>
                        )}
                        {practice.endDate && (
                          <div className="row">
                            <div className="col-lg-6">
                              <p>End Date</p>
                              <p className="m-0">
                                {moment(practice.endDate).format(
                                  "MMMM Do YYYY"
                                )}
                              </p>
                            </div>
                            <div className="col-lg-6">
                              <p>Time</p>
                              <p className="m-0">
                                {moment(practice.endDate).format("h:mm A")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {practice.questions?.length > 0 &&
              practice.testType != "random" && (
                <div className="rounded-boxes bg-white course-summery-slider mt-3 mb-0">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Analytics</h3>
                  </div>
                  <div className="d-flex">
                    <div className="border rounded p-3 mr-4 mr-4">
                      <div className="item widget">
                        <PQuestionChart
                          practice={practice}
                          pieChartTitle="Question Distribution by Subject &  Unit"
                          summarySubject={summarySubject}
                        />
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <div className="item widget">
                        <h2 className="mb-0 describe-chart">
                          Question Distribution by Question Type
                        </h2>

                        <div className="content-chart-overflow">
                          <div
                            id="chart_by_category"
                            className="content-chart-overflow"
                          >
                            <Chart
                              series={questionByCategoryChartOptions.series}
                              options={questionByCategoryChartOptions.options}
                              type="donut"
                              height={300}
                              width={280}
                            />
                          </div>
                          {/* <apx-chart [series]="questionByCategoryChartOptions.series" [chart]="questionByCategoryChartOptions.chart" [plotOptions]="questionByCategoryChartOptions.plotOptions" [labels]="questionByCategoryChartOptions.labels"
                                    [fill]="questionByCategoryChartOptions.fill" [legend]="questionByCategoryChartOptions.legend" [responsive]="questionByCategoryChartOptions.responsive">
                                </apx-chart> */}
                        </div>

                        {questionDistributionByCategory?.map(
                          (data: any, i: number) => (
                            <div className="accordion" id="accordion" key={i}>
                              <div id={`dataOne_distributionbycategory_${i}`}>
                                {data?.questions?.length > 1 ? (
                                  <>
                                    <button
                                      className="btn border-0 p-0 dropdown-toggle w-100"
                                      onClick={() => setExpanded(!expanded)}
                                      aria-expanded={expanded}
                                      aria-controls={`collapsedata_distributionbycategory_${i}`}
                                    >
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                          <div
                                            className="inline_dot_circle"
                                            style={{
                                              background: data.color,
                                            }}
                                          />
                                          {/* <span className="text-left"></span> */}
                                          <small className="pl-2">
                                            {data.category}
                                          </small>
                                        </div>

                                        <div className="col-auto ml-auto">
                                          <div className="marks ml-auto">
                                            <span>{data.count}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                    <div
                                      id={`collapsedata_distributionbycategory_${i}`}
                                      className="collapse py-2"
                                      aria-labelledby="dataOne"
                                      data-parent="#accordion"
                                    >
                                      {data.questions.map(
                                        (q: any, index: number) => (
                                          <div className="row" key={index}>
                                            <div className="col">
                                              <div className="name">
                                                <span className="purple">
                                                  {q.category} ({q.marks}m)
                                                </span>
                                              </div>
                                            </div>

                                            <div className="col-auto">
                                              <div className="number ml-auto">
                                                <span className="pl-0">
                                                  {q.count}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <button className="btn border-0 shadow-none p-0 w-100">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="inline_dot_circle"
                                          style={{
                                            background: data.color,
                                          }}
                                        />
                                        {/* <span className="text-left"></span> */}
                                        <small className="pl-2 ">
                                          {data.category}
                                        </small>
                                      </div>

                                      <div className="col-auto ml-auto">
                                        <div className="marks ml-auto">
                                          <span>{data.count}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
      <Modal
        show={sendMailTemplate}
        onHide={() => setSendMailTemplate(false)}
        backdrop="static"
        keyboard={false}
      >
        <div>
          <div className="modal-header modal-header-bg justify-content-center">
            <h4 className="form-box_title">Mass Mail</h4>
          </div>
          <div className="modal-body text-black">
            <p className="mb-1">
              This mail will be sent to <b>{classroom?.studentsCount}</b>{" "}
              students{" "}
              {sendingMail && <i className="fa fa-spinner fa-pulse"></i>}
            </p>
            <form>
              <input
                style={{ border: "none" }}
                type="text"
                className="form-control border-bottom rounded-0"
                maxLength="250"
                value={massMail.subject}
                onChange={(e) => {
                  setMassMail({
                    ...massMail,
                    subject: e.target.value,
                  });
                }}
                placeholder="Subject for mail**"
                name="subject"
                required
              />

              <h6 className="mt-3">Add Message</h6>
              <textarea
                value={massMail.message}
                onChange={(e) => {
                  setMassMail({
                    ...massMail,
                    message: e.target.value,
                  });
                }}
                rows="5"
                name="message"
                placeholder="......"
                className="form-control mt-2 border rounded"
              />

              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-light mr-2"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline mr-2 px-3"
                  onClick={testMassMail}
                  disabled={
                    !massMail.subject || !massMail.message || sendingMail
                  }
                >
                  Test
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-3"
                  onClick={sendMassMail}
                  disabled={
                    !massMail.subject || !massMail.message || sendingMail
                  }
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SummaryComponent;
