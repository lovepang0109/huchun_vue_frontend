"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import PImageComponent from "@/components/AppImage";
import ItemPrice from "@/components/ItemPrice";
import CustomCarousel from "@/components/assessment/carousel";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { arrayToString } from "@/lib/pipe";
import { elipsisText, toQueryString } from "@/lib/validator";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clientApi from "@/lib/clientApi";
import * as practiceService from "@/services/practiceService";
import * as questionSvc from "@/services/questionService";
import * as attemptSvc from "@/services/attemptService";
import * as favoriteSvc from "@/services/favaorite-service";
import * as shoppingCartService from "@/services/shopping-cart-service";
import * as settingSvc from "@/services/settingService";
import * as subjectService from "@/services/subjectService";
import * as userService from "@/services/userService";
import { confirm, error, alert, success } from "alertifyjs";
import UploadAssessmentModal from "@/components/assessment/upload-assessment-modal";
import CreateAssessmentModal from "@/components/assessment/create-assessment-modal";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter } from "next/navigation";

const TeacherAssessment = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { push } = useRouter();
  const [clientData, setClientData] = useState<any>();
  const fileBrowseRef = useRef(null);
  const [showCreateAssessmentModal, setShowCreateAssessmentModal] =
    useState<boolean>(false);
  const [showUploadAssessmentModal, setShowUploadAssessmentModal] =
    useState<boolean>(false);
  const [publishedTests, setPublishedTests] = useState<any[]>([]);
  const [publishedLoaded, setPublishedLoaded] = useState<boolean>(false);
  const [draftTests, setDraftTests] = useState<any[]>([]);
  const [draftLoaded, setDraftLoaded] = useState<boolean>(false);
  const [archivedTests, setArchivedTests] = useState<any[]>([]);
  const [archivedLoaded, setArchivedLoaded] = useState<boolean>(false);
  const [privateTests, setPrivateTests] = useState<any[]>([]);
  const [privateLoaded, setPrivateLoaded] = useState<boolean>(false);
  const [buyTests, setBuyTests] = useState<any[]>([]);
  const [buyLoaded, setBuyLoaded] = useState<boolean>(false);
  const [internalTests, setInternalTests] = useState<any[]>([]);
  const [internalLoaded, setInternalLoaded] = useState<boolean>(false);
  const [listSubjects, setListSubjects] = useState<any[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 8,
    sort: "updatedAt,-1",
    excludeUser: true,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchPractices, setSearchPractices] = useState<any[]>([]);
  const [searchloading, setSearchLoading] = useState<boolean>(false);
  const [searchInternal, setSearchInternal] = useState<boolean>(false);
  const [hasTests, setHasTests] = useState<boolean>(false);
  const [practicesCount, setPracticesCount] = useState<any>();
  const [addToQB, setAddToQB] = useState<any>({ value: "self" });
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [cTags, setCTags] = useState<any[]>([]);
  const [userSubjects, setUserSubjects] = useState<any[]>([]);
  const [marketplaceTests, setMarketplaceTests] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [myTests, setMyTests] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>();
  const [attemptedLoaded, setAattemptedLoaded] = useState<boolean>(false);
  const [recentLoaded, setRecentLoaded] = useState<boolean>(false);
  const [myTestLoaded, setMyTestLoaded] = useState<boolean>(false);
  const [favoriteLoaded, setFavoriteLoaded] = useState<boolean>(false);
  const [generalTestLoaded, setGeneralTestLoaded] = useState<boolean>(false);
  const [noTag, setNoTag] = useState<string>("");
  const [generalTests, setGeneralTests] = useState<any[]>([]);
  const [QOD, setQOD] = useState<any[]>([]);
  const [allLoadedSections, setAllLoadedSections] = useState<any[]>([]);
  const [opening, setOpening] = useState<boolean>(false);

  useEffect(() => {
    userService.get().then((us) => {
      clientApi.get(`/api/settings`).then((res) => {
        setClientData(res.data);
        if (
          res.data.features?.marketplace &&
          (us.role == "director" || us.role == "admin")
        ) {
          practiceService
            .getPublisherAssessments({ ...params })
            .then((tests: any[]) => {
              tests.sort((a, b) => b.enrolled - a.enrolled);
              tests.forEach((item) => {
                item.addedToCart = shoppingCartService.isItemAdded(item);
              });
              setMarketplaceTests(processTests(tests, us));
              setHasTests(tests.length > 0);
            });
        }
      });
      attemptSvc.getRecentAttempts({ limit: 8 }).then((res: []) => {
        setAattemptedLoaded(true);
        setRecentAttempts(res?.attempts);
        setHasTests(res.length > 0);
      });

      practiceService
        .getPurchasedTests({ ...params })
        .then(({ tests }: any) => {
          setRecentLoaded(true);
          setRecentTests(processTests(tests, us));
          setHasTests(tests.length > 0);
        });

      practiceService
        .findTeacherTests({
          ...params,
          centerOwned: true,
          includeFields: "classRooms",
        })
        .then(({ tests }: any) => {
          setMyTests(processTests(tests, us));
          setMyTestLoaded(true);
          setHasTests(tests.length > 0);
        });

      favoriteSvc
        .findPractices({
          page: 1,
          limit: 6,
          excludeUser: true,
          showClassrooms: true,
          showAttempts: true,
          getPreference: true,
        })
        .then((tests: any[]) => {
          setFavorites(processTests(tests, us, true));
          setFavoriteLoaded(true);
          setHasTests(tests.length > 0);
        });

      practiceService.listSubject().then((res: any[]) => {
        setListSubjects(res);
        setSubjectsLoaded(true);
      });

      settingSvc.findOne("contentOrganizer").then((conf: any) => {
        let tags = [];
        const updatedSections = [...sections];
        if (conf?.assessment?.length) {
          for (const sec of conf.assessment) {
            if (sec.visible) {
              tags = [...tags, ...sec.tags];
              updatedSections.push(sec);
              practiceService
                .findTeacherTests({
                  ...params,
                  tags: sec.tags.join(","),
                  sort: "title,1",
                  includeFields: "classRooms",
                })
                .then((secResult: any) => {
                  sec.tests = processTests(secResult.tests, us);
                  setHasTests(secResult.length > 0);
                });
            }
          }
          setSections(updatedSections);
        }

        setNoTag(tags.join(","));
        practiceService
          .findTeacherTests({
            ...params,
            noTag: tags.join(","),
            publisherPushed: true,
            includeFields: "classRooms",
          })
          .then(({ tests }: any) => {
            setGeneralTests(processTests(tests, us));
            setGeneralTestLoaded(true);
            setHasTests(tests.length > 0);
          });
      });

      if (us.primaryInstitute.preferences.general.questionOfDay) {
        questionSvc.getQuestionOfDay({ ignoreAnswered: true }).then((qod) => {
          setQOD(qod);
        });
      }
    });
  }, []);

  const publish = async (practice: any) => {
    if (practice._id) {
      if (practice.accessMode == "public" && user?.role == "mentor") {
        alert(
          "Message",
          "You can not publish practice test with access mode is free."
        );
        return;
      }
      if (!practice.startDate && practice.isProctored) {
        alert("Message", "Start date is required");
        return;
      }

      try {
        const copy = Object.assign({}, practice);
        const lastData = copy;
        lastData.status = "published";
        lastData.statusChangedAt = new Date().getTime();

        await clientApi.get(
          `/api/tests/checkQuestionsBeforePublish/${practice._id}`
        );
        confirm(
          "Are you sure you want to publish this Assessment?",
          async () => {
            const copy = Object.assign({}, practice);
            const lastData = practice;
            lastData.status = "published";
            lastData.statusChangedAt = new Date().getTime();
            try {
              const session = await getSession();
              await clientApi.put(
                `https://newapi.practiz.xyz/api/v1/tests/${practice._id}`,
                lastData,
                {
                  headers: {
                    instancekey: session?.instanceKey,
                    Authorization: `bearer ${session?.accessToken}`,
                  },
                }
              );
              practice = {
                ...practice,
                status: "published",
                statusChangeAt: new Date().getTime(),
              };
              if (practice.accessMode == "public") {
                setPublishedTests([practice, ...publishedTests]);
              } else if (practice.accessMode == "invitation") {
                setPrivateTests([practice, ...privateTests]);
              } else if (practice.accessMode == "buy") {
                setBuyTests([practice, ...buyTests]);
              }
              const idx = draftTests.findIndex(
                (t: any) => t._id == practice._id
              );
              if (idx > -1) {
                let draft = draftTests;
                draft.splice(idx, 1);
                setDraftTests(draft);
              }
              success("Practice test published successfully.");
            } catch (err: any) {
              if (err.params) {
                alert("Message", err.message);
              } else {
                alert("Message", err);
              }
            }
          }
        );
      } catch (err: any) {
        if (err.response.data.msg) {
          alert("Message", err.response.data.msg);
        } else {
          alert("Message", "Somethng went wrong, Please try after sometime.");
        }
      }
    }
  };

  const search = async (searchTxt: string, isIntenal = searchInternal) => {
    setSearchText(searchTxt);
    let param = { ...params, page: 1 };
    setParams(param);

    if (searchTxt === "") {
      setIsSearch(false);
      setSearchPractices([]);
    } else {
      setSearchLoading(true);
      setIsSearch(true);
      setSearchPractices([]);

      let searchParams = {
        ...param,
        limit: 12,
        title: searchTxt,
        includeCount: true,
        ...(isIntenal && { accessMode: "internal" }),
      };
      if (searchParams.upcoming) {
        delete searchParams.upcoming;
      }
      try {
        const { data } = await clientApi.post(
          "/api/tests/teacher/find",
          searchParams
        );
        let { total, tests } = data;
        setPracticesCount(total);
        tests.forEach((t) => {
          t.canEdit =
            (user.role != "teacher" && user.role != "mentor") ||
            t.user == user._id ||
            (t.instructors && t.instructors.find((i) => i == user._id));
        });
        setSearchPractices(tests);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const loadMore = async () => {
    let param = { ...params, page: params.page + 1 };
    setParams(param);
    let searchParams = {
      ...param,
      limit: 12,
      title: searchText,
      ...(searchInternal && { accessMode: "internal" }),
    };

    if (searchParams.upcoming) {
      delete searchParams.upcoming;
    }

    const { data } = await clientApi.post(
      "/api/tests/teacher/find",
      searchParams
    );
    setSearchPractices(
      searchPractices.concat(
        data.tests.map((t: any) => ({
          ...t,
          canEdit:
            (user?.role != "teacher" && user?.role != "mentor") ||
            t.user == user.info._id ||
            (t.instructors &&
              t.instructors.find((i: any) => i == user.info._id)),
        }))
      )
    );
  };

  const clearSearch = () => {
    setSearchText("");
    search("");
  };

  const cancel = (val: any) => {
    // paramsModal = {
    //   grade: '',
    //   subject: '',
    //   topic: [],
    //   isAdaptive: false,
    //   learningMode: false
    // };
    // practice = {};
    // selectedSubjects = [];
    // selectedUnits = [];
    // practiceUnits = [];
    // paramTopic = '';
    // bsModalRef.hide();
  };

  const accessModeFilterChanged = () => {
    setSearchInternal(!searchInternal);
    search(searchText, !searchInternal);
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const openModal = async (template: any, loadSubject: boolean = true) => {
    setUploadFile(null);
    setTags([]);
    setAddToQB({ value: "self" });
    setCTags([]);
    if (template === "createAssessment") {
      if (loadSubject && userSubjects.length === 0) {
        setOpening(true);
        const res: any = await subjectService.getMine({ unit: true });
        setUserSubjects(res);
        try {
          setOpening(true);
          const res: any = await subjectService.getMine({ unit: true });
          setUserSubjects(res);
        } catch (ex) {
          console.log(ex);
          alert("Message", "Fail to load your subjects.");
        } finally {
          setOpening(false);
        }
      }
      setShowCreateAssessmentModal(true);
    } else if (template === "uploadassessment") {
      setShowUploadAssessmentModal(true);
    }
  };

  const upload = async (file: any) => {
    let formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("QB", "false");
    formData.append("overwritten", "true");

    if (addToQB) {
      formData.append("isAllowReuse", addToQB.value);
    }

    if (tags && tags.length > 0) {
      formData.append("tags", tags.map((t: any) => t.text).join(","));
    }
    console.log("tags: ", formData);
    if (file["isDocm"]) {
      if (selectedProfile.name) {
        formData.append("profile", selectedProfile.name);
      } else {
        // Default
        formData.append("profile", "Perfectice Core");
      }
    }
    try {
      await clientApi.post("/api/tests/import", formData);
      success("Uploaded successfully");
      setShowUploadAssessmentModal(false);
      const { data } = await clientApi.post("/api/tests/teacher/find", {
        page: 1,
        limit: 8,
        sort: "updatedAt,-1",
        status: "draft",
      });
      setDraftTests(
        data.test.map((d: any) => ({
          ...d,
          slugfly: d.title.replace(/\s+/g, "-"),
          canEdit:
            (user?.role != "teacher" && user?.role != "mentor") ||
            d.user == user.info._id ||
            (d.instructors &&
              d.instructors.find((i: any) => i == user.info._id)),
        }))
      );
      setDraftLoaded(true);
    } catch (error: any) {
      if (error.response === "OK") {
        setUploadFile(null);
        success("Uploaded successfully");
        return;
      }
      if (error.response.message == "Duplicate test name") {
        alert(
          "Message",
          "Name of practice is duplicated with existing one in sheet `Practice Test`, please change the name."
        );
      } else {
        alert(
          "Message",
          "Practice test processing failed. A detailed reason has been sent in your registered email. Please fix and upload again."
        );
      }
    }
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const viewMarketplaceTest = (test) => {
    push(`/view-assessment/${test._id}`);
  };

  const viewTest = (test: any) => {
    if (test.isFromMarketPlace) {
      push(`/view-assessment/${test._id}`);
    } else {
      push(`/assessment/details/${test._id}`);
    }
  };

  const processTests = (tests, user: any, notInclude = false) => {
    const data = tests.map((d) => {
      d.slugfly = d.title.replace(/\s+/g, "-");
      d.canEdit =
        (user.role != "teacher" && user.role != "mentor") ||
        d.user == user._id ||
        (d.instructors && d.instructors.find((i) => i == user._id));
      return d;
    });

    if (!notInclude) {
      setAllLoadedSections([...allLoadedSections, ...data]);
    }

    return data;
  };

  const onFavoriteChanged = (ev: any) => {
    favoriteSvc
      .findPractices({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
        showAttempts: true,
        getPreference: true,
      })
      .then((tests: any[]) => {
        setFavorites(processTests(tests, user, true));
      });

    const updatedAllLoadedSections = [...allLoadedSections];

    for (const test of updatedAllLoadedSections) {
      if (test._id == ev._id) {
        test.isFavorite = ev.favorite;
      }
    }
    setAllLoadedSections(updatedAllLoadedSections);
  };

  const reviewTest = (test: any) => {
    if (!test.totalQuestion) {
      alert(
        "Message",
        "No questions are added to review. Please add some questions in assessment to review."
      );
      return;
    }
    push(`/assessment/review/${test._id}`);
  };

  const PublishedItem = (test: any) => {
    test = test.test;
    return (
      <div className="box-item p-0" style={{ width: "255px" }}>
        <div className="box box_new bg-white pt-0" style={{ width: "255px" }}>
          <div
            className="image-wrap cursor-pointer"
            onClick={() => viewTest(test)}
          >
            <PImageComponent
              height={120}
              fullWidth
              imageUrl={test.imageUrl}
              backgroundColor={test.colorCode}
              text={test.title}
              radius={9}
              fontSize={15}
              type="assessment"
              testMode={test.testMode}
              testType={test.testType}
              isProctored={test.isProctored}
            />
            <FavoriteButton
              item={test}
              type="test"
              onChanged={onFavoriteChanged}
            />
          </div>
          <div className="box-inner box-inner_new">
            {/* Mode-TAG */}
            {!test.assignee && (
              <div className="Box-inner-accessModeTags">
                {test.accessMode !== "buy" && (
                  <>
                    {["internal", "public"].includes(test.accessMode) && (
                      <div className="border-0 box-inner_tag">
                        <div className="d-flex align-items-center">
                          <span className="material-icons">
                            {test.accessMode === "internal"
                              ? "lock"
                              : "lock_open"}
                          </span>
                          <div className="stud2 subjctViewAll">
                            <strong>
                              {test.accessMode === "public"
                                ? "PUBLIC"
                                : "INTERNAL"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                    {test.accessMode === "invitation" && (
                      <div className="text-ellipsis pt-1 h6">
                        <img
                          src="/assets/images/bottom-tabs/classroom.svg"
                          className="classroom-icon"
                          alt="Classroom"
                        />
                        &nbsp;&nbsp;
                        {test.classRooms.length
                          ? test.classRooms.map((room) => room.name).join(", ")
                          : "No classroom"}
                      </div>
                    )}
                  </>
                )}
                {test.accessMode === "buy" && (
                  <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                    <ItemPrice content={test} />
                  </div>
                )}
              </div>
            )}
            {test.assignee && (
              <div className="Box-inner-accessModeTags">
                <div className="text-ellipsis pt-1 h6">
                  <span className="material-icons">lock</span>
                  {test.assignee.name}
                </div>
              </div>
            )}
            {/* END */}
            <div className="info p-0 m-0">
              <h4
                data-toggle="tooltip"
                data-placement="top"
                title={test.title}
                className="mt-0 mb-0 cursor-pointer"
                onClick={() => viewTest(test)}
              >
                {test.title}
              </h4>
              <div className="form-row">
                <div className="col sub1_new text-truncate">
                  {test.subjects && test.subjects.length && (
                    <a>
                      {test.subjects[0].name}
                      {test.subjects.length > 1 &&
                        ` + ${test.subjects.length - 1} more`}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="Box-inner-1">
              <div className="form-row mt-1">
                <div className="detailed col-6 small">
                  <div className="d-flex align-items-center">
                    <span className="material-icons">content_paste</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong>
                        {test.totalQuestion > 0 ? test.totalQuestion : "No"}
                      </strong>{" "}
                      questions
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="material-icons">timelapse</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong className="text-black">{test.totalTime}</strong>{" "}
                      minutes
                    </span>
                  </div>
                </div>

                <div className="detailed col-6 small">
                  <div className="d-flex align-items-center">
                    <span className="material-icons">people</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong>
                        {test.totalJoinedStudent > 0
                          ? test.totalJoinedStudent
                          : "No"}
                      </strong>{" "}
                      {test.totalJoinedStudent === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="material-icons">assignment</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong>
                        {test.totalAttempt > 0 ? test.totalAttempt : "No"}
                      </strong>{" "}
                      Attempt(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row mt-2">
                <div className="col">
                  <a
                    className="btn btn-outline btn-sm d-block"
                    onClick={() => reviewTest(test)}
                  >
                    Review
                  </a>
                </div>
                {test.canEdit && (
                  <div className="col">
                    <a
                      className="btn btn-buy btn-sm d-block"
                      onClick={() => viewTest(test)}
                    >
                      View Details
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const PublishedItemSm = (test: any) => (
    <div className="box-item p-0">
      <div className="box box_new bg-white pt-0">
        <div
          className="image-wrap cursor-pointer"
          onClick={() => viewTest(test)}
        >
          <PImageComponent
            height={111}
            fullWidth
            imageUrl={test.imageUrl}
            backgroundColor={test.colorCode}
            text={test.title}
            radius={9}
            fontSize={15}
            type="assessment"
            testMode={test.testMode}
            testType={test.testType}
            isProctored={test.isProctored}
          />
          <FavoriteButton
            item={test}
            type="test"
            onChanged={onFavoriteChanged}
          />
        </div>
        <div className="box-inner box-inner_new">
          {!test.assignee && (
            <div className="Box-inner-accessModeTags">
              {test.accessMode !== "buy" && (
                <>
                  {["internal", "public"].includes(test.accessMode) && (
                    <div className="border-0 box-inner_tag">
                      <div className="d-flex align-items-center">
                        <span className="material-icons">
                          {test.accessMode === "internal"
                            ? "lock"
                            : "lock_open"}
                        </span>
                        <div className="stud2 subjctViewAll">
                          <strong>
                            {test.accessMode === "public"
                              ? "PUBLIC"
                              : "INTERNAL"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                  {test.accessMode === "invitation" && (
                    <div className="text-ellipsis pt-1 h6">
                      <img
                        src="/assets/images/bottom-tabs/classroom.svg"
                        className="classroom-icon"
                        alt="Classroom"
                      />
                      &nbsp;&nbsp;
                      {test.classRooms.length
                        ? test.classRooms.map((room) => room.name).join(", ")
                        : "No classroom"}
                    </div>
                  )}
                </>
              )}
              {test.accessMode === "buy" && (
                <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                  <ItemPrice content={test} />
                </div>
              )}
            </div>
          )}
          {test.assignee && (
            <div className="Box-inner-accessModeTags">
              <div className="text-ellipsis pt-1 h6">
                <span className="material-icons">lock</span>
                {test.assignee.name}
              </div>
            </div>
          )}
          <div className="info p-0 m-0">
            <h4
              data-toggle="tooltip"
              data-placement="top"
              title={test.title}
              className="mt-0 mb-0 cursor-pointer"
              onClick={() => viewTest(test)}
            >
              {test.title}
            </h4>
            <div className="form-row">
              {test.subjects && test.subjects.length > 0 && (
                <div className="col sub1_new text-truncate">
                  <a>
                    {test.subjects[0].name}
                    {test.subjects.length > 1 &&
                      ` + ${test.subjects.length - 1} more`}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="Box-inner-1">
            <div className="form-row mt-1">
              <div className="detailed col-6 small">
                <div className="d-flex align-items-center">
                  <span className="material-icons">content_paste</span>
                  <span className="stud2 ml-1 text-truncate">
                    <strong>
                      {test.totalQuestion > 0 ? test.totalQuestion : "No"}
                    </strong>{" "}
                    questions
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="material-icons">timelapse</span>
                  <span className="stud2 ml-1 text-truncate">
                    <strong className="text-black">{test.totalTime}</strong>{" "}
                    minutes
                  </span>
                </div>
              </div>

              <div className="detailed col-6 small">
                <div className="d-flex align-items-center">
                  <span className="material-icons">people</span>
                  <span className="stud2 ml-1 text-truncate">
                    <strong>
                      {test.totalJoinedStudent > 0
                        ? test.totalJoinedStudent
                        : "No"}
                    </strong>{" "}
                    {test.totalJoinedStudent === 1 ? "student" : "students"}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="material-icons">assignment</span>
                  <span className="stud2 ml-1 text-truncate">
                    <strong>
                      {test.totalAttempt > 0 ? test.totalAttempt : "No"}
                    </strong>{" "}
                    Attempt(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row mt-2">
              <div className="col">
                <a
                  className="btn btn-outline btn-sm d-block"
                  onClick={() => reviewTest(test)}
                >
                  Review
                </a>
              </div>
              {test.canEdit && (
                <div className="col">
                  <a
                    className="btn btn-buy btn-sm d-block"
                    onClick={() => viewTest(test)}
                  >
                    View Details
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const DraftItem = (test: any) => {
    test = test.test;
    return (
      <div className="box-item p-0" style={{ width: "255px" }}>
        <div className="box box_new bg-white pt-0" style={{ width: "255px" }}>
          <Link
            href={`}/assessment/details/${test._id}`}
            className="image-wrap cursor-pointer"
          >
            <PImageComponent
              height={120}
              fullWidth
              imageUrl={test.imageUrl}
              backgroundColor={test.colorCode}
              text={test.title}
              radius={9}
              fontSize={15}
              type="assessment"
              testMode={test.testMode}
              testType={test.testType}
              status={test.status}
              isProctored={test.isProctored}
            />
            <FavoriteButton
              item={test}
              type="test"
              onChanged={onFavoriteChanged}
            />
          </Link>

          <div className="box-inner box-inner_new">
            <div className="Box-inner-accessModeTags">
              {test.accessMode !== "buy" && (
                <>
                  {["internal", "public"].includes(test.accessMode) && (
                    <div className="border-0 box-inner_tag">
                      <div className="d-flex align-items-center">
                        <span className="material-icons">
                          {test.accessMode === "internal"
                            ? "lock"
                            : "lock_open"}
                        </span>
                        <div className="stud2 subjctViewAll">
                          <strong>
                            {test.accessMode === "public"
                              ? "PUBLIC"
                              : "INTERNAL"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                  {test.accessMode === "invitation" && (
                    <div className="text-ellipsis pt-1 h6">
                      {test.classRooms.length
                        ? test.classRooms.map((room) => room.name).join(", ")
                        : "No classroom"}
                    </div>
                  )}
                </>
              )}
              {test.accessMode === "buy" && (
                <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                  <ItemPrice content={test} />
                </div>
              )}
            </div>

            <div className="info p-0 m-0">
              <h4
                data-toggle="tooltip"
                data-placement="top"
                title={test.title}
                className="mt-0 mb-0 cursor-pointer"
              >
                <Link href={`/assessment/details/${test._id}`}>
                  <h4>{test.title}</h4>
                </Link>
              </h4>
              <div className="form-row">
                {test.subjects && test.subjects.length > 0 && (
                  <div className="col sub1_new text-truncate">
                    <a>
                      {test.subjects[0].name}
                      {test.subjects.length > 1 &&
                        ` + ${test.subjects.length - 1} more`}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="Box-inner-1">
              <div className="form-row mt-1 mb-4 pb-1">
                <div className="detailed col-6 small">
                  <div className="d-flex align-items-center">
                    <span className="material-icons">content_paste</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong className="text-black">
                        {test.totalQuestion}
                      </strong>{" "}
                      questions
                    </span>
                  </div>
                </div>

                <div className="detailed col-6 small">
                  <div className="d-flex align-items-center">
                    <span className="material-icons">timelapse</span>
                    <span className="stud2 ml-1 text-truncate">
                      <strong className="text-black">{test.totalTime}</strong>{" "}
                      minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row mt-2">
                <div className="col">
                  <a
                    className="btn btn-outline btn-sm d-block"
                    onClick={() => reviewTest(test)}
                  >
                    Review
                  </a>
                </div>
                <div className="col">
                  <div className="btn-group w-100">
                    <Link
                      href={`/assessment/details/${test._id}`}
                      className="btn btn-success btn-sm"
                    >
                      Edit
                    </Link>
                    {test.canEdit && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm dropdown-toggle dropdown-toggle-split"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="true"
                        >
                          <span className="caret"></span>
                          <span className="sr-only">Split button!</span>
                        </button>

                        <div className="dropdown-menu">
                          <a
                            className="dropdown-item m-0"
                            onClick={() => publish(test)}
                          >
                            Publish
                          </a>
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
    );
  };
  const DraftItemSm = (test: any) => (
    <div className="box-item p-0">
      <div className="box box_new bg-white pt-0">
        <Link
          href={`/assessment/details/${test._id}`}
          className="image-wrap cursor-pointer"
        >
          <PImageComponent
            height={111}
            fullWidth
            imageUrl={test.imageUrl}
            backgroundColor={test.colorCode}
            text={test.title}
            radius={9}
            fontSize={15}
            type="assessment"
            testMode={test.testMode}
            testType={test.testType}
            isProctored={test.isProctored}
          />
          <FavoriteButton
            item={test}
            type="test"
            onChanged={onFavoriteChanged}
          />
        </Link>

        <div className="box-inner box-inner_new">
          <div className="info p-0 m-0">
            <h4 data-toggle="tooltip" data-placement="top" title={test.title}>
              {test.title}
            </h4>
            <div className="form-row">
              {test.subjects && test.subjects.length > 0 && (
                <div className="col text-truncate">
                  <a>
                    {test.subjects[0].name}
                    {test.subjects.length > 1 &&
                      ` + ${test.subjects.length - 1} more`}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="form-row mt-1">
            <div className="detailed col-6 small">
              <div className="d-flex align-items-center">
                <span className="material-icons">content_paste</span>
                <span className="stud2 ml-1 text-truncate">
                  <strong className="text-black">{test.totalQuestion}</strong>{" "}
                  questions
                </span>
              </div>
            </div>

            <div className="detailed col-6 small">
              <div className="d-flex align-items-center">
                <span className="material-icons">timelapse</span>
                <span className="stud2 ml-1 text-truncate">
                  <strong className="text-black">{test.totalTime}</strong>{" "}
                  minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-row mt-2">
          <div className="col">
            <button
              className="btn btn-outline btn-sm d-block"
              onClick={() => reviewTest(test)}
            >
              Review
            </button>
          </div>

          <div className="col">
            <div className="btn-group w-100">
              <Link
                href={`/assessment/details/${test._id}`}
                className="btn btn-success btn-sm"
              >
                Edit
              </Link>
              {test.canEdit && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm dropdown-toggle dropdown-toggle-split"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="caret"></span>
                    <span className="sr-only">Split button!</span>
                  </button>
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => publish(test)}
                    >
                      Publish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TestLoading = () => (
    <div className="box-area-wrap clearfix d-none d-lg-block">
      <div className="heading heading_new">
        <div className="row">
          <div className="col-3">
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          </div>
        </div>
      </div>
      <div className="box-item p-0">
        <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
      </div>
      <div className="box-item p-0">
        <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
      </div>
      <div className="box-item p-0">
        <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
      </div>
      <div className="box-item p-0">
        <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
      </div>
      <div className="box-item p-0">
        <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
      </div>
    </div>
  );

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">
                What do you want to assess today?
              </h1>
              <form>
                <div className="form-group assess-snap mb-0">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for Assessment"
                    value={searchText}
                    onChange={(e) => search(e.target.value)}
                  />
                  <span>
                    <figure>
                      <img src="/assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  {isSearch && (
                    <button
                      type="button"
                      className="btn p-0"
                      onClick={clearSearch}
                    >
                      <figure>
                        <img src="/assets/images/close3.png" alt="" />
                      </figure>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {!isSearch ? (
        <div className="home-assessments bg-plAll_text customResponsive-1">
          {!subjectsLoaded ? (
            <section className="subject">
              <div className="container">
                <div className="subject-area center_Alg mx-auto clearfix">
                  <div className="row">
                    <div className="col-sm-4"></div>
                    <div className="col-sm-3">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                    <div className="col-sm-2 subject-item">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="115" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <></>
          )}
          {subjectsLoaded && listSubjects?.length > 0 ? (
            <section className="subject">
              <div className="mx-auto">
                <div className="container">
                  <div className="heading heading_new text-center">
                    <h6>Your Subjects</h6>
                  </div>
                  <div className="subject-area center_Alg mx-auto">
                    <CustomCarousel
                      items={listSubjects.map((item: any, i: number) => (
                        <div
                          className="slider"
                          style={{ width: "90px" }}
                          key={"list_subject" + i}
                        >
                          <Link
                            href={`/assessment/subjects/${
                              item.name
                            }${toQueryString({ id: item._id })}`}
                          >
                            <div className="subject-item p-0">
                              <PImageComponent
                                height={80}
                                width={80}
                                imageUrl={item.imageUrl}
                                text={item.title}
                                radius={9}
                                fontSize={15}
                                type="subject"
                              />
                            </div>
                            <h2 className="subject-item_title text-center mt-3">
                              {item.name}
                            </h2>
                          </Link>
                        </div>
                      ))}
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <></>
          )}
          <main className="pt-3">
            <div className="main-area Assess-homeResponse mx-auto mw-100">
              {user?.role != "support" &&
              user?.role != "mentor" &&
              (!user?.info?.primaryInstitute ||
                user?.info?.primaryInstitute.preferences?.assessment
                  .allowToCreate) ? (
                <div className="container">
                  <div className="box-area box-area_new">
                    <div className="section_heading_wrapper d-none d-lg-block">
                      <h3 className="section_top_heading">New Assessments</h3>
                    </div>
                    <div className="row mb-3 ">
                      <div className="col-4 pr-2 d-lg-block d-none">
                        <div className="dashed-border-box h-md-100">
                          <div className="create-btn-remove assesm">
                            <span className="helper-text">
                              <p className="assess-help lh-16">
                                Create assessment by creating question or
                                importing question
                              </p>
                            </span>
                            <div className="text-right mt-2">
                              <button
                                className="btn btn-primary"
                                onClick={() => openModal("createAssessment")}
                                disabled={opening}
                              >
                                Create Assessment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${
                          clientData?.features?.marketplace &&
                          (user?.role == "director" || user?.role == "operator")
                            ? "col-6 px-2 d-lg-block d-none"
                            : "col-7 pl-2 d-lg-block d-none"
                        }`}
                      >
                        <div className="dashed-border-box h-md-100">
                          <div className="curriculam-buttons assesm">
                            <div className="d-flex justify-content-around">
                              <div>
                                <span className="helper-text2">
                                  <p className="assess-help h-16">
                                    Upload Questions to create assesment
                                  </p>
                                </span>
                                <div className="text-right mt-2">
                                  <div
                                    className="btn btn-primary"
                                    onClick={() =>
                                      openModal("uploadassessment", false)
                                    }
                                  >
                                    Upload Assessment
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="row mt-md-0 mt-2">
                                  <div className="col-12">
                                    <p className="mb-2">
                                      Download the Template
                                    </p>
                                  </div>
                                </div>
                                <div className="form-row justify-content-end justify-content-sm-start text-right">
                                  <div className="col-sm-auto col-12">
                                    <Link
                                      className="btn btn-outline"
                                      href="/assets/media/Perfectice-New-Test-Template.xlsx"
                                      target="_blank"
                                    >
                                      <div className="d-flex align-items-center justify-content-center">
                                        <img
                                          className="tem-svg mr-1"
                                          src="/assets/images/assessment-excel.svg"
                                          alt=""
                                        />{" "}
                                        Excel Template
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="col-sm-auto col-12">
                                    <p className="my-2">OR</p>
                                  </div>
                                  <div className="col-sm-auto col-12">
                                    <Link
                                      className="btn btn-outline"
                                      href="/assets/media/Test-Upload-Template.docx"
                                      target="_blank"
                                    >
                                      <div className="d-flex align-items-center justify-content-center">
                                        <img
                                          className="tem-svg mr-1"
                                          src="/assets/images/assessment-word.svg"
                                          alt=""
                                        />
                                        Word Template
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3 d-block d-lg-none">
                      <div className="col-auto ml-auto pull-right">
                        <div
                          className="btn btn-primary"
                          onClick={() => openModal("createAssessment")}
                        >
                          Create Assesment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}

              <div className="container">
                {attemptedLoaded ? (
                  <div className="box-area box-area_new">
                    {recentAttempts.length ? (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Recent Results
                                </h3>
                                <p className="section_sub_heading">
                                  These assessments were taken by the students
                                  in the last 7 days. You may want to review the
                                  results.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div className="box-area-wrap clearfix">
                            <CustomCarousel
                              items={recentAttempts.map((attempt, index) => (
                                <div
                                  key={attempt._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  <div
                                    className="box-item p-0 p-0"
                                    style={{ width: "255px" }}
                                  >
                                    <div
                                      className="box box_new bg-white pt-0"
                                      style={{ width: "255px" }}
                                    >
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => viewTest(attempt.test)}
                                      >
                                        <PImageComponent
                                          height={120}
                                          fullWidth
                                          imageUrl={attempt.test.imageUrl}
                                          backgroundColor={
                                            attempt.test.colorCode
                                          }
                                          text={attempt.test.title}
                                          radius={9}
                                          fontSize={15}
                                          type="assessment"
                                          testMode={attempt.test.testMode}
                                          testType={attempt.test.testType}
                                          isProctored={attempt.test.isProctored}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        {/* Mode-TAG */}
                                        {/* {attempt.test.accessMode !== "buy" && (
                                          <div className="Box-inner-accessModeTags">
                                            {(attempt.test.accessMode ===
                                              "internal" ||
                                              attempt.test.accessMode ===
                                                "public") && (
                                              <div className="border-0 box-inner_tag">
                                                <div className="d-flex align-items-center">
                                                  {attempt.test.accessMode ===
                                                    "internal" && (
                                                    <span className="material-icons">
                                                      lock
                                                    </span>
                                                  )}
                                                  {attempt.test.accessMode ===
                                                    "public" && (
                                                    <span className="material-icons">
                                                      lock_open
                                                    </span>
                                                  )}
                                                  <div className="stud2 subjctViewAll">
                                                    <strong>
                                                      {attempt.test
                                                        .accessMode ===
                                                        "public" && "PUBLIC"}
                                                      {attempt.test
                                                        .accessMode ===
                                                        "internal" &&
                                                        "INTERNAL"}
                                                    </strong>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            <div className="text-ellipsis pt-1 h6">
                                              {attempt.studentName}
                                            </div>
                                          </div>
                                        )} */}

                                        {/* END */}
                                        <div className="info p-0 m-0">
                                          <h4
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            title={attempt.test.title}
                                            className="mt-0 mb-0 cursor-pointer"
                                            onClick={() =>
                                              viewTest(attempt.test)
                                            }
                                          >
                                            {attempt.test.title}
                                          </h4>
                                          <div className="form-row">
                                            {attempt.test.subjects &&
                                              attempt.test.subjects.length >
                                                0 && (
                                                <div className="col sub1_new text-truncate">
                                                  <a>
                                                    {
                                                      attempt.test.subjects[0]
                                                        .name
                                                    }
                                                    {attempt.test.subjects
                                                      .length > 1 && (
                                                      <span>
                                                        {" "}
                                                        +{" "}
                                                        {attempt.test.subjects
                                                          .length - 1}{" "}
                                                        more
                                                      </span>
                                                    )}
                                                  </a>
                                                </div>
                                              )}
                                          </div>
                                        </div>

                                        <div className="Box-inner-1">
                                          <div className="form-row mt-1">
                                            <div className="detailed col-6 small">
                                              <div className="d-flex align-items-center">
                                                <span className="material-icons">
                                                  content_paste
                                                </span>
                                                <span className="stud2 ml-1 text-truncate">
                                                  <strong>
                                                    {attempt.test
                                                      .totalQuestion > 0
                                                      ? attempt.test
                                                          .totalQuestion
                                                      : "No"}{" "}
                                                  </strong>
                                                  questions
                                                </span>
                                              </div>
                                              <div className="d-flex align-items-center">
                                                <span className="material-icons">
                                                  {" "}
                                                  timelapse{" "}
                                                </span>
                                                <span className="stud2 ml-1 text-truncate">
                                                  <strong className="text-black">
                                                    {attempt.test.totalTime}
                                                  </strong>{" "}
                                                  minutes
                                                </span>
                                              </div>
                                            </div>

                                            <div className="detailed col-6 small">
                                              <div className="d-flex align-items-center">
                                                <span className="material-icons">
                                                  {" "}
                                                  access_time{" "}
                                                </span>
                                                <span className="stud2 ml-1 text-truncate">
                                                  <strong>
                                                    {moment(
                                                      attempt.createdAt
                                                    ).fromNow()}
                                                  </strong>
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="form-row mt-2">
                                            <div className="col">
                                              <Link
                                                className="btn btn-outline btn-sm d-block"
                                                href={`/assessment/review/${attempt.test._id}?attemptId=${attempt._id}`}
                                              >
                                                Review
                                              </Link>
                                            </div>
                                            <div className="col">
                                              <Link
                                                className="btn btn-buy btn-sm d-block"
                                                href={`/assessment/student-attempt-summary/${attempt._id}`}
                                              >
                                                View Result
                                              </Link>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <TestLoading />
                )}
                {favoriteLoaded ? (
                  <div className="box-area box-area_new">
                    {favorites.length ? (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Favorite Assessments
                                </h3>
                                <p className="section_sub_heading">
                                  Quickly organize and find assessments of your
                                  interest. You can add or remove by opening an
                                  assessment and clicking Heart icon next to the
                                  name.
                                </p>
                              </div>
                            </div>
                            {favorites.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/assessment/my-favorites`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href={`/assessment/my-favorites`}>
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div className="box-area-wrap clearfix ">
                            <CustomCarousel
                              items={favorites.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  {test.status == "draft" && (
                                    <DraftItem test={test} />
                                  )}
                                  {test.status != "draft" && (
                                    <PublishedItem test={test} />
                                  )}
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <TestLoading />
                )}
                {recentLoaded ? (
                  <div className="box-area box-area_new">
                    {recentTests.length ? (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Recently Purchased Assessments
                                </h3>
                                <p className="section_sub_heading">
                                  These assessments were purchased from the
                                  marketplace.
                                </p>
                              </div>
                            </div>
                            {recentTests.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/assessment/viewall/recent`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href={`/assessment/viewall/recent`}>
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div className="box-area-wrap clearfix d-none d-lg-block">
                            <CustomCarousel
                              items={recentTests.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  <PublishedItem test={test} />
                                </div>
                              ))}
                            />
                          </div>
                          <div className="box-area-wrap clearfix d-block d-lg-none mx-0">
                            <CustomCarousel
                              items={recentTests.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  <PublishedItemSm test={test} />
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <TestLoading />
                )}
                {myTestLoaded ? (
                  <div className="box-area box-area_new">
                    {myTests.length > 0 && (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  My Assessments
                                </h3>
                                <p className="section_sub_heading">
                                  These assessments are created by your
                                  institute and available to use by your
                                  teachers and students. This includes those
                                  created using question bank.
                                </p>
                              </div>
                            </div>
                            {myTests.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/assessment/viewall/mine`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href={`/assessment/viewall/mine`}>
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div className="box-area-wrap clearfix">
                            <CustomCarousel
                              items={myTests.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  <div>
                                    {test.status == "draft" ? (
                                      <DraftItem test={test} />
                                    ) : (
                                      <PublishedItem test={test} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <TestLoading />
                )}
                {marketplaceTests?.length ? (
                  <div className="card-common products_slider">
                    <div className="card-header-common">
                      <div className="row align-items-center">
                        <div className="col">
                          <div className="section_heading_wrapper">
                            <h3 className="section_top_heading">
                              Marketplace Assessments
                            </h3>
                            <p className="section_sub_heading">
                              The marketplace is a central location of all
                              ready-to-purchase assessments for your use. These
                              assessments are not yet added to your institute.
                            </p>
                          </div>
                        </div>
                        {marketplaceTests.length > 5 && (
                          <div className="col-auto ml-auto">
                            <div>
                              <Link
                                className="btn btn-outline btn-sm"
                                href={`/market-place/view-all?type=assessment`}
                              >
                                View All
                              </Link>
                            </div>
                            <div className="arrow ml-auto">
                              <Link
                                href={`/market-place/view-all?type=assessment`}
                              >
                                <i className="fas fa-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="box-area box-area_new d-none d-lg-block">
                      <div className="box-area-wrap clearfix">
                        <div className="card-body-common pl-1">
                          <CustomCarousel
                            items={marketplaceTests.map((item, index) => (
                              <div
                                key={item._id}
                                className="slider"
                                style={{ width: "255px" }}
                              >
                                <div
                                  className="box-item p-0"
                                  style={{ width: "255px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "255px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewMarketplaceTest(item)}
                                    >
                                      <PImageComponent
                                        height={135}
                                        fullWidth
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                        type="assessment"
                                        testMode={item.testMode}
                                        isProctored={item.isProctored}
                                      />
                                      <FavoriteButton
                                        item={item}
                                        type="test"
                                        changed={onFavoriteChanged}
                                      />
                                    </div>
                                    <div className="box-inner box-inner_new">
                                      <div className="info p-0 m-0">
                                        <h6
                                          className="cursor-pointer text-ellipsis"
                                          title={item.title}
                                          onClick={() =>
                                            viewMarketplaceTest(item)
                                          }
                                        >
                                          {item.title}
                                        </h6>
                                        <div className="form-row">
                                          {item.subjects &&
                                          item.subjects.length > 1 ? (
                                            <div className="col sub1_new text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          ) : (
                                            <div className="col sub1_new1 text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          )}
                                          {item.subjects &&
                                            item.subjects.length > 1 && (
                                              <div className="col-auto num1_new text-truncate">
                                                <a>
                                                  +{item.subjects.length - 1}{" "}
                                                  more
                                                </a>
                                              </div>
                                            )}
                                        </div>
                                        <div className="author-name">
                                          <p>
                                            <span>
                                              {item.brandName || item.userName}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                      {!item.enrolled && (
                                        <div>
                                          {!item.addedToCart ? (
                                            <div className="selling-price-info selling-price-info_new d-flex">
                                              {item.accessMode == "buy" &&
                                                user.role !== "student" && (
                                                  <ItemPrice
                                                    content={item}
                                                    field="marketPlacePrice"
                                                  />
                                                )}
                                              {item.accessMode == "buy" &&
                                                user.role === "student" && (
                                                  <ItemPrice
                                                    content={item}
                                                    field="price"
                                                  />
                                                )}
                                            </div>
                                          ) : (
                                            <div className="bold h6 mt-1 mb-2">
                                              Added To Cart
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {item.enrolled && (
                                        <div className="mt-1 mb-2">
                                          <p>
                                            {user.role === "admin" &&
                                            item.purchasedBy === "director"
                                              ? "Institute Purchased Already"
                                              : user.role === "director" &&
                                                item.purchasedBy === "admin"
                                              ? "Admin purchased"
                                              : "Already Purchased"}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className="form-row"
                                    style={{ width: "255px" }}
                                  >
                                    <div className="col">
                                      <a
                                        className="btn btn-buy btn-sm d-block"
                                        onClick={() =>
                                          viewMarketplaceTest(item)
                                        }
                                      >
                                        View Details
                                      </a>
                                    </div>
                                    {!item.enrolled && (
                                      <div className="col">
                                        <AddToCartButton
                                          item={item}
                                          type="practice"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <TestLoading />
                )}
                {sections.map(
                  (section, sectionIndex) =>
                    section.tests?.length > 0 && (
                      <div key={sectionIndex} className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h3 className="section_top_heading">
                                    {section.title}
                                  </h3>
                                  <p className="section_sub_heading">
                                    {section.description}
                                  </p>
                                </div>
                              </div>
                              {section.tests.length > 5 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      className="btn btn-outline btn-sm"
                                      href={`/assessment/viewall/tags?tags=${section.tags.join(
                                        ","
                                      )}&title=${section.title}`}
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link
                                      href={`/assessment/viewall/tags?tags=${section.tags.join(
                                        ","
                                      )}&title=${section.title}`}
                                    >
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common pl-1">
                            <div className="box-area-wrap clearfix ">
                              <CustomCarousel
                                items={section.tests.map((test, index) => (
                                  <div
                                    key={test._id}
                                    className="slider"
                                    style={{ width: "255px" }}
                                  >
                                    {test.status == "draft" ? (
                                      <DraftItem test={test} />
                                    ) : (
                                      <PublishedItem test={test} />
                                    )}
                                  </div>
                                ))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                )}
                {generalTestLoaded ? (
                  generalTests.length > 0 && (
                    <div className="box-area box-area_new">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  General Assessments
                                </h3>
                                <p className="section_sub_heading">
                                  These assessments are uncategorized by the
                                  creator but are available for your use in the
                                  classroom.
                                </p>
                              </div>
                            </div>
                            {generalTests.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/assessment/viewall/general?noTag=${noTag}`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link
                                    href={`/assessment/viewall/general?noTag=${noTag}`}
                                  >
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div className="box-area-wrap clearfix ">
                            <CustomCarousel
                              items={generalTests.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="slider"
                                  style={{ width: "255px" }}
                                >
                                  {test.status == "draft" ? (
                                    <DraftItem test={test} />
                                  ) : (
                                    <PublishedItem test={test} />
                                  )}
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <TestLoading />
                )}

                {QOD.length > 0 && (
                  <div className="box-area box-area_new">
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Question of the Day
                              </h3>
                              <p className="section_sub_heading">
                                Improve student’s engagement and give byte-size
                                learning daily. The system sends an email with
                                one question and asks students to solve. You can
                                mark a question as “question of the day” or
                                system will do it for you.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common pl-1 px-3 pb-3">
                        {/* <QuestionOfDay question={QOD} public={false} /> */}
                      </div>
                    </div>
                  </div>
                )}

                {!hasTests && (
                  <div className="course-search-empty text-center empty-data">
                    <figure className="mx-auto">
                      <img
                        src="assets/images/Search-rafiki.png"
                        alt=""
                        className="img-fluid d-block mx-auto mb-4"
                      />
                    </figure>
                    <h6>No Assessment Found</h6>
                    {user.role === "director" || user.role === "operator" ? (
                      <p>
                        We couldn&apos;t find any result. You can bring
                        assessments from
                        <Link className="d-inline" href={`/market-place`}>
                          <b>Marketplace</b>
                        </Link>{" "}
                        or{" "}
                        <a
                          className="d-inline"
                          onClick={() => openModal("createAssessmentModal")}
                        >
                          <b>Create new</b>.
                        </a>
                      </p>
                    ) : (
                      <p>
                        Please contact your director
                        {user.role !== "support" &&
                          user.role !== "mentor" &&
                          (!user.primaryInstitute ||
                            user.primaryInstitute.preferences?.assessment
                              .allowToCreate) && (
                            <>
                              {" "}
                              or{" "}
                              <a
                                className="d-inline"
                                onClick={() =>
                                  openModal("createAssessmentModal")
                                }
                              >
                                <b>create a new</b>
                              </a>{" "}
                              assessment.
                            </>
                          )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <main className="pt-0 search_Asses-menT">
          <div className="main-area com-width search-result mx-auto">
            <div className="container">
              <div className="box-area d-none d-lg-block mt-4">
                <div className="heading heading_new">
                  <div className="row align-items-center">
                    <div className="col-8">
                      {practicesCount > 0 && (
                        <h3>{practicesCount} Assessments</h3>
                      )}
                    </div>
                    <div className="col-4">
                      <ul className="nav justify-content-end">
                        <li className="mr-1"> Internal Assessments</li>
                        <li>
                          <div className="toggle-switch">
                            <label className="switches m-0">
                              <input
                                type="checkbox"
                                checked={searchInternal}
                                name="ckInternal"
                                onChange={(e) => accessModeFilterChanged()}
                              />
                              <span className="sliders round"></span>
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {!searchloading ? (
                  <div className="box-area-wrap clearfix d-none d-lg-block">
                    <div className="row">
                      {searchPractices.map((test: any) => (
                        <div
                          key={test._id}
                          className=" col-lg-3 col-md-4 col-6 mb-3"
                        >
                          <div className="slider">
                            {test.status !== "draft" ? (
                              <div className="box box_new bg-white pt-0">
                                <Link
                                  className="cursor-pointer"
                                  href={`/assessment/details/${test._id}`}
                                >
                                  <PImageComponent
                                    height={105}
                                    fullWidth
                                    imageUrl={test.imageUrl}
                                    backgroundColor={test.colorCode}
                                    text={test.title}
                                    radius={9}
                                    fontSize={15}
                                    type="assessment"
                                    testMode={test.testMode}
                                    isProctored={test.isProctored}
                                  />
                                </Link>

                                <div className="box-inner box-inner_new">
                                  <div className="Box-inner-accessModeTags">
                                    {test.accessMode !== "buy" ? (
                                      <div className="border-0  box-inner_tag">
                                        <div className="d-flex align-items-center">
                                          {test.accessMode === "invitation" && (
                                            <span className="material-icons">
                                              lock
                                            </span>
                                          )}
                                          {test.accessMode === "public" && (
                                            <span className="material-icons">
                                              lock_open
                                            </span>
                                          )}
                                          {test.accessMode === "internal" && (
                                            <span className="material-icons">
                                              lock
                                            </span>
                                          )}
                                          <span className="stud2 ml-1">
                                            {test.accessMode ===
                                              "invitation" && (
                                              <strong>PRIVATE</strong>
                                            )}
                                            {test.accessMode === "public" && (
                                              <strong>PUBLIC</strong>
                                            )}
                                            {test.accessMode === "internal" && (
                                              <strong>Internal</strong>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                                        <ItemPrice {...test} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="info p-0 m-0">
                                    <Link
                                      href={`/assessment/details/${test._id}`}
                                    >
                                      <h4
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        className="cursor-pointer"
                                      >
                                        {elipsisText(test.title, 40, true)}
                                      </h4>
                                    </Link>
                                    <ul className="nav">
                                      {test.subjects &&
                                        test.subjects.length > 0 && (
                                          <li>
                                            <a>{test.subjects[0].name}</a>
                                          </li>
                                        )}
                                      {test.subjects &&
                                        test.subjects.length > 1 && (
                                          <li>
                                            <a>{test.subjects.length - 1}</a>
                                          </li>
                                        )}
                                    </ul>
                                  </div>
                                  <div className="form-row mt-1">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {" "}
                                          content_paste{" "}
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          {test.totalQuestion > 0 && (
                                            <strong>
                                              {test.totalQuestion}{" "}
                                            </strong>
                                          )}
                                          {test.totalQuestion == 0 && (
                                            <strong>No </strong>
                                          )}
                                          questions
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {" "}
                                          timelapse{" "}
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalTime}
                                          </strong>{" "}
                                          minutes
                                        </div>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {" "}
                                          people{" "}
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          {test.totalJoinedStudent > 0 && (
                                            <strong>
                                              {test.totalJoinedStudent}
                                            </strong>
                                          )}
                                          {test.totalJoinedStudent == 0 && (
                                            <strong>No</strong>
                                          )}{" "}
                                          {test?.totalJoinedStudent == 1
                                            ? "student"
                                            : "students"}
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {" "}
                                          assignment{" "}
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          {test.totalAttempt > 0 && (
                                            <strong>{test.totalAttempt}</strong>
                                          )}
                                          {test.totalAttempt == 0 && (
                                            <strong>No</strong>
                                          )}{" "}
                                          Attempts
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="view-detail view-detail_new">
                                  <Link
                                    className="text-center"
                                    href={`/assessment/details/${test._id}`}
                                  >
                                    VIEW DETAILS
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="box box_new bg-white pt-0">
                                <Link
                                  className="cursor-pointer"
                                  href={`/assessment/details/${test._id}`}
                                >
                                  <PImageComponent
                                    height={120}
                                    fullWidth
                                    imageUrl={test.imageUrl}
                                    backgroundColor={test.colorCode}
                                    text={test.title}
                                    radius={9}
                                    fontSize={15}
                                    type="assessment"
                                    testMode={test.testMode}
                                    isProctored={test.isProctored}
                                  />
                                </Link>

                                <div
                                  className="box-inner box-inner_new"
                                  style={{ borderRadius: "9px" }}
                                >
                                  <div className="Box-inner-accessModeTags">
                                    {test.accessMode !== "buy" ? (
                                      <div className="border-0  box-inner_tag">
                                        <div className="d-flex align-items-center">
                                          <span className="material-icons">
                                            {test.accessMode === "invitation"
                                              ? "lock"
                                              : test.accessMode === "public"
                                              ? "lock_open"
                                              : test.accessMode === "internal"
                                              ? "lock"
                                              : ""}
                                          </span>

                                          <span className="stud2 ml-1">
                                            <strong>
                                              {test.accessMode === "invitation"
                                                ? "PRIVATE"
                                                : test.accessMode === "public"
                                                ? "PUBLIC"
                                                : test.accessMode === "internal"
                                                ? "Internal"
                                                : ""}
                                            </strong>
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                                        <ItemPrice {...test} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="info p-0 m-0">
                                    <Link
                                      href={`/assessment/details/${test._id}`}
                                    >
                                      <h4
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        className="mt-0 mb-0 cursor-pointer"
                                      >
                                        {test.title}
                                      </h4>
                                    </Link>
                                    <div className="form-row">
                                      {test.subjects &&
                                        test.subjects.length && (
                                          <div className="col sub1_new text-truncate">
                                            <div>
                                              {test.subjects[0].name}
                                              {test.subjects.length > 1 && (
                                                <span>
                                                  {" "}
                                                  + {test.subjects.length -
                                                    1}{" "}
                                                  more
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <div className="Box-inner-1">
                                    <div className="form-row mt-1">
                                      <div className="detailed col-6 small">
                                        <div className="d-flex align-items-center">
                                          <span className="material-icons">
                                            content_paste
                                          </span>
                                          <span className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalQuestion}{" "}
                                            </strong>
                                            questions
                                          </span>
                                        </div>
                                      </div>

                                      <div className="detailed col-6 small">
                                        <div className="d-flex align-items-center">
                                          <span className="material-icons">
                                            {" "}
                                            timelapse{" "}
                                          </span>
                                          <span className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalTime}
                                            </strong>{" "}
                                            minutes
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="form-row mt-2 pt-1">
                                      <div className="col">
                                        <Link
                                          className="btn btn-outline btn-sm d-block"
                                          href={`/assessment/details/${test._id}`}
                                        >
                                          Edit
                                        </Link>
                                      </div>
                                      {test.canEdit && (
                                        <div className="col">
                                          <div
                                            className="btn btn-success btn-sm d-block"
                                            onClick={() => publish(test)}
                                          >
                                            Publish
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {searchPractices.length == 0 && (
                      <div className="course-search-empty text-center empty-data">
                        <figure className="mx-auto">
                          <img
                            src="/assets/images/Search-rafiki.png"
                            alt=""
                            className="img-fluid d-block mx-auto mb-4"
                          />
                        </figure>
                        <h3>No Results Found</h3>
                        <p>
                          We could not find any results based on your search
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="box-area-wrap clearfix">
                    <div className="heading heading_new">
                      <div className="row">
                        <div className="col-3">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </div>
                      </div>
                    </div>
                    <div className="box-item p-0">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    </div>
                    <div className="box-item p-0">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    </div>
                    <div className="box-item p-0">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    </div>
                    <div className="box-item p-0">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    </div>
                    <div className="box-item p-0">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    </div>
                  </div>
                )}
              </div>
              <div className="box-area d-block d-lg-none mx-0">
                {practicesCount > 0 && (
                  <div className="heading heading_new">
                    <div className="row align-items-center">
                      <div className="col-8">
                        <h3>{practicesCount} Assessments</h3>
                      </div>
                    </div>
                  </div>
                )}
                <div className="box-area-wrap clearfix d-block d-lg-none mx-0">
                  <div className="row">
                    {searchPractices.map((test: any) => (
                      <div
                        key={test._id}
                        className=" col-lg-3 col-md-4 col-6 mb-3"
                      >
                        <div className="slider">
                          {test.status !== "draft" ? (
                            <div className="box box_new bg-white pt-0">
                              <PImageComponent
                                height={105}
                                fullWidth
                                imageUrl={test.imageUrl}
                                backgroundColor={test.colorCode}
                                text={test.title}
                                radius={9}
                                fontSize={15}
                                type={"assessment"}
                                testMode={test.testMode}
                                isProctored={test.isProctored}
                              />
                              <div className="box-inner box-inner_new">
                                <div className="Box-inner-accessModeTags">
                                  {test.accessMode !== "buy" ? (
                                    <div className="border-0  box-inner_tag">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {test.accessMode === "invitation"
                                            ? "lock"
                                            : test.accessMode === "public"
                                            ? "lock_open"
                                            : test.accessMode === "internal"
                                            ? "lock"
                                            : ""}
                                        </span>

                                        <span className="stud2 ml-1">
                                          <strong>
                                            {test.accessMode === "invitation"
                                              ? "PRIVATE"
                                              : test.accessMode === "public"
                                              ? "PUBLIC"
                                              : test.accessMode === "internal"
                                              ? "Internal"
                                              : ""}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="selling-price-info selling-price-info_new d-flex mt-0 pt-1">
                                      <ItemPrice {...test} />
                                    </div>
                                  )}
                                </div>

                                <div className="info p-0 m-0">
                                  <h4
                                    data-toggle="tooltip"
                                    data-placement="top"
                                  >
                                    {elipsisText(test.title, 40, true)}
                                  </h4>
                                  <ul className="nav">
                                    {test.subjects &&
                                      test.subjects.length > 0 && (
                                        <li>
                                          <a>{test.subjects[0].name}</a>
                                        </li>
                                      )}
                                    {test.subjects &&
                                      test.subjects.length > 1 && (
                                        <li>
                                          <a>{test.subjects.length - 1}</a>
                                        </li>
                                      )}
                                  </ul>
                                </div>
                                <div className="form-row mt-1">
                                  <div className="detailed col-6 small">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        {" "}
                                        content_paste{" "}
                                      </span>
                                      <div className="stud2 ml-1 text-truncate">
                                        {test.totalQuestion > 0 && (
                                          <strong>{test.totalQuestion} </strong>
                                        )}
                                        {test.totalQuestion == 0 && (
                                          <strong>No </strong>
                                        )}{" "}
                                        questions
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        {" "}
                                        timelapse{" "}
                                      </span>
                                      <div className="stud2 ml-1 text-truncate">
                                        <strong className="text-black">
                                          {test.totalTime}
                                        </strong>{" "}
                                        minutes
                                      </div>
                                    </div>
                                  </div>

                                  <div className="detailed col-6 small">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        {" "}
                                        people{" "}
                                      </span>
                                      <div className="stud2 ml-1 text-truncate">
                                        {test.totalJoinedStudent > 0 && (
                                          <strong>
                                            {test.totalJoinedStudent}
                                          </strong>
                                        )}
                                        {test.totalJoinedStudent == 0 && (
                                          <strong>No</strong>
                                        )}{" "}
                                        {test?.totalJoinedStudent == 1
                                          ? "student"
                                          : "students"}
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        {" "}
                                        assignment{" "}
                                      </span>
                                      <div className="stud2 ml-1 text-truncate">
                                        {test.totalAttempt > 0 && (
                                          <strong>{test.totalAttempt}</strong>
                                        )}
                                        {test.totalAttempt == 0 && (
                                          <strong>No</strong>
                                        )}{" "}
                                        Attempts
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="view-detail view-detail_new">
                                <Link
                                  className="text-center"
                                  href={`/assessment/details/${test._id}`}
                                >
                                  VIEW DETAILS
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="box box_new bg-white pt-0">
                              <PImageComponent
                                height={120}
                                fullWidth
                                imageUrl={test.imageUrl}
                                backgroundColor={test.colorCode}
                                text={test.title}
                                radius={9}
                                fontSize={15}
                                type="assessment"
                                testMode={test.testMode}
                                isProctored={test.isProctored}
                              />

                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <h4
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    className="mt-0 mb-0"
                                  >
                                    {test.title}
                                  </h4>
                                  <div className="form-row">
                                    {test.subjects && test.subjects.length && (
                                      <div className="col sub1_new text-truncate">
                                        <div>
                                          {test.subjects[0].name}
                                          {test.subjects.length > 1 && (
                                            <span>
                                              {" "}
                                              + {test.subjects.length - 1} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="Box-inner-1">
                                  <div className="form-row mt-1">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          content_paste
                                        </span>
                                        <span className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalQuestion}{" "}
                                          </strong>
                                          questions
                                        </span>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {" "}
                                          timelapse{" "}
                                        </span>
                                        <span className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalTime}
                                          </strong>{" "}
                                          minutes
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-row mt-2">
                                    <div className="col-6">
                                      <Link
                                        className="btn btn-outline btn-sm d-block"
                                        href={`/assessment/details/${test._id}`}
                                      >
                                        Edit
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      <div
                                        className="btn btn-success btn-sm d-block"
                                        onClick={() => publish(test)}
                                      >
                                        Publish
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* <ngx-spinner name="tests" color="#0cdec1" [fullScreen]="false" type="ball-clip-rotate-multiple" size="small"></ngx-spinner> */}
                </div>
              </div>
              {!searchloading && searchPractices.length < practicesCount && (
                <div className="text-center">
                  <a className="btn btn-light px-5" onClick={() => loadMore()}>
                    Load More
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
      <CreateAssessmentModal
        show={showCreateAssessmentModal}
        onClose={() => setShowCreateAssessmentModal(false)}
        cancel={cancel}
        userSubject={userSubjects}
        dropped={dropped}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        filePicker={filePicker}
        fileBrowseRef={fileBrowseRef}
      />
      <UploadAssessmentModal
        show={showUploadAssessmentModal}
        onClose={() => setShowUploadAssessmentModal(false)}
        dropped={dropped}
        uploadFile={uploadFile}
        filePicker={filePicker}
        fileBrowseRef={fileBrowseRef}
        tags={tags}
        setTags={setTags}
        addToQB={addToQB}
        setAddToQB={setAddToQB}
        cancel={cancel}
        upload={upload}
      />
    </>
  );
};

export default TeacherAssessment;
