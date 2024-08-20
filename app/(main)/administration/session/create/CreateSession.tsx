"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as sessionService from "@/services/SessionService";
import * as practiceService from "@/services/practiceService";
import * as subjectSvc from "@/services/subjectService";
import * as userService from "@/services/userService";
import * as instituteSvc from "@/services/instituteService";
import alertify from "alertifyjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSearchParams, useRouter } from "next/navigation";
import { TagsInput } from "react-tag-input-component";
import Multiselect from "multiselect-react-dropdown";

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

export default function CreateSessionComponent() {
  const { push } = useRouter();
  const datePickerRef = useRef(null);

  const user: any = useSession()?.data?.user?.info || {};
  const [step, setStep] = useState<any>(null);
  const [unitsDropdownSettings, setUnitsDropdownSettings] = useState<any>(null);
  const [userSubjects, setUserSubjects] = useState<any>([]);
  const [cTags, setCTags] = useState<any>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any>([]);
  const [filterPractices, setFilterPractices] = useState<any>([]);
  const [allFilterPractices, setAllFilterPractices] = useState<any>([]);
  const [selectedPractices, setSelectedPractices] = useState<any>([]);
  const [session, setSession] = useState<any>([]);
  const [minDate, setMinDate] = useState<any>(new Date());
  const [searchText, setSearchText] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentGfgStep, setCurrentGfgStep] = useState<number>(0);
  const [nextGfgStep, setNextGfgStep] = useState<number>(0);
  const [previousGfgStep, setPreviousGfgStep] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [steps, setSteps] = useState<number>(4);
  const [updationOn, setUpdationOn] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 20,
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [viewSelect, setViewSelect] = useState<boolean>(false);
  let stepper: Stepper;
  const queryParams = useSearchParams();

  useEffect(() => {
    if (queryParams.get("id")) {
      setEditMode(true);
      sessionService.getSessionById(queryParams.get("id")).then((d) => {
        const s = d[0];
        const tmp_selectedPractices = selectedPractices;
        s.practiceIds.forEach((element) => {
          element["checked"] = true;
          tmp_selectedPractices.push(element);
        });
        const uniqueData = Array.from(
          new Set(tmp_selectedPractices.map((item) => item._id))
        ).map((_id) => {
          return tmp_selectedPractices.find((item) => item._id === _id);
        });

        setSelectedPractices(uniqueData);
        setFilterPractices(s.practiceIds);
        setSession(s);
      });
    }

    // this.stepper = new Stepper(document.querySelector('#stepper1'), {
    //   linear: false,
    //   animation: true
    // });
    userService.get().then((us) => {
      if (us.role === "admin") {
        subjectSvc.getMine().then((res: any) => {
          const tmp_userSubjects = res.map((d) => {
            return {
              _id: d._id,
              name: d.name,
            };
          });
          setUserSubjects(tmp_userSubjects);
        });
      } else {
        instituteSvc.getSubjects({ activeOnly: true }).then((res: any) => {
          const tmp_userSubjects = res.map((d) => {
            return {
              _id: d._id,
              name: d.name,
            };
          });
          setUserSubjects(tmp_userSubjects);
        });
      }
    });
  }, []);

  const filter = () => {
    const selectedTags = [];
    if (cTags && cTags.length > 0) {
      cTags.forEach((tag) => {
        selectedTags.push(tag.value);
      });
    }
    const tmp_selectedSubjects = [];
    if (selectedSubjects && selectedSubjects.length > 0) {
      selectedSubjects.forEach((sub) => {
        tmp_selectedSubjects.push(sub._id);
      });
    }
    sessionService
      .filterTestLists({
        ...params,
        tags: selectedTags,
        selectedSubjects: tmp_selectedSubjects,
      })
      .then((d: any) => {
        setFilterPractices(d.tests);
        setTotalCount(d.count);
        setAllFilterPractices(d.tests);

        const updatedPractices = d.tests;
        updatedPractices.forEach((e) => {
          selectedPractices.forEach((f) => {
            if (e._id === f._id && f.checked) {
              e.checked = true;
            }
          });
        });

        // Update the state with the modified practices
        setAllFilterPractices(updatedPractices);
      });
  };

  const reset = () => {
    setSelectedSubjects([]);
    setCTags([]);
  };

  const markCheck = async ($ev, p, i) => {
    if ($ev) {
      if (p.classRooms.length === 0) {
        setFilterPractices((prev) => {
          const newFilterPractices = [...prev];
          newFilterPractices[i]["checked"] = false;
          return newFilterPractices;
        });
        alert(
          "This test is not tagged in any classroom. First Please tag in any classroom."
        );
        return;
      }

      const status = await checkTestStatus(p, i);
      if (!status) {
        setFilterPractices((prev) => {
          const newFilterPractices = [...prev];
          newFilterPractices[i]["checked"] = true;
          return newFilterPractices;
        });
        const updatedFilterPractice = [...filterPractices];
        updatedFilterPractice[i]["checked"] = true;
        setSelectedPractices(
          updatedFilterPractice.filter((pv) => pv.checked === true)
        );
      }
    } else {
      const updatedFilterPractice = [...filterPractices];
      updatedFilterPractice[i]["checked"] = false;
      setFilterPractices((prev) => {
        const newFilterPractices = [...prev];
        newFilterPractices[i]["checked"] = false;
        return newFilterPractices;
      });
      setSelectedPractices(
        updatedFilterPractice.filter((pv) => pv.checked === true)
      );
    }
  };

  const next = (val: any) => {
    if (selectedPractices.length === 0) {
      alertify.alert("Message", "Please select assessment first");
      return;
    }
    setSession({
      ...session,
      practiceIds: selectedPractices,
    });
    if (val === 1) {
      stepper.next();
      return;
    }
    if (val === 2 && !editMode) {
      let load = false;
      let startDate = null;
      if (!session.title || !session.startDate) {
        alertify.alert(
          "Message",
          "Please add Title / Start date to the session"
        );
        return;
      }
      if (new Date(session.startDate).getTime() < minDate.getTime()) {
        alertify.alert("Message", "Please set start time above from now");
        return;
      }
      if (session.startDate) {
        startDate = new Date(session.startDate).getTime();
      }
      sessionService
        .create(session)
        .then((d) => {
          setSession(d);
          alertify.success("Successfully Added");
          stepper.next();
          load = true;
        })
        .catch((err) => {
          console.log(err);
          alertify.alert("Message", err.error);
        });
      return;
    } else if (val === 2 && editMode) {
      let up = false;
      let startDate = null;
      if (new Date(session.startDate).getTime() < minDate.getTime()) {
        alertify.alert("Message", "Please set start time above from now");
        return;
      }
      if (session.startDate) {
        startDate = new Date(session.startDate).getTime();
      }
      sessionService.update(session._id, session).then((data) => {
        alertify.success("Successfully Updated");
        stepper.next();
        up = true;
      });
      return;
    } else if (val === 3) {
      sessionService.update(session._id, session).then((data) => {
        alertify.success("Successfully Updated");
        push("/administration/session");
      });
    }
  };

  const viewSelected = (ev) => {
    if (ev) {
      setViewSelect(true);
      setFilterPractices((prevFilterPractices) =>
        prevFilterPractices.filter((d) => d.checked)
      );
    } else {
      setViewSelect(false);
      const updatedAllFilterPractices = allFilterPractices;
      updatedAllFilterPractices.map((e) => {
        filterPractices.forEach((f) => {
          if (e._id === f._id && f.checked) {
            e.checked = true;
          }
        });
      });
      setFilterPractices(updatedAllFilterPractices);
    }
  };

  const search = (text?: string) => {
    if (!text) {
      text = searchText;
    }
    const selectedTags_tmp: any = [];
    if (cTags && cTags.length > 0) {
      cTags.forEach((tag) => {
        selectedTags_tmp.push(tag.value);
      });
    }
    const selectedSubjects_tmp: any = [];
    if (selectedSubjects && selectedSubjects.length > 0) {
      selectedSubjects.forEach((sub) => {
        selectedSubjects_tmp.push(sub._id);
      });
    }
    sessionService
      .filterTestLists({
        tags: selectedTags_tmp,
        selectedSubjects: selectedSubjects_tmp,
        searchText: text,
      })
      .then((d: any) => {
        setFilterPractices(d.tests);
        setTotalCount(d.count);
        setAllFilterPractices(d.tests);
      });
  };

  const checkTestStatus = (p: any, i: any) => {
    return new Promise<boolean>((resolve) => {
      if (!p.totalTime) {
        const newFilterPractices = [...filterPractices];

        // Update the specific item
        newFilterPractices[i] = {
          ...newFilterPractices[i],
          checked: false,
        };

        // Update the state with the new array
        setFilterPractices(newFilterPractices);
        alertify.alert(
          "Message",
          "Please add the total time to this test (" + p.title + ") first !!"
        );
        resolve(true);
        return;
      }
      sessionService
        .testStatus(p._id, { totalTime: p.totalTime })
        .then((d: any[]) => {
          if (d && d.length > 0) {
            const updatedPractices = filterPractices.map((practice, index) => {
              // Only update the 'checked' property for the item at the specified index
              if (i === index) {
                return { ...practice, checked: false };
              }
              return practice;
            });

            // Update the state with the new array
            setFilterPractices(updatedPractices);

            alertify.alert(
              "Message",
              "This test already present in other session, You need to create new one or untagged it from session"
            );
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  };

  const previousStep = () => {
    setNextGfgStep(currentGfgStep - 1);
    setCurrentGfgStep(currentGfgStep - 1);
  };

  const nextStep1 = () => {
    setPreviousGfgStep(currentGfgStep - 1);
    setNextGfgStep(currentGfgStep + 1);
    setCurrentGfgStep(currentGfgStep + 1);

    if (currentGfgStep + 1 == 2) {
      setUpdationOn(true);
    }
  };

  const nextStepAndSave = (val: any) => {
    if (selectedPractices.length === 0) {
      alertify.alert("Message", "Please select assessment first");
      return;
    }
    setSession({
      ...session,
      practiceIds: selectedPractices,
    });
    const tmp_session = {
      ...session,
      practiceIds: selectedPractices,
    };
    if (val === 0) {
      nextStep1();
      return;
    }
    if (val === 1 && !editMode && !updationOn) {
      if (!session.title || !session.startDate) {
        alertify.alert(
          "Message",
          "Please add Title / Start date to the session"
        );
        return;
      }
      if (new Date(session.startDate).getTime() < minDate.getTime()) {
        alertify.alert("Message", "Please set start time above from now");
        return;
      }

      sessionService
        .create(tmp_session)
        .then((d) => {
          setSession(d);
          alertify.success("Successfully Added");
          nextStep1();
        })
        .catch((err) => {
          console.log(err);
          alertify.alert("Message", err.error);
        });
      return;
    } else if (val === 1 && (editMode || updationOn)) {
      if (new Date(session.startDate).getTime() < minDate.getTime()) {
        alertify.alert("Message", "Please set start time above from now");
        return;
      }
      sessionService.update(tmp_session._id, tmp_session).then((data) => {
        alertify.success("Successfully Updated");
        nextStep1();
      });
      return;
    } else if (val === 2) {
      sessionService.update(tmp_session._id, tmp_session).then((data) => {
        alertify.success("Successfully Updated");
        push("/administration/session");
      });
    }
  };

  const loadMore = () => {
    setParams({
      ...params,
      page: params.page + 1,
    });

    const para = {
      ...params,
      page: params.page + 1,
    };
    const selectedTags = [];
    if (cTags && cTags.length > 0) {
      cTags.forEach((tag) => {
        selectedTags.push(tag.value);
      });
    }
    const selectedSubjects = [];
    if (selectedSubjects && selectedSubjects.length > 0) {
      selectedSubjects.forEach((sub) => {
        selectedSubjects.push(sub._id);
      });
    }
    sessionService
      .filterTestLists({
        ...para,
        tags: selectedTags,
        selectedSubjects: selectedSubjects,
      })
      .then((d: any) => {
        setFilterPractices(filterPractices.concat(d.tests));
        setTotalCount(d.count);
        setAllFilterPractices(allFilterPractices.concat(d.tests));
      });
  };

  const publish = (practice: any) => {
    if (practice._id) {
      if (practice.accessMode == "public" && user.role == "mentor") {
        alertify.alert(
          "Message",
          "You can not publish practice test with access mode is free."
        );
        return;
      }

      if (!practice.startDate && practice.isProctored) {
        alertify.alert("Message", "Start date is required");
        return;
      }
      if (!practice.totalTime) {
        alertify.alert("Message", "Total Time is required");
        return;
      }

      practiceService
        .checkQuestions(practice._id)
        .then((res: any) => {
          alertify.confirm(
            "Are you sure you want to publish this Assessment?",
            (msg) => {
              const copy = Object.assign({}, practice);
              const lastData = copy;
              lastData.status = "published";
              lastData.statusChangedAt = new Date().getTime();
              // We will set this on server
              // lastData.testCode = commonHelper.getUniqCode(8)
              practiceService
                .updateFunc(practice._id, lastData)
                .then((res: any) => {
                  if (res.err) {
                    alertify.error("Your changes could not be saved.");
                  }
                  practice.status = "published";
                  practice.statusChangedAt = new Date().getTime();

                  practice = res;

                  alertify.success("Practice test published successfully.");
                })
                .catch((err) => {
                  if (err.error && err.error.length) {
                    alertify.alert("Message", err.error[0].msg);
                    return;
                  }
                  if (err.params) {
                    if (err) {
                      alertify.alert("Message", err.message);
                    }
                  } else {
                    alertify.alert("Message", err);
                  }
                });
            }
          );
        })
        .catch((err) => {
          if (err.error) {
            if (err.error.msg) {
              alertify.alert("Message", err.error.msg);
            }
          } else {
            alertify.alert(
              "Message",
              "Somethng went wrong, Please try after sometime."
            );
          }
        });
    }
  };

  return (
    <main className="pt-lg-3">
      <div className="container">
        <form id="form" onSubmit={(e) => e.preventDefault()}>
          <ul
            id="progressbar"
            className="stepper nav nav-pills nav-justified text-center"
          >
            <li
              className={`nav-item ${currentGfgStep >= 0 ? "active" : ""}`}
              id="step1"
              onClick={() => setCurrentGfgStep(0)}
            >
              <strong>Assessment</strong>
            </li>
            <li
              className={`nav-item ${currentGfgStep >= 1 ? "active" : ""}`}
              id="step2"
              onClick={() => setCurrentGfgStep(1)}
            >
              <strong>Details</strong>
            </li>
            <li
              className={`nav-item ${currentGfgStep >= 2 ? "active" : ""}`}
              id="step3"
              onClick={() => setCurrentGfgStep(2)}
            >
              <strong>Settings</strong>
            </li>
          </ul>
          {currentGfgStep === 0 && (
            <fieldset className="content">
              <div className="dashboard-area classroom mx-auto">
                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <div className="class-board-info">
                    <h4
                      className="admin-color-head"
                      style={{ fontSize: "18px" }}
                    >
                      Filter Assessment
                    </h4>
                    <div className="row">
                      <div className="col-lg-6">
                        <form
                          className="session-management"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <h4 className="form-box_subtitle">Subject</h4>
                          <div style={{ marginTop: "5px" }}>
                            <Multiselect
                              options={userSubjects}
                              selectedValues={selectedSubjects}
                              onSelect={(e) => setSelectedSubjects(e)}
                              onRemove={(e) => setSelectedSubjects(e)}
                              displayValue="name"
                              placeholder="Select Subjects"
                              // style={styleForMultiSelect}
                              showCheckbox={true}
                              showArrow={true}
                              closeIcon="cancel"
                              avoidHighlightFirstOption={true}
                            />
                          </div>
                          <hr />
                        </form>
                      </div>
                      <div className="col-lg-6">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <h4 className="form-box_subtitle">Tags</h4>
                          <div className="color-tags">
                            <TagsInput
                              //@ts-ignore
                              style={{ padding: "2px" }}
                              value={cTags}
                              //@ts-ignore
                              required
                              onChange={(e) => setCTags(e)}
                              name="tags"
                              placeHolder="+ Enter a new tag"
                              separators={[" "]}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-3">
                    <button className="btn btn-outline-black" onClick={reset}>
                      Reset
                    </button>
                    <button
                      className="btn btn-primary ml-2"
                      disabled={!selectedSubjects || !selectedSubjects.length}
                      onClick={filter}
                    >
                      Filter
                    </button>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-lg-4">
                    <div className="admin-search">
                      <div
                        className="switch-item d-flex align-items-center float-none"
                        style={{ zIndex: "0" }}
                      >
                        <span className="assess-set-head">View Selected</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={viewSelect}
                            onChange={(e) => viewSelected(e.target.checked)}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="admin-search">
                      <span className="search">
                        <form
                          className="common_search-type-1 form-half ml-auto"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <div className="form-group">
                            <span>
                              <figure>
                                <img
                                  className="searchBoxIcon-5"
                                  src="/assets/images/search-icon-2.png"
                                  alt=""
                                />
                              </figure>
                            </span>
                            <input
                              type="text"
                              placeholder="Search for Assessment"
                              value={searchText}
                              onChange={(e) => {
                                setSearchText(e.target.value);
                                search(e.target.value);
                              }}
                              name="search"
                              className="form-control border-0"
                            />
                          </div>
                        </form>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-boxes bg-white">
                  <div className="folder-area clearfix">
                    <div className="table-responsive table-wrap">
                      <table className="table vertical-middle mb-0">
                        <thead>
                          <tr>
                            <th className="border-0">ASSESSMENT</th>
                            <th className="border-0 text-center">SUBJECT</th>
                            <th className="border-0 text-center">QUESTIONS</th>
                            <th className="border-0 text-center">CLASSROOM</th>
                            <th className="border-0 text-center">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterPractices.map((p, i) => (
                            <tr key={i}>
                              <td className="px-0">
                                <div className="admin-table admin-Table-new1">
                                  <div className="p-0 border-0 clearfix">
                                    <div className="checkbox11">
                                      <label className="container2 checkbox-click ml-0 mt-0">
                                        <input
                                          type="checkbox"
                                          checked={p.checked || false}
                                          onChange={(e) =>
                                            markCheck(e.target.checked, p, i)
                                          }
                                        />
                                        <span
                                          className="checkmark1 circle"
                                          style={{ top: "0px" }}
                                        ></span>
                                      </label>
                                    </div>
                                    <div className="inner ml-4">
                                      <div className="inners">
                                        <strong className="table_newTitle-asseSion">
                                          {p.title}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="admin-table text-center">
                                  <strong>{p.subjects[0].name}</strong>
                                </div>
                              </td>
                              <td>
                                <div className="admin-table text-center">
                                  <strong>{p.totalQuestion}</strong>
                                </div>
                              </td>
                              <td>
                                <div className="admin-table text-center">
                                  <strong>{p.classRooms.length}</strong>
                                </div>
                              </td>
                              <td className="text-center">
                                <div
                                  className="admin-draft-btn-remove"
                                  style={{
                                    display:
                                      p.status === "draft" ? "block" : "none",
                                  }}
                                >
                                  <strong>
                                    {p.status.charAt(0).toUpperCase() +
                                      p.status.slice(1)}
                                  </strong>
                                </div>
                                <div
                                  className="admin-draft-btn-remove"
                                  style={{
                                    display:
                                      p.status === "published"
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  <strong>
                                    {p.status.charAt(0).toUpperCase() +
                                      p.status.slice(1)}
                                  </strong>
                                </div>
                                <div
                                  className="admin-draft-btn-remove"
                                  style={{
                                    display:
                                      p.status === "withdrawn"
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  <strong>
                                    {p.status.charAt(0).toUpperCase() +
                                      p.status.slice(1)}
                                  </strong>
                                </div>
                              </td>
                              <td className="text-right">
                                <div
                                  className="admin-draft-btn-remove"
                                  style={{
                                    display:
                                      p.status === "draft" ? "block" : "none",
                                  }}
                                >
                                  <button
                                    className="btn btn-success btn-sm text-capitalize"
                                    onClick={() => publish(p)}
                                  >
                                    Publish
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {filterPractices.length < totalCount && !viewSelect && (
                    <button className="btn btn-light" onClick={loadMore}>
                      Load More
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => nextStepAndSave(0)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </fieldset>
          )}
          {currentGfgStep === 1 && (
            <fieldset className="content">
              <div className="dashboard-area classroom mx-auto">
                <div className="rounded-boxes form-boxes class-board-remove bg-white text-dark">
                  <div className="class-board-info">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <h4 className="form-box_subtitle">Session Name</h4>
                      <input
                        type="text"
                        name="search"
                        value={session.title}
                        onChange={(e) =>
                          setSession({ ...session, title: e.target.value })
                        }
                        placeholder="Enter Session Name"
                      />
                    </form>
                    <hr />
                  </div>
                </div>
                <div className="row text-dark">
                  <div className="col-lg-6">
                    <div className="rounded-boxes form-boxes bg-white">
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="class-board-info">
                            <h4 className="form-box_subtitle">Start Date</h4>
                            <p className="input-group datepicker-box border-bottom rounded-0">
                              <DatePicker
                                className="form-control"
                                selected={
                                  session.startDate
                                    ? new Date(session.startDate)
                                    : null
                                }
                                onChange={(date) =>
                                  setSession({ ...session, startDate: date })
                                }
                                minDate={minDate}
                                dateFormat="dd-MM-yyyy "
                                placeholderText="Enter date"
                                popperPlacement="bottom-start"
                                popperModifiers={{
                                  preventOverflow: {
                                    enabled: true,
                                    escapeWithReference: false,
                                    boundariesElement: "viewport",
                                  },
                                }}
                                ref={datePickerRef}
                              />
                              <span className="input-group-btn">
                                <button
                                  type="button"
                                  className="btn btn-date"
                                  onClick={() => {
                                    if (datePickerRef.current) {
                                      datePickerRef.current.input.focus();
                                    }
                                  }}
                                >
                                  <i className="far fa-calendar-alt text-black"></i>
                                </button>
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="class-board-info">
                            <h4 className="form-box_subtitle">Start Time</h4>
                            <input
                              type="time"
                              style={{ width: "50%" }}
                              value={
                                new Date(session.startDate) instanceof Date
                                  ? new Date(session.startDate)
                                      .toTimeString()
                                      .slice(0, 5)
                                  : ""
                              }
                              onChange={(e) => {
                                const timeValue = e.target.value;
                                const currentTime = new Date();
                                const hours = parseInt(timeValue.split(":")[0]);
                                const minutes = parseInt(
                                  timeValue.split(":")[1]
                                );
                                currentTime.setHours(hours, minutes);
                                setSession({
                                  ...session,
                                  startDate: currentTime,
                                });
                              }}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="rounded-boxes form-boxes class-board-remove bg-white">
                      <div className="class-board-info">
                        <h4 className="form-box_subtitle">
                          Login Allowance Time (mins)
                        </h4>
                        <form onSubmit={(e) => e.preventDefault()}>
                          <input
                            type="text"
                            name="search"
                            placeholder="Enter allowance time"
                            value={session.loginAllowanceTime}
                            onChange={(e) =>
                              setSession({
                                ...session,
                                loginAllowanceTime: e.target.value,
                              })
                            }
                            className="form-control"
                          />
                        </form>
                      </div>
                    </div>
                    <div className="rounded-boxes form-boxes class-board-remove bg-white">
                      <div className="class-board-info">
                        <div className="switch-item d-flex align-items-center float-none">
                          <h6 className="d-flex align-items-center">
                            Deactivate Remaining Students?
                            <label className="switch ml-3 my-0">
                              <input
                                type="checkbox"
                                checked={session.deactivateRemainingStudents}
                                onChange={(e) =>
                                  setSession({
                                    ...session,
                                    deactivateRemainingStudents:
                                      e.target.checked,
                                  })
                                }
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </h6>
                        </div>
                        <p>It will deactivate all the users</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button className="btn btn-outline" onClick={previousStep}>
                    Previous Step
                  </button>
                  <button
                    className="btn btn-primary ml-2"
                    onClick={() => nextStepAndSave(1)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </fieldset>
          )}
          {currentGfgStep === 2 && (
            <fieldset className="content">
              <div className="dashboard-area classroom mx-auto">
                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <h4 className="form-box_title">Marks</h4>
                  <div className="class-board-info">
                    <div className="row align-items-center inputFieldNum_new">
                      <div className="col-lg-4">
                        <div className="switch-item d-flex align-items-center float-none">
                          <span className="assess-set-head">
                            Marks at test level
                          </span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={session.isMarksLevel}
                              onChange={(e) =>
                                setSession({
                                  ...session,
                                  isMarksLevel: e.target.checked,
                                })
                              }
                            />
                            <span className="slider round translate-middle-y"></span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <span className="form-box_subtitle mr-3">
                          Positive Marks
                        </span>
                        <input
                          type="number"
                          style={{ color: "black" }}
                          name="score"
                          value={session.plusMark}
                          onChange={(e) =>
                            setSession({ ...session, plusMark: e.target.value })
                          }
                          maxLength="3"
                          min="0"
                          max="999"
                        />
                      </div>
                      <div className="col-lg-4">
                        <span className="form-box_subtitle mr-3">
                          Negative Marks
                        </span>
                        <input
                          type="number"
                          style={{ color: "black" }}
                          name="score"
                          value={session.minusMark}
                          onChange={(e) =>
                            setSession({
                              ...session,
                              minusMark: e.target.value,
                            })
                          }
                          maxLength="3"
                          min="-999"
                          max="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <div className="class-board-info">
                    <div className="row align-items-center inputFieldNum_new">
                      <div className="col-lg-12">
                        <div className="switch-item d-flex align-items-center float-none">
                          <span className="form-box_title mb-2">Time</span>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <span className="form-box_subtitle mr-3">
                          Total Time
                        </span>
                        <input
                          type="number"
                          name="search"
                          value={session.totalTime}
                          onChange={(e) =>
                            setSession({
                              ...session,
                              totalTime: e.target.value,
                            })
                          }
                          min="0"
                        />
                      </div>
                      <div className="col-lg-4">
                        <span className="form-box_subtitle mr-3">
                          Start Time Allowance
                        </span>
                        <input
                          type="number"
                          name="search"
                          value={session.startTimeAllowance}
                          onChange={(e) =>
                            setSession({
                              ...session,
                              startTimeAllowance: e.target.value,
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <div className="class-board-info titileHeaderBs-stepper_new">
                    <h4 className="form-box_title mb-2">Optional Settings</h4>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="profile-info">
                          <span className="form-box_subtitle mr-3">
                            Offscreen Limit
                          </span>
                          <form>
                            <input
                              className="form-control border-bottom rounded-0"
                              type="number"
                              value={session.offscreenLimit}
                              onChange={(e) =>
                                setSession({
                                  ...session,
                                  offscreenLimit: e.target.value,
                                })
                              }
                              min="0"
                            />
                          </form>
                          <br />
                          <div className="assess-set-toggle-box">
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Random questions
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.randomQuestions}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      randomQuestions: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Randomise answer options
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.randomizeAnswerOptions}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      randomizeAnswerOptions: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Ask feed at the end of test
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.showFeedback}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      showFeedback: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Automatic Evaluation
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.autoEvaluation}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      autoEvaluation: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="profile-info">
                          <span className="form-box_subtitle mr-3">
                            Attempts allowed per student
                          </span>
                          <form>
                            <input
                              type="number"
                              value={session.attemptAllowed}
                              onChange={(e) =>
                                setSession({
                                  ...session,
                                  attemptAllowed: e.target.value,
                                })
                              }
                              placeholder="Enter allowed attempts"
                              className="form-control border-bottom rounded-0"
                              min="0"
                            />
                          </form>
                          <br />
                          <div className="assess-set-toggle-box">
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Student Camera
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.camera}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      camera: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Allow students to view answer
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.isShowResult}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      isShowResult: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Allow students to view attempt
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.isShowAttempt}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      isShowAttempt: e.target.checked,
                                    })
                                  }
                                />
                                <span className="slider round translate-middle-y"></span>
                              </label>
                            </div>
                            <div className="switch-item d-flex align-items-center float-none my-1">
                              <span className="assess-set-head">
                                Allow other teachers to view
                              </span>
                              <label className="switch col-auto ml-auto my-0 align-middle">
                                <input
                                  type="checkbox"
                                  checked={session.allowTeacher}
                                  onChange={(e) =>
                                    setSession({
                                      ...session,
                                      allowTeacher: e.target.checked,
                                    })
                                  }
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

                <div className="text-right">
                  <button className="btn btn-outline" onClick={previousStep}>
                    Previous Step
                  </button>
                  <button
                    className="btn btn-primary ml-2"
                    onClick={() => nextStepAndSave(2)}
                  >
                    Finish
                  </button>
                </div>
              </div>
            </fieldset>
          )}
        </form>
      </div>
    </main>
  );
}
