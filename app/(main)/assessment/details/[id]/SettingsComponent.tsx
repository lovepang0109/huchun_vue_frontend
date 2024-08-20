import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CkeOptionsWithToolbar,
  CkeOptionsWithToolbarAndNotes,
  CkeSectionConfig,
  Params,
  IDropdownSettings,
} from "@/interfaces/interface";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import ToggleComponent from "@/components/ToggleComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as practicesetService from "@/services/practice-service";
import Multiselect from "multiselect-react-dropdown";
import { TagsInput } from "react-tag-input-component";
import moment from "moment";
import { alert, success, error, confirm } from "alertifyjs";
import { FileDrop } from "react-file-drop";
import MathJax from "@/components/assessment/mathjax";
import PriceEditor from "@/components/PriceEditor";
import _ from "lodash";
import * as authService from "@/services/auth";
import * as subjectService from "@/services/subject-service";
import * as classRoomService from "@/services/classroomService";
import * as programSvc from "@/services/programService";
import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";

class ListItem {
  id: string | number;
  text: string | number;
  tooltip?: string | undefined;
  isDisabled?: boolean;

  constructor(source: any) {
    this.id = source.id;
    this.text = source.text;
    this.tooltip = source.tooltip;
    this.isDisabled = source.isDisabled;
  }
}

type StepperOptions = {
  linear?: boolean;
  animation?: boolean;
  selectors?: {
    steps?: string;
    trigger?: string;
    stepper?: string;
  };
};

class Stepper {
  constructor(element: Element, _options?: StepperOptions) {}
  next(): void {}
  previous(): void {}
  to(stepNumber: number): void {}
  reset(): void {}
  destroy(): void {}
  private _currentIndex: number = 0;

  getCurrentIndex(): number {
    return this._currentIndex;
  }
}

const styleForMultiSelect = {
  multiselectContainer: {},
  searchBox: {
    fontSize: "10px",
    minHeight: "30px",
    outline: 0,
    border: 0,
  },
  inputField: {
    margin: 5,
  },

  option: {
    color: "black",
    //height: 30,
    //padding: "3px 5px",
    //margin: 0,
    borderRadius: 5,
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
  },
};

