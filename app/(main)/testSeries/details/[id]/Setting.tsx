import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import Editor from "@/public/assets/ckeditor/build/ckeditor";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import MathJax from "@/components/assessment/mathjax";
import { IDropdownSettings, SubjectEntry } from "@/interfaces/interface";
import { getMine, getTeachersBySubjects } from "@/services/subjectService";
import {
  getAllInstitutes,
  getClassRoomByLocation,
} from "@/services/classroomService";
import * as authService from "@/services/auth";
import { withdraw, copy } from "@/services/courseService";
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
import { clearScreenDown } from "readline";
import { firstValueFrom } from "rxjs";
import { revoke, update, deleteFun } from "@/services/testseriesService";
import LoadingOverlay from "react-loading-overlay-ts";
import { getMineProgram } from "@/services/programService";

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

const SettingsComponent = ({ series, setSeries, user, settings }: any) => {
  const router = useRouter();
  const [classrooms, setClassRooms] = useState<any>([]);
  const [editingSeries, setEditingSeries] = useState<any>(series);
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
  const [selectedPrograms, setSelectedPrograms] = useState<any>([]);
  const [userPrograms, setUserPrograms] = useState<any>([]);
  const dropdownSettings: IDropdownSettings = {
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
  const [languageModal, setLanguageModal] = useState<boolean>(false);
  const [copySeriesFormData, setCopySeriesFormData] = useState({
    title: "",
  });
  const [copySeriesFormErrors, setCopySeriesFormErrors] = useState({
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
  const [testseriesInstructors, setTestseriesInstructors] = useState<any>([]);
  const [testseriesReviewers, setTestseriesReviewers] = useState<any>([]);
  const [pageLoaded, setPageLoaded] = useState(false);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const editingSeriesData = { ...series };
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
      setSelectedSubjects(renameObjectKey(series.subjects, "_id", "id"));
    };
    fetchData();

    setCountries((prev: any) => (series.countries ? series.countries : prev));
    setLocations((prev: any) => (series.locations ? series.locations : prev));

    if (!series.includes) {
      editingSeriesData.includes = "";
    }
    console.log(series, "this is series data");

    if (series.startDate) {
      editingSeriesData.startDate = new Date(series.startDate);
      if (series.startDate < new Date()) {
        setMinDate(new Date(series.startDate));
      }
    } else {
      setMinDate(new Date());
    }

    if (series.expiresOn) {
      editingSeriesData.expiresOn = new Date(series.expiresOn);
    }
    console.log(series, "this is series data");

    if (!series.imageUrl) {
      editingSeriesData.imageUrl = "/assets/images/testseriesDefault.png";
    }

    if (
      (series.status == "published" || series.status == "revoked") &&
      moment(series.startDate).isBefore(moment())
    ) {
      editingSeriesData.readOnlyStartDate = true;
    }

    if (user.role === "publisher") {
      getAllInstitutes().then((res: []) => {
        setInstitutes(res);
      });
    }

    getClassRoomByLocationFuc();
    getTeachersBySubjectsFuc();

    if (series.instructors) {
      setTestseriesInstructors(series.instructors);
    }
    if (series.reviewers) {
      setTestseriesReviewers(series.reviewers);
    }

    if (series.status === "draft") {
      getMineProgram({ subject: true }).then((programs: any) => {
        setUserPrograms(programs);
        const tmp: any = [];
        for (const pro of programs) {
          for (const s of pro.subjects) {
            if (!tmp.find((ss: any) => ss._id == s._id)) {
              tmp.push(s);
            }
          }
        }

        if (editingSeriesData.programs?.length === 0) {
          const updatedPrograms: any = [];
          for (const pro of programs) {
            if (
              pro.subjects.find((ps: any) =>
                editingSeriesData.subjects.find((ss: any) => ss._id === ps._id)
              )
            ) {
              updatedPrograms.push({
                _id: pro._id,
                name: pro.name,
              });
            }
          }
          // setEditingSeries((prevEditingSeries: any) => ({
          //   ...prevEditingSeries,
          //   programs: updatedPrograms,
          // }));
          editingSeriesData.programs = updatedPrograms;
          // console.log(editingSeriesData.programs, "hello");
          setSelectedPrograms(updatedPrograms);
        }
      });
    }

    if (editingSeriesData.enabledCodeLang) {
      editingSeriesData.enabledCodeLang.forEach((c: any) => {
        for (const code of codeLanguagesData) {
          if (code.language === c) {
            code.checked = true;
            break;
          }
        }
      });
    }
    setCodeLanguages(codeLanguagesData);
    setEditingSeries({ ...editingSeriesData });
    // setSelectedPrograms(editingSeriesData.programs);
    console.log(editingSeriesData, "this is series data");
  }, []);

  const getAllInstitutesFuc = async () => {
    getAllInstitutes()
      .then((res) => {
        const instituteSuggestionsData: any = [];
        res?.map((ins: any, i: number) => {
          const data: any = [];

          data.id = ins._id;
          data.text = ins.name;
          instituteSuggestionsData.push(data);
        });
        setInstitutes(instituteSuggestionsData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getClassRoomByLocationFuc = async () => {
    getClassRoomByLocation(
      series.locations.map((i: any) => i._id),
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
                series.classrooms.find((pc: any) => pc._id == c._id)
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
        series.classrooms.forEach((l: any) => {
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
        const allTeachersData = res.filter((d: any) => {
          if (!d || !series.user) {
            return false;
          }
          return d._id != series.user._id;
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
    if (series.locations) {
      series.locations.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        institutesData.push(data);
      });
      setInstituteTag(institutesData);
    }

    const reviewerData: any = [];
    if (series.reviewers) {
      series.reviewers.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        reviewerData.push(data);
      });
      setReviewerTag(reviewerData);
    }

    const instructorData: any = [];
    if (series.instructors) {
      series.instructors.map((item: any) => {
        const data: any = [];
        data.id = item._id;
        data.text = item.name;
        instructorData.push(data);
      });
      setInstructorTag(instructorData);
    }
    setTimeout(() => {
      const allReviewersData = series.instructors
        ? teacherData.filter(
            (t: any) => !series.instructors.find((ts: any) => ts._id == t._id)
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

      const allInstructorsData = series.reviewers
        ? teacherData.filter(
            (t: any) => !series.reviewers.find((ts: any) => ts._id == t._id)
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

    let editingSeriesData = editingSeries;

    editingSeriesData.enabledCodeLang = codeLanguages
      .filter((c: any) => c.checked)
      .map((c: any) => c.language);

    const toUpdate = {
      ...editingSeries,
      instructors: [],
      locations: locations ? [...locations.map((e: any) => e._id)] : [],
      classrooms: getSelectedClassrooms(),
    };
    console.log(toUpdate.locations, "locations");
    const filterInst = testseriesInstructors.filter(
      (ins: any) => ins._id != editingSeries.user._id
    );
    if (filterInst && filterInst.length > 0) {
      toUpdate.instructors = filterInst.map((i: any) => i._id);
    }

    toUpdate.reviewers = testseriesReviewers.map((i: any) => i._id);

    if (editingSeriesData.startDate) {
      toUpdate.startDate = moment(
        editingSeriesData.startDate,
        "DD-MM-YYYY"
      ).toDate();
    }
    if (editingSeriesData.expiresOn) {
      toUpdate.expiresOn = moment(
        editingSeriesData.expiresOn,
        "DD-MM-YYYY"
      ).toDate();
    }

    setSeries({
      ...series,
      processing: true,
    });

    delete toUpdate.praticeinfo;

    setPageLoaded(false);
    console.log(toUpdate, "tpdaup");

    update(editingSeriesData._id, toUpdate).then(
      (res: any) => {
        setSeries({
          ...series,
          title: editingSeriesData.title,
          description: editingSeriesData.description,
          countries: editingSeriesData.countries,
          summary: editingSeriesData.summary,
          imageUrl: editingSeriesData.imageUrl,
          user: editingSeriesData.user,
          status: editingSeriesData.status,
          accessMode: editingSeriesData.accessMode,
          classrooms: editingSeriesData.classrooms,
          level: editingSeriesData.level,
          marketPlacePrice: editingSeriesData.marketPlacePrice,
          price: editingSeriesData.price,
          discountValue: editingSeriesData.discountValue,
          subjects: editingSeriesData.subjects,
          videoUrl: editingSeriesData.videoUrl,
          attemptAllowed: editingSeriesData.attemptAllowed,
          enabledCodeLang: editingSeriesData.enabledCodeLang,
          enableOrdering: editingSeriesData.enableOrdering,
          startDate: editingSeriesData.startDate
            ? moment(editingSeriesData.startDate, "DD-MM-YYYY").toDate()
            : null,
          expiresOn: editingSeriesData.expiresOn
            ? moment(editingSeriesData.expiresOn, "DD-MM-YYYY").toDate()
            : null,
          instructors: testseriesInstructors,
        });

        success("Test Series is saved successfully.");
        setPageLoaded(true);
      },
      (err) => {
        console.log(err);
        setPageLoaded(true);
        if (err.response) {
          alert("Message", err.response.data.message);
        } else {
          alert("Message", "Fail to save this testseries");
        }
      }
    );
  };

  const publishSeries = (settingForm?: any) => {
    confirm(
      "Are you sure you want to publish this Test Series?",
      (msg: any) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        let editingSeriesData = editingSeries;

        editingSeriesData.enabledCodeLang = codeLanguages
          .filter((c: any) => c.checked)
          .map((c: any) => c.language);

        const toUpdate = {
          ...editingSeries,
          instructors: [],
          locations: locations ? [...locations.map((e: any) => e._id)] : [],
          classrooms: getSelectedClassrooms(),
        };
        const filterInst = testseriesInstructors.filter(
          (ins: any) => ins._id != editingSeries.user._id
        );
        if (filterInst && filterInst.length > 0) {
          toUpdate.instructors = filterInst.map((i: any) => i._id);
        }

        toUpdate.reviewers = testseriesReviewers.map((i: any) => i._id);

        if (editingSeriesData.startDate) {
          toUpdate.startDate = moment(
            editingSeriesData.startDate,
            "DD-MM-YYYY"
          ).toDate();
        }
        if (editingSeriesData.expiresOn) {
          toUpdate.expiresOn = moment(
            editingSeriesData.expiresOn,
            "DD-MM-YYYY"
          ).toDate();
        }

        toUpdate.status = "published";

        delete toUpdate.praticeinfo;

        setPageLoaded(false);

        update(editingSeriesData._id, toUpdate).then(
          (res: any) => {
            setSeries({
              ...series,
              status: "published",
              instructors: testseriesInstructors,
              reviewers: testseriesReviewers,
              statusChangedAt: res.statusChangedAt,
            });
            setEditingSeries({
              ...editingSeries,
              status: "published",
            });

            success("Test Series is published successfully.");
            setPageLoaded(true);
          },
          (err) => {
            console.log(err);
            setPageLoaded(true);
            if (err.response) {
              alert("Message", err.response.data.message);
            } else {
              alert("Message", "Fail to publish this testseries");
            }
          }
        );
      }
    );
  };

  const deleteTestSeries = async () => {
    confirm(
      "Are you sure you want to withdraw this Test Series? Once withdrawn, you will not be able to change or re-publish the Test Series.",
      (data: any) => {
        setPageLoaded(false);

        deleteFun(series._id)
          .then((res: any) => {
            router.back();
            success("Test series is deleted successfully");
            setPageLoaded(true);
          })
          .catch((err: any) => {
            alert(
              "Message",
              "You are not allowed to delete this series. Only Director and creator of this test series can delete it."
            );
            setPageLoaded(true);
          });
      }
    );
  };

  const withdrawTestSeries = async () => {
    confirm(
      "Are you sure you want to withdraw this Test Series? Once withdrawn, you will not be able to change or re-publish the Test Series.",
      (data: any) => {
        setPageLoaded(false);
        const toUpdate = { ...series };
        delete toUpdate.praticeinfo;
        revoke(series._id, toUpdate)
          .then((res: any) => {
            setSeries({
              ...series,
              status: "revoked",
              statusChangedAt: res.statusChangedAt,
            });
            setEditingSeries({
              ...editingSeries,
              status: "revoked",
            });
            setPageLoaded(true);
            success("Withdrawn Successfully");
          })
          .catch((err: any) => {
            setPageLoaded(true);
            alert("Message", "Unable to withdraw the test series");
          });
      }
    );
    setEditingSeries({
      ...editingSeries,
      status: "revoked",
      processing: true,
    });
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

  const generateSubjectObjects = (subjects: any) => {
    const subjectObj = renameObjectKey(subjects, "_id", "id");
    return subjectObj;
  };

  const generateProgramObjects = (programs: any) => {
    const programObj = renameObjectKey(programs, "_id", "id");
    return programObj;
  };

  const renameObjectKey = (data: any, oldKey: string, newKey: string) => {
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      let subject = data[i];
      if (oldKey === newKey) return;
      if (!subject) return;
      if (!subject[oldKey]) return;
      if (subject[newKey] !== undefined) return;
      subject = { ...subject, [newKey]: subject[oldKey] };
      delete subject[oldKey];
      newData.push({ ...subject });
    }
    return newData;
  };

  const countriesChange = (newCountries: any) => {
    setEditingSeries({
      ...editingSeries,
      countries: newCountries,
    });
  };

  const handleFileChange = (file: File) => {
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
    const reviewerData = series.reviewers?.filter(
      (item: any) => item._id !== reviewerTag[i].id
    );
    setTestseriesReviewers(reviewerData);

    setReviewerTag(reviewerTag.filter((rev: any, index: any) => index !== i));
    setReviewerSuggestions([...reviewerSuggestions, reviewerTag[i]]);
    setInstructorSuggestions([...instructorSuggestions, reviewerTag[i]]);
    resetReviewer(reviewerData);
  };

  const handleReviewerAddition = (rev: any) => {
    const reviewerData = series.reviewers || [];
    reviewerData.push(allReviewers?.find((item: any) => item._id !== rev.id));
    setTestseriesReviewers(reviewerData);

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
    const instructorData = series.instructors?.filter(
      (item: any) => item._id !== instructorTag[i].id
    );
    setTestseriesReviewers(instructorData);

    setInstructorTag(
      instructorTag.filter((cls: any, index: any) => index !== i)
    );
    setReviewerSuggestions([...reviewerSuggestions, instructorTag[i]]);
    setInstructorSuggestions([...instructorSuggestions, instructorTag[i]]);
    resetInstructor(allInstructors);
  };

  const handleInstructorAddition = (inst: any) => {
    const instructorData = series.instructors || [];
    instructorData.push(
      allInstructors?.find((item: any) => item._id !== inst.id)
    );
    setTestseriesReviewers(instructorData);

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
    const oldData = editingSeries.subjects || [];
    oldData.push(
      userSubjects.find((item: any) => item._id === selectedItem.id)
    );
    setEditingSeries({
      ...editingSeries,
      subjects: oldData,
    });
  };

  const handleDeleteSubjects = (list: any, removedItem: any) => {
    if (series.subjects.length === 1) {
      alert("Message", "Test series need to have at least one subject.");
      return false;
    }
    setSelectedSubjects(list);
    const oldData = series.subjects || [];
    setEditingSeries({
      ...editingSeries,
      subjects: oldData.filter((item: any) => item._id !== removedItem.id),
    });
  };

  const handleAddPrograms = (list: any, selectedItem: any) => {
    setSelectedPrograms(list);
    const oldData = editingSeries.programs || [];
    oldData.push(
      userPrograms.find((item: any) => item._id === selectedItem.id)
    );
    setEditingSeries({
      ...editingSeries,
      programs: oldData,
    });
  };

  const handleDeletePrograms = (list: any, removedItem: any) => {
    if (series.programs.length === 1) {
      alert("Message", "Test series need to have at least one program.");
      return false;
    }
    setSelectedPrograms(list);
    const oldData = series.programs || [];
    setEditingSeries({
      ...editingSeries,
      programs: oldData.filter((item: any) => item._id !== removedItem.id),
    });
  };

  const onAllowAllLocChanged = (e: any) => {
    console.log(institutes, "institutes");
    setEditingSeries({
      ...editingSeries,
      allowAllLocations: e.target.checked,
    });
    // setLocations([]);
  };

  const addLocation = async (ev: any) => {
    setLocations(ev);
    let updatedLoadedClassrooms = loadedClassrooms;
    const lastId = ev[ev.length - 1]._id;
    if (!loadedClassrooms[lastId]) {
      const classes = await getClassRoomByLocation([ev._id]);

      updatedLoadedClassrooms[lastId] = classes;
      setLoadedClassrooms(updatedLoadedClassrooms);
    }

    let classrooms: any[] = [];

    for (const loc of ev) {
      if (updatedLoadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(updatedLoadedClassrooms[loc._id]);
      }
    }

    setClassRooms(classrooms);
  };

  const removeLocations = (ev: any) => {
    setLocations(ev);
    let classrooms: any[] = [];

    for (const loc of ev) {
      if (loadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(loadedClassrooms[loc._id]);
      }
    }

    setClassRooms(classrooms);

    const newClassrooms = [];
    for (const room of editingSeries.classrooms) {
      if (room.location != ev._id) {
        newClassrooms.push(room);
      }
    }
    setEditingSeries({
      ...editingSeries,
      classrooms: newClassrooms,
    });
  };
  console.log(editingSeries.startDate, "editingSeries?.startDate");
  return (
    <>
      <div className="testseries-setting-area">
        {/* start series-setting-area */}
        <div className="rounded-boxes form-boxes bg-white ">
          {editingSeries.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Test Series Name</h4>
              <input
                type="text"
                name="txtTitle"
                placeholder="Name"
                value={editingSeries.title}
                onChange={(e: any) => {
                  setEditingSeries({
                    ...editingSeries,
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
              <h4 className="form-box_subtitle">Test Series Name</h4>
              <p>{editingSeries.title}</p>
            </div>
          )}
        </div>

        <div className="rounded-boxes form-boxes bg-white ">
          {editingSeries.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Summary</h4>
              <input
                type="text"
                name="txtSummary"
                placeholder="Summary"
                value={editingSeries.summary}
                onChange={(e) => {
                  setEditingSeries({
                    ...editingSeries,
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
              <p>{editingSeries.summary}</p>
            </div>
          )}
        </div>

        <div className="rounded-boxes form-boxes bg-white ">
          {editingSeries.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Description</h4>
              <div className="mt-2 course-ck">
                <CKEditorCustomized
                  defaultValue={editingSeries.description || ""}
                  onChangeCon={(data: any) => {
                    setEditingSeries({
                      ...editingSeries,
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
                value={editingSeries.description}
                className="max-with-image word-break-w"
              />
            </div>
          )}
        </div>

        <div className="rounded-boxes form-boxes bg-white ">
          {editingSeries.status !== "revoked" ? (
            <div>
              <h4 className="form-box_subtitle">Test Series Includes</h4>
              <div className="mt-2 course-ck">
                <CKEditorCustomized
                  defaultValue={editingSeries.includes || ""}
                  onChangeCon={(data: any) => {
                    setEditingSeries({
                      ...editingSeries,
                      includes: data,
                    });
                  }}
                  config={ckeOptions}
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="form-box_subtitle">Test Series Includes</h4>
              <MathJax
                value={editingSeries.includes}
                className="max-with-image word-break-w"
              />
            </div>
          )}
        </div>

        {user.role === "publisher" && editingSeries.accessMode !== "buy" && (
          <div className="rounded-boxes form-boxes bg-white  new-class-instructor-a">
            <div className="switch-item float-none">
              <div className="d-flex align-items-center">
                <span className="mr-3 switch-item-label">All Locations</span>

                <label className="switch my-0">
                  <input
                    type="checkbox"
                    checked={editingSeries.allowAllLocations}
                    onChange={(e) => onAllowAllLocChanged(e)}
                    disabled={editingSeries.status != "draft"}
                  />
                  <span
                    className="slider round translate-middle-y"
                    style={{ top: 0 }}
                  ></span>
                </label>
              </div>
            </div>
            <h5 className="form-box_title">
              {editingSeries.allowAllLocations
                ? "Exception Location"
                : "Location"}
            </h5>
            <div className="border-bottom LibraryChange_new">
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
            </div>
          </div>
        )}

        <div className="row mb-lg-3">
          <div className="col-lg-6">
            <div className="rounded-boxes form-boxes bg-white new-class-instructor-a">
              <h4 className="form-box_subtitle">Owners</h4>
              <ReactTags
                suggestions={instructorSuggestions}
                tags={instructorTag || []}
                handleDelete={handleInstructorDelete}
                handleAddition={handleInstructorAddition}
                inputFieldPosition="inline"
                placeholder="Owners"
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

            <div className="rounded-boxes form-boxes bg-white ">
              {editingSeries.status === "draft" ? (
                <div>
                  <h4 className="form-box_subtitle">Programs</h4>
                  <div className="mt-2">
                    <Multiselect
                      options={generateProgramObjects(userPrograms)}
                      selectedValues={selectedPrograms}
                      onSelect={handleAddPrograms}
                      onRemove={handleDeletePrograms}
                      displayValue="name"
                      placeholder="Select programs"
                      showArrow
                      closeIcon="cancel"
                      avoidHighlightFirstOption={true}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="form-box_subtitle ">Programs</h4>
                  <div className="padding_match_form_control">
                    {editingSeries.programs?.map((item: any, index: number) => (
                      <span key={index} className="text-dark">
                        {item.name}
                        {index === editingSeries.programs.length - 1
                          ? ""
                          : ","}{" "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white ">
              <h4 className="form-box_subtitle">Level</h4>
              {editingSeries.status === "draft" && (
                <div className="form-row mt-2">
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio">
                        <input
                          type="radio"
                          value="school"
                          disabled={editingSeries.status === "published"}
                          name="level"
                          checked={editingSeries.level === "school"}
                          onChange={(e) =>
                            setEditingSeries({
                              ...editingSeries,
                              level: e.target.value,
                            })
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
                          disabled={editingSeries.status === "published"}
                          name="level"
                          checked={editingSeries.level === "bachelors"}
                          onChange={(e) =>
                            setEditingSeries({
                              ...editingSeries,
                              level: e.target.value,
                            })
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
                          disabled={editingSeries.status === "published"}
                          name="level"
                          checked={editingSeries.level === "masters"}
                          onChange={(e) =>
                            setEditingSeries({
                              ...editingSeries,
                              level: e.target.value,
                            })
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
                          disabled={editingSeries.status === "published"}
                          name="level"
                          checked={editingSeries.level === "open"}
                          onChange={(e) =>
                            setEditingSeries({
                              ...editingSeries,
                              level: e.target.value,
                            })
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
              {editingSeries.status !== "draft" && (
                <div className="padding_match_form_control">
                  {editingSeries.level}
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white min-h-control-lg">
              {editingSeries.status !== "revoked" ? (
                <div className="profile-info">
                  <h2 className="form-box_subtitle">Test allowed per day</h2>
                  <input
                    className="form-control"
                    name="attemptAllowed"
                    type="number"
                    min="0"
                    step="1"
                    pattern="\d+"
                    placeholder="Number of test allowed"
                    defaultValue={editingSeries.attemptAllowed}
                    onChange={(e) => {
                      setEditingSeries({
                        ...editingSeries,
                        attemptAllowed: e.target.value,
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="profile-info">
                  <h4 className="form-box_subtitle">Test allowed per day</h4>
                  <p>{editingSeries.attemptAllowed}</p>
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white min-h-control-lg">
              <div className="rounded-boxes form-boxes bg-white  date">
                <h4 className="form-box_subtitle">Start Date</h4>

                <div className="d-flex align-items-center">
                  {editingSeries.readOnlyStartDate ? (
                    <div className="padding_match_form_control">
                      {editingSeries?.startDate.toLocaleDateString()}
                    </div>
                  ) : (
                    <DatePicker
                      selected={
                        editingSeries.startDate
                          ? new Date(editingSeries?.startDate)
                          : null
                      }
                      onChange={(date) => {
                        setEditingSeries({
                          ...editingSeries,
                          startDate: date || "",
                        });
                      }}
                      dateFormat="dd-MM-yyyy"
                      minDate={minDate}
                      maxDate={editingSeries.expiresOn}
                      placeholderText="Start Date"
                      className="form-control date-picker"
                    />
                  )}
                </div>
                <hr />
              </div>
            </div>

            <div
              className="rounded-boxes form-boxes bg-white   min-lg-100 date"
              style={{ minHeight: "89px" }}
            >
              <h4 className="form-box_subtitle">Duration (Days)</h4>

              {editingSeries.status === "draft" ? (
                <div className="d-flex align-items-center">
                  <input
                    className="form-control date-picker border-bottom rounded-0"
                    type="number"
                    min="0"
                    placeholder="Duration Of Test Series"
                    value={editingSeries.duration}
                    onChange={(e: any) => {
                      setEditingSeries({
                        ...editingSeries,
                        duration: e.target.value,
                      });
                    }}
                    name="txtDuration"
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center border-bottom rounded-0 mt-1">
                  {editingSeries.duration ? (
                    <p className="padding_match_form_control">
                      {" "}
                      {editingSeries.duration}
                    </p>
                  ) : (
                    <p className="padding_match_form_control"> No Duration</p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white  new-border-padding min-lg-100">
              {editingSeries.status !== "revoked" ? (
                <div>
                  <div className="form-group">
                    <h4 className="form-box_subtitle">Test Series Video</h4>
                    <input
                      type="text"
                      id="videoUrl"
                      name="videoUrl"
                      pattern="[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
                      placeholder="Copy and Paste video url"
                      defaultValue={editingSeries.videoUrl}
                      onChange={(e) => {
                        setEditingSeries({
                          ...editingSeries,
                          videoUrl: e.target.value,
                        });
                      }}
                      className="form-control border-bottom rounded-0"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p>{editingSeries.videoUrl}</p>
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white ">
              <h2 className="form-box_subtitle">Upload Test Series Picture</h2>
              {editingSeries.status !== "revoked" && (
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
          </div>

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

            <div className="rounded-boxes form-boxes bg-white ">
              {editingSeries.status === "draft" ? (
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
                  <div className="padding_match_form_control">
                    {editingSeries.subjects?.map((item: any, index: number) => (
                      <span key={index} className="text-dark">
                        {item.name}
                        {index === editingSeries.subjects.length - 1
                          ? ""
                          : ","}{" "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white ">
              <h4 className="form-box_subtitle">Access Mode</h4>
              {editingSeries.status === "draft" &&
                editingSeries.user._id === editingSeries.owner._id && (
                  <>
                    <div className="form-row mt-2">
                      <div className="col-auto d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio">
                            <input
                              type="radio"
                              value="public"
                              name="access"
                              id="public"
                              checked={editingSeries.accessMode === "public"}
                              onChange={(e) =>
                                setEditingSeries({
                                  ...editingSeries,
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
                              checked={
                                editingSeries.accessMode === "invitation"
                              }
                              onChange={(e) =>
                                setEditingSeries({
                                  ...editingSeries,
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
                              checked={editingSeries.accessMode === "buy"}
                              onChange={(e) =>
                                setEditingSeries({
                                  ...editingSeries,
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
                    {editingSeries.accessMode === "buy" && (
                      <div className="mt-2">
                        <PriceEditorComponent
                          settings={settings}
                          countries={countries}
                          setCountries={setCountries}
                          countriesChange={countriesChange}
                        />
                      </div>
                    )}
                  </>
                )}
              {editingSeries.status === "draft" &&
                editingSeries.user._id !== editingSeries.owner._id && (
                  <div className="padding_match_form_control text-dark">
                    {editingSeries.accessMode}
                  </div>
                )}

              {editingSeries.status === "publish" && (
                <>
                  <div className="form-row">
                    <div className="col">
                      <div className="form-row align-items-center">
                        <div className="col-auto mt-2">
                          <h4 className="form-box_subtitle">
                            {editingSeries.accessMode}
                          </h4>
                          <hr />
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingSeries.accessMode === "buy" && (
                    <div className="form-row mt-2 ml-0">
                      <PriceEditorComponent
                        settings={settings}
                        countries={countries}
                        setCountries={setCountries}
                        countriesChange={countriesChange}
                      />
                    </div>
                  )}
                </>
              )}

              {editingSeries.status === "revoked" && (
                <>
                  <div className="rights float-none mt-0">
                    {editingSeries.accessMode}
                  </div>
                  {editingSeries.accessMode === "buy" && (
                    <>
                      <p>{editingSeries.price}</p>
                      <h4>Discount (%)</h4>
                      <p>{editingSeries.discountValue}</p>
                    </>
                  )}
                </>
              )}
            </div>

            {editingSeries.accessMode === "invitation" && (
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
                  readOnly={editingSeries.status === "revoked"}
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
            )}

            <div className="rounded-boxes form-boxes bg-white  date">
              <h4 className="form-box_subtitle">End Date</h4>

              <div className="d-flex align-items-center">
                <DatePicker
                  selected={
                    editingSeries.expiresOn
                      ? new Date(editingSeries.expiresOn)
                      : null
                  }
                  onChange={(date: any) => {
                    setEditingSeries({
                      ...editingSeries,
                      expiresOn: date || "",
                    });
                  }}
                  dateFormat="dd-MM-yyyy"
                  disabled={editingSeries.status === "revoked"}
                  minDate={minDate}
                  placeholderText="End Date"
                  className="form-control date-picker"
                />
              </div>
              <hr />
            </div>

            <div
              className="rounded-boxes form-boxes bg-white min-h-control-lg"
              style={{ minHeight: "94px" }}
            >
              <div className="form-row align-items-center">
                <div className="col">
                  <h4 className="form-box_subtitle">Enable Ordering</h4>
                </div>
                <div className="col-auto ml-auto">
                  {editingSeries.status !== "revoked" ? (
                    <div className="switch-item d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          aria-label="this is for enablingOrder"
                          value={editingSeries.enableOrdering}
                          onChange={(e: any) => {
                            setEditingSeries({
                              ...editingSeries,
                              enableOrdering: e.target.value,
                            });
                          }}
                          name="enableOrdering"
                          id="enableOrdering"
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  ) : editingSeries.enableOrdering ? (
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
              <p>Allow students to take test in order</p>
            </div>

            {settings.features.coding && (
              <div className="rounded-boxes form-boxes bg-white min-h-control-lg">
                <div className="profile-info">
                  <h2 className="form-box_subtitle">
                    Enabled Code Languages
                    {editingSeries.status !== "revoked" && (
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

            <div className="bg-white rounded-boxes form-boxes text-black">
              {editingSeries && editingSeries.status !== "revoked" && (
                <div className="bg-white">
                  <h4 className="form-box_title">Test Series Tags</h4>
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
                </div>
              )}
              {editingSeries && editingSeries.status === "revoked" && (
                <div>
                  <h4 className="form-box_title">Tags</h4>
                  <p>{editingSeries.tags.join(", ")}</p>
                </div>
              )}
            </div>

            <div className="rounded-boxes form-boxes bg-white min-h-control-lg">
              <div className="form-row align-items-center">
                <div className="col">
                  <h2 className="form-box_subtitle">
                    Enable Level in Assessments
                  </h2>
                </div>
                <div className="col-auto ml-auto">
                  {editingSeries.status !== "revoked" && (
                    <div className="switch-item d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          name="testLevel"
                          aria-label="enable test level"
                          id="testLevel"
                          defaultChecked={editingSeries.testLevel}
                          onChange={(e: any) => {
                            setEditingSeries({
                              ...editingSeries,
                              testLevel: e.target.checked,
                            });
                          }}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  )}
                  {editingSeries.status === "revoked" && (
                    <p>{editingSeries.testLevel ? "Yes" : "No"}</p>
                  )}
                </div>
              </div>
              <p>
                A level is a complexity defined at the assessment. Each Test
                Series can have levels and students must finish one level of
                assessments before moving to next level.
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          {editingSeries.status === "draft" && (
            <div className="mt-0">
              <a
                className="btn btn-danger ml-1"
                onClick={() => deleteTestSeries()}
              >
                Delete
              </a>
            </div>
          )}
          {editingSeries.status === "published" &&
            (user.role == "admin" || user._id == editingSeries.user._id) && (
              <div className="mt-0">
                <a
                  className="btn btn-danger ml-1"
                  onClick={() => withdrawTestSeries()}
                >
                  Withdraw
                </a>
              </div>
            )}
          {editingSeries.status === "draft" && (
            <div className="mt-0">
              <a
                className="btn btn-success ml-1"
                onClick={() => publishSeries()}
              >
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
      </div>

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
