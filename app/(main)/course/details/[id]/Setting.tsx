import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import Editor from "@/public/assets/ckeditor/build/ckeditor";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import MathJax from "@/components/assessment/mathjax";
import {
  CourseStatusType,
  IDropdownSettings,
  SubjectEntry,
} from "@/interfaces/interface";
import { getMine, getTeachersBySubjects } from "@/services/subjectService";
import {
  getAllInstitutes,
  getClassRoomByLocation,
} from "@/services/classroomService";
import * as authService from "@/services/auth";
import * as programSvc from "@/services/programService";
import { update, Delete, withdraw, copy } from "@/services/courseService";
import { getReportData } from "@/services/adminService";
import { success, alert, confirm } from "alertifyjs";
import Multiselect from "multiselect-react-dropdown";
import { Modal } from "react-bootstrap";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { FileUploader } from "react-drag-drop-files";
import PriceEditorComponent from "@/components/PriceEditor";
import DatePicker from "react-datepicker";
import { WithContext as ReactTags } from "react-tag-input";
import "react-datepicker/dist/react-datepicker.css";

const styleForMultiSelect = {
  multiselectContainer: {},
  searchBox: {
    fontSize: "10px",
    minHeight: "50px",
  },
  inputField: {
    margin: 5,
  },
  option: {
    color: "black",
    height: 30,
    padding: "3px 5px",
    margin: 0,
    borderRadius: 5,
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
  },
};
const fileTypes = ["JPEG", "PNG", "GIF", "JPG"];