const SettingsComponent = ({
  practice,
  setPractice,
  practicesetId,
  user,
  clientData,
  selectedSideMenu,
}: any) => {
  const router = useRouter();
  const fileBrowseRef = useRef(null);

  const [reqAdditionalnfo, setReqAdditionalnfo] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [userPrograms, setUserPrograms] = useState<any>([]);
  const [userSubjects, setUserSubjects] = useState<any>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [token, setToken] = useState<any>(null);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const [maxLength, setMaxLength] = useState<number>(4000);
  const [minM, setMinM] = useState<number>(0);
  const [minS, setMinS] = useState<number>(60);
  const [params, setParams] = useState<Params>({
    reqAdditionalnfo: false,
    limit: 20,
    page: 1,
    absent: true,
    ready: true,
    started: true,
    finished: true,
    abandoned: true,
    admit: true,
    reject: true,
    classes: [],
  });
  const [testReviewers, setTestReviewers] = useState<any[]>([]);
  const [practiceSubjects, setPracticeSubjects] = useState<any[]>([]);
  const [cTags, setCTags] = useState<string[]>([]);
  const [locations, setLocations] = useState<any>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [practiceUnits, setPracticeUnits] = useState<
    { _id: number; name: string }[]
  >([]);
  const [selectedPrograms, setSelectedPrograms] = useState<
    { _id: number; name: string }[]
  >([]);
  const [selectedSubjects, setSelectedSubjects] = useState<
    { _id: number; name: string }[]
  >([]);
  const [selectedUnits, setSelectedUnits] = useState<
    { _id: number; name: string }[]
  >([]);
  const [levels, setLevels] = useState<Array<Object>>([
    { num: 0, name: "AA" },
    { num: 1, name: "BB" },
  ]);
  const [selectedLevel, setSelectedLevel] = useState(levels[1]);
  const [oData, setOdata] = useState<boolean>(false);
  const [allCls, setAllCls] = useState<any>([]);
  const [lClassrooms, setLClassrooms] = useState<any>([]);
  const [selectedClassrooms, setSelecltedClassrooms] = useState<any>([]);
  const [selectedLocations, setSelectedLocations] = useState<any>([]);
  const [reqAdditionalInfo, setReqAdditionalInfo] = useState<boolean>(false);

  const [selectedRandomUnit, setSelectedRandomUnit] = useState<any>("");
  const [selectedRandomSubject, setSelectedRandomSubject] = useState<any>("");
  const [selectedRandomTopic, setSelectedRandomTopic] = useState<any>("");
  const [randomMarks, setRandomMarks] = useState<number>(0);
  const [totalRandomQuestions, setTotalRandomQuestions] = useState<number>(0);
  const [randomUnits, setRandomUnits] = useState<any>([]);
  const [randomTopics, setRandomTopics] = useState<any>([]);
  const [randomUnitsLoaded, setRandomUnitsLoaded] = useState<boolean>(false);
  const [randomTopicsLoaded, setRandomTopicsLoaded] = useState<boolean>(false);
  const [totalQuesPerTopic, setTotalQuesPerTopic] = useState<number>(0);
  const [showTotalQuesPerTopic, setShowTotalQuesPerTopic] =
    useState<boolean>(false);
  const [selectedRandomDetails, setSelectedRandomDetails] = useState<any>([]);
  //back navigate
  const [course, setCourse] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string>("");
  const [sectionId, setSectionId] = useState<any>([]);
  // stepper
  const [currentGfgStep, setCurrentGfgStep] = useState<number>(0);
  const [nextGfgStep, setNextGfgStep] = useState<number>(0);
  const [previousGfgStep, setPreviousGfgStep] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [steps, setSteps] = useState<number>(4);
  const [elements, setElements] = useState<any>(null);
  const [allTeachers, setAllTeachers] = useState<any>([]);
  const [allInstructors, setAllInstructors] = useState<any>([]);
  const [testInstructors, setTestInstructors] = useState<any>([]);
  const [allReviewers, setAllReviewers] = useState<any>([]);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [updatePractice, setUpdatePractice] = useState(false);
  const [countries, setCountires] = useState<any>();

  const [uploadFile, setUploadFile] = useState<any>(null);

  const [selectedObj, setSelectedObj] = useState([]);
  const [checked, setChecked] = useState<any>(practice.allowAllLocations);
  const datePickerRef = useRef(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [imageReview, setImageReview] = useState<boolean>(false);
  let stepper: Stepper;

  useEffect(() => {
    setCountires(practice.countries);
    // Create an instance of Stepper when the component mounts
    const element = document.createElement("div");
    stepper = new Stepper(element);

    // Clean up the Stepper instance when the component unmounts
    return () => {
      stepper.destroy();
    };
  }, []);

  useEffect(() => {
    // Create an instance of Stepper when the component mounts
    const element = document.createElement("div");
    stepper = new Stepper(element);

    // Clean up the Stepper instance when the component unmounts
    return () => {
      stepper.destroy();
    };
  }, []);
  // for new demographic fields
  const [newDemographicFields, setNewDemographicFields] = useState([
    {
      label: "Label 1",
      value: false,
    },
    {
      label: "Label 2",
      value: false,
    },
  ]);
  const [isEditDemographic, setIsEditDemographic] = useState<boolean>(false);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>(-1);
  const [loadedClassrooms, setLoadedClassrooms] = useState<any>({});
  const [otherInstituteClassrooms, setOtherInstituteClassrooms] = useState<any>(
    []
  );
  const [viewTemplates, setViewTemplates] = useState<any>(null);
  const [sectionQuestions, setSectionQuestions] = useState<any>({});
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isCourse, setIsCourse] = useState<boolean>(false);
  const [getClientData, setClientData]: any = useState();

  const [unitsDropdownSettings, setUnitsDropdownSettings] =
    useState<IDropdownSettings>({});
  const [locationDropdownSettings, setLocationDropdownSettings] =
    useState<IDropdownSettings>({});

  const [ckeOptionswithToolbarAndNotes, setCkeOptionswithToolbarAndNotes] =
    useState<CkeOptionsWithToolbarAndNotes>({
      placeholder: "",
      simpleUpload: null,
    });

  const [ckeOptionswithToolbar, setCkeOptionswithToolbar] =
    useState<CkeOptionsWithToolbar>({
      placeholder: "",
      simpleUpload: null,
    });

  const [ckeSectionConfig, setCkeSectionConfig] = useState<CkeSectionConfig>({
    placeholder: "Section Direction",
    simpleUpload: {
      uploadUrl: `${process.env.NEXT_PUBLIC_API}$/api/v1/files/discussionUpload?method=drop`,
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  });

  useEffect(() => {
    if (selectedSideMenu === "settings") {
      getSectionQuestionsCount();
      if (
        practice.status === "published" &&
        moment(practice.expiresOn) < moment()
      ) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    }
  }, [selectedSideMenu]);

  const getSectionQuestionsCount = () => {
    const updatedSectionQuestions = {}; // Initialize an empty object to hold updated counts

    // Iterate over each section
    practice.sections.forEach((sec: any) => {
      // Filter questions belonging to the current section and count them
      const questionsForSection = practice.questions.filter(
        (q) => q.section === sec.name
      );
      // Update the count for the current section in the updated object
      updatedSectionQuestions[sec.name] = questionsForSection.length;
    });

    // Update the state with the new section questions count
    setSectionQuestions(updatedSectionQuestions);
  };

  const handleBeforeUnload = (event: any) => {
    sessionStorage.setItem(
      "teacher_test_setting_current_page_" + practicesetId,
      currentGfgStep.toString()
    );
  };

  const onBrowserBackBtnClose = (event: any) => {
    event.preventDefault();
    if (isCourse) {
      router.push(
        {
          pathname: `/${user.role}/course/details`,
          query: {
            addSection: true,
            tab: "curriculum",
            section: sectionId,
            course: courseId,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    getClientData();
    setUnitsDropdownSettings({
      ...unitsDropdownSettings,
      singleSelection: false,
      textField: "name",
      idField: "_id",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: true,
    });
    setLocationDropdownSettings({
      ...locationDropdownSettings,
      singleSelection: false,
      textField: "name",
      idField: "_id",
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: false,
    });
    const token_temp = authService.getToken();
    setToken(token_temp);
    setCkeSectionConfig({
      placeholder: "Write Instructions",
      simpleUpload: {
        // The URL that the images are uploaded to.
        uploadUrl: `${process.env.NEXT_PUBLIC_API}$/api/v1/files/discussionUpload?method=drop`,

        // Enable the XMLHttpRequest.withCredentials property.
        withCredentials: true,

        // Headers sent along with the XMLHttpRequest to the upload server.
        headers: {
          "X-CSRF-TOKEN": "CSRF-Token",
          Authorization: "Bearer " + token,
        },
      },
    });
    setCkeOptionswithToolbarAndNotes({
      placeholder: "Write Notes",
      simpleUpload: {
        // The URL that the images are uploaded to.
        uploadUrl: `${process.env.NEXT_PUBLIC_API}$/api/v1/files/discussionUpload?method=drop`,

        // Enable the XMLHttpRequest.withCredentials property.
        withCredentials: true,

        // Headers sent along with the XMLHttpRequest to the upload server.
        headers: {
          "X-CSRF-TOKEN": "CSRF-Token",
          Authorization: "Bearer " + token,
        },
      },
    });
    const fetchData = async () => {
      const res = await subjectService.getMine();

      const temp_userSubject = res.map((d: any) => {
        return {
          _id: d._id,
          name: d.name,
        };
      });

      setUserSubjects(temp_userSubject);
    };
    fetchData();

    const savedStep = sessionStorage.getItem(
      "teacher_test_setting_current_page_" + practicesetId
    );
    if (savedStep) {
      sessionStorage.removeItem(
        "teacher_test_setting_current_page_" + practicesetId
      );
      setCurrentGfgStep(Number(savedStep));
    }

    // if (
    //   practice.startDate &&
    //   new Date(practice.startDate).getTime() < new Date().getTime()
    // ) {
    //   setMinDate(new Date(practice.startDate));
    // }

    // if (
    //   practice.startDate &&
    //   new Date(practice.startDate).getTime() < new Date().getTime() &&
    //   practice.status === "draft"
    // ) {
    //   setMinDate(new Date(practice.startDate));
    //   practice.startDate = new Date(new Date().getTime() + 30 * 60000);
    //   setMaxDate(new Date(practice.startDate));
    // }

    if (practice.expiresOn) {
      practice.expiresOn = new Date(practice.expiresOn);
      setPractice({
        ...practice,
        expiresOn: new Date(practice.expiresOn),
      });
    }
    if (practice.startDate) {
      practice.startDate = new Date(practice.startDate);
      setPractice({
        ...practice,
        expiresOn: new Date(practice.startDate),
      });
    }

    if (practice.randomTestDetails && practice.randomTestDetails.length > 0) {
      const unitIds = practice.units.map((d) => d._id);
      subjectService.getTopicsByUnits({ units: unitIds }).then((data: any) => {
        setRandomTopics(data.data);
        if (practice.status === "published") {
          data.forEach((d) => {
            practice.randomTestDetails.map((element: any) => {
              if (d._id === element.topic) {
                if (
                  !selectedRandomDetails.find((x: any) => x.name === d.name)
                ) {
                  setSelectedRandomDetails([
                    ...selectedRandomDetails,
                    {
                      name: d.name,
                      quesMarks: element.quesMarks,
                      questions: element.questions,
                    },
                  ]);
                }
              }
            });
          });
        }
      });
    }

    if (!practice.totalTime) {
      setPractice({
        ...practice,
        totalTime: 30,
      });
    }

    if (!practice.attemptAllowed) {
      setPractice({
        ...practice,
        attemptAllowed: 0,
      });
    }

    if (
      practice.testType === "random" &&
      (!practice.randomTestDetails ||
        (practice.randomTestDetails && practice.randomTestDetails.length === 0))
    ) {
      const updatedRandomTestDetails = [];
      if (!practice.isMarksLevel) {
        updatedRandomTestDetails.push({
          topic: "",
          questions: "",
          quesMarks: "",
        });
      }
      setPractice({ ...practice, randomTestDetails: updatedRandomTestDetails });
    }

    if (practice.userInfo) {
      subjectService
        .getTeachersByPrograms({ isVerified: true })
        .then((data: any[]) => {
          const index = data?.findIndex((e) => e._id === practice.userInfo._id);
          if (index === -1) {
            data.push(practice.userInfo);
          }
          setAllTeachers(data);
          let temp_inst;
          if (practice.instructors) {
            temp_inst = practice.instructors.filter(
              (user: any) =>
                !user.activeLocation ||
                user.locations.indexOf(user.activeLocation) > -1
            );

            setTestInstructors(
              practice.instructors.filter(
                (user: any) =>
                  !user.activeLocation ||
                  user.locations.indexOf(user.activeLocation) > -1
              )
            );
          }

          if (practice.reviewers) {
            setTestReviewers(
              practice.reviewers.filter(
                (user: any) =>
                  !user.activeLocation ||
                  user.locations.indexOf(user.activeLocation) > -1
              )
            );
          }

          const insInd = temp_inst.findIndex(
            (e: any) => e._id === practice.userInfo._id
          );
          if (insInd < 0) {
            setTestInstructors([...temp_inst, practice.userInfo]);
          }

          setOdata(true);
          resetInstructorAndReviewer(data);
        });
    }

    if (practice.demographicData) {
      for (const dem in practice.demographicData) {
        if (
          practice.demographicData[dem] &&
          dem !== "field1" &&
          dem !== "field2"
        ) {
          setReqAdditionalInfo(true);
        }
      }

      if (
        practice.demographicData.field1 &&
        practice.demographicData.field1.value
      ) {
        setReqAdditionalInfo(true);
      }

      if (
        practice.demographicData.field2 &&
        practice.demographicData.field2.value
      ) {
        setReqAdditionalInfo(true);
      }

      if (reqAdditionalInfo) {
        if (practice.demographicData.field1) {
          setNewDemographicFields((prevFields) => [
            ...prevFields,
            practice.demographicData.field1,
          ]);
        }

        if (practice.demographicData.field2) {
          setNewDemographicFields((prevFields) => [
            ...prevFields,
            practice.demographicData.field2,
          ]);
        }
      }
    }

    if (!locations) {
      classRoomService
        .getAllInstitutes({ type: "all" })
        .then((allLocs: any) => {
          allLocs?.map((e: any) => {
            if (e._id === user.activeLocation && e.viewTemplates) {
              setViewTemplates(e.viewTemplates.filter((v: any) => v.active));
            }
          });

          setLocations(allLocs?.filter((l: any) => l.type !== "publisher"));

          const loc: any = [];
          allLocs
            ?.filter((l: any) => l.type !== "publisher")
            .map((e) => {
              practice.locations.forEach((l) => {
                if (l === e._id) {
                  loc.push(e);
                }
              });
            });

          if (viewTemplates?.length && !practice.viewTemplate) {
            practice.viewTemplate =
              viewTemplates.find((v: any) => v.default) || viewTemplates[0];
          }

          setSelectedLocations(loc);
          let locationIds = loc.map((e) => e._id);

          setSelecltedClassrooms([]);

          if (practice.accessMode === "internal") {
            if (!locationIds.includes(user.activeLocation)) {
              locationIds.push(user.activeLocation);
              practice.locations.push(user.activeLocation);
              if (
                locations.find((loc: any) => loc._id === user.activeLocation)
              ) {
                setSelectedLocations([
                  ...selectedLocations,
                  locations.find((loc: any) => loc._id === user.activeLocation),
                ]);
              }
            }
          } else if (
            practice.accessMode === "invitation" &&
            practice.allowAllLocations &&
            user.primaryInstitute?.type !== "publisher"
          ) {
            locationIds = [user.activeLocation];
          }
          if (practice.allowAllLocations) {
            setSelecltedClassrooms(
              practice.classRooms.map((cl) => ({ _id: cl }))
            );
          } else {
            locationIds = [user.activeLocation];
            classRoomService
              .getClassRoomByLocation(locationIds)
              .then((data: any[]) => {
                if (user.role !== "publisher") {
                  setOtherInstituteClassrooms(
                    data
                      ?.filter(
                        (c) =>
                          c.location !== user.activeLocation &&
                          practice.classRooms.find((pc) => pc === c._id)
                      )
                      .map((c) => c._id)
                  );
                  data = data?.filter(
                    (l) => l.location === user.activeLocation
                  );
                }

                setAllCls(data);
                const cls: any[] = [];
                data.forEach((e: any) => {
                  practice.classRooms.map((l: any) => {
                    if (l === e._id) {
                      cls.push(e);
                    }
                  });
                });

                if (practice?.classRooms) {
                  const cls = [];
                  data.forEach((e) => {
                    practice.classRooms.forEach((l) => {
                      if (l === e._id) {
                        cls.push(e);
                      }
                    });
                  });
                  setSelecltedClassrooms(cls);
                }

                data?.map((r: any) => {
                  if (!loadedClassrooms[r.location]) {
                    // setLoadedClassrooms({
                    //   ...loadedClassrooms,
                    //   [r.location]: [...loadedClassrooms[r?.location], r],
                    // });
                  } else {
                    setLoadedClassrooms({
                      ...loadedClassrooms,
                      [r.location]: [r],
                    });
                  }
                });
              });
          }
        });
    }

    if (practice.tags && practice.tags?.length > 0) {
      const c: any = [];
      practice.tags.map((element: any) => {
        c.push({
          display: element,
          value: element,
        });
      });
      setCTags(c);
    }
    let temp_selectedSubjects;
    let temp_selectedUnits;
    if (practice.subjects && practice.subjects?.length > 0) {
      const sub: any = [];
      practice?.subjects?.map((element: any) => {
        sub.push({ name: element.name, _id: element._id });
      });
      temp_selectedSubjects = sub;

      setSelectedSubjects(sub);
    }
    if (practice.units && practice.units?.length > 0) {
      const units: any = [];
      practice.units.map((element: any) => {
        units.push({ name: element.name, _id: element._id });
      });
      temp_selectedUnits = units;

      setSelectedUnits(units);
    }

    const subIds: any[] = [];
    practice.subjects.map((e: any) => {
      subIds.push(e._id);
      return e;
    });

    const fetchFunc = async () => {
      const data = await subjectService.getUnitsBySubject({ subjects: subIds });
      setPracticeUnits(data);
    };
    fetchFunc();

    if (!practice.countries) {
      setPractice({
        ...practice,
        countries: [],
      });
    }
    let updatedPractice = practice;

    programSvc.getMine({ subject: true, unit: true }).then((p: any[]) => {
      sortByName(p);
      setUserPrograms(p);

      if (practice.subjects && practice.subjects.length > 0) {
        setSelectedSubjects(practice.subjects);

        // set programs base on subjects
        if (!practice.programs?.length) {
          setPractice({
            ...practice,
            programs: [],
          });
          updatedPractice.programs = [];
          for (const pro of p) {
            if (
              pro.subjects.find((ps) =>
                practice.subjects.find((ss) => ss._id == ps._id)
              )
            ) {
              updatedPractice.programs.push({
                _id: pro._id,
                name: pro.name,
              });
              // setPractice(updatePractice);
            }
          }
        }
      }

      if (updatedPractice.programs && updatedPractice.programs.length > 0) {
        setSelectedPrograms(updatedPractice.programs);
      }

      if (updatedPractice.units && updatedPractice.units.length > 0) {
        setSelectedUnits(practice.units);
      }
      onProgramChange(
        updatedPractice.programs,
        p,
        temp_selectedSubjects,
        temp_selectedUnits
      );

      // onSubjectChange(temp_selectedSubjects, temp_selectedSubjects, );
    });

    setLoaded(true);
    getSectionQuestionsCount();
  }, []);

  const onProgramChange = (sp?: any, ups?: any, ss?: any, su?: any) => {
    if (!sp) {
      sp = selectedPrograms;
    }
    if (!ups) {
      ups = userPrograms;
    }
    if (!ss) {
      ss = selectedSubjects;
    }
    if (!su) {
      su = selectedUnits;
    }
    const sub: any = [];
    for (const p of sp) {
      const found = ups.find((up) => up._id == p._id);

      if (found) {
        for (const s of found.subjects) {
          if (!sub.find((ss) => ss._id == s._id)) {
            sub.push(s);
          }
        }
      }
    }
    sortByName(sub);

    setPracticeSubjects(sub);

    const updateSelectedSubjects = ss.filter((obj1) =>
      sub.find((obj2) => obj1._id == obj2._id)
    );
    setSelectedSubjects(updateSelectedSubjects);
    onSubjectChange(updateSelectedSubjects, su, sub);
  };

  const onProgramSelect = (item: any) => {
    setSelectedPrograms(item);
    onProgramChange(item);
  };

  const onProgramDeselect = (ev) => {
    const removedItem = selectedPrograms.filter(
      (obj) => !ev.some((e) => e._id === obj._id)
    );

    const idToRemove = removedItem[0]._id;
    setSelectedPrograms(ev);
    const result = practice.questions.filter(
      (o1) => o1.question.subject._id === idToRemove
    );
    if (result && result.length > 0) {
      const compSubjects = [...selectedSubjects];
      compSubjects.push(ev);
      setSelectedSubjects(compSubjects);
      alert(
        "Message",
        "You cannot unselect a subject if questions related to that subject are already added. Please delete all questions for the subject before deleting the subject itself."
      );
      return;
    }

    const updatedSelectedSubjects = selectedSubjects.filter(
      (item) => item._id !== idToRemove
    );
    setSelectedSubjects(updatedSelectedSubjects);
    onProgramChange(ev);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", onBrowserBackBtnClose);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", onBrowserBackBtnClose);
    };
  }, []);

  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      setUploading(true);
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setUploading(false);
      setUploadedUrl(res.data.fileUrl);
      setImageReview(true);
    } catch (err) {
      alert("message", err);
    }
  };

  const resetInstructorAndReviewer = (data?: any) => {
    if (data) {
      const temp_allReviewers = data.filter(
        (t: any) => !testInstructors.find((ts) => ts._id === t._id)
      );
      const temp_allInstructors = data.filter(
        (t: any) => !testReviewers.find((ts) => ts._id === t._id)
      );
      setAllReviewers(temp_allReviewers);
      setAllInstructors(temp_allInstructors);
    } else {
      const temp_allReviewers = allTeachers.filter(
        (t: any) => !testInstructors.find((ts) => ts._id === t._id)
      );
      const temp_allInstructors = allTeachers.filter(
        (t: any) => !testReviewers.find((ts) => ts._id === t._id)
      );
      setAllReviewers(temp_allReviewers);
      setAllInstructors(temp_allInstructors);
    }
  };

  const next = (stepper: Stepper) => {
    savePracticeSets(stepper.getCurrentIndex() + 1);
  };
  const nextStep = (stepper: Stepper) => {
    stepper.next();
  };

  const setClassrooms = () => {
    if (user.role !== "publisher") {
      setPractice({
        ...practice,
        classRooms: selectedClassrooms
          ?.map(({ _id }) => _id)
          .concat(otherInstituteClassrooms),
      });
    } else {
      console.log(
        selectedClassrooms?.map(({ _id }) => _id),
        "ddd"
      );
      setPractice({
        ...practice,
        classRooms: selectedClassrooms?.map(({ _id }) => _id),
      });
    }
  };

  const savePracticeSets = (currentStep: any) => {
    const pra = {
      ...practice,
      programs: selectedPrograms,
      subjects: selectedSubjects,
      units: selectedUnits,
      locations: selectedLocations.map(({ _id }) => _id),
      imageUrl: uploadedUrl ? uploadedUrl : "",
    };
    if (user.role !== "publisher") {
      pra.classRooms = selectedClassrooms
        ?.map(({ _id }) => _id)
        .concat(otherInstituteClassrooms);
    } else {
      pra.classRooms = selectedClassrooms?.map(({ _id }) => _id);
    }

    // setClassrooms();

    if (pra.subjects && pra.subjects.length === 0) {
      alert("Message", "Please add the title");
      return;
    }

    if (
      (pra.subjects && pra.subjects.length === 0) ||
      selectedSubjects?.length === 0
    ) {
      alert("Message", "Please add the Subjects first");
      setSaving(false);

      return;
    }
    if ((pra.units && pra.units.length === 0) || selectedUnits?.length === 0) {
      alert("Mesage", "Please add the Units first");
      setSaving(false);

      return;
    }
    if (!pra.startDate && pra.isProctored && currentStep == 3) {
      alert("Message", "Start date is required.");
      return;
    }
    if (!pra.isProctored) {
      pra.camera = false;
    }
    if (!pra.startDate && pra.testMode === "proctored" && currentStep == 3) {
      alert("Message", "Start date is required.");
      return;
    }
    const selectedTags: any = [];
    if (cTags && cTags.length > 0) {
      cTags.map((tag: any) => {
        selectedTags.push(tag.value);
      });

      pra.tags = selectedTags;
    }

    if (pra.accessMode === "buy" && !pra.countries.length && currentStep == 1) {
      alert("Message", "Please add at least one currency");
      return;
    }

    if (
      pra.testType == "random" &&
      pra.randomTestDetails.length == 0 &&
      currentStep == 1
    ) {
      alert("Message", "You can not save it without topic!!");
      return;
    }

    if (
      pra.testType == "random" &&
      pra.randomTestDetails.length > 0 &&
      currentStep == 1
    ) {
      let isPresent = true;
      for (let i = 0; i < pra.randomTestDetails.length; i++) {
        if (!pra.randomTestDetails[i].topic) {
          alert("Message", "Please add the topic first !!");
          isPresent = false;
          break;
        }
      }
      if (!isPresent) {
        return;
      }
    }

    if (
      (!pra.questionsToDisplay || pra.questionsToDisplay === 0) &&
      pra.testType === "random" &&
      currentStep == 1
    ) {
      alert("Message", "You can't leave the Question to display column empty");
      return;
    }

    if (pra.enableSection && pra.sections.length) {
      let totalSecHavingTime = 0;
      let totalSectiontime = 0;
      pra.sections.map((sec: any) => {
        if (sec.time > 0) {
          totalSecHavingTime++;
          totalSectiontime += sec.time;
        }
      });

      pra.totalTime = Number(pra.totalTime);
      if (totalSecHavingTime === pra.sections.length) {
        if (totalSectiontime !== pra.totalTime) {
          pra.totalTime = totalSectiontime;
        }
      } else {
        alert("Message", "All sections should have time greater than Zero.");
        return;
      }
    } else {
      if (pra.totalTime < 15) {
        alert("Message", "Minimun Time for test is 15 mins");
        return;
      }
    }

    const now = new Date();

    const validDate = addMinutes(now, 30);
    if (
      pra.expiresOn &&
      new Date(pra.expiresOn) < validDate &&
      currentStep === 3
    ) {
      alert("Message", "Expiration date must be at least 30 mins from now.");
      return;
    }

    if (pra.startDate && pra.testMode === "proctored" && currentStep == 3) {
      if (
        pra.startDate.getTime() < new Date().getTime() ||
        (pra.expiresOn && pra.startDate.getTime() > pra.expiresOn.getTime())
      ) {
        alert(
          "Message",
          "Test start date must be after current date and before expiration date (if set)."
        );
        return;
      }
    }

    if (pra.pra > 0 && currentStep == 3) {
      if (
        practice.pra > pra.totalTime &&
        pra.testMode == "proctored" &&
        currentStep === 3
      ) {
        alert(
          "Messate",
          "Start time allowance should not pass total test time."
        );
        return;
      }
    }

    if (
      pra.accessMode === "invitation" &&
      !pra.allowAllLocations &&
      selectedLocations &&
      selectedLocations.length === 0 &&
      currentStep === 1
    ) {
      alert("Messate", "Please add the location first ");
      return;
    }

    if (pra.testType !== "random" || pra.randomTestDetails[0].topic === "") {
      pra.randomTestDetails = [];
    }
    if (pra.testType === "random" && pra.isMarksLevel) {
      pra.randomTestDetails.map((element: any) => {
        element.quesMarks = "";
      });
    }
    const p = {
      ...pra,
      subjects: [...selectedSubjects],
      units: [...selectedUnits],
      instructors: [],
      reviewers: [],
    };

    const filterInst = testInstructors.filter(
      (ins: any) => ins._id !== pra.userInfo._id
    );

    if (filterInst.length) {
      p.instructors = filterInst.map((i: any) => i._id);
    }

    p.reviewers = testReviewers.map((r) => r._id);

    if (user.activeLocation) {
      p.instructors = [
        ...p.instructors,
        ...practice.instructors
          .filter((u: any) => u.locations.indexOf(user.activeLocation) == -1)
          .map((i: any) => i._id),
      ];
      p.reviewers = [
        ...p.reviewers,
        ...practice.reviewers
          .filter((u: any) => u.locations.indexOf(user.activeLocation) == -1)
          .map((i: any) => i._id),
      ];
    }

    if (reqAdditionalnfo) {
      let val = false;
      newDemographicFields.map((e: any, i: number) => {
        if (e.value && !e.label) {
          alert("Message", "Please unchecked the blank demographic field");
          val = true;
          return;
        }
        if (e.label && e.value) {
          p.demographicData["field" + (i + 1)] = e;
        }
      });
      if (val) {
        return;
      }
    }
    setPractice(pra);

    const setDemographicData = (ev: boolean) => {
      if (!ev) {
        setPractice({
          ...practice,
          demographicData: {
            rollNumber: false,
            identificationNumber: false,
            state: false,
            passingYear: false,
            coreBranch: false,
            dob: false,
            city: false,
            gender: false,
            collegeName: false,
            identityVerification: false,
          },
        });

        if (practice.demographicData.field1) {
          setPractice({
            ...practice,
            demographicData: {
              ...practice.demographicData,
              field1: { value: false },
            },
          });
        }

        if (practice.demographicData.field2) {
          setPractice({
            ...practice,
            demographicData: {
              ...practice.demographicData,
              field2: { value: false },
            },
          });
        }
      }
    };
    if (practice.testMode == "learning") {
      setDemographicData(false);
    }

    const updated = beforeSaveTest(p);
    setSaving(true);

    practicesetService
      .updatePractice(practicesetId, updated)
      .then((res) => {
        if (res) {
          success("Assessment updated successfully.");
          setSaving(false);
          nextStep1();
          setPractice({
            ...practice,
            sections: res.sections,
          });
          window.scrollTo(0, 0);
        }
      })
      .catch((res) => {
        let msg = res.response.data[0].msg;
        if (res.response.data) {
          msg = res.response.data.map((e) => e.msg).join("<br/>");
        } else {
          msg = "Failed to update assessment!";
        }
        alert("Message", msg);

        setSaving(false);
        // if (res.error.sysTags) {
        //   this.practice.tags = [...res.error.sysTags, ...this.practice.tags]
        // }
      });
  };

  const beforeSaveTest = (practice: any) => {
    practice.title = practice.title.replace(/ {1,}/g, " ");

    if (
      practice.accessMode !== "invitation" &&
      practice.accessMode !== "internal"
    ) {
      setPractice({
        ...practice,
        inviteeEmails: [],
        inviteePhones: [],
        classRooms: [],
      });
    } else {
      if (
        practice.inviteeEmails &&
        typeof practice.inviteeEmails === "object"
      ) {
        const invitees: string[] = [];
        for (let index = 0; index < practice.inviteeEmails.length; index++) {
          let email = practice.inviteeEmails[index];
          if (email.text !== null) {
            email = email.text;
          }
          invitees.push(email.toLowerCase());
        }
        const inviteEmails_temp = invitees.length > 0 ? invitees : null;
        setPractice({
          ...practice,
          inviteeEmails: inviteEmails_temp,
        });
      }
    }
    return practice;
  };

  const publish = (pra: any, form?: any) => {
    if (pra.testType === "random") {
      const count: any = [];
      let isReturn = false;
      pra.randomTestDetails.map((element: any, i: number) => {
        count[i] = 0;
        pra.questions.map((e: any) => {
          if (e.question.topic._id === element.topic) {
            count[i]++;
          }
        });
        if (element.questions > count[i]) {
          alert(
            "Message",
            " Please add the minimum number of questions required for this topic"
          );
          isReturn = true;
          return;
        }
      });
      if (isReturn) {
        return;
      }
    }
    if (!practice.startDate && practice.testMode === "proctored") {
      alert("Message", "Start date is required.");
      return;
    }
    setClassrooms();
    if (practice.testType === "random") {
      let totalQues = 0;
      practice.randomTestDetails.map((element: any) => {
        totalQues = totalQues + element.questions;
      });
      if (totalQues !== practice.questionsToDisplay) {
        alert(
          "Message",
          "Total questions count is not matching, you need to add or delete some questions while choosing random type"
        );
        return;
      }
    }
    if (!pra || (pra && typeof pra._id === "undefined")) {
      alert("Message", "Your practice is not found");
      return;
    }
    if (!pra.totalTime) {
      alert("Warning", "Time is empty");
      return;
    }
    let codingAndDesTypeQuestion = 0;
    if (pra?.questions?.length >= 2) {
      pra.questions.map((q: any, qI: any) => {
        if (
          q.question.category == "code" ||
          q.question.category == "descriptive"
        ) {
          codingAndDesTypeQuestion++;
        }
      });
    }

    const questionToPublish = 5;
    if (pra.totalQuestion < questionToPublish && codingAndDesTypeQuestion < 2) {
      alert(
        "Message",
        "Please add at least " +
          questionToPublish +
          " questions before publishing the assessment."
      );
      return;
    }
    if (pra.startDate && practice.testMode === "proctored") {
      if (
        new Date(practice.startDate) < new Date() ||
        (practice.expiresOn &&
          new Date(practice.startDate) > new Date(practice.expiresOn))
      ) {
        alert(
          "Message",
          "Test start date must be after current date and before expiration date (if set)."
        );
        return;
      }
    }
    const validDate = addMinutes(new Date(), 30);
    if (practice.expiresOn && practice.expiresOn < validDate) {
      alert("Message", "Expiration date must be at least 30 mins from now.");
      return;
    }

    if (pra.startTimeAllowance > 0) {
      if (
        pra.startTimeAllowance > pra.totalTime &&
        pra.testMode == "proctored"
      ) {
        alert(
          "Message",
          "Start time allowance should not pass total test time."
        );
        return;
      }
    }

    // coding question
    let pushEnableCodeLang: any = [];
    if (practice && practice.questions.length > 0) {
      for (let i = 0; i < practice.questions.length; i++) {
        if (
          practice.questions[i].question.category == "code" &&
          practice.questions[i].question.coding &&
          practice.questions[i].question.coding.length > 0
        ) {
          practice.questions[i].question.coding.map((element: any) => {
            pushEnableCodeLang.push(element.language);
          });
        }
      }
      pushEnableCodeLang = _.uniq(pushEnableCodeLang);
      setPractice({
        ...practice,
        enabledCodeLang: pushEnableCodeLang,
      });
    }

    if (pra.enableSection && pra.sections.length) {
      let totalSecHavingTime = 0;
      let totalSectiontime = 0;
      pra.sections.map((sec: any) => {
        if (sec.time > 0) {
          totalSecHavingTime++;
          totalSectiontime += sec.time;
        }
      });

      if (totalSecHavingTime === practice.sections.length) {
        if (totalSectiontime != practice.totalTime) {
          setPractice({
            ...practice,
            totalTime: totalSectiontime,
          });
        }
      } else {
        alert("Message", "All Sections Should have time great than Zero.");
        return;
      }
    } else {
      practice.sections = [];
    }
    confirm("Are you sure you want to publish this Assessment?", (s: any) => {
      const p = { ...practice, instructors: [] };
      const filterInst = testInstructors.filter(
        (ins) => ins._id != practice.userInfo._id
      );
      if (filterInst && filterInst.length > 0) {
        p.instructors = filterInst.map((i) => i._id);
      }

      if (user.activeLocation) {
        p.instructors = [
          ...p.instructors,
          ...practice.instructors
            .filter((u) => u.locations.indexOf(user.activeLocation) == -1)
            .map((i) => i._id),
        ];
        p.reviewers = [
          ...p.reviewers,
          ...practice.reviewers
            .filter((u) => u.locations.indexOf(user.activeLocation) == -1)
            .map((i) => i._id),
        ];
      }

      const updateData = beforeSaveTest(p);

      updateData.status = "published";
      updateData.statusChangedAt = new Date().getTime();
      // We will set this on server
      practicesetService
        .updatePractice(practice._id, updateData)
        .then((data: any) => {
          setPractice((prevState) => ({
            ...prevState,
            status: data.status,
            data: {
              ...prevState.data,
              status: data.statusChangedAt,
            },
            testCode: data.testCode,
          }));

          // afterSavePractice();

          success("Assessment published successfully.");
        })
        .catch((err) => {
          console.error(err);
        });
    });
  };

  const afterSavePractice = () => {
    setPractice({
      ...practice,
      lastModifiedBy: { name: user.name },
      lastModifiedDate: new Date(),
    });
    setParams({
      ...params,
      reqAdditionalnfo: false,
    });

    if (practice.demographicData) {
      for (const prop in practice.demographicData) {
        if (practice.demographicData[prop]) {
          setParams({
            ...params,
            reqAdditionalnfo: true,
          });
        }
      }
    }
    // updatePractice();
  };
  const validateCodeLang = () => {
    if (practice.enabledCodeLang || !practice.enabledCodeLang[0]) {
      return "There are coding questions but no languages enabled.";
    }
    return "";
  };

  const onSubjectChange = (sub?: any, uni?: any, ps?: any) => {
    if (!sub) {
      sub = selectedSubjects;
    }
    if (!uni) {
      uni = selectedUnits;
    }
    if (!ps) {
      ps = practiceSubjects;
    }
    let units: any = [];
    for (const s of sub) {
      const found = ps.find((su) => su._id == s._id);
      if (found) {
        units = [...units, ...found.units];
      }
    }
    sortByName(units);
    setPracticeUnits(units);
    setSelectedUnits(
      uni.filter((obj1) => units.find((obj2) => obj1._id === obj2._id))
    );
  };

  const onSubItemSelect = (item: any) => {
    onSubjectChange();
  };
  const onUnitsDeselect = (ev: any) => {
    setSelectedUnits(ev);
  };
  // const onDeselect = async (ev: any) => {
  //   console.log(ev, "Ddev")
  //   const idToRemove = ev._id;
  //   const result = practice.questions.filter(
  //     (o1: any) => o1.question.subject._id === idToRemove
  //   );
  //   setSelectedSubjects([...ev])
  //   console.log(result, "res")

  //   if (result && result.length > 0) {
  //     const compSubjects = [...selectedSubjects];
  //     compSubjects.push(ev);
  //     setSelectedSubjects(compSubjects);

  //     alert(
  //       "Message",
  //       "You cannot unselect a subject if questions related to that subject are already added. Please delete all questions for the subject before deleting the subject itself."
  //     );
  //     return;
  //   }
  //   const res = await subjectService.getUnitsBySubject({ subjects: ev._id });
  //   const newUnits = selectedUnits.filter((obj1) =>
  //     res?.every((obj2: any) => obj1._id !== obj2._id)
  //   );
  //   console.log(newUnits, "newunits")
  //   console.log(res, "res")
  //   setSelectedUnits(newUnits);

  //   // setSelectedSubjects([...ev]);
  //   const temp_selectedSubjects = selectedSubjects.filter(
  //     (item) => item._id !== idToRemove
  //   );
  //   console.log(temp_selectedSubjects, "temp")
  //   setSelectedSubjects(temp_selectedSubjects);
  //   // setSelectedSubjects([...ev])

  //   onSubjectChange(ev);
  // };

  const onDeselect = async (ev: any) => {
    const removedItem = selectedSubjects.filter(
      (obj) => !ev.some((e) => e._id === obj._id)
    );

    const idToRemove = removedItem[0]._id;
    // setSelectedSubjects([])

    const result = practice.questions.filter(
      (o1) => o1.question.subject._id === idToRemove
    );
    // if (result && result.length > 0) {
    //   console.log(ev, "ev")
    //   const compSubjects = [...selectedSubjects]
    //   compSubjects.push(ev)
    //   console.log(compSubjects, "comp")
    //   setSelectedSubjects(compSubjects)
    //   // onSubjectSelect(compSubjects)
    //   alert("Message", "You cannot unselect a subject if questions related to that subject are already added. Please delete all questions for the subject before deleting the subject itself.")
    //   return
    // }
    setSelectedSubjects(ev);

    const units = await subjectService.getUnitsBySubject({
      subjects: idToRemove,
    });
    const newUnits = selectedUnits.filter((obj1) =>
      units?.every((obj2) => obj1._id !== obj2._id)
    );
    setSelectedUnits(newUnits);

    // onSubjectChange();
  };

  const onClassroomSelect = (items: any) => {
    setSelecltedClassrooms([...items]);
  };
  const onClassroomDeSelect = (ev: any) => {
    setSelecltedClassrooms([...ev]);
  };

  const onLocationSelect = async (ev: any) => {
    setSelectedLocations(ev);
    let updatedLoadedClassrooms = loadedClassrooms;
    const lastId = ev[ev.length - 1]._id;
    if (!loadedClassrooms[lastId]) {
      const classes = await classRoomService.getClassRoomByLocation([lastId]);
      updatedLoadedClassrooms[lastId] = classes;
      setLoadedClassrooms(updatedLoadedClassrooms);
    }

    let classrooms: any[] = [];

    for (const loc of ev) {
      if (updatedLoadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(updatedLoadedClassrooms[loc._id]);
      }
    }
    sortByName(classrooms);
    setAllCls(classrooms);
  };

  const sortByName = (array: any) => {
    array.sort((a, b) => a.name.localeCompare(b.name));
  };

  const onLocationDeSelect = (ev: any) => {
    setSelectedLocations(ev);
    if (
      !practice.allowAllLocations &&
      selectedLocations &&
      selectedLocations.length == 0
    ) {
      setSelectedLocations([ev]);
      alert(
        "Message",
        "You can not remove the location. At least one location should be selected."
      );
      return;
    }

    let classrooms = [];

    for (const loc of ev) {
      if (loadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(loadedClassrooms[loc._id]);
      }
    }

    sortByName(classrooms);
    setAllCls(classrooms);

    const newClassrooms = [];
    for (const room of selectedClassrooms) {
      if (room.location != ev._id) {
        newClassrooms.push(room);
      }
    }
    setSelecltedClassrooms(newClassrooms);
  };

  const removeSection = async (i: any, sec: any) => {
    const res = await practicesetService.checkSectionQuestion(practice._id, {
      sectionName: sec.name,
    });
    if (res === "ok") {
      const updatedSections = practice.sections.filter(
        (_, index) => index !== i
      );
      setPractice({
        ...practice,
        sections: updatedSections,
      });
    } else {
      console.log("error");
    }
    return;
  };

  const addSection = () => {
    setPractice((prevPractice: any) => ({
      ...prevPractice,
      sections: [
        ...prevPractice.sections,
        {
          name: "",
          showCalculator: false,
          time: 5,
          direction: "",
          isBreakTime: false,
        },
      ],
    }));
  };

  const addSectionBreak = () => {
    setPractice((prevPractice: any) => ({
      ...prevPractice,
      sections: [
        ...prevPractice.sections,
        {
          name: "Take a Break",
          showCalculator: false,
          time: 5,
          direction: "",
          isBreakTime: true,
        },
      ],
    }));
  };

  const selectRandomTopic = ($ev: any, i: number) => {
    setSelectedRandomTopic("");
    setSelectedRandomTopic($ev);
    let count = 0;
    practice.questions.map((element: any) => {
      if (element.question.topic._id === selectedRandomTopic) {
        count++;
      }
    });
    setTotalQuesPerTopic(count);
    setShowTotalQuesPerTopic(true);
    const updatedRandomTestDetails = [...practice.randomTestDetails];
    updatedRandomTestDetails[i].topic = $ev;
    updatedRandomTestDetails[i].totalQuesPerTopic = count;
    setPractice({
      ...practice,
      randomTestDetails: updatedRandomTestDetails,
    });
    // Update practice state with new values
    // setPractice((prevPractice: any) => {
    //   const updatedRandomTestDetails = [...prevPractice.randomTestDetails];
    //   updatedRandomTestDetails[i].topic = selectedRandomTopic;
    //   updatedRandomTestDetails[i].totalQuesPerTopic = count;
    //   console.log(updatedRandomTestDetails, "update")
    //   return { ...prevPractice, randomTestDetails: updatedRandomTestDetails };
    // });
  };

  const changeTestType = async (type?: string) => {
    setPractice({
      ...practice,
      testType: type,
    });
    if (
      practice &&
      type === "random" &&
      (!practice.randomTestDetails ||
        (practice.randomTestDetails && practice.randomTestDetails.length === 0))
    ) {
      const updatedRandomTestDetails = [
        {
          topic: "",
          questions: "",
          quesMarks: "",
        },
      ];

      setPractice((prevPractice: any) => ({
        ...prevPractice,
        randomTestDetails: updatedRandomTestDetails,
      }));

      const unitIds = practice.units.map((d: any) => d._id);
      const data = await subjectService.getTopicsByUnits({ units: unitIds });
      setRandomTopics(data.data);
    }

    if (practice && type === "adaptive") {
      setPractice((prevPractice: any) => ({
        ...prevPractice,
        isAdaptive: true,
        questionsToDisplay: 10,
      }));
    } else {
      setPractice((prevPractice: any) => ({
        ...prevPractice,
        isAdaptive: false,
        questionsToDisplay: "",
      }));
    }
  };

  const addRandomTestDetails = () => {
    setPractice((prevPractice: any) => ({
      ...prevPractice,
      randomTestDetails: [
        ...prevPractice.randomTestDetails,
        {
          topic: "",
          quesMarks: "",
          questions: "",
        },
      ],
    }));
  };

  const deleteRandomTest = (i: any) => {
    setPractice((prevPractice: any) => {
      const updatedRandomTestDetails = [...prevPractice.randomTestDetails];
      updatedRandomTestDetails.splice(i, 1);
      return { ...prevPractice, randomTestDetails: updatedRandomTestDetails };
    });
  };

  // const isAuthorizedUser = (roles: any) => {
  //   return _.indexOf(roles, authService.getCurrentUserRole()) !== -1;
  // };

  const deactive = (practice: any) => {
    if (practice._id) {
      confirm(
        "Are you sure you want to withdraw this Assessment? Once withdrawn, you will not be able to change or re-publish the Assessment."
      ).set("onok", (closeEvent: any) => {
        const data = { ...practice };

        data.status = "revoked";
        setPractice({
          ...practice,
          status: "revoked",
        });
        practicesetService
          .updateAssessment(data._id, data)
          .then((res) => {
            setUpdatePractice(!updatePractice);
            success("Assessment withdrawn successfully.");
          })
          .catch((error) => {
            data.status = "published";
            error(
              "Assessment could not be withdrawn. Please contact Administrator."
            );
          });
      });
    } else {
      error("Cannot withdraw your practice");
    }
  };

  const removePractice = async () => {
    confirm("Are you sure to remove this test permanently?", () => {
      setDeleting(true);
      removeFunc();
      setDeleting(false);
    });
    const removeFunc = async () => {
      const data = await practicesetService.destroy(practice._id, user);
      if (data == "success") {
        router.push("/assessment/home");
      }
    };
  };
  const previousStep = () => {
    setNextGfgStep(currentGfgStep - 1);
    setCurrentGfgStep(currentGfgStep - 1);
  };
  const nextStep1 = () => {
    if (currentGfgStep == 4) {
      return;
    }

    setNextGfgStep(currentGfgStep + 1);
    setCurrentGfgStep(currentGfgStep + 1);
  };

  const nextStepAndSave = () => {
    if (user.role === "mentor") {
      nextStep1();
    } else {
      savePracticeSets(currentGfgStep);
    }
  };

  const clearExpireDate = () => {
    setPractice({
      ...practice,
      expiresOn: null,
    });
  };
  const clearStartDate = () => {
    setPractice({
      ...practice,
      startDate: null,
    });
  };

  const changeExpireDate = () => {
    setMaxDate(new Date(practice.startDate));
  };

  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.practice.sections, event.previousIndex, event.currentIndex);
  // }

  const removeInstructor = (ev) => {
    // const removedItem = testInstructors.filter(obj => !ev.some(e => e._id === obj._id));

    // const idToRemove = removedItem[0]._id;
    // if (idToRemove === practice.userInfo._id) {
    //   error("You cannot remove the creator of the assessment");
    //   setTestInstructors((prevInstructors: any) => [
    //     ...prevInstructors,
    //     practice.userInfo,
    //   ]);
    //   return;
    // }

    // onTeacherRemove(ev);
    setTestInstructors(ev);
  };

  const editField = (field: any, i: any, val: any) => {
    if (val) {
      setIsEditDemographic(false);
      setSelectedFieldIndex(-1);
      field.value = true;
      return;
    }
    setIsEditDemographic(true);
    setSelectedFieldIndex(i);
  };

  const onTeacherAdded = (ev: any) => {
    setTestInstructors(ev);
    resetInstructorAndReviewer();
  };

  const onTeacherRemove = (ev: any) => {
    resetInstructorAndReviewer();
  };
  const addMinutes = (date: any, minutes: any) => {
    const newDate = new Date(date.getTime() + minutes * 60 * 1000);
    return new Date(newDate.setSeconds(0, 0));
  };
  const onSubmit = (event: any) => {
    event.preventDefault();
    return;
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPractice({
      ...practice,
      title: event.target.value,
    });
  };

  const onSubjectSelect = (item: any) => {
    setSelectedSubjects([...item]);
    onSubjectChange(item);
  };
  const onUnitsSelect = (item: any) => {
    setSelectedUnits([...item]);
  };

  const handleRemoveInstructor = (indexToRemove: number) => {
    setTestInstructors(
      testInstructors.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAddInstructor = (newInstructor: any) => {
    setTestInstructors([...testInstructors, newInstructor]);
  };

  const handleFileChange = (file: File) => {
    console.log(file);
    setFile(URL.createObjectURL(file));
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setChecked(newValue);
  };
  const onToggle = () => {
    setPractice({
      ...practice,
      enableSection: !practice.enableSection,
    });
    if (
      practice.enableSection &&
      (!practice.sections || !practice.sections.length)
    ) {
      buildSection(practice.subjects);
    }
  };

  const buildSection = (newVal: any) => {
    // Build sections here
    const sections: any = [];

    practice.sections.map((sec: any) => {
      sections.push(sec);
    });

    // Add new section for new subject

    newVal.map((s: any) => {
      const idx = sections.findIndex((sec: any) => sec.name === s.name);
      if (idx === -1) {
        sections.push({
          name: s.name,
          showCalculator: false,
          time: 5,
          direction: "",
        });
      }
    });
    setPractice({
      ...practice,
      sections: sections,
    });
    getSectionQuestionsCount();
  };

  const handleSectionNameChange = (e, index) => {
    const updatedSections = [...practice.sections];
    updatedSections[index].name = e.target.value;
    setPractice({ ...practice, sections: updatedSections });
  };

  const handleDragStart = (e, fromIndex) => {
    e.dataTransfer.setData("fromIndex", fromIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, toIndex) => {
    const fromIndex = e.dataTransfer.getData("fromIndex");
    moveSection(parseInt(fromIndex), toIndex);
  };

  const moveSection = (fromIndex, toIndex) => {
    const updatedSections = [...practice.sections];
    const sectionToMove = updatedSections[fromIndex];
    updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, sectionToMove);
    setPractice({ ...practice, sections: updatedSections });
  };

  const onAllowAllLocChanged = (e) => {
    setPractice({
      ...practice,
      allowAllLocations: e.target.checked,
    });
    // setSelectedLocations([]);
  };
  return (
    <form id="form" onSubmit={onSubmit}>
      <ul
        id="progressbar"
        className="stepper nav nav-pills nav-justified text-center"
      >
        <li
          className={"nav-item " + (currentGfgStep >= 0 ? "active" : "")}
          id="step1"
          onClick={() => setCurrentGfgStep(0)}
        >
          <strong>Test Details</strong>
        </li>
        <li
          className={"nav-item " + (currentGfgStep >= 1 ? "active" : "")}
          id="step2"
          onClick={() => setCurrentGfgStep(1)}
        >
          <strong>Access & Type</strong>
        </li>
        <li
          className={"nav-item " + (currentGfgStep >= 2 ? "active" : "")}
          id="step3"
          onClick={() => setCurrentGfgStep(2)}
        >
          <strong>Section</strong>
        </li>
        <li
          className={"nav-item " + (currentGfgStep >= 3 ? "active" : "")}
          id="step4"
          onClick={() => setCurrentGfgStep(3)}
        >
          <strong>Settings</strong>
        </li>
        <li
          className={"nav-item " + (currentGfgStep >= 4 ? "active" : "")}
          id="step5"
          onClick={() => setCurrentGfgStep(4)}
        >
          <strong>Instruction</strong>
        </li>
      </ul>
      {currentGfgStep == 0 && (
        <fieldset className="content">
          <div className="row">
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <h4 className="form-box_title mb-2">Details</h4>
                <div className="clearfix">
                  <div className="class-board-info stepper-content-all">
                    <div className="row">
                      <div className="col-lg-12">
                        {practice.status !== "revoked" && (
                          <form>
                            <div className="form-group">
                              <h4 className="form-box_subtitle">
                                Assessment name
                              </h4>
                              <input
                                className="form-control border-bottom rounded-0"
                                type="text"
                                name="search"
                                placeholder="Name"
                                value={practice.title}
                                onChange={handleTitleChange}
                              />
                            </div>
                          </form>
                        )}
                        <div className="form-group">
                          {practice.status === "revoked" && (
                            <>
                              <h4 className="form-box_subtitle">
                                Assessment name
                              </h4>
                              <p>{practice.title}</p>
                            </>
                          )}
                        </div>
                        {practice.status !== "revoked" && (
                          <form>
                            <div className="form-group">
                              <h4 className="form-box_subtitle">Description</h4>
                              <input
                                className="form-control border-bottom rounded-0"
                                type="text"
                                name="search"
                                placeholder="Write Description"
                                value={practice.description}
                                onChange={(e) =>
                                  setPractice({
                                    ...practice,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </form>
                        )}
                        <div className="form-group">
                          {practice.status === "revoked" && (
                            <>
                              <h4 className="form-box_subtitle">Description</h4>
                              <p>{practice.description}</p>
                            </>
                          )}
                        </div>
                        <form>
                          {practice.status === "draft" && (
                            <div className="row">
                              <div className="col-lg-6">
                                <h4 className="form-box_subtitle pb-2">
                                  Subjects
                                </h4>
                                <div className="border-bottom rounded-0 custom LibraryChange_new">
                                  <Multiselect
                                    options={userSubjects}
                                    displayValue="name"
                                    onSelect={onSubjectSelect}
                                    onRemove={onDeselect}
                                    selectedValues={selectedSubjects}
                                    placeholder="Select Subjects"
                                  />
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <h4 className="form-box_subtitle pb-2">
                                  Units
                                </h4>
                                <div className="border-bottom LibraryChange_new">
                                  <Multiselect
                                    options={practiceUnits}
                                    displayValue="name"
                                    selectedValues={selectedUnits}
                                    onSelect={onUnitsSelect}
                                    onRemove={onUnitsDeselect}
                                    placeholder="Select Units"
                                  />
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <h4 className="form-box_subtitle pb-2">
                                  Programs
                                </h4>
                                <div className="border-bottom LibraryChange_new">
                                  <Multiselect
                                    options={userPrograms}
                                    displayValue="name"
                                    selectedValues={selectedPrograms}
                                    onSelect={onProgramSelect}
                                    onRemove={onProgramDeselect}
                                    placeholder="Select Programs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </form>
                        <div className="row">
                          {practice.status !== "draft" && (
                            <>
                              <div className="col-lg-6">
                                <h4 className="form-box_subtitle pb-2">
                                  Subjects
                                </h4>
                                {selectedSubjects.map((s, i) => (
                                  <span key={i}>
                                    {s.name}
                                    {i === selectedSubjects.length - 1
                                      ? ""
                                      : ","}
                                  </span>
                                ))}
                              </div>
                              <div className="col-lg-6">
                                <h4 className="form-box_subtitle pb-2">
                                  Units
                                </h4>
                                {selectedUnits.map((u, i) => (
                                  <span key={i}>
                                    {u.name}
                                    {i === selectedUnits.length - 1 ? "" : ","}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <h4 className="form-box_title mb-2">Marks</h4>
                <div className="clearfix">
                  <div className="class-board-info stepper-content-all">
                    <form>
                      {practice.status === "draft" && (
                        <div className="row special-strapping align-items-center">
                          <div
                            className="col-lg-4 switch-item"
                            style={{ zIndex: "0" }}
                          >
                            <div className="d-flex align-items-center">
                              <strong className="form-box_subtitle assess-set-head marks d-inline-block mr-3">
                                Marks at test level
                              </strong>
                              <div className="align-self-center">
                                <label className="switch col-auto ml-auto my-0 align-middle">
                                  <input
                                    type="checkbox"
                                    checked={practice.isMarksLevel}
                                    onChange={(e) => {
                                      setPractice({
                                        ...practice,
                                        isMarksLevel: !practice.isMarksLevel,
                                      });
                                    }}
                                    disabled={practice.status === "published"}
                                  />
                                  <span
                                    className="slider round translate-middle-y"
                                    style={{ top: 0 }}
                                  ></span>
                                </label>
                              </div>
                            </div>
                            {!practice.isMarksLevel && (
                              <div>Now Marks is on questions Level</div>
                            )}
                          </div>
                          <div className="col-lg-4 pOsTive pl-mn">
                            {practice.isMarksLevel && (
                              <>
                                <strong className="form-box_subtitle assess-set-head1 marks">
                                  Positive Marks
                                </strong>
                                <input
                                  type="number"
                                  placeholder="Positive marks"
                                  value={practice.plusMark}
                                  onChange={(e) => {
                                    setPractice({
                                      ...practice,
                                      plusMark: e.target.value,
                                    });
                                  }}
                                  disabled={practice.status === "published"}
                                  style={{ color: "black" }}
                                  name="score"
                                  max="999"
                                  className="form-box_subtitle"
                                />
                              </>
                            )}
                          </div>
                          <div className="col-lg-4 pOsTive pl-mn">
                            {practice.isMarksLevel && (
                              <>
                                <strong className="form-box_subtitle assess-set-head1 marks">
                                  Negative Marks
                                </strong>
                                <input
                                  type="number"
                                  placeholder="Negative marks"
                                  value={practice.minusMark}
                                  onChange={(e) => {
                                    setPractice({
                                      ...practice,
                                      minusMark: e.target.value,
                                    });
                                  }}
                                  disabled={practice.status === "published"}
                                  style={{ color: "black" }}
                                  name="score"
                                  min="-999"
                                  max="0"
                                  className="form-box_subtitle"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="row">
                        {practice.status !== "draft" && (
                          <div className="col-lg-6 switch-item">
                            <strong className="form-box_subtitle assess-set-head marks d-inline-block mr-3">
                              Marks at test level
                            </strong>
                            <p className="d-inline-block">
                              {practice.isMarksLevel ? "Yes" : "No"}
                            </p>
                            {!practice.isMarksLevel && (
                              <div>Now Marks is on questions Level</div>
                            )}
                          </div>
                        )}
                        {/* {practice.isMarksLevel && (
                          <>
                            <div className="col-lg-3">
                              <strong className="form-box_subtitle assess-set-head1 marks d-inline-block mr-3">
                                Positive Marks&nbsp;&nbsp;
                              </strong>
                              <p className="d-inline-block font-italic">
                                {practice.plusMark}
                              </p>
                            </div>
                            <div className="col-lg-3">
                              <strong className="form-box_subtitle assess-set-head1 marks d-inline-block mr-3">
                                Negative Marks
                              </strong>
                              <p className="d-inline-block font-italic">
                                {practice.minusMark}
                              </p>
                            </div>
                          </>
                        )} */}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="h-lg-100">
                <div className="bg-white rounded-boxes form-boxes text-black">
                  <h4 className="form-box_title">Owners</h4>

                  <Multiselect
                    options={allInstructors}
                    displayValue="name"
                    onSelect={onTeacherAdded}
                    onRemove={removeInstructor}
                    selectedValues={testInstructors}
                    placeholder="+ Owner Name"
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="h-lg-100">
                <div className="bg-white rounded-boxes form-boxes text-black">
                  {practice && practice.status !== "revoked" && (
                    <div className="bg-white">
                      <h4 className="form-box_title">Assessment Tags</h4>
                      {/* <TagInput
                        // className="color-tags new-class-placeholder"
                        tags={[]}
                        handleAddition={() => {}}
                        handleDelete={() => {}}
                        editable={true}
                        required
                        addOnBlur={true}
                        clearOnBlur={true}
                      /> */}
                      <TagsInput
                        //@ts-ignore
                        value={practice.tags}
                        //@ts-ignore
                        onChange={(e) => setPractice({ ...practice, tags: e })}
                        name="tags"
                        placeHolder="+ Enter a new tag"
                        separators={[" "]}
                      />
                    </div>
                  )}
                  {practice && practice.status === "revoked" && (
                    <div>
                      <h4 className="form-box_title">Assessment Tags</h4>
                      <p>{" " + practice.tags}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                {practice.status !== "revoked" && (
                  <>
                    <h4 className="form-box_title">
                      Upload Assessment Picture
                    </h4>

                    {imageReview && uploadedUrl ? (
                      <div className="standard-upload-box mt-2 bg-white">
                        <button
                          type="reset"
                          aria-label="remove uploaded image"
                          className="close btn p-0 mb-2"
                          onClick={() => {
                            setImageReview(false);
                          }}
                        >
                          <img
                            src="/assets/images/close.png"
                            alt="user_uploaded image"
                          />
                        </button>
                        <figure>
                          <img
                            src={uploadedUrl}
                            alt="actually uploaded image"
                            className="actual-uploaded-image"
                          />
                        </figure>
                      </div>
                    ) : (
                      <div className="standard-upload-box mt-2">
                        <FileDrop onDrop={(f: any) => dropped(f)}>
                          <h2 className="upload_icon mb-0">
                            <span className="material-icons">file_copy</span>
                          </h2>
                          <p className="pro-text-drug text-center d-block active text-primary">
                            {uploadFile?.name}
                          </p>
                          <span className="title">
                            Drag and Drop or{" "}
                            <a onClick={filePicker} className="text-primary">
                              {" "}
                              browse{" "}
                            </a>{" "}
                            your files
                            <br></br>
                            For optimal view, we recommend size 190px * 200px
                          </span>
                          {/* {uploading && (
                        <div className="info mx-auto mt-1 mb-2">
                          <p className="text-center text-dark">
                            Uploading(
                            <span style={{ color: "#8C89F9" }}>
                              {uploadProgress.progress.toFixed(0)}%
                            </span>{" "}
                            <i className="fa fa-spinner fa-pulse"></i>)
                          </p>
                        </div>
                      )} */}

                          <div className="d-flex justify-content-center gap-xs">
                            {!uploadFile?.name && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  filePicker();
                                }}
                              >
                                Browse
                              </button>
                            )}
                            {uploadFile?.name && (
                              <>
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => {
                                    setUploadFile({
                                      ...uploadFile,
                                      name: "",
                                    });
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm ml-2"
                                  type="button"
                                  onClick={fileUpload}
                                >
                                  Upload
                                  {uploading && (
                                    <i className="fa fa-spinner fa-pulse"></i>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                          <input
                            accept=""
                            value=""
                            style={{ display: "none", opacity: 0 }}
                            ref={fileBrowseRef}
                            type="file"
                            onChange={(e) => dropped(e.target.files)}
                          />
                        </FileDrop>
                      </div>
                    )}
                  </>
                )}
                {practice.status === "revoked" && practice.imageUrl && (
                  <div>
                    <img src={practice.imageUrl} alt="Assessment Image" />
                  </div>
                )}
              </div>
            </div>
            <div className="col-auto ml-auto">
              {practice.status !== "revoked" && (
                <div className="upload-btn1-remove assess-setting-common-remove">
                  <button className="btn btn-primary" onClick={nextStepAndSave}>
                    Save & Next
                  </button>
                  {saving && (
                    <div>
                      Saving...<i className="fa fa-pulse fa-spinner"></i>
                    </div>
                  )}
                </div>
              )}
              {practice.status === "revoked" && currentGfgStep !== 0 && (
                <div className="upload-btn1-remove assess-setting-common-remove">
                  <button className="btn btn-primary" onClick={nextStep1}>
                    Next
                  </button>
                </div>
              )}
              {practice.status === "revoked" && currentGfgStep === 0 && (
                <div className="upload-btn1-remove assess-setting-common-remove">
                  <button className="btn btn-primary" onClick={nextStepAndSave}>
                    Save & Next
                  </button>
                  {saving && (
                    <div>
                      Saving...<i className="fa fa-pulse fa-spinner"></i>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </fieldset>
      )}
      {currentGfgStep == 1 && (
        <fieldset className="content">
          <div className="row">
            {practice.status === "draft" ? (
              <div className="col-lg-12">
                <div className="bg-white rounded-boxes form-boxes text-black">
                  <div>
                    <div className="profile-info-remove stepper-content-all2 All-TwoLabeL">
                      <h4 className="form-box_title mb-2">Assessment Type</h4>
                      {practice.testType === "standard" && (
                        <p>
                          Standard assessment relies on the evaluation of
                          student understanding with respect to agreed-upon
                          standards, (also known as &quot;outcomes&quot;).
                        </p>
                      )}
                      {practice.testType === "random" && (
                        <p>
                          Random assessment refers to a testing based on a
                          random structure. This results in a unique exam for
                          each candidate.
                        </p>
                      )}
                      {practice.testType === "adaptive" && (
                        <p>
                          Computer generated assessment are designed to adjust
                          their level of difficulty based on the responses
                          provided, to match the knowledge and ability of a
                          assessment taker.
                        </p>
                      )}
                      {practice.testType === "section-adaptive" && (
                        <p>
                          Select this format for full-length Digital SAT. The
                          first section is static and based on the performance
                          of first section, second section quetions are created.
                        </p>
                      )}
                      <div className="form-row mt-2">
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio my-0">
                              <input
                                type="radio"
                                value="standard"
                                name="type"
                                id="standard"
                                checked={practice.testType === "standard"}
                                onChange={() => changeTestType("standard")}
                                disabled={practice.status === "published"}
                              />
                              <label
                                htmlFor="standard"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Standard</div>
                        </div>
                        {!user.primaryInstitute ||
                          (user.primaryInstitute?.preferences?.assessment
                            .adaptive && (
                            <div className="col-auto d-flex align-items-center">
                              <div className="container1 my-0">
                                <div className="radio my-0">
                                  <input
                                    type="radio"
                                    value="adaptive"
                                    name="type"
                                    id="adaptive"
                                    checked={practice.testType === "adaptive"}
                                    onChange={() => changeTestType("adaptive")}
                                    disabled={practice.status === "published"}
                                  />
                                  <label
                                    htmlFor="adaptive"
                                    className="my-0 translate-middle-y"
                                  ></label>
                                </div>
                              </div>
                              <div className="rights my-0">Adaptive</div>
                            </div>
                          ))}
                        {getClientData?.sectionAdaptive &&
                          user?.primaryInstitute?.preferences?.assessment
                            .sectionAdaptive && (
                            <div className="col-auto d-flex align-items-center">
                              <div className="container1 my-0">
                                <div className="radio my-0">
                                  <input
                                    type="radio"
                                    value="section-adaptive"
                                    name="type"
                                    id="section-adaptive"
                                    checked={
                                      practice.testType === "section-adaptive"
                                    }
                                    onChange={() =>
                                      changeTestType("section-adaptive")
                                    }
                                    disabled={practice.status === "published"}
                                  />
                                  <label
                                    htmlFor="section-adaptive"
                                    className="my-0 translate-middle-y"
                                  ></label>
                                </div>
                              </div>
                              <div className="rights my-0">
                                Section Adaptive
                              </div>
                            </div>
                          )}
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio my-0">
                              <input
                                type="radio"
                                value="random"
                                name="type"
                                id="random"
                                checked={practice.testType === "random"}
                                onChange={() => changeTestType("random")}
                                disabled={practice.status === "published"}
                              />
                              <label
                                htmlFor="random"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Random</div>
                        </div>
                      </div>
                      <div className="clear-both post-box bg-white m-0">
                        {practice.testType === "random" && (
                          <div className="mt-2">
                            <div className="d-flex align-items-center">
                              <p className="mr-3">Total Question to display </p>
                              <input
                                className="w-auto form-control border-bottom rounded-0 common-InputAsSetting"
                                type="number"
                                value={practice.questionsToDisplay}
                                onChange={(e) =>
                                  setPractice({
                                    ...practice,
                                    questionsToDisplay: e.target.value,
                                  })
                                }
                                min="0"
                                max="999"
                                disabled={practice.status === "published"}
                                placeholder=""
                              />
                            </div>
                            {practice.randomTestDetails.map((rd, i) => (
                              <div className="random-Testsettings mt-1" key={i}>
                                <div className="row">
                                  <div className="col-lg-4">
                                    <select
                                      className="form-control border-bottom rounded-0 random-MultiSelectInput"
                                      onChange={(e) =>
                                        selectRandomTopic(e.target.value, i)
                                      }
                                      disabled={practice.status === "published"}
                                    >
                                      <option
                                        disabled
                                        selected
                                        hidden
                                        style={{ color: "#999", width: "90px" }}
                                      >
                                        Topic
                                      </option>
                                      {randomTopics?.map((us) => (
                                        <option
                                          key={us._id}
                                          value={us._id}
                                          selected={rd.topic === us._id}
                                        >
                                          {us.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {!practice.isMarksLevel && (
                                    <div className="col-lg-3">
                                      <div className="row align-items-center">
                                        <div className="col-auto">
                                          <p>Marks</p>
                                        </div>
                                        <div className="col">
                                          <input
                                            className="form-control border-bottom rounded-0 common-InputAsSetting"
                                            type="number"
                                            value={rd.quesMarks}
                                            onChange={(e) => {
                                              const updatedRandomTestDetails = [
                                                ...practice.randomTestDetails,
                                              ];
                                              updatedRandomTestDetails[i] = {
                                                ...updatedRandomTestDetails[i],
                                                quesMarks: e.target.value,
                                              };
                                              setPractice((prevState) => ({
                                                ...prevState,
                                                randomTestDetails:
                                                  updatedRandomTestDetails,
                                              }));
                                            }}
                                            min="0"
                                            max="100"
                                            disabled={
                                              practice.status === "published"
                                            }
                                            placeholder=""
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="col-lg-4">
                                    <div className="row align-items-center">
                                      <div className="col-auto">
                                        <p>Number of Question</p>
                                      </div>
                                      <div className="col">
                                        <input
                                          className="form-control border-bottom rounded-0 common-InputAsSetting"
                                          type="number"
                                          name="numberofquestion"
                                          value={rd.questions}
                                          onChange={(e) => {
                                            const updatedRandomTestDetails = [
                                              ...practice.randomTestDetails,
                                            ];
                                            updatedRandomTestDetails[i] = {
                                              ...updatedRandomTestDetails[i],
                                              questions: e.target.value,
                                            };
                                            setPractice((prevState) => ({
                                              ...prevState,
                                              randomTestDetails:
                                                updatedRandomTestDetails,
                                            }));
                                          }}
                                          min="0"
                                          max="100"
                                          disabled={
                                            practice.status === "published"
                                          }
                                          placeholder=""
                                        />
                                      </div>
                                      <div className="col-auto">
                                        <a
                                          className="material-icons"
                                          onClick={() => deleteRandomTest(i)}
                                        >
                                          close
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className=" mt-2">
                              <span
                                className="randomAdd-More add_more"
                                onClick={addRandomTestDetails}
                              >
                                {" "}
                                + Add more topic
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className="clear-both post-box bg-white m-0"
                        style={{
                          display:
                            practice.testType === "adaptive" ? "block" : "none",
                        }}
                      >
                        <div className="row mt-3">
                          <div className="col-md">
                            <p>Question Per Topic</p>
                            <input
                              className="form-control border-bottom rounded-0"
                              type="number"
                              value={practice.questionsPerTopic}
                              onChange={(e) =>
                                (practice.questionsPerTopic = e.target.value)
                              }
                              min="0"
                              max="999"
                              placeholder="Questions Per Topic"
                            />
                          </div>
                          <div className="col-md-auto mt-md-0 my-2">
                            <p>OR</p>
                          </div>
                          <div className="col-md">
                            <p>Question to display</p>
                            <input
                              className="form-control border-bottom rounded-0"
                              type="number"
                              value={practice.questionsToDisplay}
                              onChange={(e) =>
                                (practice.questionsToDisplay = e.target.value)
                              }
                              min="10"
                              max="999"
                              placeholder="Number of Question"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-lg-12">
                <div className="bg-white rounded-boxes form-boxes text-black">
                  <div className="clearfix">
                    <div className="stepper-content-all2">
                      <h4 className="form-box_title mb-2">Assessment Type</h4>
                      {practice.testType == "standard" && (
                        <p>
                          Standard assessment relies on the evaluation of
                          student understanding with respect to agreed-upon
                          standards, (also known as &quot;outcomes&quot;).{" "}
                        </p>
                      )}
                      {practice.testType == "random" && (
                        <p>
                          Random assessment refers to a testing based on a
                          random structure. This results in a unique exam for
                          each candidate.{" "}
                        </p>
                      )}
                      {practice.testType == "adaptive" && (
                        <p>
                          Computer generated assessment are designed to adjust
                          their level of difficulty based on the responses
                          provided, to match the knowledge and ability of a
                          assessment taker.
                        </p>
                      )}
                      <p className="text-capitalize">
                        <strong>{practice.testType}</strong>
                      </p>

                      <div
                        className="post-box bg-white m-0"
                        style={{
                          display:
                            practice.testType === "random" ? "block" : "none",
                        }}
                      >
                        <div>
                          {selectedRandomDetails.map((srd, i) => (
                            <div key={i}>
                              <h4 className="head">
                                <strong>Topic</strong>
                              </h4>
                              <p>{srd.name}</p>
                              <p>Total Question Count</p>
                              <p>{srd.questions}</p>
                              <p>Marks of Questions</p>
                              <p>{srd.quesMarks}</p>
                            </div>
                          ))}
                          {practice.status === "draft" && (
                            <div className="profile-box clearfix">
                              <span onClick={addRandomTestDetails}>
                                + Add Section
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p>
                            Total Question to display <sup>*</sup>
                          </p>
                          <p>{practice.questionsToDisplay}</p>
                        </div>
                      </div>
                      <div
                        className="post-box bg-white m-0"
                        style={{
                          display:
                            practice.testType === "adaptive" ? "block" : "none",
                        }}
                      >
                        <div>
                          <p>Question Per Topic </p>
                          <p>{practice.questionsPerTopic}</p>
                        </div>
                        <h1>OR</h1>
                        <div>
                          <p>Total Question to display </p>
                          <p>{practice.questionsToDisplay}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <div className="stepper-content-all2 All-TwoLabeL">
                  <h4 className="form-box_title mb-2">Access Mode</h4>
                  {practice.accessMode == "public" && (
                    <p>Free assessments are available for all.</p>
                  )}
                  {practice.accessMode == "invitation" && (
                    <p>
                      Private assessments are accessible to only selected
                      classes.
                    </p>
                  )}
                  {practice.accessMode == "buy" && (
                    <p>
                      Buy assessments refers to those that must be purchased to
                      get access.
                    </p>
                  )}
                  {practice.accessMode == "internal" && (
                    <p>
                      Internal assessments are accessible to only courses and
                      testseries.
                    </p>
                  )}
                  <div>
                    {practice.status === "draft" && (
                      <div className="form-row mt-2">
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio">
                              <input
                                type="radio"
                                value="public"
                                name="access"
                                id="public"
                                checked={practice.accessMode === "public"}
                                onChange={() => {
                                  setPractice({
                                    ...practice,
                                    accessMode: "public",
                                  });
                                }}
                              />
                              <label
                                htmlFor="public"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Free</div>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio">
                              <input
                                type="radio"
                                value="invitation"
                                name="access"
                                id="invite"
                                checked={practice.accessMode === "invitation"}
                                onChange={() => {
                                  setPractice({
                                    ...practice,
                                    accessMode: "invitation",
                                  });
                                }}
                              />
                              <label
                                htmlFor="invite"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Private</div>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio">
                              <input
                                type="radio"
                                value="buy"
                                name="access"
                                id="buy"
                                checked={practice.accessMode === "buy"}
                                onChange={() => {
                                  setPractice({
                                    ...practice,
                                    accessMode: "buy",
                                  });
                                }}
                              />
                              <label
                                htmlFor="buy"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Buy</div>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio">
                              <input
                                type="radio"
                                value="internal"
                                name="access"
                                id="internal"
                                checked={practice.accessMode === "internal"}
                                onChange={() => {
                                  setPractice({
                                    ...practice,
                                    accessMode: "internal",
                                  });
                                }}
                              />
                              <label
                                htmlFor="internal"
                                className="my-0 translate-middle-y"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Internal</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {practice.status !== "draft" ? (
                      <p className="text-capitalize">
                        <strong>{practice.accessMode}</strong>
                      </p>
                    ) : null}
                  </div>
                  <div className="pl-0 mt-3">
                    {practice.accessMode === "buy" && (
                      <PriceEditor
                        countries={countries}
                        setCountries={setCountires}
                        settings={clientData}
                      />
                    )}
                  </div>
                  {practice.accessMode === "invitation" &&
                    practice.status !== "revoked" && (
                      <div className="col-lg-6 mt-2">
                        {/* {!practice.allowAllLocations || user.role != 'publisher' && ( */}
                        {/* <div >
                        <h5 className="form-box_title">Classroom</h5>
                        <div className="border-bottom LibraryChange_new">

                          <Multiselect
                            className="multiSelectLocCls"
                            options={allCls}
                            displayValue="name"
                            onSelect={onClassroomSelect}
                            onRemove={onClassroomDeSelect}
                            selectedValues={selectedClassrooms}
                            placeholder="Select Classroom"
                          />
                        </div>
                      </div> */}
                        {/* )} */}
                      </div>
                    )}
                </div>
                <div className="mt-2">
                  {(practice.accessMode === "invitation" ||
                    practice.accessMode === "public") &&
                    user.role === "publisher" &&
                    practice.status !== "revoked" && (
                      <div className="switch-item float-none">
                        <div className="d-flex align-items-center">
                          <span className="mr-3 switch-item-label">
                            All Locations
                          </span>

                          <label className="switch my-0">
                            <input
                              type="checkbox"
                              checked={practice.allowAllLocations}
                              onChange={(e) => onAllowAllLocChanged(e)}
                              disabled={practice.status != "draft"}
                            />
                            <span
                              className="slider round translate-middle-y"
                              style={{ top: 0 }}
                            ></span>
                          </label>
                        </div>
                      </div>
                    )}
                </div>
                <div className="row loc-class2 Custom-boxLayout-1 w-100">
                  {(practice.accessMode === "invitation" ||
                    practice.accessMode === "public") &&
                    user.role === "publisher" &&
                    practice.status !== "revoked" && (
                      <div className="col-lg-6">
                        <h5 className="form-box_title">
                          {practice.allowAllLocations
                            ? "Exception Location"
                            : "Location"}
                        </h5>
                        <div className="border-bottom LibraryChange_new">
                          {locations && locations.length > 0 && (
                            <Multiselect
                              placeholder="Select locations"
                              options={locations}
                              selectedValues={selectedLocations}
                              onSelect={onLocationSelect}
                              onRemove={onLocationDeSelect}
                              displayValue="name"
                              className="multiSelectLocCls"
                              style={locationDropdownSettings}
                            />
                          )}
                        </div>
                      </div>
                    )}

                  {practice.accessMode === "invitation" &&
                    practice.status !== "revoked" && (
                      <div className="col-lg-6 mt-2">
                        {(!practice.allowAllLocations ||
                          user.role !== "publisher") && (
                          <>
                            <h5 className="form-box_title">Classroom</h5>
                            <div className="border-bottom LibraryChange_new">
                              <Multiselect
                                placeholder="Select Classroom"
                                options={allCls}
                                selectedValues={selectedClassrooms}
                                onSelect={onClassroomSelect}
                                onRemove={onClassroomDeSelect}
                                displayValue="name"
                                className="multiSelectLocCls"
                                style={locationDropdownSettings}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </div>
                {practice.status === "revoked" && (
                  <div className="row loc-class2 Custom-boxLayout-1">
                    <div className="col-lg-6">
                      <h5 className="form-box_title">Location</h5>
                      <ul>
                        {selectedLocations.map((l, i) => (
                          <li key={i}>
                            {i + 1} - {l.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-lg-6">
                      <label>Classroom</label>
                      <ul>
                        {selectedClassrooms?.map((l, i) => (
                          <li key={i}>
                            {i + 1} - {l.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <div>
                  <div className="profile-info-remove stepper-content-all2 All-TwoLabeL">
                    {practice.status === "draft" && (
                      <>
                        <h4 className="form-box_title mb-2">Delivery Mode</h4>
                        {practice.testMode === "practice" && (
                          <p>
                            In Practice mode, all correct solutions will be
                            displayed at the end of the assessment.
                          </p>
                        )}
                        {practice.testMode === "learning" && (
                          <p>
                            In Learning mode, correct solution will be displayed
                            after each attempted question
                          </p>
                        )}
                        <div className="form-row mt-2">
                          <div className="col-auto d-flex align-items-center">
                            <div className="container1 my-0">
                              <div className="radio">
                                <input
                                  type="radio"
                                  value="practice"
                                  name="level"
                                  id="practice"
                                  checked={practice.testMode === "practice"}
                                  onChange={() => {
                                    setPractice({
                                      ...practice,
                                      testMode: "practice",
                                    });
                                  }}
                                  disabled={practice.status === "published"}
                                />
                                <label
                                  htmlFor="practice"
                                  className="my-0 translate-middle-y"
                                ></label>
                              </div>
                            </div>
                            <div className="rights my-0">Practice</div>
                          </div>
                          <div className="col-auto d-flex align-items-center">
                            <div className="container1 my-0">
                              <div className="radio">
                                <input
                                  type="radio"
                                  value="learning"
                                  name="level"
                                  id="learning"
                                  checked={practice.testMode === "learning"}
                                  onChange={() => {
                                    setPractice({
                                      ...practice,
                                      testMode: "learning",
                                    });
                                  }}
                                  disabled={practice.status === "published"}
                                />
                                <label
                                  htmlFor="learning"
                                  className="my-0 translate-middle-y"
                                ></label>
                              </div>
                            </div>
                            <div className="rights my-0">Learning</div>
                          </div>
                        </div>
                      </>
                    )}
                    {practice.status !== "draft" && (
                      <div className="profile-info">
                        <h4 className="form-box_title mb-2">Delivery Mode</h4>
                        {!practice.isProctored && (
                          <>
                            {practice.testMode === "practice" && (
                              <p>
                                In Practice mode, all correct solutions will be
                                displayed at the end of the assessment.
                              </p>
                            )}
                            {practice.testMode === "learning" && (
                              <p>
                                In Learning mode, correct solution will be
                                displayed after each attempted question
                              </p>
                            )}
                            <p className="text-capitalize">
                              <strong>{practice.testMode}</strong>
                            </p>
                          </>
                        )}
                        {practice.isProctored && (
                          <>
                            <p>
                              Proctor mode will have timed exams that students
                              can take while proctoring software monitors their
                              computer&apos;s desktop, webcam video and audio in
                              the presence of supervisor throughout the test.
                            </p>
                            <p className="text-capitalize">
                              <strong>Proctored</strong>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-auto ml-auto">
              <div className="new-flex-box">
                <button
                  name="previous-step"
                  className="previous-step btn btn-outline"
                  onClick={previousStep}
                >
                  Previous Step
                </button>
                {practice.status !== "revoked" && (
                  <div className="upload-btn1-remove assess-setting-common-remove ml-2">
                    <button
                      className="btn btn-primary"
                      onClick={nextStepAndSave}
                    >
                      Save & Next
                    </button>
                  </div>
                )}
                {practice.status === "revoked" && (
                  <div className="upload-btn1-remove assess-setting-common-remove ml-2">
                    <button className="btn btn-primary" onClick={nextStep1}>
                      Next
                    </button>
                  </div>
                )}
                {saving && (
                  <div className="saving-box">
                    Saving...<i className="fa fa-pulse fa-spinner"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      )}
      {currentGfgStep == 2 && (
        <fieldset className="content enable-section">
          <div className="row">
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black stepper-content-all">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="form-box_title d-inline-block mb-2">
                      Section
                    </h4>
                    <p>
                      Assessments will be divided based on categories/sections.
                      Students can move on to the next section only after they
                      complete the previous section.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="asses-item setting3 p-0">
                      <div className="switch-item d-flex align-items-center float-none my-1">
                        <h4 className="form-box_title assess-set-toggle2 mb-0">
                          Enable Section
                        </h4>
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value={true}
                            checked={practice.enableSection}
                            onChange={onToggle}
                            disabled={practice.status === "revoked"}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {practice.enableSection && (
                    <div>
                      {practice.status !== "revoked" && (
                        <div>
                          <div className="row">
                            <div className="col bold">Section Name</div>
                            <div className="col bold">Time (minutes)</div>
                            <div className="col bold">Total Questions</div>
                            {practice.showCalculator != "none" && (
                              <div className="col bold">Allow Calculator</div>
                            )}
                            <div
                              className="col-auto"
                              style={{ width: "67px" }}
                            ></div>
                          </div>
                          <div>
                            <div>
                              {practice.sections.map((section, i) => (
                                <div
                                  key={i}
                                  className={`row ${
                                    section.isBreakTime ? "break-time-row" : ""
                                  }`}
                                >
                                  <div className="col d-flex align-items-center">
                                    <a
                                      // draggable={practice.status !== "revoked"}
                                      // onDragStart={(e) => e.preventDefault()}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, i)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, i)}
                                    >
                                      <span
                                        className="material-icons bg-transparent p-0"
                                        style={{ color: "#007bff" }}
                                      >
                                        drag_indicator
                                      </span>
                                    </a>
                                    <input
                                      className="form-control border-bottom rounded-0"
                                      required
                                      type="text"
                                      value={section.name}
                                      onChange={(e) => {
                                        const updatedSections = [
                                          ...practice.sections,
                                        ];
                                        updatedSections[i].name =
                                          e.target.value;
                                        setPractice({
                                          ...practice,
                                          sections: updatedSections,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="col">
                                    <input
                                      className="form-control border-bottom rounded-0"
                                      type="number"
                                      value={section.time}
                                      onChange={(e) => {
                                        const updatedSections = [
                                          ...practice.sections,
                                        ];
                                        updatedSections[i].time =
                                          e.target.value;
                                        setPractice({
                                          ...practice,
                                          sections: updatedSections,
                                        });
                                      }}
                                      max="999"
                                      min="0"
                                      placeholder="time"
                                    />
                                  </div>
                                  <div className="col">
                                    {!section.isBreakTime && (
                                      <div className="pt-2">
                                        {sectionQuestions[section.name]}
                                      </div>
                                    )}
                                  </div>
                                  <div className="col">
                                    {practice.showCalculator != "none" &&
                                      !section.isBreakTime && (
                                        <ToggleComponent
                                          value={section.showCalculator}
                                          onValueChange={() => {
                                            const updatedSections = [
                                              ...practice.sections,
                                            ];
                                            updatedSections[i].showCalculator =
                                              !section.showCalculator;
                                            setPractice({
                                              ...practice,
                                              sections: updatedSections,
                                            });
                                          }}
                                        />
                                      )}
                                  </div>

                                  {/* {!section.isBreakTime && (
                                      // <app-toggle
                                      //   value={section.showCalculator}
                                      // />
                                    )} */}

                                  <div className="col-auto d-flex gap-xs">
                                    <a
                                      onClick={() => removeSection(i, section)}
                                      className="btn"
                                    >
                                      <i className="fa fa-times"></i>
                                    </a>
                                  </div>
                                  <div className="col-12 mb-1">
                                    {!section.isBreakTime &&
                                      (practice.viewTemplate === "SAT" ||
                                        practice.viewTemplate === "ACT") && (
                                        // <ckeditor
                                        //   editor="Editor"
                                        //   value={section.direction}
                                        //   onChange={(value) =>
                                        //     (section.direction = value)
                                        //   }
                                        //   name={`section_direction_${i}`}
                                        //   config="ckeSectionConfig"
                                        // />
                                        <CKEditorCustomized
                                          defaultValue={section.direction}
                                          className="form-control ml-2"
                                          style={{
                                            border: "1px solid #ced4da",
                                            width: "90%",
                                          }}
                                          config={{
                                            placeholder:
                                              "Post a question or comment. Your post will be visible to everyone.",

                                            toolbar: {
                                              items: [],
                                            },
                                            mediaEmbed: {
                                              previewsInData: true,
                                            },
                                          }}
                                          onChangeCon={(e: any) => {
                                            console.log(e);
                                          }}
                                        />
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-3">
                    <button onClick={addSection} className="text-dark">
                      + Add Section
                    </button>
                    {(practice.viewTemplate === "SAT" ||
                      practice.viewTemplate === "ACT") &&
                      practice.sections.length > 0 && (
                        <button
                          onClick={addSectionBreak}
                          className="ml-3 text-dark"
                        >
                          + Add Break between Sections
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-auto ml-auto ">
              <div className="col-auto ml-auto">
                <div className="new-flex-box">
                  <button
                    name="previous-step"
                    className="previous-step btn btn-outline"
                    onClick={previousStep}
                  >
                    Previous Step
                  </button>
                  {practice.status !== "revoked" ? (
                    <div className="upload-btn1-remove assess-setting-common-remove ml-2">
                      <button
                        className="btn btn-primary"
                        onClick={nextStepAndSave}
                      >
                        Save & Next
                      </button>
                    </div>
                  ) : (
                    <div className="upload-btn1-remove assess-setting-common-remove">
                      <button
                        className="btn btn-primary ml-2"
                        onClick={nextStep1}
                      >
                        Next
                      </button>
                      {saving && (
                        <div className="saving-box">
                          Saving...<i className="fa fa-pulse fa-spinner"></i>
                        </div>
                      )}
                    </div>
                  )}
                  {saving && (
                    <div className="saving-box">
                      Saving...<i className="fa fa-pulse fa-spinner"></i>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      )}
      {currentGfgStep == 3 && (
        <fieldset className="content optional-settingCustomWidth">
          <div className="OptIOnalQueS">
            <div className="bg-white rounded-boxes form-boxes text-black">
              <h4 className="form-box_title mb-2">Time Settings</h4>
              <div className="stepper-content-all2 Time_oPtiOnal">
                <div className="row">
                  <div className="col-lg-5">
                    <div className="bg-white">
                      <div className="">
                        <div className="profile-info">
                          <h4 className="form-box_subtitle">
                            Total Time(minutes)
                          </h4>
                          <form>
                            <input
                              type="text"
                              name="search"
                              placeholder=""
                              // Add your validation for appNumberOnly
                              min="0"
                              value={practice.totalTime}
                              onChange={(e) =>
                                setPractice({
                                  ...practice,
                                  totalTime: e.target.value,
                                })
                              }
                              disabled={practice.status === "published"}
                              className="form-control border-bottom rounded-0"
                            />
                          </form>
                          <p>
                            {practice.status === "revoked" &&
                              practice.totalTime}
                          </p>
                          {practice.testMode === "proctored" && (
                            <div className="row mt-3">
                              <div className="col-lg-5">
                                <h4 className="form-box_subtitle">
                                  Start Date
                                </h4>
                                {/* <p className="input-group datepicker-box border-bottom rounded-0">
                                  <input
                                    type="text"
                                    bsDatepicker
                                    disabled={practice.status === "revoked"}
                                    className="form-control"
                                    ngDefaultControl
                                    id="startDate"
                                    placeholder="Start date"
                                    value={practice.startDate}
                                    minDate={minDate}
                                    onChange={changeExpireDate}
                                    readOnly
                                  />
                                  <span className="input-group-btn">
                                    <span
                                      type="button"
                                      className="btn btn-date"
                                    >
                                      <i className="far fa-calendar-alt"></i>
                                    </span>
                                  </span>
                                </p> */}
                                <div style={{ display: "flex" }}>
                                  <p className="input-group datepicker-box border-bottom rounded-0">
                                    <DatePicker
                                      className="form-control"
                                      selected={practice.startDate || null}
                                      onChange={(date) =>
                                        setPractice({
                                          ...practice,
                                          startDate: date,
                                        })
                                      }
                                      dateFormat="dd-MM-yyyy "
                                      placeholderText="Start date"
                                      popperPlacement="bottom-start"
                                      popperModifiers={{
                                        preventOverflow: {
                                          enabled: true,
                                          escapeWithReference: false,
                                          boundariesElement: "viewport",
                                        },
                                      }}
                                    />
                                  </p>
                                  <span className="input-group-btn">
                                    <span
                                      type="button"
                                      className="btn btn-date"
                                      onClick={() => {
                                        // Toggle date picker by focusing on the input field
                                        if (datePickerRef.current) {
                                          datePickerRef.current.input.focus();
                                        }
                                      }}
                                    >
                                      <i className="far fa-calendar-alt"></i>
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {practice._id && practice.startDate && loaded && (
                                <div className="col-lg-4">
                                  <h4 className="form-box_subtitle">
                                    Start Time
                                  </h4>
                                  {/* <input
                                    type="time"
                                    value={practice.startDate.substring(11, 16)}
                                    onChange={(e) => {
                                      setPractice({
                                        ...practice,
                                        startDate: e.target.value,
                                      });
                                    }}
                                    disabled={practice.status === "revoked"}
                                    className="form-control"
                                  /> */}
                                  <div className="form-row flex-nowrap align-items-center">
                                    <input
                                      type="time"
                                      style={{ width: "50%" }}
                                      value={
                                        practice.startDate instanceof Date
                                          ? practice.startDate
                                              .toTimeString()
                                              .slice(0, 5)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const timeValue = e.target.value;
                                        const currentTime = new Date();
                                        const hours = parseInt(
                                          timeValue.split(":")[0]
                                        );
                                        const minutes = parseInt(
                                          timeValue.split(":")[1]
                                        );
                                        currentTime.setHours(hours, minutes);
                                        setPractice({
                                          ...practice,
                                          startDate: currentTime,
                                        });
                                      }}
                                      disabled={practice.status === "revoked"}
                                      className="form-control"
                                    />
                                    <div className="col-auto ml-auto">
                                      {practice.startDate && (
                                        <span
                                          className="cursor-pointer"
                                          onClick={clearStartDate}
                                        >
                                          X
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 offset-lg-2">
                    <div className="bg-white">
                      <div className="">
                        <div className="profile-info">
                          {practice.testMode === "proctored" && (
                            <div className="mb-3">
                              <h4 className="form-box_subtitle">
                                Allowance Time (minutes)
                              </h4>
                              <form>
                                <input
                                  className="form-control border-bottom rounded-0"
                                  type="text"
                                  name="search"
                                  placeholder=""
                                  appNumberOnly
                                  min="0"
                                  value={practice.startTimeAllowance}
                                  onChange={(e) =>
                                    setPractice({
                                      ...practice,
                                      startTimeAllowance: e.target.value,
                                    })
                                  }
                                />
                              </form>
                              <p>
                                {practice.status === "revoked"
                                  ? practice.startTimeAllowance
                                  : ""}
                              </p>
                            </div>
                          )}
                          <div className="row">
                            <div className="col-lg-5">
                              <h4 className="form-box_subtitle">
                                Expiration Date
                              </h4>
                              {/* <p className="input-group datepicker-box border-bottom rounded-0 ">
                                <input
                                  type="text"
                                  bsDatepicker
                                  bsConfig={{
                                    dateInputFormat: "DD-MM-YYYY",
                                    showWeekNumbers: false,
                                  }}
                                  name="expirationDate"
                                  className="form-control"
                                  id="expDate"
                                  placeholder="Expired date"
                                  // disabled={practice.status === "revoked"}
                                  value={practice.expiresOn}
                                  onChange={(e) =>
                                    setPractice({
                                      ...practice,
                                      expiresOn: e.target.value,
                                    })
                                  }
                                  minDate={minDate}
                                  
                                />
                                
                                <span className="input-group-btn">
                                  <span
                                    type="button"
                                    className="btn btn-date"
                                    onClick={() => { }}
                                  >
                                    <i className="far fa-calendar-alt"></i>
                                  </span>
                                </span>
                              </p> */}
                              <div style={{ display: "flex" }}>
                                <p className="input-group datepicker-box border-bottom rounded-0">
                                  <DatePicker
                                    className="form-control"
                                    selected={practice.expiresOn}
                                    onChange={(date) =>
                                      setPractice({
                                        ...practice,
                                        expiresOn: date,
                                      })
                                    }
                                    dateFormat="dd-MM-yyyy "
                                    placeholderText="Expired date"
                                    popperPlacement="bottom-start"
                                    popperModifiers={{
                                      preventOverflow: {
                                        enabled: true,
                                        escapeWithReference: false,
                                        boundariesElement: "viewport",
                                      },
                                    }}
                                  />
                                </p>
                                <span className="input-group-btn">
                                  <span
                                    type="button"
                                    className="btn btn-date"
                                    onClick={() => {
                                      // Toggle date picker by focusing on the input field
                                      if (datePickerRef.current) {
                                        datePickerRef.current.input.focus();
                                      }
                                    }}
                                  >
                                    <i className="far fa-calendar-alt"></i>
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="col-lg-4">
                              {practice.expiresOn && (
                                <h4 className="form-box_subtitle">End Time</h4>
                              )}
                              <div className="form-row flex-nowrap align-items-center">
                                <div className="col">
                                  {practice.expiresOn && (
                                    <input
                                      type="time"
                                      style={{ width: "50%" }}
                                      value={
                                        practice.expiresOn instanceof Date
                                          ? practice.expiresOn
                                              .toTimeString()
                                              .slice(0, 5)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const timeValue = e.target.value;
                                        const currentTime = new Date();
                                        const hours = parseInt(
                                          timeValue.split(":")[0]
                                        );
                                        const minutes = parseInt(
                                          timeValue.split(":")[1]
                                        );
                                        currentTime.setHours(hours, minutes);
                                        setPractice({
                                          ...practice,
                                          expiresOn: currentTime,
                                        });
                                      }}
                                      disabled={practice.status === "revoked"}
                                      className="form-control"
                                    />
                                  )}
                                </div>
                                <div className="col-auto ml-auto">
                                  {practice.expiresOn && (
                                    <span
                                      className="cursor-pointer"
                                      onClick={clearExpireDate}
                                    >
                                      X
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-boxes form-boxes text-black">
              <div className="class-board-info optionalCustom-settings2">
                <h4 className="form-box_title mb-2">Test Settings</h4>
                <div className="row">
                  <div className="col-lg-5">
                    <div className="bg-white">
                      <div className="profile-info">
                        {practice.testMode !== "learning" &&
                          practice.accessMode !== "buy" && (
                            <>
                              <div>
                                {practice.status !== "revoked" ? (
                                  <div className="mb-3">
                                    <strong>Offscreen Limit</strong>
                                    <input
                                      type="number"
                                      name="search"
                                      placeholder=""
                                      appNumberOnly
                                      min="0"
                                      value={practice.offscreenLimit}
                                      onChange={(e) => {
                                        setPractice({
                                          ...practice,
                                          offscreenLimit: e.target.value,
                                        });
                                      }}
                                      className="form-control border-bottom rounded-0"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="form-box_subtitle">
                                      Offscreen Limit
                                    </h4>
                                    <p>{practice.offscreenLimit}</p>
                                  </div>
                                )}
                              </div>

                              <div>
                                {practice.status !== "revoked" ? (
                                  <div className="mb-3 form-box_subtitle">
                                    <strong>Assessment View</strong>
                                    <select
                                      className="form-control border-bottom"
                                      name="state"
                                      value={practice.viewTemplate}
                                      onChange={(e) => {
                                        setPractice({
                                          ...practice,
                                          viewTemplate: e.target.value,
                                        });
                                      }}
                                    >
                                      <option value="" disabled>
                                        Select a Template
                                      </option>

                                      {viewTemplates?.map(
                                        (template: any, index: number) => (
                                          <option
                                            key={index}
                                            value={template.name}
                                          >
                                            {template.name}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="form-box_subtitle">
                                      Assessment View
                                    </h4>
                                    <p>{practice.viewTemplate || "default"}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                        <div
                          className="assess-set-toggle-box"
                          style={{ position: "relative", zIndex: "0" }}
                        >
                          <div
                            className="switch-item d-flex align-items-center float-none my-1"
                            style={{ float: "left" }}
                          >
                            <span className="assess-set-head">
                              Random questions
                            </span>
                            <label
                              className="switch col-auto ml-auto my-0 align-middle"
                              style={{ marginLeft: "18px" }}
                            >
                              <input
                                type="checkbox"
                                value={true}
                                disabled={practice.status === "revoked"}
                                checked={practice.randomQuestions}
                                onChange={(e) => {
                                  setPractice({
                                    ...practice,
                                    randomQuestions: !practice.randomQuestions,
                                  });
                                }}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>

                          <div
                            className="switch-item d-flex align-items-center float-none my-1"
                            style={{ float: "left" }}
                          >
                            <span className="assess-set-head">
                              Randomise answer options
                            </span>
                            <label
                              className="switch col-auto ml-auto my-0 align-middle"
                              style={{ marginLeft: "18px" }}
                            >
                              <input
                                type="checkbox"
                                value={true}
                                disabled={practice.status === "revoked"}
                                checked={practice.randomizeAnswerOptions}
                                onChange={(e) => {
                                  setPractice({
                                    ...practice,
                                    randomizeAnswerOptions:
                                      !practice.randomizeAnswerOptions,
                                  });
                                }}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>

                          <div
                            className="switch-item d-flex align-items-center float-none my-1"
                            style={{ float: "left" }}
                          >
                            <span className="assess-set-head">
                              Auto Evaluation
                            </span>
                            <label
                              className="switch col-auto ml-auto my-0 align-middle"
                              style={{ marginLeft: "18px" }}
                            >
                              <input
                                type="checkbox"
                                value={true}
                                disabled={practice.status === "revoked"}
                                checked={practice.autoEvaluation}
                                onChange={(e) => {
                                  setPractice({
                                    ...practice,
                                    autoEvaluation: !practice.autoEvaluation,
                                  });
                                }}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 offset-lg-2">
                    <div className="bg-white">
                      <div className="profile-info">
                        {practice.testMode !== "learning" &&
                          practice.accessMode !== "buy" && (
                            <div className="mb-3">
                              <strong>Attempts allowed per student</strong>
                              <form>
                                {practice.status !== "revoked" && (
                                  <input
                                    type="number"
                                    name="search"
                                    placeholder=""
                                    min="0"
                                    value={practice.attemptAllowed}
                                    onChange={(e) => {
                                      setPractice({
                                        ...practice,
                                        attemptAllowed: e.target.value,
                                      });
                                    }}
                                    className="form-control border-bottom rounded-0"
                                  />
                                )}
                              </form>
                              {practice.status === "revoked" && (
                                <p>{practice.attemptAllowed}</p>
                              )}
                            </div>
                          )}
                        <div
                          className="assess-set-toggle-box"
                          style={{ position: "relative", zIndex: "0" }}
                        >
                          <div
                            className="switch-item d-flex align-items-center float-none my-1"
                            style={{ float: "left" }}
                          >
                            <span className="assess-set-head">
                              Enable Calculator
                            </span>
                            <label
                              className="switch col-auto ml-auto my-0 align-middle"
                              style={{ marginLeft: "18px" }}
                            >
                              <input
                                type="checkbox"
                                checked={practice.showCalculator}
                                disabled={practice.status === "revoked"}
                                onChange={(e) => {
                                  setPractice({
                                    ...practice,
                                    showCalculator: !practice.showCalculator,
                                  });
                                }}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                          {practice.testMode === "proctored" && (
                            <div
                              className="switch-item d-flex align-items-center float-none my-1"
                              style={{ float: "left" }}
                            >
                              <span className="assess-set-head">
                                Student Camera
                              </span>
                              <label
                                className="switch col-auto ml-auto my-0 align-middle"
                                style={{ marginLeft: "18px" }}
                              >
                                <input
                                  type="checkbox"
                                  checked={practice.camera}
                                  disabled={practice.status === "revoked"}
                                  onChange={(e) => {
                                    setPractice({
                                      ...practice,
                                      camera: !practice.camera,
                                    });
                                  }}
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                          )}
                          {practice.testMode === "practice" && (
                            <div
                              className="switch-item d-flex align-items-center float-none my-1"
                              style={{ float: "left" }}
                            >
                              <span className="assess-set-head">
                                Fraud Detect
                              </span>
                              <label
                                className="switch col-auto ml-auto my-0 align-middle"
                                style={{ marginLeft: "18px" }}
                              >
                                <input
                                  type="checkbox"
                                  checked={practice.fraudDetect}
                                  disabled={practice.status === "revoked"}
                                  onChange={(e) => {
                                    setPractice({
                                      ...practice,
                                      fraudDetect: !practice.fraudDetect,
                                    });
                                  }}
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                          )}
                          {practice.sections &&
                            practice.sections.length &&
                            practice.enableSection && (
                              <div
                                className="switch-item d-flex align-items-center float-none my-1"
                                style={{ float: "left" }}
                              >
                                <span className="assess-set-head">
                                  Random Section
                                </span>
                                <label
                                  className="switch col-auto ml-auto my-0 align-middle"
                                  style={{ marginLeft: "18px" }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={practice.randomSection}
                                    disabled={practice.status === "revoked"}
                                    onChange={(e) => {
                                      setPractice({
                                        ...practice,
                                        randomSection: !practice.randomSection,
                                      });
                                    }}
                                  />
                                  <span className="slider round translate-middle-y"></span>
                                </label>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {practice.testMode === "practice" && (
              <div className="bg-white rounded-boxes form-boxes text-black">
                {practice.testMode === "practice" &&
                  user.primaryInstitute?.preferences.assessment.proctor && (
                    <>
                      <h4 className="form-box_title mb-2">Proctor Settings</h4>
                      <p>
                        Watch live test progress of a student including the
                        camera. Set start date, start time, expiration date and
                        expiration time on top of start time by which a student
                        can start the assessment
                      </p>

                      <div className="row my-2">
                        <div
                          className="col-lg-5"
                          style={{ position: "relative", zIndex: "0" }}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div
                              className="switch-item d-flex align-items-center float-none my-1"
                              style={{ float: "left" }}
                            >
                              <span className="assess-set-head">
                                Turn your assessment into proctor mode
                              </span>
                              <label
                                className="switch col-auto ml-auto my-0 align-middle"
                                style={{ marginLeft: "18px" }}
                              >
                                <input
                                  type="checkbox"
                                  // disabled={practice.status === "revoked"}
                                  checked={practice.isProctored}
                                  onChange={(e) => {
                                    setPractice({
                                      ...practice,
                                      isProctored: !practice.isProctored,
                                    });
                                  }}
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                          </div>
                          <p>
                            Turning this on will make your assessment proctored
                            where you can track your students live
                          </p>
                        </div>
                        <div className="col-lg-2"></div>
                        {practice.isProctored && (
                          <div
                            className="col-lg-5"
                            style={{ position: "relative", zIndex: "0" }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div
                                className="switch-item d-flex align-items-center float-none my-1"
                                style={{ float: "left" }}
                              >
                                <span className="assess-set-head">
                                  Watch student live
                                </span>

                                <label
                                  className="switch col-auto ml-auto my-0 align-middle"
                                  style={{ marginLeft: "18px" }}
                                >
                                  <input
                                    type="checkbox"
                                    value={true}
                                    // disabled={practice.status === "revoked"}
                                    checked={practice.camera}
                                    onChange={(e) => {
                                      setPractice({
                                        ...practice,
                                        camera: !practice.camera,
                                      });
                                    }}
                                  />
                                  <span className="slider round translate-middle-y"></span>
                                </label>
                              </div>
                            </div>
                            <p>
                              Student must start the camera and keep it ON when
                              taking the test
                            </p>
                          </div>
                        )}
                      </div>

                      {practice.isProctored && (
                        <div className="row my-3">
                          <div className="col-lg-5">
                            <div className="row">
                              <div className="col-lg-5">
                                <h4 className="form-box_subtitle">
                                  Start Date
                                </h4>
                                {/* <p className="input-group datepicker-box border-bottom rounded-0">
                              <input
                                type="text"
                                bsDatepicker
                                bsConfig={{ dateInputFormat: 'DD-MM-YYYY', showWeekNumbers: false }}
                                name="startdate"
                                className="form-control"
                                disabled={practice.status === 'revoked'}
                                id="startDate"
                                placeholder="Start date"
                                value={practice.startDate}
                                onChange={() => { }} // Handle change event
                                minDate={minDate}
                                readOnly
                              />
                              <span className="input-group-btn">
                                <span type="button" className="btn btn-date" onClick={() => dss.toggle()}>
                                  <i className="far fa-calendar-alt"></i>
                                </span>
                              </span>
                            </p> */}
                                <div style={{ display: "flex" }}>
                                  <p className="input-group datepicker-box border-bottom rounded-0">
                                    <DatePicker
                                      className="form-control"
                                      selected={practice.startDate}
                                      onChange={(date) =>
                                        setPractice({
                                          ...practice,
                                          startDate: date,
                                        })
                                      }
                                      dateFormat="dd-MM-yyyy "
                                      placeholderText="Start date"
                                      popperPlacement="bottom-start"
                                      popperModifiers={{
                                        preventOverflow: {
                                          enabled: true,
                                          escapeWithReference: false,
                                          boundariesElement: "viewport",
                                        },
                                      }}
                                    />
                                  </p>
                                  <span className="input-group-btn">
                                    <span
                                      type="button"
                                      className="btn btn-date"
                                      onClick={() => {
                                        // Toggle date picker by focusing on the input field
                                        if (datePickerRef.current) {
                                          datePickerRef.current.input.focus();
                                        }
                                      }}
                                    >
                                      <i className="far fa-calendar-alt"></i>
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {practice.startDate && (
                                <div className="col-lg-4">
                                  <h4 className="form-box_subtitle">
                                    Start Time
                                  </h4>
                                  <div className="form-row flex-nowrap align-items-center">
                                    <div className="col">
                                      <input
                                        type="time"
                                        value={
                                          practice.startDate instanceof Date
                                            ? practice.startDate
                                                .toTimeString()
                                                .slice(0, 5)
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const timeValue = e.target.value;
                                          const currentTime = new Date();
                                          const hours = parseInt(
                                            timeValue.split(":")[0]
                                          );
                                          const minutes = parseInt(
                                            timeValue.split(":")[1]
                                          );
                                          currentTime.setHours(hours, minutes);
                                          setPractice({
                                            ...practice,
                                            startDate: currentTime,
                                          });
                                        }}
                                        disabled={practice.status === "revoked"}
                                        className="form-control"
                                      />
                                    </div>
                                    <div className="col-auto ml-auto">
                                      {practice.startDate && (
                                        <span
                                          className="cursor-pointer"
                                          onClick={clearStartDate}
                                        >
                                          X
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-lg-2"></div>
                          <div className="col-lg-5">
                            <div className="row">
                              <div className="col-lg-5">
                                <h4 className="form-box_subtitle">
                                  Expiration Date
                                </h4>
                                {/* <p className="input-group datepicker-box border-bottom rounded-0 ">
                              <input
                                type="text"
                                bsDatepicker
                                bsConfig={{ dateInputFormat: 'DD-MM-YYYY', showWeekNumbers: false }}
                                name="expirationDate"
                                className="form-control"
                                id="expDate"
                                placeholder="Expired date"
                                disabled={practice.status === 'revoked'}
                                value={practice.expiresOn}
                                onChange={() => { }} // Handle change event
                                minDate={minDate}
                                readOnly
                              />
                              <span className="input-group-btn">
                                <span type="button" className="btn btn-date" onClick={() => d.toggle()}>
                                  <i className="far fa-calendar-alt"></i>
                                </span>
                              </span>
                            </p> */}
                                <div style={{ display: "flex" }}>
                                  <p className="input-group datepicker-box border-bottom rounded-0">
                                    <DatePicker
                                      className="form-control"
                                      selected={practice.expiresOn}
                                      onChange={(date) =>
                                        setPractice({
                                          ...practice,
                                          expiresOn: date,
                                        })
                                      }
                                      dateFormat="dd-MM-yyyy "
                                      placeholderText="Expired date"
                                      popperPlacement="bottom-start"
                                      popperModifiers={{
                                        preventOverflow: {
                                          enabled: true,
                                          escapeWithReference: false,
                                          boundariesElement: "viewport",
                                        },
                                      }}
                                    />
                                  </p>
                                  <span className="input-group-btn">
                                    <span
                                      type="button"
                                      className="btn btn-date"
                                      onClick={() => {
                                        // Toggle date picker by focusing on the input field
                                        if (datePickerRef.current) {
                                          datePickerRef.current.input.focus();
                                        }
                                      }}
                                    >
                                      <i className="far fa-calendar-alt"></i>
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {practice.expiresOn && (
                                <div className="col-lg-4">
                                  <h4 className="form-box_subtitle">
                                    End Time
                                  </h4>
                                  <div className="form-row flex-nowrap align-items-center">
                                    <div className="col">
                                      <div className="form-row flex-nowrap align-items-center">
                                        <div className="col">
                                          <input
                                            type="time"
                                            value={
                                              practice.expiresOn instanceof Date
                                                ? practice.expiresOn
                                                    .toTimeString()
                                                    .slice(0, 5)
                                                : ""
                                            }
                                            onChange={(e) => {
                                              const timeValue = e.target.value;
                                              const currentTime = new Date();
                                              const hours = parseInt(
                                                timeValue.split(":")[0]
                                              );
                                              const minutes = parseInt(
                                                timeValue.split(":")[1]
                                              );
                                              currentTime.setHours(
                                                hours,
                                                minutes
                                              );
                                              setPractice({
                                                ...practice,
                                                expiresOn: currentTime,
                                              });
                                            }}
                                            disabled={
                                              practice.status === "revoked"
                                            }
                                            className="form-control"
                                          />
                                        </div>
                                        <div className="col-auto ml-auto">
                                          {practice.expiresOn && (
                                            <span
                                              className="cursor-pointer"
                                              onClick={clearExpireDate}
                                            >
                                              X
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {practice.isProctored && (
                        <div className="row my-2">
                          <div className="col-lg-5">
                            <h4 className="form-box_subtitle">
                              Allowance Time (minutes)
                            </h4>
                            <p>
                              How late a student can start the test (after the
                              start time)
                            </p>
                            <form>
                              <input
                                className="form-control border-bottom rounded-0"
                                type="text"
                                name="search"
                                placeholder=""
                                appNumberOnly
                                min="0"
                                value={practice.startTimeAllowance}
                                onChange={(e) => {
                                  setPractice({
                                    ...practice,
                                    startTimeAllowance: e.target.value,
                                  });
                                }}
                                disabled={practice.status === "revoked"}
                              />
                            </form>
                            {practice.status === "revoked" && (
                              <p>{practice.startTimeAllowance}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
            )}
            {practice.testMode !== "learning" && (
              <div className="class-board-info optionalCustom-settings2">
                <div className="bg-white rounded-boxes form-boxes text-black">
                  <h4 className="form-box_title mb-2">Optional Settings</h4>
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="bg-white">
                        <div className="">
                          <div
                            className="profile-info"
                            style={{ position: "relative", zIndex: "0" }}
                          >
                            <div className="assess-set-toggle-box">
                              <div
                                className="switch-item d-flex align-items-center float-none my-1"
                                style={{ float: "left" }}
                              >
                                <span className="assess-set-head">
                                  Allow students to view answer
                                </span>
                                <label
                                  className="switch col-auto ml-auto my-0 align-middle"
                                  style={{ marginLeft: "18px" }}
                                >
                                  <input
                                    type="checkbox"
                                    name="isShowResult"
                                    checked={practice.isShowResult}
                                    onChange={() => {
                                      setPractice({
                                        ...practice,
                                        isShowResult: !practice.isShowResult,
                                      });
                                    }}
                                  />
                                  <span className="slider round translate-middle-y"></span>
                                </label>
                              </div>
                              <div
                                className="switch-item d-flex align-items-center float-none my-1"
                                style={{ float: "left" }}
                              >
                                <span className="assess-set-head">
                                  Allow students to view attempt
                                </span>
                                <label
                                  className="switch col-auto ml-auto my-0 align-middle"
                                  style={{ marginLeft: "18px" }}
                                >
                                  <input
                                    type="checkbox"
                                    name="isShowAttempt"
                                    checked={practice.isShowAttempt}
                                    onChange={() => {
                                      setPractice({
                                        ...practice,
                                        isShowAttempt: !practice.isShowAttempt,
                                      });
                                    }}
                                  />
                                  <span className="slider round translate-middle-y"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-2"></div>
                    <div className="col-lg-5">
                      <div
                        className="profile-info bg-white"
                        style={{ position: "relative", zIndex: "0" }}
                      >
                        <div className="assess-set-toggle-box">
                          <div
                            className="switch-item d-flex align-items-center float-none my-1"
                            style={{ float: "left" }}
                          >
                            <span className="assess-set-head">
                              Ask feedback at the End of the test?
                            </span>
                            <label
                              className="switch col-auto ml-auto my-0 align-middle"
                              style={{ marginLeft: "18px" }}
                            >
                              <input
                                type="checkbox"
                                name="isShowFeedback"
                                checked={practice.showFeedback}
                                onChange={() => {
                                  setPractice({
                                    ...practice,
                                    showFeedback: !practice.showFeedback,
                                  });
                                }}
                                disabled={practice.status === "revoked"}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-boxes form-boxes text-black">
                  <h4 className="form-box_title mb-2">Demographic Settings</h4>
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="bg-white">
                        <div className="">
                          <div className="profile-info">
                            <div className="assess-set-toggle-box clearfix">
                              <div className="switch-item d-flex justify-content-left align-items-center float-none my-1">
                                <span className="form-box_subtitle">
                                  Collect Demographic Data
                                </span>
                                <label className="col-auto ml-auto switch">
                                  <input
                                    id="additionalnfo"
                                    type="checkbox"
                                    name="additionalnfo"
                                    value={1}
                                    checked={reqAdditionalnfo}
                                    onChange={(e) =>
                                      setReqAdditionalnfo(!reqAdditionalnfo)
                                    }
                                    disabled={practice.status === "revoked"}
                                  />

                                  <span className="slider round translate-middle-y"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {reqAdditionalnfo && (
                    <div className="row px-3">
                      <label className="container2 col-3 pl-4">
                        Roll Number
                        <input
                          type="checkbox"
                          checked={practice.demographicData.rollNumber}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                rollNumber:
                                  !practice.demographicData.rollNumber,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Identification Number
                        <input
                          type="checkbox"
                          checked={
                            practice.demographicData.identificationNumber
                          }
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                identificationNumber:
                                  !practice.demographicData
                                    .identificationNumber,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        State
                        <input
                          type="checkbox"
                          checked={practice.demographicData.state}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                state: !practice.demographicData.state,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Passing Year
                        <input
                          type="checkbox"
                          checked={practice.demographicData.passingYear}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                passingYear:
                                  !practice.demographicData.passingYear,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Branch
                        <input
                          type="checkbox"
                          checked={practice.demographicData.coreBranch}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                coreBranch:
                                  !practice.demographicData.coreBranch,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Date of Birth
                        <input
                          type="checkbox"
                          checked={practice.demographicData.dob}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                dob: !practice.demographicData.dob,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        City
                        <input
                          type="checkbox"
                          checked={practice.demographicData.city}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                city: !practice.demographicData.city,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Gender
                        <input
                          type="checkbox"
                          checked={practice.demographicData.gender}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                gender: !practice.demographicData.gender,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        College Name
                        <input
                          type="checkbox"
                          checked={practice.demographicData.collegeName}
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                collegeName:
                                  !practice.demographicData.collegeName,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      <label className="container2 col-3 pl-4">
                        Identity Verification
                        <input
                          type="checkbox"
                          checked={
                            practice.demographicData.identityVerification
                          }
                          onChange={(e) => {
                            setPractice({
                              ...practice,
                              demographicData: {
                                identityVerification:
                                  !practice.demographicData
                                    .identityVerification,
                              },
                            });
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>

                      {newDemographicFields.map((field, i) => (
                        <label key={i} className="container2 col-3 pl-4">
                          {field.label}
                          {!isEditDemographic ||
                          (isEditDemographic && selectedFieldIndex !== i) ? (
                            <span className="fas fa-edit"></span>
                          ) : (
                            <span>
                              <input
                                type="text"
                                className="border-bottom rounded-0"
                                value={field.label}
                              />
                              <i
                                style={{ marginLeft: "160px" }}
                                className="fa fa-check"
                                onClick={() => editField(field, i, true)}
                              ></i>
                            </span>
                          )}
                          <input
                            id="checked"
                            checked={field.value}
                            onChange={(e) => {
                              const updatedFields = [...newDemographicFields];
                              updatedFields[i] = {
                                ...field,
                                value: !field.value,
                              };
                              setNewDemographicFields(updatedFields);
                            }}
                            type="checkbox"
                          />
                          <span className="checkmark1 translate-middle-y"></span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="col-auto ml-auto ">
            <div className="col-auto ml-auto">
              <div className="new-flex-box">
                <button
                  name="previous-step"
                  className="previous-step btn btn-outline"
                  onClick={previousStep}
                >
                  Previous Step
                </button>
                {practice.status !== "revoked" ? (
                  <div className="upload-btn1-remove assess-setting-common-remove ml-2">
                    <button
                      className="btn btn-primary"
                      onClick={nextStepAndSave}
                    >
                      Save & Next
                    </button>
                  </div>
                ) : (
                  <div className="upload-btn1-remove assess-setting-common-remove">
                    <button
                      className="btn btn-primary ml-2"
                      onClick={nextStep1}
                    >
                      Next
                    </button>
                    {saving && (
                      <div className="saving-box">
                        Saving...<i className="fa fa-pulse fa-spinner"></i>
                      </div>
                    )}
                  </div>
                )}
                {saving && (
                  <div className="saving-box">
                    Saving...<i className="fa fa-pulse fa-spinner"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      )}
      {currentGfgStep == 4 && (
        <fieldset className="content ck-editInstruckSett">
          <div className="row">
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <div className="clearfix">
                  <div className="class-board-info optionalCustom-settings2">
                    <h4 htmlFor="exampleInputEmail1" className="form-box_title">
                      Instructions
                    </h4>
                    <p className="mt-2">
                      Use this to provide any special/custom instructions to
                      your students before starting the assessment. It will be
                      shown just before the assessment starts. If you don&apos;t
                      provide, the instruction text will be empty.
                    </p>

                    {practice &&
                      practice._id &&
                      practice.status !== "revoked" && (
                        <div className="editor mt-2">
                          <CKEditorCustomized
                            defaultValue={practice.instructions}
                            className="form-control ml-2"
                            style={{
                              border: "1px solid #ced4da",
                              width: "90%",
                            }}
                            config={{
                              placeholder: "Write Instrunction.",
                              mediaEmbed: { previewsInData: true },
                            }}
                            onChangeCon={(data) => {
                              setPractice({
                                ...practice,
                                instructions: data,
                              });
                            }}
                          />
                        </div>
                      )}

                    {practice.status === "revoked" && (
                      <div>
                        <MathJax value={practice.instructions} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="bg-white rounded-boxes form-boxes text-black">
                <div className="clearfix">
                  <div className="class-board-info optionalCustom-settings2">
                    <h4 htmlFor="exampleInputEmail1" className="form-box_title">
                      Internal Notes
                    </h4>
                    <p className="mt-2">
                      This will be visible only to your teachers. It is meant to
                      share information when multiple teachers are working on
                      the development of an assessment.
                    </p>

                    {practice &&
                      practice._id &&
                      practice.status !== "revoked" && (
                        <div className="editor mt-2">
                          <CKEditorCustomized
                            defaultValue={practice.notes}
                            className="form-control ml-2"
                            config={{
                              placeholder: "Write Instructions.",
                              mediaEmbed: { previewsInData: true },
                            }}
                            onChangeCon={(data) => {
                              setPractice({
                                ...practice,
                                notes: data,
                              });
                            }}
                          />
                        </div>
                      )}
                    {practice.status === "revoked" && (
                      <div>
                        <MathJax value={practice.notes} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-auto d-flex flex-wrap flex-row-reverse mt-1 gap-xs">
                {(practice.status === "revoked" ||
                  (practice.status === "published" && practice.isExpired)) && (
                  <button
                    className="btn btn-danger"
                    onClick={removePractice}
                    disabled={deleting}
                  >
                    Remove Permanently
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    user.role === "mentor" && practice.user._id !== "123"
                  }
                  onClick={() => savePracticeSets(5)}
                >
                  Save
                </button>
                {practice.status === "draft" && !practice.isExpired && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => publish(practice)}
                    disabled={
                      practice.user.role === "mentor" &&
                      practice.user._id !== "123"
                    }
                  >
                    Publish
                  </button>
                )}
                {practice.status === "published" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => deactive(practice)}
                  >
                    Withdraw
                  </button>
                )}
                {(practice.status === "draft" ||
                  practice.status === "tempt") && (
                  <button
                    className="btn btn-danger"
                    disabled={
                      practice.user.role === "mentor" &&
                      practice.user._id !== "123"
                    }
                    onClick={removePractice}
                  >
                    Delete
                  </button>
                )}
                <button
                  name="previous-step"
                  onClick={previousStep}
                  className="previous-step btn btn-outline"
                >
                  Previous Step
                </button>
              </div>
            </div>
          </div>
        </fieldset>
      )}
    </form>
  );
};

export default SettingsComponent;