const SettingsComponent = ({
  pageLoaded,
  setPageLoaded,
  course,
  setCourse,
  user,
  settings,
  updatedCourse,
}: any) => {
  const router = useRouter();
  const suggestions = [
    { id: "asdas", text: "test" },
    { id: "asdasdasdasdas", text: "testasd" },
  ];
  const [classrooms, setClassRooms] = useState<any>([]);
  const [userClasses, setUserClasses] = useState<any>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<any>([]);
  const [instructors, setInstructors] = useState<any>([]);
  const [disableAccess, setDisableAccess] = useState<boolean>(false);
  const [searchInst, setSearchInst] = useState<string>("");
  const [searchClass, setSearchClass] = useState<string>("");
  const [allInstructors, setAllInstructors] = useState<any>([]);
  const [allReviewers, setAllReviewers] = useState<any>([]);
  const [allTeachers, setAllTeachers] = useState<any>([]);
  const [notificationMsg, setNotificationMsg] = useState<string>("");
  const [userSubjects, setUserSubjects] = useState<any>([]);
  const [userPrograms, setUserPrograms] = useState<any>([]);
  const [institutes, setInstitutes] = useState<any>([]);
  const [locations, setLocations] = useState<any>([]);
  const [loadedClassrooms, setLoadedClassrooms] = useState<any>({});
  const [otherInstituteClassrooms, setOtherInstituteClassrooms] = useState<any>(
    []
  );
  const [copying, setCopying] = useState<boolean>(false);
  const [codeLanguages, setCodeLanguages] = useState<any>([]);
  const [allLangs, setAllLangs] = useState<any>([]);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [minDate, setMinDate] = useState<any>(moment.min().toDate());
  const [selectedSubjects, setSelectedSubjects] = useState<any>([]);
  const unitsDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    textField: "name",
    idField: "_id",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 5,
    allowSearchFilter: true,
    enableCheckAll: true,
  };
  const [notificationModal, setNotificationModal] = useState<boolean>(false);
  const [copyCourseModal, setCopyCourseModal] = useState<boolean>(false);
  const [languageModal, setLanguageModal] = useState<boolean>(false);
  const [copyCourseFormData, setCopyCourseFormData] = useState({
    title: "",
  });
  const [copyCourseFormErrors, setCopyCourseFormErrors] = useState({
    title: "",
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [fileUploadStatus, setFileUploadStatus] = useState<boolean>(false);
  const [file, setFile] = useState("");
  const [classroomSuggestions, setClassroomSuggestions] = useState<any>([]);
  const [classroomTag, setClassroomTag] = useState<any>([]);
  const [instituteSuggestions, setInstituteSuggestions] = useState<any>([]);
  const [instituteTag, setInstituteTag] = useState<any>([]);
  const [reviewerSuggestions, setReviewerSuggestions] = useState<any>([]);
  const [reviewerTag, setReviewerTag] = useState<any>([]);
  const [instructorSuggestions, setInstructorSuggestions] = useState<any>([]);
  const [instructorTag, setInstructorTag] = useState<any>([]);
  const [insDropdownShow, setInsDropdownShow] = useState<boolean>(false);
  const [clsDropdownShow, setClsDropdownShow] = useState<boolean>(false);
  const [revDropdownShow, setRevDropdownShow] = useState<boolean>(false);
  const [instDropdownShow, setInstDropdownShow] = useState<boolean>(false);

  const ckeOptions = {
    placeholder: "Write Description",
    simpleUpload: {
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  };

  const ckeRequireOptions = {
    placeholder: "Write Requirements",
    simpleUpload: {
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  };

  const sortByName = (array: any) => {
    array.sort((a, b) => a.name.localeCompare(b.name));
  };

  useEffect(() => {
    programSvc.getMine({ subject: true }).then((programs: any[]) => {
      sortByName(programs);
      setUserPrograms(programs);

      const tmp = [];
      for (const pro of programs) {
        for (const s of pro.subjects) {
          if (!tmp.find((ss) => ss._id == s._id)) {
            tmp.push(s);
          }
        }
      }
      sortByName(tmp);
      setUserSubjects(tmp);

      // set programs base on subjects
      let update_course = course;
      if (!course.programs?.length) {
        update_course.programs = [];

        for (const pro of programs) {
          if (
            pro.subjects.find((ps) =>
              update_course.subjects.find((ss) => ss._id == ps._id)
            )
          ) {
            update_course.programs.push({
              _id: pro._id,
              name: pro.name,
            });
          }
        }
        setCourse(update_course);
      }
    });
    const codeLanguagesData = getCodeLanguages();
    setAllLangs(codeLanguagesData);
    const fetchData = async () => {
      const subjectsData = await getMine();
      const userSubjectsData = subjectsData.map((item: SubjectEntry) => {
        return {
          _id: item._id,
          name: item.name,
        };
      });
      setUserSubjects(userSubjectsData);
      setSelectedSubjects(renameObjectKey(course.subjects, "_id", "id"));
    };
    fetchData();

    setCountries((prev: any) => (course.countries ? course.countries : prev));
    setLocations((prev: any) => (course.locations ? course.locations : prev));
    if (!course.requirements) {
      setCourse({ ...course, requirements: "" });
    }
    if (!course.includes) {
      setCourse({ ...course, includes: "" });
    }
    if (!course.learningIncludes) {
      setCourse({ ...course, learningIncludes: "" });
    }
    if (!course.description) {
      setCourse({ ...course, description: "" });
    }
    if (!course.imageUrl) {
      setCourse({ ...course, imageUrl: "/assets/images/defaultCourses.png" });
    }

    if (!course.startDate) {
      setMinDate(new Date());
    } else if (course.startDate < new Date()) {
      setMinDate(new Date(course.startDate));
    }

    // getAllInstitutesFuc();
    getAllInstitutes().then((res) => {
      setInstitutes(res);
    });

    getClassRoomByLocationFuc();
    getTeachersBySubjectsFuc();

    if (course.enabledCodeLang) {
      course.enabledCodeLang.forEach((c: any) => {
        for (const code of codeLanguagesData) {
          if (code.language === c) {
            code.checked = true;
            break;
          }
        }
      });
    }
    setCodeLanguages(codeLanguagesData);
  }, []);

  console.log(institutes, "insti");

  // const getAllInstitutesFuc = async () => {
  //   getAllInstitutes()
  //     .then((res) => {
  //       const instituteSuggestionsData: any = [];
  //       res?.map((ins: any, i: number) => {
  //         const data: any = [];

  //         data.id = ins._id;
  //         data.text = ins.name;
  //         instituteSuggestionsData.push(data);
  //       });
  //       setInstitutes(instituteSuggestionsData);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  const getClassRoomByLocationFuc = async () => {
    getClassRoomByLocation(
      course.locations.map((i: any) => i._id),
      {
        select: "name location updatedAt",
      }
    ).then((res) => {
      if (user.role != "publisher") {
        setOtherInstituteClassrooms(
          res
            .filter(
              (c: any) =>
                c.location != user.activeLocation &&
                course.classrooms.find((pc: any) => pc._id == c._id)
            )
            .map((c: any) => c._id)
        );
        res = res.filter((l: any) => l.location == user.activeLocation);
      }

      res.sort((c1: any, c2: any) => {
        return c2.updatedAt - c1.updatedAt;
      });

      setClassRooms(res);

      const cls: any = [];
      res.forEach((e: any) => {
        course.classrooms.forEach((l: any) => {
          if (l._id === e._id) {
            cls.push(e);
          }
        });
      });
      setSelectedClassrooms(cls);
      const secls: any = [];
      cls.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        secls.push(data);
      });
      setClassroomTag(secls);

      let loadedRoomData = loadedClassrooms;
      for (const r of res) {
        if (!loadedRoomData[r.location]) {
          loadedRoomData[r.location] = [];
        }
        loadedRoomData[r.location].push(r);
      }
      setLoadedClassrooms(loadedRoomData);

      let classroomSuggestionsData: any = [];
      res?.map((cls: any, i: number) => {
        const data: any = [];

        data.id = cls._id;
        data.text = cls.name;
        classroomSuggestionsData.push(data);
      });
      secls.map(
        (item: any) =>
          (classroomSuggestionsData = classroomSuggestionsData.filter(
            (cls: any) => cls.id !== item.id
          ))
      );
      setClassroomSuggestions(classroomSuggestionsData);
    });
  };

  const getTeachersBySubjectsFuc = async () => {
    await getTeachersBySubjects({ isVerified: true })
      .then((res: any) => {
        setInstructors(res);
        const allTeachersData = res.filter((d: any) => {
          if (!d || !course.user) {
            return false;
          }
          return d._id != course.user._id;
        });
        setAllTeachers(allTeachersData);

        resetInstructorAndReviewer(allTeachersData);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const resetInstructorAndReviewer = (teacherData?: any) => {
    const institutesData: any = [];
    if (course.locations) {
      course.locations.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        institutesData.push(data);
      });
      setInstituteTag(institutesData);
    }

    const reviewerData: any = [];
    if (course.reviewers) {
      course.reviewers.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        reviewerData.push(data);
      });
      setReviewerTag(reviewerData);
    }

    const instructorData: any = [];
    if (course.instructors) {
      course.instructors.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        instructorData.push(data);
      });
      setInstructorTag(instructorData);
    }
    setTimeout(() => {
      const allReviewersData = course.instructors
        ? teacherData.filter(
            (t: any) => !course.instructors.find((ts: any) => ts._id == t._id)
          )
        : teacherData;
      let reviewerSuggestionsData: any = [];
      allReviewersData?.map((rev: any, i: number) => {
        const data: any = [];
        data.id = rev._id;
        data.text = rev.name;
        reviewerSuggestionsData.push(data);
      });
      reviewerData.map((rev: any) => {
        reviewerSuggestionsData = reviewerSuggestionsData.filter(
          (item: any) => item.id !== rev.id
        );
      });
      setReviewerSuggestions(reviewerSuggestionsData);
      setAllReviewers(allReviewersData);

      const allInstructorsData = course.reviewers
        ? teacherData.filter(
            (t: any) => !course.reviewers.find((ts: any) => ts._id == t._id)
          )
        : teacherData;
      let instructorSuggestionsData: any = [];
      allInstructorsData?.map((ins: any, i: number) => {
        const data: any = [];
        data.id = ins._id;
        data.text = ins.name;
        instructorSuggestionsData.push(data);
      });
      instructorData.map((rev: any) => {
        instructorSuggestionsData = instructorSuggestionsData.filter(
          (item: any) => item.id !== rev.id
        );
      });
      setInstructorSuggestions(instructorSuggestionsData);
      setAllInstructors(allInstructorsData);
    }, 100);
    setPageLoaded(true);
  };

  const cancel = () => {
    setNotificationModal(false);
    setCopyCourseModal(false);
    setLanguageModal(false);
  };

  const openLanguageModal = () => {
    let allLangsData = allLangs;
    for (const lang of allLangsData) {
      lang.checked = !!codeLanguages.find(
        (cl: any) => cl.language == lang.language && cl.checked
      );
    }
    setAllLangs(allLangsData);
    setLanguageModal(true);
  };

  const getSelectedClassrooms = () => {
    if (user.role != "publisher") {
      return selectedClassrooms
        .map(({ _id }: { _id: string }) => _id)
        .concat(otherInstituteClassrooms);
    } else {
      return selectedClassrooms.map(({ _id }: { _id: string }) => _id);
    }
  };

  const saveChange = (settingForm?: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    let courseData = course;
    if (!courseData.title) {
      alert("Alert", "Please add the name first");
      return;
    }

    if (
      courseData.startDate &&
      courseData.expiresOn &&
      courseData.expiresOn.getTime() < courseData.startDate.getTime() + 86400000
    ) {
      alert(
        "Alert",
        "Please set the expiration date after one day of start date"
      );
      return;
    }
    if (!courseData.subjects.length) {
      alert("Alert", "Please don't remove all subjects");
      return;
    }

    if (!courseData.videoUrl) {
      alert("Alert", "Please input course video url.");
      return;
    }

    courseData.enabledCodeLang = codeLanguages
      .filter((c: any) => c.checked)
      .map((c: any) => c.language);

    const crs: any = {
      course: {
        ...course,
        locations: locations ? locations.map((e: any) => e._id) : [],
        classrooms: getSelectedClassrooms(),
      },
      full: true,
    };
    console.log(crs, "crs");
    delete crs.course.sections;

    setPageLoaded(false);

    update(courseData._id, crs).then(
      (res: any) => {
        courseData.locations = locations ? locations : [];
        courseData.classrooms = selectedClassrooms ? selectedClassrooms : [];

        success("Your changes are saved");
        setPageLoaded(true);
      },
      (err) => {
        console.log(err);
        setPageLoaded(true);
        alert("Alert", "Fail to update course.");
      }
    );
    setCourse(courseData);
  };

  const publish = (settingForm?: any) => {
    let courseData = course;
    if (!courseData.sections || !courseData.sections.length) {
      alert(
        "Alert",
        "Please add sections in course curriculum before publishing the course"
      );
      return;
    }

    if (!courseData.title) {
      alert("Alert", "Please add the name first");
      return;
    }
    if (!courseData.startDate) {
      alert("Alert", "Please add start date");
      return;
    }

    if (!courseData.sections.find((sec: any) => sec.status == "published")) {
      alert("Alert", "Please publish at least one section!!");
      return;
    }

    if (courseData.accessMode === "buy" && !courseData.countries.length) {
      alert("Alert", "Please set at least one currency.");
      return;
    }

    if (
      courseData.accessMode === "invitation" &&
      locations &&
      locations.length == 0
    ) {
      alert("Alert", "Please add institute also");
      return;
    }

    if (
      user.role != "publisher" &&
      courseData.accessMode === "invitation" &&
      selectedClassrooms &&
      selectedClassrooms.length == 0
    ) {
      alert("Alert", "Please add classroom also");
      return;
    }

    if (
      courseData.expiresOn &&
      courseData.expiresOn.getTime() < courseData.startDate.getTime() + 86400000
    ) {
      alert(
        "Alert",
        "Please set the expiration date after one day of start date"
      );
      return;
    }
    if (!courseData.subjects.length) {
      alert("Alert", "Please don't remove all subjects");
      return;
    }

    if (settingForm.controls.videoUrl?.errors?.pattern) {
      alert("Alert", "Please fix course video url.");
      return;
    }

    courseData.enabledCodeLang = codeLanguages
      .filter((c: any) => c.checked)
      .map((c: any) => c.language);

    const crs = {
      course: {
        ...course,
        status: "published",
        classrooms: getSelectedClassrooms(),
      },
      full: true,
    };

    delete crs.course.sections;

    confirm("Are you sure you want to publish course?", async (data: any) => {
      setPageLoaded(false);
      await update(course._id, crs).then(
        (e: any) => {
          setCourse({
            ...course,
            status: "published",
            classrooms: [...selectedClassrooms],
            locations: [...locations],
          });

          updatedCourse("published");
          success("Course is published successfully");
        },
        (res: any) => {
          if (res.error && res.error.message) {
            alert("Alert", "Fail to publish course", res.error.message);
          } else [alert("Alert", "Fail to publish course")];
        }
      );
      setPageLoaded(true);
    });
  };

  const deleteCourse = async () => {
    confirm("Are you sure you want to delete this course?", (data: any) => {
      Delete(course._id)
        .then((res: any) => {
          router.push(`/course`);
          success("Course is deleted successfully");
        })
        .catch((err: any) => {
          alert(
            "Alert",
            "You are not allowed to delete this course. Only Director and creator of this course can delete it."
          );
        });
    });
  };

  const withdrawCourse = async () => {
    withdraw(course._id, {
      notificationMsg: notificationMsg,
      disableAccess: disableAccess,
    })
      .then((d: any) => {
        setCourse({
          ...course,
          status: CourseStatusType.REVOKED,
        });
        updatedCourse(CourseStatusType.REVOKED);
        success("Withdrawn Successfully");
        cancel();
      })
      .catch((err: any) => {
        alert("Alert", "Unable to withdraw the course");
      });
  };

  const onRemoveSubjects = (ev: any) => {
    if (!course.subjects.length) {
      alert("Alert", "Course need to have at least one subject.");
      setCourse({
        ...course,
        subjects: [ev],
      });
    }
  };

  const addLocation = async (ev: any) => {
    setLocations(ev);
    let loadedClassroomsData = loadedClassrooms;
    const lastId = ev[ev.length - 1];
    if (!loadedClassrooms[lastId]) {
      const classes = await getClassRoomByLocation([ev._id]);
      loadedClassroomsData[lastId] = classes;
      setLoadedClassrooms(loadedClassroomsData);
    }

    let classrooms: any = [];

    for (const loc of locations) {
      if (loadedClassroomsData[loc._id]) {
        classrooms = classrooms.concat(loadedClassroomsData[loc._id]);
      }
    }

    setClassRooms(classrooms);
  };

  const removeLocations = (ev: any) => {
    setLocations(ev);
    let classrooms: any = [];

    for (const loc of ev) {
      if (loadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(loadedClassrooms[loc._id]);
      }
    }

    setClassRooms(classrooms);

    const newClassrooms = [];
    for (const room of selectedClassrooms) {
      if (room.location != ev._id) {
        newClassrooms.push(room);
      }
    }
    setSelectedClassrooms(newClassrooms);
  };

  const onAllowAllLocChanged = (e) => {
    setCourse({
      ...course,
      allowAllLocations: e.target.checked,
    });
    setLocations([]);
  };

  const onTeacherAdded = (label: string, ev: any) => {
    console.log(ev);
    ev._id = ev.id;
    delete ev.id;
    console.log(ev);

    // resetInstructorAndReviewer(label, ev);
  };

  const copyCourse = async (fm: any) => {
    setCopying(true);
    copy(course._id, { title: fm.value.title })
      .then((newC: any) => {
        success("New Course is created");
        cancel();
        router.push(`/course/details/`, newC._id);
      })
      .catch((err: any) => {
        if (err.error?.message) {
          alert("Alert", err.error.message);
        } else {
          alert("Alert", "Fail to copy course");
        }
      });
    setCopying(false);
  };

  const selectLanguages = () => {
    setCodeLanguages((prev: any) => {
      for (const lang of prev) {
        lang.checked = !!allLangs.find(
          (ml: any) => ml.language == lang.language && ml.checked
        );
      }
      return prev;
    });
    setLanguageModal(false);
  };

  const languageCheckedFunction = (value: boolean, id: number) => {
    setAllLangs((prev: any) => {
      const newArray = [...prev];
      newArray[id] = { ...newArray[id], checked: value };
      return newArray;
    });
  };

  const removeCodeLanguages = (id: number) => {
    setCodeLanguages((prev: any) => {
      const newArray = [...prev];
      newArray[id] = { ...newArray[id], checked: false };
      return newArray;
    });
  };

  const aiReviewDetails = async () => {
    if (!course.summary) {
      alert(
        "Alert",
        "Please enter course summary and save it before reviewing details."
      );
      return;
    }
    confirm(
      "This will update (& overwrite) existing content. Do you want to proceed?",
      () => {
        setReviewing(true);
        getReportData("openai_review_course_details", {
          course: course._id,
          location: user.activeLocation,
        })
          .then((res: any) => {
            setCourse({
              ...course,
              description: res.data["Description"],
              summary: res.data["Course Summary"],
              includes: res.data["Course Includes"],
              learningIncludes: res.data["Learning Includes"],
              requirements: res.data["Requirements"],
            });
            console.log(res, "res");

            success("Course details is updated");
          })
          .catch((err: any) => {
            alert("Alert", "Fail to review course detail");
            console.log(err);
          });
        setReviewing(false);
      }
    );
  };

  const getCodeLanguages = (): any[] => {
    return [
      {
        display: "C",
        language: "c",
      },
      {
        display: "C++",
        language: "cpp",
      },
      {
        display: "Java",
        language: "java",
      },
      {
        display: "Python",
        language: "python",
      },
      {
        display: "Ruby",
        language: "ruby",
      },
      {
        display: "Javascript",
        language: "javascript",
      },
    ];
  };

  const copyCourseHandleInputChange = (e: any) => {
    const { name, value } = e.target;
    setCopyCourseFormData({ ...copyCourseFormData, [name]: value });
  };

  const copyCourseHandleSubmit = (e: any) => {
    e.preventDefault();
    // Perform form validation
    const errors = { title: "" };
    if (!copyCourseFormData.title) {
      errors.title = "Name is required";
    } else if (copyCourseFormData.title.length < 2) {
      errors.title = "Name must be greater than 2 characters";
    } else if (copyCourseFormData.title.length > 200) {
      errors.title = "Name must be smaller than 200 characters";
    }
    setCopyCourseFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Form is valid, proceed with form submission
      setCopying(true);
      // Call your copyCourse function here with formData as argument
      // For example: copyCourse(formData).then(() => setCopying(false));
    }
  };

  const generateSubjectObjects = (subjects: any) => {
    const subjectObj = renameObjectKey(subjects, "_id", "id");
    return subjectObj;
  };

  const renameObjectKey = (data: any, oldKey: string, newKey: string) => {
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      let subject = data[i];
      if (oldKey === newKey) return;
      if (!subject[oldKey]) return;
      if (subject[newKey] !== undefined) return;
      subject = { ...subject, [newKey]: subject[oldKey] };
      delete subject[oldKey];
      newData.push({ ...subject });
    }
    return newData;
  };

  const countriesChange = (newCountries: any) => {
    setCourse({
      ...course,
      countries: newCountries,
    });
  };

  const handleFileChange = (file: File) => {
    console.log(file);
    setFile(URL.createObjectURL(file));
    setFileUploadStatus(true);
  };

  const handleInstituteDelete = (i: any) => {
    let classrooms: any = [];

    for (const loc of instituteTag) {
      if (loadedClassrooms[loc.id]) {
        classrooms = classrooms.concat(loadedClassrooms[loc.id]);
      }
    }

    setClassRooms(classrooms);

    const newClassrooms = [];
    for (const room of selectedClassrooms) {
      if (room.location != instituteTag[i].id) {
        newClassrooms.push(room);
      }
    }
    setSelectedClassrooms(newClassrooms);

    setInstituteTag(instituteTag.filter((ins: any, index: any) => index !== i));
    setInstituteSuggestions([...instituteSuggestions, instituteTag[i]]);

    setLocations(
      locations.filter((los: any) => los._id !== instituteTag[i].id)
    );
  };

  const handleInstituteAddition = async (ins: any) => {
    setInstituteTag([...instituteTag, ins]);

    setInstituteSuggestions(
      instituteSuggestions.filter(
        (item: any, index: number) => item.id !== ins.id
      )
    );

    const locationsData = locations || [];
    locationsData.push(institutes.find((item: any) => item._id === ins.id));
    let loadedClassroomsData = loadedClassrooms;
    if (!loadedClassroomsData[ins._id]) {
      const classes = await getClassRoomByLocation([ins._id]);
      loadedClassroomsData[ins._id] = classes;
      setLoadedClassrooms(loadedClassroomsData);
    }

    let classrooms: any = [];

    for (const loc of locationsData) {
      if (loadedClassroomsData[loc._id]) {
        classrooms = classrooms.concat(loadedClassroomsData[loc._id]);
      }
    }

    setClassRooms(classrooms);
    setLocations(locationsData);
    setInstDropdownShow(false);
  };

  const handleClassroomDelete = (i: any) => {
    setClassroomTag(
      classroomTag.filter((cls: any, index: number) => index !== i)
    );
    setClassroomSuggestions([...classroomSuggestions, classroomTag[i]]);
    setSelectedClassrooms(
      selectedClassrooms.filter((cls: any) => cls._id !== classroomTag[i]._id)
    );
  };

  const handleClassroomAddition = (cls: any) => {
    setClassroomTag([...classroomTag, cls]);
    setClassroomSuggestions(
      classroomSuggestions.filter(
        (item: any, index: number) => item.id !== cls.id
      )
    );
    setSelectedClassrooms([
      ...selectedClassrooms,
      classrooms.find((item: any) => item._id === cls.id),
    ]);
    setClsDropdownShow(false);
  };

  const handleReviewerDelete = (i: any) => {
    const reviewerData = course.reviewers?.filter(
      (item: any) => item._id !== reviewerTag[i].id
    );
    setCourse({
      ...course,
      reviewers: reviewerData,
    });
    setReviewerTag(reviewerTag.filter((rev: any, index: any) => index !== i));
    setReviewerSuggestions([...reviewerSuggestions, reviewerTag[i]]);
    setInstructorSuggestions([...instructorSuggestions, reviewerTag[i]]);
    resetReviewer(reviewerData);
  };

  const handleReviewerAddition = (rev: any) => {
    const reviewerData = course.reviewers || [];
    reviewerData.push(allReviewers?.find((item: any) => item._id !== rev.id));
    setCourse({
      ...course,
      reviewers: reviewerData,
    });
    setReviewerTag([...reviewerTag, rev]);
    setReviewerSuggestions(
      reviewerSuggestions.filter(
        (item: any, index: number) => item.id !== rev.id
      )
    );
    setInstructorSuggestions(
      instructorSuggestions.filter(
        (item: any, index: number) => item.id !== rev.id
      )
    );
    resetReviewer(reviewerData);
    setRevDropdownShow(false);
  };

  const handleInstructorDelete = (i: number) => {
    const instructorData = course.instructors?.filter(
      (item: any) => item._id !== instructorTag[i].id
    );
    setCourse({
      ...course,
      instructors: instructorData,
    });
    setInstructorTag(
      instructorTag.filter((cls: any, index: any) => index !== i)
    );
    setReviewerSuggestions([...reviewerSuggestions, instructorTag[i]]);
    setInstructorSuggestions([...instructorSuggestions, instructorTag[i]]);
    resetInstructor(allInstructors);
  };

  const handleInstructorAddition = (inst: any) => {
    const instructorData = course.instructors || [];
    instructorData.push(
      allInstructors?.find((item: any) => item._id !== inst.id)
    );
    setCourse({
      ...course,
      instructors: instructorData,
    });
    setInstructorTag([...instructorTag, inst]);
    setReviewerSuggestions(
      reviewerSuggestions.filter(
        (item: any, index: number) => item.id !== inst.id
      )
    );
    setInstructorSuggestions(
      instructorSuggestions.filter(
        (item: any, index: number) => item.id !== inst.id
      )
    );
    resetInstructor(instructorData);
    setInsDropdownShow(false);
  };

  const resetInstructor = (data: any) => {
    const teacherData = allTeachers;
    setTimeout(() => {
      const allInstructorsData = data
        ? teacherData.filter(
            (t: any) => !data.find((ts: any) => ts._id == t._id)
          )
        : teacherData;
      setAllInstructors(allInstructorsData);
    }, 100);
  };

  const resetReviewer = (data: any) => {
    const teacherData = allTeachers;
    setTimeout(() => {
      const allReviewersData = data
        ? teacherData.filter(
            (t: any) => !data.find((ts: any) => ts._id == t._id)
          )
        : teacherData;
      setAllReviewers(allReviewersData);
    }, 100);
  };

  const handleAddSubjects = (list: any, selectedItem: any) => {
    setSelectedSubjects(list);
    const oldData = course.subjects || [];
    oldData.push(
      userSubjects.find((item: any) => item._id === selectedItem.id)
    );
    setCourse({
      ...course,
      subjects: oldData,
    });
  };

  const handleDeleteSubjects = (list: any, removedItem: any) => {
    if (course.subjects.length === 1) {
      alert("Alert", "Course need to have at least one subject.");
      return false;
    }
    setSelectedSubjects(list);
    const oldData = course.subjects || [];
    setCourse({
      ...course,
      subjects: oldData.filter((item: any) => item._id !== removedItem.id),
    });
  };

  return (
    <>
      <form className="course-setting-area">
        {/* start course-setting-area */}
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Course Name</h4>
              <input
                type="text"
                name="txtTitle"
                placeholder="Name"
                value={course.title}
                onChange={(e: any) => {
                  setCourse({
                    ...course,
                    title: e.target.value,
                  });
                }}
                maxLength={200}
                id="name"
                className="form-control border-bottom rounded-0 m-0"
              />
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle">Course Name</h4>
              <p>{course.title}</p>
            </div>
          )}
        </div>
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Summary</h4>
              <input
                type="text"
                name="txtSummary"
                placeholder="Summary"
                value={course.summary || ""}
                onChange={(e) => {
                  setCourse({
                    ...course,
                    summary: e.target.value,
                  });
                }}
                id="summary"
                maxLength={1000}
                className="form-control border-bottom rounded-0 m-0"
              />
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle">Summary</h4>
              <p>{course.summary}</p>
            </div>
          )}
        </div>
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status === "draft" ? (
            <div>
              <h4 className="form-box_subtitle">Programs</h4>
              <div className="mt-2">
                <Multiselect
                  options={userPrograms}
                  selectedValues={course.programs}
                  onSelect={(item) => {
                    setCourse({
                      ...course,
                      programs: item,
                    });
                  }}
                  onRemove={(item) => {
                    setCourse({
                      ...course,
                      programs: item,
                    });
                  }}
                  displayValue="name"
                  placeholder="Select Programs"
                  style={styleForMultiSelect}
                  showArrow
                  closeIcon="cancel"
                  avoidHighlightFirstOption={true}
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle ">Subjects</h4>
              <div className="mt-2">
                {course.programs.map((item: any, index: number) => (
                  <span key={index} className="text-dark">
                    {item.name}
                    {index === course.programs.length - 1 ? "" : ","}{" "}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status === "draft" ? (
            <div>
              <h4 className="form-box_subtitle">Subjects</h4>
              <div className="mt-2">
                <Multiselect
                  options={generateSubjectObjects(userSubjects)}
                  selectedValues={selectedSubjects}
                  onSelect={handleAddSubjects}
                  onRemove={handleDeleteSubjects}
                  displayValue="name"
                  placeholder="Select subjects"
                  style={styleForMultiSelect}
                  showArrow
                  closeIcon="cancel"
                  avoidHighlightFirstOption={true}
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle ">Subjects</h4>
              <div className="mt-2">
                {course.subjects.map((item: any, index: number) => (
                  <span key={index} className="text-dark">
                    {item.name}
                    {index === course.subjects.length - 1 ? "" : ","}{" "}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Description</h4>
              <div className="mt-2 course-ck">
                <CKEditorCustomized
                  defaultValue={course.description || ""}
                  onChangeCon={(data: any) => {
                    setCourse({
                      ...course,
                      description: data,
                    });
                  }}
                  config={ckeOptions}
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle">Description</h4>
              <MathJax
                value={course.description}
                className="max-with-image word-break-w"
              />
            </div>
          )}
        </div>
        <div className="rounded-boxes form-boxes bg-white ">
          {course.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Learning Includes</h4>
              <div className="mt-2 course-ck">
                <CKEditorCustomized
                  defaultValue={course.learningIncludes || ""}
                  onChangeCon={(data: any) => {
                    setCourse({
                      ...course,
                      learningIncludes: data,
                    });
                  }}
                  config={ckeOptions}
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle">Learning Includes</h4>
              <MathJax
                value={course.learningIncludes}
                className="max-with-image word-break-w"
              />
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              {course.status !== "revoked" ? (
                <div>
                  <h4 className="form-box_subtitle">Requirements</h4>
                  <div className="mt-2 course-ck">
                    <CKEditorCustomized
                      defaultValue={course.requirements || ""}
                      onChangeCon={(data: any) => {
                        setCourse({
                          ...course,
                          requirements: data,
                        });
                      }}
                      config={ckeRequireOptions}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="form-box_subtitle">Requirements</h4>
                  <MathJax
                    value={course.requirements}
                    className="max-with-image word-break-w"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              {course.status !== "revoked" ? (
                <div>
                  <h4 className="form-box_subtitle">Course Includes</h4>
                  <div className="mt-2 course-ck">
                    <CKEditorCustomized
                      defaultValue={course.includes || ""}
                      onChangeCon={(data: any) => {
                        setCourse({
                          ...course,
                          includes: data,
                        });
                      }}
                      config={ckeOptions}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="form-box_subtitle">Course Includes</h4>
                  <MathJax
                    value={course.includes}
                    className="max-with-image word-break-w"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              <h4 className="form-box_subtitle">Level</h4>
              {course.status === "draft" && (
                <div className="form-row mt-2">
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="school"
                          disabled={course.status === "published"}
                          name="level"
                          checked={course.level === "school"}
                          onChange={(e) =>
                            setCourse({ ...course, level: e.target.value })
                          }
                          id="school"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="school"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">School</div>
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="bachelors"
                          disabled={course.status === "published"}
                          name="level"
                          checked={course.level === "bachelors"}
                          onChange={(e) =>
                            setCourse({ ...course, level: e.target.value })
                          }
                          id="bachelor"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="bachelor"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Bachelor</div>
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="masters"
                          disabled={course.status === "published"}
                          name="level"
                          checked={course.level === "masters"}
                          onChange={(e) =>
                            setCourse({ ...course, level: e.target.value })
                          }
                          id="master"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="master"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Master</div>
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="open"
                          disabled={course.status === "published"}
                          name="level"
                          checked={course.level === "open"}
                          onChange={(e) =>
                            setCourse({ ...course, level: e.target.value })
                          }
                          id="open"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="open"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Open</div>
                  </div>
                </div>
              )}
              {course.status !== "draft" && (
                <div className="padding_match_form_control">{course.level}</div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              <h4 className="form-box_subtitle">Type</h4>
              {course.status === "draft" && (
                <div className="form-row mt-2">
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="semester"
                          disabled={course.status === "published"}
                          name="type"
                          checked={course.type === "semester"}
                          onChange={(e) =>
                            setCourse({ ...course, type: e.target.value })
                          }
                          id="semester"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="semester"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Semester</div>
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="other"
                          disabled={course.status === "published"}
                          name="type"
                          checked={course.type === "other"}
                          onChange={(e) =>
                            setCourse({ ...course, type: e.target.value })
                          }
                          id="other"
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="other"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Other</div>
                  </div>
                </div>
              )}
              {course.status !== "draft" && (
                <div className="padding_match_form_control">{course.type}</div>
              )}

              {course.type === "semester" && course.status === "draft" && (
                <div className="mt-3 pb-2 border-bottom-color-1">
                  <input
                    type="text"
                    name="txtCredits"
                    placeholder="Earn credits for the course"
                    value={course.credits}
                    onChange={(e: any) => {
                      setCourse({ ...course, credits: e.target.value });
                    }}
                  />
                </div>
              )}

              {course.status === "semester" && course.type !== "other" && (
                <span>Credits - {course.credits}</span>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              <h4 className="form-box_subtitle">Access Mode</h4>
              {course.status === "draft" &&
                course.user._id === course.owner._id && (
                  <div className="form-row mt-2">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio">
                          <input
                            type="radio"
                            value="public"
                            name="access"
                            id="public"
                            checked={course.accessMode === "public"}
                            onChange={(e) =>
                              setCourse({
                                ...course,
                                accessMode: e.target.value,
                              })
                            }
                            className="custom-control-input"
                          />
                          <label
                            htmlFor="public"
                            className="my-0 translate-middle-y"
                          ></label>
                        </div>
                      </div>
                      <div className="rights float-none mt-0">Public</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio">
                          <input
                            type="radio"
                            value="invitation"
                            name="access"
                            id="invite"
                            checked={course.accessMode === "invitation"}
                            onChange={(e) =>
                              setCourse({
                                ...course,
                                accessMode: e.target.value,
                              })
                            }
                            className="custom-control-input"
                          />
                          <label
                            htmlFor="invite"
                            className="my-0 translate-middle-y"
                          ></label>
                        </div>
                      </div>
                      <div className="rights float-none mt-0">Private</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio">
                          <input
                            type="radio"
                            value="buy"
                            name="access"
                            id="buy"
                            checked={course.accessMode === "buy"}
                            onChange={(e) =>
                              setCourse({
                                ...course,
                                accessMode: e.target.value,
                              })
                            }
                            className="custom-control-input"
                          />
                          <label
                            htmlFor="buy"
                            className="my-0 translate-middle-y"
                          ></label>
                        </div>
                      </div>
                      <div className="rights float-none mt-0">Buy</div>
                    </div>
                  </div>
                )}
              {course.status !== "draft" ||
                (course.user._id !== course.owner._id && (
                  <div className="padding_match_form_control text-dark">
                    {course.accessMode}
                  </div>
                ))}

              {course.accessMode === "buy" && course.status !== "revoked" && (
                <div className="mt-2">
                  <PriceEditorComponent
                    settings={settings}
                    countries={countries}
                    setCountries={setCountries}
                    countriesChange={countriesChange}
                  />
                </div>
              )}

              {course.accessMode === "buy" && course.status === "revoked" && (
                <>
                  <p>{course.price}</p>
                  <p>{course.discountValue}</p>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div
              className="rounded-boxes form-boxes bg-white"
              style={{ minHeight: "74.8px" }}
            >
              <h4 className="form-box_subtitle">Certification</h4>
              {course.status !== "revoked" && (
                <div className="form-row mt-2">
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value={true}
                          name="certi"
                          id="tr"
                          checked={course.certificate === true}
                          onChange={() =>
                            setCourse({ ...course, certificate: true })
                          }
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="tr"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">Yes</div>
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value={false}
                          id="noo"
                          name="certi"
                          checked={course.certificate === false}
                          onChange={() =>
                            setCourse({ ...course, certificate: false })
                          }
                          className="custom-control-input"
                        />
                        <label
                          htmlFor="noo"
                          className="my-0 translate-middle-y"
                        ></label>
                      </div>
                    </div>
                    <div className="rights float-none mt-0">No</div>
                  </div>
                </div>
              )}
              {course.status === "revoked" && course.certificate && <p>Yes</p>}
              {course.status === "revoked" && !course.certificate && <p>No</p>}
            </div>
          </div>

          <div className="col-lg-6 pattern-match">
            <div className="rounded-boxes form-boxes bg-white  date">
              <h4 className="form-box_subtitle">Start Date</h4>

              <div className="d-flex align-items-center">
                <DatePicker
                  selected={course.startDate}
                  onChange={(date: any) => {
                    setCourse({ ...course, startDate: date });
                  }}
                  dateFormat="dd-MM-yyyy"
                  minDate={minDate}
                  disabled={course.status !== "draft"}
                  placeholderText="Start Date"
                  className="form-control date-picker"
                />
              </div>
              <hr />
            </div>
          </div>

          <div className="col-lg-6 pattern-match">
            <div className="rounded-boxes form-boxes bg-white  date">
              <h4 className="form-box_subtitle">End Date</h4>

              <div className="d-flex align-items-center">
                <DatePicker
                  selected={course.expiresOn}
                  onChange={(date: any) => {
                    setCourse({ ...course, expiresOn: date });
                  }}
                  dateFormat="dd-MM-yyyy"
                  minDate={new Date(course.startDate)}
                  disabled={course.status === "revoked"}
                  placeholderText="End Date"
                  className="form-control date-picker"
                />
              </div>
              <hr />
            </div>
          </div>
        </div>

        {user.role === "publisher" && course.accessMode !== "buy" && (
          <div className="rounded-boxes form-boxes bg-white  new-class-instructor-a">
            <div className="switch-item float-none">
              <div className="d-flex align-items-center">
                <span className="mr-3 switch-item-label">All Locations</span>

                <label className="switch my-0">
                  <input
                    type="checkbox"
                    checked={course.allowAllLocations}
                    onChange={(e) => onAllowAllLocChanged(e)}
                    disabled={course.status != "draft"}
                  />
                  <span
                    className="slider round translate-middle-y"
                    style={{ top: 0 }}
                  ></span>
                </label>
              </div>
            </div>
            <h4 className="form-box_subtitle">
              {course.allowAllLocations ? "Exception Location" : "Location"}
            </h4>
            {institutes && institutes.length > 0 && (
              <Multiselect
                placeholder="Select locations"
                options={institutes}
                selectedValues={locations}
                onSelect={addLocation}
                onRemove={removeLocations}
                displayValue="name"
                className="multiSelectLocCls"
              />
            )}
            {/* <ReactTags
              suggestions={instituteSuggestions}
              tags={instituteTag}
              handleDelete={handleInstituteDelete}
              handleAddition={handleInstituteAddition}
              inputFieldPosition="inline"
              placeholder="Select Institute"
              handleInputChange={(value: any) => {
                if (value.length > 1) setInstDropdownShow(false);
                else setInstDropdownShow(true);
              }}
              handleInputFocus={() => setInstDropdownShow(true)}
              handleInputBlur={() => {
                setTimeout(() => {
                  setInstDropdownShow(false);
                }, 500);
              }}
              autocomplete
            />
            {instDropdownShow && (
              <div className="tag-dropdown">
                {instituteSuggestions.map((item: any, i: number) => (
                  <div
                    className="tag-dropdown-item"
                    key={i}
                    onClick={() => handleInstituteAddition(item)}
                  >
                    {item.text}
                  </div>
                ))}
              </div> */}
            {/* )} */}
          </div>
        )}

        <div className="row">
          {!course.allowAllLocations && course.accessMode == "invitation" && (
            <div className="col-lg-6">
              <div className="rounded-boxes form-boxes bg-white new-class-instructor-a">
                <h4 className="form-box_subtitle">Select Classroom</h4>
                <ReactTags
                  suggestions={classroomSuggestions}
                  tags={classroomTag}
                  handleDelete={handleClassroomDelete}
                  handleAddition={handleClassroomAddition}
                  inputFieldPosition="inline"
                  placeholder="Select Classroom"
                  handleInputChange={(value: any) => {
                    if (value.length > 1) setClsDropdownShow(false);
                    else setClsDropdownShow(true);
                  }}
                  handleInputFocus={() => setClsDropdownShow(true)}
                  handleInputBlur={() => {
                    setTimeout(() => {
                      setClsDropdownShow(false);
                    }, 500);
                  }}
                  autocomplete
                />
                {clsDropdownShow && (
                  <div className="tag-dropdown">
                    {classroomSuggestions.map((item: any, i: number) => (
                      <div
                        className="tag-dropdown-item"
                        key={i}
                        onClick={() => handleClassroomAddition(item)}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white new-class-instructor-a">
              <h4 className="form-box_subtitle">Reviewer</h4>
              <ReactTags
                suggestions={reviewerSuggestions}
                tags={reviewerTag}
                handleDelete={handleReviewerDelete}
                handleAddition={handleReviewerAddition}
                inputFieldPosition="inline"
                placeholder="Select Reviewer"
                handleInputChange={(value: any) => {
                  if (value.length > 1) setRevDropdownShow(false);
                  else setRevDropdownShow(true);
                }}
                handleInputFocus={() => setRevDropdownShow(true)}
                handleInputBlur={() => {
                  setTimeout(() => {
                    setRevDropdownShow(false);
                  }, 500);
                }}
                autocomplete
              />
              {revDropdownShow && (
                <div className="tag-dropdown">
                  {reviewerSuggestions.map((item: any, i: number) => (
                    <div
                      className="tag-dropdown-item"
                      key={i}
                      onClick={() => handleReviewerAddition(item)}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white  new-class-instructor-a">
              <h4 className="form-box_subtitle">Instructor</h4>
              <ReactTags
                suggestions={instructorSuggestions}
                tags={instructorTag}
                handleDelete={handleInstructorDelete}
                handleAddition={handleInstructorAddition}
                inputFieldPosition="inline"
                placeholder="Select Instructor"
                handleInputChange={(value: any) => {
                  if (value.length > 1) setInsDropdownShow(false);
                  else setInsDropdownShow(true);
                }}
                handleInputFocus={() => setInsDropdownShow(true)}
                handleInputBlur={() => {
                  setTimeout(() => {
                    setInsDropdownShow(false);
                  }, 500);
                }}
                autocomplete
              />
              {insDropdownShow && (
                <div className="tag-dropdown">
                  {instructorSuggestions.map((item: any, i: number) => (
                    <div
                      className="tag-dropdown-item"
                      key={i}
                      onClick={() => handleInstructorAddition(item)}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div
              className="rounded-boxes form-boxes bg-white min-h-control-lg"
              style={{ minHeight: "94px" }}
            >
              <div className="form-row align-items-center">
                <div className="col">
                  <h4 className="form-box_subtitle">Enable Ordering</h4>
                </div>
                <div className="col-auto ml-auto">
                  {course.status !== "revoked" ? (
                    <div className="switch-item d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          aria-label="this is for enablingOrder"
                          value={course.enableOrdering}
                          onChange={(e: any) => {
                            setCourse({
                              ...course,
                              enableOrdering: e.target.value,
                            });
                          }}
                          name="enableOrdering"
                          id="enableOrdering"
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  ) : course.enableOrdering ? (
                    <p>
                      <b>Yes</b>
                    </p>
                  ) : (
                    <p>
                      <b>No</b>
                    </p>
                  )}
                </div>
              </div>
              <p>Allow students to view course sections in order</p>
            </div>
          </div>
        </div>

        {user.role === "admin" && (
          <div className="rounded-boxes form-boxes bg-white">
            {course.status !== "revoked" ? (
              <div>
                <h4 className="form-box_subtitle">
                  Notification Message (message shown to students if withdraw
                  with enrolled course)
                </h4>
                <input
                  type="text"
                  name="notificationMsg"
                  placeholder="Message"
                  value={course.notificationMsg}
                  onChange={(e: any) => {
                    setCourse({ ...course, notificationMsg: e.tartget.value });
                  }}
                  className="form-control border-bottom rounded-0 m-0"
                />
              </div>
            ) : (
              <div>
                <h4 className="form-box_subtitle">
                  Notification Message (message shown to students if withdraw
                  with enrolled course)
                </h4>
                <p>{course.notificationMsg}</p>
              </div>
            )}
          </div>
        )}

        <div className="row">
          <div className="col-lg-6 pattern-match">
            <div
              className="rounded-boxes form-boxes bg-white   min-lg-100 date"
              style={{ minHeight: "89px" }}
            >
              <h4 className="form-box_subtitle">Duration (Days)</h4>

              {course.status === "draft" ? (
                <div className="d-flex align-items-center">
                  <input
                    className="form-control date-picker border-bottom rounded-0"
                    type="number"
                    min="0"
                    placeholder="Duration Of Course"
                    value={course.duration}
                    onChange={(e: any) => {
                      setCourse({ ...course, duration: e.target.value });
                    }}
                    name="txtDuration"
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center border-bottom rounded-0 mt-1">
                  {course.duration ? (
                    <p className="padding_match_form_control">
                      {" "}
                      {course.duration}
                    </p>
                  ) : (
                    <p className="padding_match_form_control"> No Duration</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white  new-border-padding min-lg-100">
              {course.status !== "revoked" ? (
                <div>
                  <div className="form-group">
                    <h4 className="form-box_subtitle">Course Video</h4>
                    <input
                      type="text"
                      id="videoUrl"
                      name="videoUrl"
                      pattern="[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
                      placeholder="Copy and Paste video url"
                      defaultValue={course.videoUrl}
                      onChange={(e) => {
                        setCourse({ ...course, videoUrl: e.target.value });
                      }}
                      className="form-control border-bottom rounded-0"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p>{course.videoUrl}</p>
                </div>
              )}
            </div>
          </div>
          {(course.status === "draft" ||
            course.offeredBy?.name ||
            course.offered?.imageUrl) && (
            <div className="col-lg-6">
              <div className="rounded-boxes form-boxes bg-white ">
                <h4 className="form-box_subtitle">Offered By</h4>
                {course.status === "draft" ? (
                  <div>
                    {/* TODO: implement file upload component */}

                    <div className="course-offerdBy-box m-0">
                      <input
                        type="text"
                        name="offeredByName"
                        placeholder="Name"
                        value={course.offeredBy.name}
                        onChange={(e) => {
                          setCourse({
                            ...course,
                            offeredBy: {
                              ...course.offeredBy,
                              name: e.target.value,
                            },
                          });
                        }}
                        className="form-control border-bottom rounded-0 p-0"
                      />
                    </div>

                    <div className="course-offerdBy-box mt-2">
                      <input
                        type="text"
                        name="offeredByDescription"
                        placeholder="Description"
                        value={course.offeredBy.description}
                        onChange={(e) => {
                          setCourse({
                            ...course,
                            offeredBy: {
                              ...course.offeredBy,
                              description: e.target.value,
                            },
                          });
                        }}
                        className="form-control border-bottom rounded-0 py-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="standard-upload-box my-2"
                      style={{ minHeight: "165px" }}
                    >
                      {course.offeredBy && course.offeredBy.imageUrl && (
                        <figure>
                          <img
                            src={course.offeredBy.imageUrl}
                            className="actual-uploaded-image"
                            alt="this actual uploaded image of course"
                          />
                        </figure>
                      )}
                    </div>
                    {course && course.offeredBy.name && (
                      <div className="pb-2">
                        <p>
                          <b>Name - </b>
                          {course.offeredBy.name}
                        </p>
                      </div>
                    )}
                    {course && course.offeredBy.description && (
                      <div className="">
                        <p>
                          {" "}
                          <b>Description - </b>
                          {course.offeredBy.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white ">
              <h2 className="form-box_subtitle">Upload Course Picture</h2>
              {course.status !== "revoked" && (
                <FileUploader
                  multiple={false}
                  handleChange={handleFileChange}
                  name="file"
                  types={fileTypes}
                >
                  <div className="standard-upload-box">
                    <div className=" d-flex  align-items-center justify-content-center">
                      <h2 className="upload_icon">
                        {file ? (
                          <img
                            src={file}
                            alt="copy"
                            height={200}
                            style={{ height: 200 }}
                          />
                        ) : (
                          <span className="material-icons">file_copy</span>
                        )}
                      </h2>
                    </div>
                    <p className="text-primary"></p>
                    <span className="title">
                      Click here to Drag and Drop or browse your files
                    </span>
                    <p className="text-dark">
                      For optimal view, we recommend size{" "}
                      <span className="text-danger">190px * 200px</span>
                    </p>
                    {fileUploadStatus ? (
                      <div className="upload-btn mx-auto">
                        {/* <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ marginRight: "10px" }}
                          onClick={() => {
                            setFileUploadStatus(false);
                            setFile("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                        >
                          Upload
                        </button> */}
                      </div>
                    ) : (
                      <div className="upload-btn mx-auto">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                        >
                          Browse
                        </button>
                      </div>
                    )}
                  </div>
                </FileUploader>
              )}
            </div>
            {settings.features.coding && (
              <div className="rounded-boxes form-boxes bg-white min-h-control-lg">
                <div className="profile-info">
                  <h2 className="form-box_subtitle">
                    Enabled Code Languages
                    {course.status !== "revoked" && (
                      <a
                        className="btn btn-sm btn-secondary ml-2"
                        onClick={() => openLanguageModal()}
                      >
                        <div className="d-flex align-items-center">
                          <span className="material-icons align-bottom">
                            add
                          </span>
                          <span>Add Language</span>
                        </div>
                      </a>
                    )}
                  </h2>

                  <div>
                    {codeLanguages.map(
                      (item: any, index: number) =>
                        item.checked && (
                          <div
                            key={index}
                            className="d-inline-flex badge badge-primary mr-2 code-badge my-1"
                          >
                            <div
                              className="material-icons mr-2 cl-white align-bottom"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                removeCodeLanguages(index);
                              }}
                            >
                              close
                            </div>
                            {item.display}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end">
          {course.status === "draft" && user.primaryInstitute?.canUseAI && (
            <div className="mt-0">
              <button
                type="button"
                className="btn btn-primary ml-1"
                disabled={reviewing}
                onClick={() => aiReviewDetails()}
              >
                Review Details &nbsp;
                {reviewing && <i className="fa fa-spinner fa-pulse"></i>}
              </button>
            </div>
          )}
          {course.status === "draft" && (
            <div className="mt-0">
              <a className="btn btn-danger ml-1" onClick={() => deleteCourse()}>
                Delete
              </a>
            </div>
          )}
          {course.status === "published" &&
            (user.role == "admin" || user._id == course.user._id) && (
              <div className="mt-0">
                <a
                  className="btn btn-danger ml-1"
                  onClick={() => setNotificationModal(true)}
                >
                  Withdraw
                </a>
              </div>
            )}
          {course.status !== "draft" && course.user._id == user._id && (
            <div className="mt-0">
              <a
                className="btn btn-success ml-1"
                onClick={() => setCopyCourseModal(true)}
              >
                <span>Make a Copy</span>
              </a>
            </div>
          )}
          {course.status === "draft" && (
            <div className="mt-0">
              <a className="btn btn-success ml-1" onClick={() => publish()}>
                <span>Publish</span>
              </a>
            </div>
          )}
          <div className="mt-0">
            <a className="btn btn-primary ml-1" onClick={() => saveChange()}>
              Save
            </a>
          </div>
        </div>
      </form>

      {/* notification modal */}
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
              <div className="class-board-info">
                <div className=" mx-auto">
                  <form onSubmit={() => withdrawCourse()}>
                    <div className="form-group">
                      <div className="d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio">
                            <input
                              type="radio"
                              checked={false}
                              name="ckDisable"
                              id="ckDisable1"
                              onClick={(e: any) => {
                                setDisableAccess(true);
                              }}
                              className="custom-control-input"
                            />
                            <label className="my-0 translate-middle-y"></label>
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
                              checked={true}
                              name="ckDisable"
                              id="ckDisable2"
                              onClick={(e: any) => {
                                setDisableAccess(false);
                              }}
                              className="custom-control-input"
                            />
                            <label className="my-0 translate-middle-y"></label>
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
                          value={notificationMsg}
                          onChange={(e: any) => {
                            setNotificationMsg(e.target.value);
                          }}
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

      <Modal
        show={copyCourseModal}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h1 className="form-box_title">New Course</h1>
          </div>
          <div className="modal-body text-black">
            <p className="mb-1">
              This will create new course with similar content from the current
              course.
            </p>
            <form onSubmit={copyCourseHandleSubmit}>
              <input
                type="text"
                className="form-control border-bottom rounded-0"
                minLength={2}
                maxLength={200}
                placeholder="New Course Name"
                name="title"
                value={copyCourseFormData.title}
                onChange={copyCourseHandleInputChange}
                required
              />
              {copyCourseFormErrors.title && (
                <p className="label label-danger text-danger">
                  {copyCourseFormErrors.title}
                </p>
              )}
              <div className="d-flex justify-content-end mt-2">
                <button
                  className="btn bg_light mr-1"
                  type="button"
                  disabled={copying}
                  onClick={cancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={
                    Object.keys(copyCourseFormErrors).length > 0 || copying
                  }
                >
                  Save {copying && <i className="fa fa-spinner fa-pulse"></i>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <Modal
        show={languageModal}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h4 className="form-box_title">Select Languages</h4>
          </div>
          <div className="modal-body">
            {allLangs.map((item: any, index: number) => (
              <label key={index} className="container2">
                {item.display}
                <input
                  type="checkbox"
                  name="ckCode_{{item.language}}"
                  defaultChecked={item.checked}
                  onChange={(e: any) => {
                    languageCheckedFunction(e.target.checked, index);
                  }}
                />

                <span className="checkmark1 translate-middle-y"></span>
              </label>
            ))}
            <div className="text-right">
              <button
                className="btn btn-light mr-2"
                onClick={(e) => setLanguageModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => selectLanguages()}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default SettingsComponent;
