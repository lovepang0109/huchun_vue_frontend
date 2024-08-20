"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as settingSvc from "@/services/settingService";
import * as authService from "@/services/auth";
import * as adminSvc from "@/services/adminService";
import * as classRoomService from "@/services/classroomService";
import moment from "moment";
import * as alertify from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { FileDrop } from "react-file-drop";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import { fromNow } from "@/lib/pipe";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ToggleComponent from "@/components/ToggleComponent";
import Multiselect from "multiselect-react-dropdown";
import Chart from "react-apexcharts";
import { Modal } from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MailTemplate() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [locations, setLocations] = useState<any>([]);
  const [codemirrorConfig, setCodemirrorConfig] = useState<any>({
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "application/json",
  });
  const fileBrowseRef = useRef(null);

  const [ckeOptions, setCckeOptions] = useState<any>({
    placeholder: "Note content...",
    simpleUpload: {
      // The URL that the images are uploaded to.
      uploadUrl: "/api/files/discussionUpload?method=drop",

      // Enable the XMLHttpRequest.withCredentials property.
      withCredentials: true,

      // Headers sent along with the XMLHttpRequest to the upload server.
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  });

  const [locationDropdownSettings, setLocationDropdownSettings] = useState<any>(
    {
      singleSelection: false,
      textField: "name",
      idField: "_id",
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false,
    }
  );
  const [staticTabs, setStaticTabs] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<any>([]);
  const [templates, setTemplates] = useState<any>([]);
  const user: any = useSession()?.data?.user?.info || {};
  const [searchText, setSearchText] = useState<string>("");
  const [filterTemplates, setFilterTemplates] = useState<any>([]);
  const [subEdit, setSubEdit] = useState<boolean>(false);
  const [bodyEdit, setBodyEdit] = useState<boolean>(false);
  const [preHeaderEdit, setPreHeaderEdit] = useState<boolean>(false);
  const [smsEdit, setSmsEdit] = useState<boolean>(false);
  const [nameEdit, setNameEdit] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(false);
  const [notiConfig, setNotiConfig] = useState<any>(null);
  const [previewData, setPreviewData] = useState<string>("");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadedSourceName, setUploadedSourceName] = useState<string>("");
  const [notificationDistChartOptions, setNotificationDistChartOptions] =
    useState<any>({
      series: [0, 0],
      options: {
        chart: {
          height: 350,
          type: "donut",
        },
        dataLabels: {
          enabled: false,
        },
        plotOptions: {
          pie: {
            donut: {
              size: "80%",
              labels: {
                show: true,
                value: {
                  fontSize: "16px",
                  fontWeight: 600,
                  formatter: (val, opts) => {
                    const total = opts.globals.series.reduce(
                      (p, c) => p + c,
                      0
                    );
                    return Math.round((val * 100) / total) + "%";
                  },
                },
                total: {
                  show: true,
                  label: "Users",
                  fontSize: "18px",
                  fontWeight: 700,
                  offsetY: 20,
                },
              },
            },
          },
        },
        legend: {
          show: true,
          position: "bottom",
          formatter: function (seriesName, opts) {
            const val = Number(opts.w.globals.series[opts.seriesIndex]);
            return [val, seriesName];
          },
        },
        tooltip: {
          enabled: false,
        },
        labels: ["Emails", "Phones"],
        responsive: [
          {
            breakpoint: 1200,
            options: {
              chart: {
                height: 300,
              },
            },
          },
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 250,
              },
            },
          },
        ],
      },
    });

  const [changeDataSrcModal, setChangeDataSrcModal] = useState<boolean>(false);
  const [dataSourceString, setDataSourceString] = useState<string>("");
  const [dataSourceCollection, setDataSourceCollection] =
    useState<string>("users");
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<any>(new Date());

  const getSelectedTemplateFunc = () => {
    return selectedTemplate;
  };

  const setSelectedTemplateFunc = (value: any, loc?: any) => {
    if (!loc) {
      loc = locations;
    }
    setSelectedTemplate(value);
    onTemplateChanged(value, loc);
  };

  useEffect(() => {
    adminSvc.getMailTemplates().then((res: any[]) => {
      res.sort((t1, t2) =>
        t1.note.toLowerCase().localeCompare(t2.note.toLowerCase())
      );
      setTemplates(res);
      setFilterTemplates(res);

      if (res.length > 0) {
        classRoomService.getAllInstitutes().then((locs: []) => {
          setLocations(locs.sort((a, b) => a.name.localeCompare(b.name)));
          setSelectedTemplateFunc(
            res[0],
            locs.sort((a, b) => a.name.localeCompare(b.name))
          );
        });
      }
    });

    settingSvc.getNotificationConfig().then((config) => {
      setNotiConfig(config);
    });

    classRoomService.getAllInstitutes().then((locs: []) => {
      setLocations(locs.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  const previewTemplate = (tmp?: any) => {
    if (!tmp) {
      tmp = selectedTemplate;
    }
    setPreview(!preview);
    const tmp_preview = !preview;
    console.log("previewTemplate", tmp_preview);
    if (tmp_preview) {
      setPreviewData(notiConfig.header + tmp.body + notiConfig.footer);
    }
  };

  const onTemplateChanged = (value: any, locs?: any) => {
    if (!locs) {
      locs = locations;
    }
    setPreview(false);
    setPreviewData("");
    setEditingTemplate(value ? { ...value } : null);

    if (value) {
      setSelectedLocations(
        locs.filter((loc) => value.locations.indexOf(loc._id) > -1)
      );
    }
    if (value && value.schedule) {
      setSelectedTemplate({
        ...value,
        schedule: {
          ...value.schedule,
          endHour: moment(value.schedule.endDate).get("hour"),
        },
      });
      value.schedule.endHour = moment(value.schedule.endDate).get("hour");
      if (value.uploadedSource) {
        setUploadedSourceName(value.uploadedSource.name);
        // calculate number of phone or email
        let emailCount = 0;
        let phoneCount = 0;
        for (const u of value.uploadedSource.users) {
          if (u.email) {
            emailCount++;
          } else if (u.phoneNumber) {
            phoneCount++;
          }
        }
        setNotificationDistChartOptions({
          ...notificationDistChartOptions,
          series: [emailCount, phoneCount],
        });
      } else if (value.dataSource) {
        setUploadedSourceName("");
        setLoadingStats(true);
        // get statistic
        adminSvc
          .runMailTemplateDataSource(value.dataCollection, value.dataSource, {
            statistic: true,
          })
          .then((res: any) => {
            // update chart
            setNotificationDistChartOptions({
              ...notificationDistChartOptions,
              series: [res.email, res.phone],
            });
            setLoadingStats(false);
          })
          .catch((err) => {
            console.log(err);
            setLoadingStats(false);
          });

        if (value.dataSource.length) {
          const lastAgg = value.dataSource[value.dataSource.length - 1];
          value.tags = Object.keys(lastAgg[Object.keys(lastAgg)[0]]).filter(
            (t) => t != "_id"
          );
        } else {
          value.tags = [];
        }
      } else {
        setUploadedSourceName("");
      }
      setSelectedTemplate(value);
    }

    if (staticTabs) {
      setStaticTabs((prevTabs) =>
        prevTabs.map((tab, index) => ({
          ...tab,
          active: index === 0,
        }))
      );
    }
  };

  const saveMailData = (field: any) => {
    adminSvc
      .updateMailTemplate(selectedTemplate._id, {
        [field]: editingTemplate[field],
      })
      .then((res) => {
        alertify.success(`${field} is updated`);
        setEditingTemplate({
          ...editingTemplate,
          updatedAt: new Date(),
        });
        setSelectedTemplate((prevTemplate) => ({
          ...prevTemplate,
          updatedAt: new Date(),
          [field]: editingTemplate[field],
        }));
      });
  };

  const cancelMailData = (field: any) => {
    setEditingTemplate({
      ...editingTemplate,
      [field]: selectedTemplate[field],
    });
  };

  const sendTestMail = () => {
    adminSvc
      .testBulkMail(selectedTemplate._id, selectedTemplate)
      .then((res) => {
        alertify.success("Test mail is sent.");
      });
  };

  const search = (text: string) => {
    if (!text) {
      text = searchText;
      if ((text = "")) {
        text = "";
      }
    }
    console.log(text, "text");
    if (text) {
      setFilterTemplates(
        templates.filter(
          (t) => t.note.toLowerCase().indexOf(text.toLowerCase()) > -1
        )
      );
    } else {
      setFilterTemplates(templates);
    }
  };

  const selectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setSelectedTemplateFunc(template);
  };

  const deactivate = (template: any, index?: any) => {
    alertify.confirm("Do you want to deactivate the email?", () => {
      adminSvc.changeMailTemlateStatus(template._id, false).then((res) => {
        alertify.success(`Template is deactivated`);
        const updatedTemplates = filterTemplates.map((t) =>
          t._id === template._id
            ? { ...t, active: false, updatedAt: new Date() }
            : t
        );
        setFilterTemplates(updatedTemplates);
      });
    });
  };

  const activate = (template: any, index?: any) => {
    alertify.confirm("Do you want to activate the email?", () => {
      adminSvc.changeMailTemlateStatus(template._id, true).then((res) => {
        alertify.success(`Template is activated`);
        const updatedTemplates = filterTemplates.map((t) =>
          t._id === template._id
            ? { ...t, active: true, updatedAt: new Date() }
            : t
        );
        setFilterTemplates(updatedTemplates);
      });
    });
  };

  const openPreview = (template: any) => {
    selectTemplate(template);
    setTimeout(() => {
      previewTemplate(template);
    }, 500);
  };

  const changeDataSource = (template: any) => {
    setDataSourceCollection(selectedTemplate.dataCollection || "users");
    setDataSourceString(
      JSON.stringify(selectedTemplate.dataSource, null, "\t")
    );
    setChangeDataSrcModal(true);
  };

  const updateDataSource = () => {
    try {
      setSelectedTemplate({
        ...selectedTemplate,
        dataCollection: dataSourceCollection,
        dataSource: JSON.parse(dataSourceString),
      });
      const tmp_selectedTemplate = {
        ...selectedTemplate,
        dataCollection: dataSourceCollection,
        dataSource: JSON.parse(dataSourceString),
      };

      setChangeDataSrcModal(false);

      if (tmp_selectedTemplate.dataSource.length > 0) {
        const lastAgg =
          tmp_selectedTemplate.dataSource[
            tmp_selectedTemplate.dataSource.length - 1
          ];
        setSelectedTemplate({
          ...tmp_selectedTemplate,
          tags: Object.keys(lastAgg[Object.keys(lastAgg)[0]]).filter(
            (t) => t != "_id"
          ),
        });
      } else {
        setSelectedTemplate({
          ...tmp_selectedTemplate,
          tags: [],
        });
      }
      adminSvc
        .updateMailTemplate(selectedTemplate._id, {
          dataCollection: dataSourceCollection,
          dataSource: JSON.parse(dataSourceString),
        })
        .then((res) => {
          setLoadingStats(true);
          adminSvc
            .runMailTemplateDataSource(
              dataSourceCollection,
              JSON.parse(dataSourceString),
              { statistic: true }
            )
            .then((res: any) => {
              // update chart
              setNotificationDistChartOptions({
                ...notificationDistChartOptions,
                series: [res.email, res.phone],
              });
              setLoadingStats(false);
            })
            .catch((err) => {
              setLoadingStats(false);
            });
        });
    } catch (ex) {
      console.log(ex, "Ex");
      alertify.alert("Message", "Invalid JSON format.");
    }
  };

  const closeDataSourceModal = () => {
    setChangeDataSrcModal(false);
  };

  const updateSchedule = () => {
    if (!selectedTemplate) {
      return;
    }
    const tmp = selectedTemplate;

    if (selectedTemplate.schedule.endDate) {
      setSelectedTemplate({
        ...selectedTemplate,
        schedule: {
          ...selectedTemplate.schedule,
          endDate: moment(selectedTemplate.schedule.endDate)
            .set({
              hour: selectedTemplate.schedule.endHour,
              minute: 0,
              second: 0,
              millisecond: 0,
            })
            .toDate(),
        },
      });
      tmp.schedule.endDate = moment(tmp.schedule.endDate)
        .set({
          hour: tmp.schedule.endHour,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toDate();
    }
    adminSvc.updateMailTemplate(tmp._id, tmp).then((res) => {
      if (selectedTemplate.dataSource && selectedTemplate.schedule.active) {
        alertify.success("Bulk mail is scheduled.");
      } else {
        alertify.success("Mail template is updated.");
      }
    });
  };

  const cancelUpload = () => {
    setUploading(false);
  };

  const onRepeatChange = (e) => {
    const updatedSelectedTemplate = selectedTemplate;

    // updatedSelectedTemplate.schedule.repeatEvery = e.target.value;
    for (const k in updatedSelectedTemplate.schedule.repeatOn) {
      updatedSelectedTemplate.schedule.repeatOn[k] = false;
    }

    setSelectedTemplate({
      ...updatedSelectedTemplate,
      schedule: {
        ...updatedSelectedTemplate.schedule,
        repeatEvery: e.target.value,
      },
    });
  };

  const onRepeatDayChange = (day: any, event: any) => {
    // only allow single select if repeatEvery not 'day'
    setSelectedTemplate((prevState) => ({
      ...prevState,
      schedule: {
        ...prevState.schedule,
        repeatOn: {
          ...prevState.schedule.repeatOn,
          [day]: event.target.checked,
        },
      },
    }));

    if (
      selectedTemplate.schedule.repeatEvery &&
      selectedTemplate.schedule.repeatEvery != "day" &&
      event
    ) {
      setTimeout(() => {
        const updatedSelectedTemplate = selectedTemplate;
        for (const k in updatedSelectedTemplate.schedule.repeatOn) {
          updatedSelectedTemplate.schedule.repeatOn[k] = k === day;
        }

        setSelectedTemplate(updatedSelectedTemplate);
      }, 100);
    }
  };

  const endHourUp = () => {
    if (selectedTemplate.schedule.endHour < 23) {
      setSelectedTemplate({
        ...selectedTemplate,
        schedule: {
          ...selectedTemplate.schedule,
          endHour: selectedTemplate.schedule.endHour + 1,
        },
      });
    }
  };

  const endHourDown = () => {
    if (selectedTemplate.schedule.endHour) {
      setSelectedTemplate({
        ...selectedTemplate,
        schedule: {
          ...selectedTemplate.schedule,
          endHour: selectedTemplate.schedule.endHour - 1,
        },
      });
    }
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const cancelDocs = () => {
    setUploadFile(null);
  };

  const uploadCampaignMailSource = () => {
    if (selectedTemplate && uploadFile && !uploading) {
      const formData: FormData = new FormData();
      formData.append("file", uploadFile, uploadFile.name);

      setUploading(true);
      adminSvc
        .uploadCampaignMailSource(selectedTemplate._id, formData)
        .then((res: any) => {
          alertify.success(`Mail source is uploaded.`);
          setNotificationDistChartOptions({
            ...notificationDistChartOptions,
            series: [res.email, res.phone],
          });
          setUploadedSourceName(res.name);
          setUploadFile(false);
          setUploadFile(null);
        })
        .catch((err) => {
          if (err.response.data.msg) {
            alertify.alert("Message", err.response.data.msg);
          } else {
            alertify.alert("Message", "Fail to upload mail source.");
          }
          setUploadFile(false);
          setUploadFile(null);
        });
    }
  };

  const removeFileSource = () => {
    if (selectedTemplate) {
      adminSvc
        .removeCampaignMailUploadedSource(selectedTemplate._id)
        .then((res: any) => {
          alertify.success(`Uploaded mail source is removed.`);
          setUploadedSourceName("");
          setSelectedTemplate({
            ...selectedTemplate,
            uploadedSource: null,
          });
        })
        .catch((err) => {
          if (err.response.data.msg) {
            alertify.alert("Message", err.response.data.msg);
          } else {
            alertify.alert("Message", "Fail to remove mail source.");
          }
        });
    }
  };

  const saveLocations = () => {
    setSelectedTemplate({
      ...selectedTemplate,
      locations: selectedLocations.map(({ _id }) => _id),
    });
    const updatedTemplates = filterTemplates.map((t) =>
      t._id === selectedTemplate._id
        ? { ...t, locations: selectedLocations.map(({ _id }) => _id) }
        : t
    );
    setFilterTemplates(updatedTemplates);
    adminSvc
      .updateMailTemplate(selectedTemplate._id, {
        allowAllLocations: selectedTemplate.allowAllLocations,
        locations: selectedLocations.map(({ _id }) => _id),
      })
      .then((res) => {
        alertify.success("Location setting is saved");
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Fail to update this template.");
      });
  };

  return (
    <>
      <div className="container bulk-mail">
        <div className="hadding-name">
          <h3>Manage Communication Templates</h3>
        </div>
        <div className="main-body bg-white text-dark p-3">
          <div className="row">
            <div className="col-4">
              <div className="d-flex justify-content-between align-items-center px-1">
                <span>
                  <strong>Templates</strong>
                </span>
                {/* SearchBox component with two-way binding and search event */}
                <div className="member-search my-3">
                  <form
                    className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                    style={{ maxWidth: "100%" }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      // search();
                    }}
                  >
                    <input
                      type="text"
                      className="form-control border-0 my-0"
                      maxLength={50}
                      placeholder="Search..."
                      name="txtSearch"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        search(e.target.value);
                      }}
                    />
                    {searchText !== "" && (
                      <span
                        className="search-pause"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "3px",
                        }}
                        onClick={() => {
                          setSearchText("");

                          search("");
                        }}
                      >
                        <FontAwesomeIcon icon={faXmarkCircle} />
                      </span>
                    )}

                    <span className="m-0 w-auto h-auto">
                      <figure className="m-0 w-auto">
                        <img
                          className="m-0 h-auto mw-100"
                          src="/assets/images/search-icon-2.png"
                          alt=""
                        />
                      </figure>
                    </span>
                  </form>
                </div>
              </div>

              <div
                className="mt-2 px-1"
                style={{ maxHeight: "calc(100vh - 180px)", overflow: "auto" }}
              >
                {/* Mapping over filterTemplates array */}
                {filterTemplates.map((template, i) => (
                  <div
                    key={template._id}
                    className={`p-2 border rounded my-2 cursor-pointer ${
                      template._id === selectedTemplate?._id
                        ? "border-success"
                        : ""
                    }`}
                    onClick={() => selectTemplate(template)}
                  >
                    <p className="bold mb-2">
                      {template.note}&nbsp;&nbsp;
                      {/* Conditional rendering for icon based on template properties */}
                      {template.active ? (
                        <i
                          className="fas fa-circle text-primary"
                          title="active"
                        ></i>
                      ) : (
                        <i className="far fa-circle" title="inactive"></i>
                      )}
                      &nbsp;
                      {template.dataSource ? (
                        <i
                          className="fas fa-calendar-check"
                          title="campaign"
                        ></i>
                      ) : (
                        <i className="fas fa-bell" title="transaction"></i>
                      )}
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {/* Using moment.js or similar library for date formatting */}
                        <p>Last update {fromNow(template.updatedAt)}</p>
                        {template.lastRunDate && (
                          <p>Last run {fromNow(template.lastRunDate)}</p>
                        )}
                      </div>

                      <div>
                        {/* Buttons for Preview, Activate, Deactivate */}
                        <button
                          className="btn btn-sm btn-outline mr-1"
                          onClick={() => openPreview(template)}
                        >
                          Preview
                        </button>
                        {template.active ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deactivate(template, i)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => activate(template, i)}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedTemplate && (
              <div className="col-8">
                <Tabs
                  defaultActiveKey="design"
                  id="uncontrolled-tab-example"
                  className="mb-3"
                >
                  <Tab
                    eventKey="design"
                    title={
                      <span className="mx-auto border-0">
                        <strong className="text-center mx-auto">Design</strong>
                      </span>
                    }
                  >
                    <div className="pt-2">
                      <div className="text-right mb-3">
                        <button
                          onClick={() => {
                            setPreview(!preview);
                            previewTemplate();
                          }}
                          className="btn btn-primary"
                        >
                          <i
                            className={`fa ${preview ? "fa-pause" : "fa-play"}`}
                          ></i>
                          &nbsp;Preview
                        </button>
                        {selectedTemplate.dataSource && (
                          <button
                            className="btn btn-outline ml-2"
                            onClick={sendTestMail}
                          >
                            Send Test
                          </button>
                        )}
                      </div>

                      {preview ? (
                        <iframe
                          srcDoc={previewData}
                          width="100%"
                          height="800px"
                        ></iframe>
                      ) : (
                        <>
                          {selectedTemplate.dataSource && (
                            <div className="border border-primary rounded mb-3">
                              <div className="border-bottom border-primary d-flex justify-content-between py-2 px-3 text-primary align-items-center">
                                <h4 className="f-16 bold">Name</h4>
                                <div className="d-flex gap-xs">
                                  {!nameEdit ? (
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => setNameEdit(true)}
                                    >
                                      <i className="far fa-edit"></i>&nbsp;Edit
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-light"
                                        onClick={() => {
                                          setNameEdit(false);
                                          cancelMailData("note");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                          setNameEdit(false);
                                          saveMailData("note");
                                        }}
                                      >
                                        <i className="far fa-save"></i>
                                        &nbsp;Save
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="p-3">
                                <textarea
                                  name="note"
                                  className="border-0 outline-0 w-100 textarea-no-resize"
                                  rows="1"
                                  value={editingTemplate.note}
                                  onChange={(e) => {
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      note: e.target.value,
                                    });
                                  }}
                                  readOnly={!nameEdit}
                                  aria-label="text"
                                ></textarea>
                              </div>
                            </div>
                          )}

                          {selectedTemplate.dataSource &&
                            selectedTemplate.tags && (
                              <div className="tag-use">
                                <h6>Tags Used</h6>
                                <div className="tag-use-input mt-2">
                                  {selectedTemplate.tags.map((tag, index) => (
                                    <span key={index} contentEditable="true">
                                      @{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="border border-primary rounded mb-3">
                            <div className="border-bottom border-primary d-flex justify-content-between py-2 px-3 text-primary align-items-center">
                              <h4 className="f-16 bold">Subject</h4>
                              <div className="d-flex gap-xs">
                                {!subEdit ? (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => setSubEdit(true)}
                                  >
                                    <i className="far fa-edit"></i>&nbsp;Edit
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-light"
                                      onClick={() => {
                                        setSubEdit(false);
                                        cancelMailData("subject");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setSubEdit(false);
                                        saveMailData("subject");
                                      }}
                                    >
                                      <i className="far fa-save"></i>&nbsp;Save
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-3">
                              <textarea
                                placeholder="subject..."
                                className="border-0 outline-0 w-100 textarea-no-resize"
                                name="subject"
                                rows="1"
                                value={editingTemplate.subject}
                                onChange={(e) => {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    subject: e.target.value,
                                  });
                                }}
                                readOnly={!subEdit}
                                aria-label="text"
                              ></textarea>
                            </div>
                          </div>

                          <div className="border border-primary rounded mb-3">
                            <div className="border-bottom border-primary d-flex justify-content-between py-2 px-3 text-primary align-items-center">
                              <h4 className="f-16 bold">Body</h4>
                              <div className="d-flex gap-xs">
                                {!bodyEdit ? (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => setBodyEdit(true)}
                                  >
                                    <i className="far fa-edit"></i>&nbsp;Edit
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-light"
                                      onClick={() => {
                                        setBodyEdit(false);
                                        cancelMailData("body");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setBodyEdit(false);
                                        saveMailData("body");
                                      }}
                                    >
                                      <i className="far fa-save"></i>&nbsp;Save
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-3">
                              {bodyEdit ? (
                                <textarea
                                  placeholder="body..."
                                  className="border-0 outline-0 w-100 textarea-no-resize"
                                  name="body"
                                  rows="20"
                                  value={editingTemplate.body}
                                  onChange={(e) => {
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      body: e.target.value,
                                    });
                                  }}
                                  aria-label="text"
                                ></textarea>
                              ) : (
                                <iframe
                                  srcDoc={editingTemplate.body}
                                  width="100%"
                                  height="340px"
                                ></iframe>
                              )}
                            </div>
                          </div>

                          <div className="border border-primary rounded mb-3">
                            <div className="border-bottom border-primary d-flex justify-content-between py-2 px-3 text-primary align-items-center">
                              <h4 className="f-16 bold">Preheader</h4>
                              <div className="d-flex gap-xs">
                                {!preHeaderEdit ? (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => setPreHeaderEdit(true)}
                                  >
                                    <i className="far fa-edit"></i>&nbsp;Edit
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-light"
                                      onClick={() => {
                                        setPreHeaderEdit(false);
                                        cancelMailData("preheader");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setPreHeaderEdit(false);
                                        saveMailData("preheader");
                                      }}
                                    >
                                      <i className="far fa-save"></i>&nbsp;Save
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-3">
                              <textarea
                                placeholder="preheader..."
                                className="border-0 outline-0 w-100 textarea-no-resize"
                                name="preheader"
                                rows="3"
                                value={editingTemplate.preheader}
                                onChange={(e) => {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    preheader: e.target.value,
                                  });
                                }}
                                readOnly={!preHeaderEdit}
                                aria-label="text"
                              ></textarea>
                            </div>
                          </div>

                          <div className="border border-primary rounded mb-3">
                            <div className="border-bottom border-primary d-flex justify-content-between py-2 px-3 text-primary align-items-center">
                              <h4 className="f-16 bold">SMS Text</h4>
                              <div className="d-flex gap-xs">
                                {!smsEdit ? (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => setSmsEdit(true)}
                                  >
                                    <i className="far fa-edit"></i>&nbsp;Edit
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-light"
                                      onClick={() => {
                                        setSmsEdit(false);
                                        cancelMailData("sms");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setSmsEdit(false);
                                        saveMailData("sms");
                                      }}
                                    >
                                      <i className="far fa-save"></i>&nbsp;Save
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-3">
                              <textarea
                                placeholder="sms..."
                                className="border-0 outline-0 w-100 textarea-no-resize"
                                name="sms"
                                rows="3"
                                maxLength="160"
                                value={editingTemplate.sms}
                                onChange={(e) => {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    sms: e.target.value,
                                  });
                                }}
                                readOnly={!smsEdit}
                                aria-label="text"
                              ></textarea>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Tab>
                  <Tab
                    eventKey="schedule"
                    title={
                      <span className="mx-auto border-0">
                        <strong className="text-center mx-auto">
                          Schedule
                        </strong>
                      </span>
                    }
                  >
                    <div className="p-3 mt-2 standard-upload-box my-0 text-left">
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <div className="d-flex align-items-center">
                          <span className="mr-3 switch-item-label">
                            All Locations
                          </span>
                          <label className="switch my-0">
                            <input
                              type="checkbox"
                              value="1"
                              checked={selectedTemplate.allowAllLocations}
                              onChange={(e) => {
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  allowAllLocations: e.target.checked,
                                });
                                setSelectedLocations([]);
                              }}
                              disabled={user.role !== "admin"}
                            />
                            <span className="slider round translate-middle-y"></span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-3">
                        <strong className="form-box_title">
                          {selectedTemplate.allowAllLocations
                            ? "Exception Location"
                            : "Location"}
                        </strong>
                        <div className="border-bottom LibraryChange_new">
                          {locations?.length && (
                            <Multiselect
                              className="multiSelectLocCls"
                              options={locations}
                              selectedValues={selectedLocations}
                              onSelect={(e) => setSelectedLocations(e)}
                              onRemove={(e) => setSelectedLocations(e)}
                              displayValue="name"
                              placeholder="Select locations"
                              // style={styleForMultiSelect}
                              showCheckbox={true}
                              showArrow={true}
                              closeIcon="cancel"
                              avoidHighlightFirstOption={true}
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          className="btn btn-theme-bg"
                          onClick={() => saveLocations()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    {selectedTemplate.dataSource && (
                      <>
                        <div className="pt-3">
                          <div className="p-3 standard-upload-box my-0 text-left">
                            <h6>Target Users</h6>
                            <p>
                              You can select users from the database using a
                              predefined query or upload a CSV file.
                            </p>
                          </div>
                        </div>
                        <div className="row mt-4">
                          <div className="col">
                            <div className="uplode">
                              <div className="standard-upload-box mt-2">
                                <FileDrop onDrop={(f: any) => dropped(f)}>
                                  <h2 className="upload_icon mb-0">
                                    <span className="material-icons">
                                      file_copy
                                    </span>
                                  </h2>
                                  <p className="pro-text-drug text-center d-block active text-primary mt-2">
                                    {uploadFile?.name}
                                  </p>
                                  <span className="title">
                                    Drag and Drop or{" "}
                                    <a
                                      onClick={openFileSelector}
                                      className="active text-primary"
                                    >
                                      {" "}
                                      browse{" "}
                                    </a>{" "}
                                    your files
                                  </span>
                                  <div className="text-center">
                                    {!uploadFile?.name ? (
                                      <>
                                        <a
                                          className="btn btn-primary btn-sm mx-2"
                                          onClick={openFileSelector}
                                        >
                                          Browse
                                        </a>
                                      </>
                                    ) : (
                                      <>
                                        <a
                                          className="btn btn-secondary btn-sm mx-2"
                                          onClick={cancelDocs}
                                        >
                                          Cancel
                                        </a>
                                      </>
                                    )}
                                    <a
                                      className={`btn btn-secondary btn-sm ${
                                        !uploadFile ? "disabled" : ""
                                      }`}
                                      onClick={() => uploadCampaignMailSource()}
                                    >
                                      Upload
                                    </a>
                                    <a
                                      className="btn btn-primary btn-sm ml-2"
                                      href="/assets/media/campaign_template.xlsx"
                                      target="_blank"
                                    >
                                      Download Template
                                    </a>
                                  </div>
                                  <input
                                    accept=".xls,.xlsx"
                                    value=""
                                    style={{ display: "none", opacity: 0 }}
                                    ref={fileBrowseRef}
                                    type="file"
                                    onChange={(e) => dropped(e.target.files)}
                                  />
                                </FileDrop>
                              </div>
                            </div>
                            {selectedTemplate && (
                              <div className="standard-upload-box p-3 text-center">
                                <p>
                                  Select this option to use database query to
                                  get list of <br></br>users
                                </p>
                                <a
                                  onClick={() =>
                                    changeDataSource("editDataSourceTemplate")
                                  }
                                  className="btn btn-primary mt-2"
                                >
                                  Database Query
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="col border-left">
                            <div className="cart position-relative rounded shadow p-4">
                              <h5>Total Users</h5>
                              <p>User will receive message for this template</p>
                              <Chart
                                series={notificationDistChartOptions.series}
                                options={notificationDistChartOptions.options}
                                type="donut"
                              />
                              {loadingStats && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    marginLeft: "-28px",
                                    marginTop: "-28px",
                                  }}
                                >
                                  <i className="fa fa-pulse fa-spinner fa-4x"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedTemplate && (
                          <div className="section-5 mt-4">
                            <div className="sms-box">
                              <h4>
                                Schedule
                                <label className="switch">
                                  <input
                                    name="active"
                                    type="checkbox"
                                    checked={selectedTemplate.schedule.active}
                                    onChange={(e) => {
                                      setSelectedTemplate({
                                        ...selectedTemplate,
                                        schedule: {
                                          ...selectedTemplate.schedule,
                                          active: e.target.checked,
                                        },
                                      });
                                    }}
                                    aria-label="checkbox"
                                  />
                                  <span className="slider"></span>
                                </label>
                                {selectedTemplate && (
                                  <div className="flex-grow-1 text-right">
                                    <button
                                      className="btn btn-theme-bg"
                                      onClick={updateSchedule}
                                    >
                                      Save
                                    </button>
                                  </div>
                                )}
                              </h4>
                              <div className="disc">
                                <div className="row">
                                  <div className="col-sm-12 col-md-6 col-lg-4">
                                    <div className="repeat-every">
                                      <h5 className="name-teb">Repeat every</h5>
                                      <select
                                        name="repeatEvery"
                                        value={
                                          selectedTemplate.schedule.repeatEvery
                                        }
                                        onChange={(e) => {
                                          onRepeatChange(e);
                                        }}
                                      >
                                        <option value="day">
                                          Once in a Day
                                        </option>
                                        <option value="week">
                                          Once in a Week
                                        </option>
                                        <option value="month">
                                          Once in a Month
                                        </option>
                                        <option value="year">
                                          Once in a Year
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-sm-12 col-md-6 col-lg-4">
                                    <div className="repeat-on">
                                      <h5 className="name-teb">
                                        <img
                                          src="/assets/images/ro.png"
                                          alt=""
                                          width="12"
                                        />{" "}
                                        Repeat on
                                      </h5>
                                      <div className="in-flex">
                                        {[
                                          "sunday",
                                          "monday",
                                          "tuesday",
                                          "wednesday",
                                          "thursday",
                                          "friday",
                                          "saturday",
                                        ].map((day, index) => (
                                          <div
                                            className="input-box-a"
                                            key={index}
                                          >
                                            <span className="checkbox">
                                              <input
                                                type="checkbox"
                                                id={`day-${day
                                                  .charAt(0)
                                                  .toUpperCase()}`}
                                                name={`day-${day
                                                  .charAt(0)
                                                  .toUpperCase()}`}
                                                checked={
                                                  selectedTemplate.schedule
                                                    .repeatOn[day]
                                                }
                                                onChange={(event) =>
                                                  onRepeatDayChange(day, event)
                                                }
                                              />
                                              <label
                                                htmlFor={`day-${day
                                                  .charAt(0)
                                                  .toUpperCase()}`}
                                              >
                                                <div className="box-main">
                                                  {day.charAt(0).toUpperCase()}
                                                </div>
                                              </label>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-12 col-md-6 col-lg-4">
                                    <div className="repeat-end">
                                      <h5 className="name-teb">
                                        <img
                                          src="assets/images/clock2.png"
                                          alt=""
                                          width="16"
                                        />{" "}
                                        End On
                                      </h5>
                                    </div>
                                    <div className="on-select mb-4">
                                      <div className="on-select-box d-flex align-items-center border pr-1">
                                        <DatePicker
                                          className="form-control date-picker"
                                          placeholderText="Start Date"
                                          selected={
                                            new Date(
                                              selectedTemplate.schedule
                                                .endDate || null
                                            )
                                          }
                                          onChange={(date) => {
                                            setSelectedTemplate({
                                              ...selectedTemplate,
                                              schedule: {
                                                ...selectedTemplate.schedule,
                                                endDate: date,
                                              },
                                            });
                                          }}
                                          dateFormat="dd-MM-yyyy"
                                          minDate={currentDate}
                                        />
                                        <ol className="mb-0">
                                          <li
                                            className="material-icons cursor-pointer"
                                            onClick={() =>
                                              document
                                                .querySelector(".date-picker")
                                                .focus()
                                            }
                                          >
                                            date_range
                                          </li>
                                        </ol>
                                      </div>
                                    </div>
                                    <div className="on-select">
                                      <h5>Set mail time after</h5>
                                      <div className="add-after">
                                        <a
                                          className="add-remov"
                                          onClick={endHourDown}
                                        >
                                          <i className="fa fa-minus"></i>
                                        </a>
                                        <input
                                          type="text"
                                          className="m-0 input-hour"
                                          name="schedule-end-hour"
                                          pattern="[0-9]{1,2}"
                                          maxLength="2"
                                          value={
                                            selectedTemplate.schedule.endHour
                                          }
                                          readOnly
                                          aria-label="text"
                                        />
                                        <a
                                          className="add-remov"
                                          onClick={endHourUp}
                                        >
                                          <i className="fa fa-plus"></i>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Tab>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        show={changeDataSrcModal}
        onHide={() => setChangeDataSrcModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-content">
          <div className="modal-header modal-header-bg justify-content-center">
            <h6 className="form-box_title mb-0 text-center">Data Source</h6>
          </div>
          <div className="modal-body">
            <label>Collection</label>
            <select
              className="form-control"
              name="collection"
              value={dataSourceCollection}
              onChange={(e) => setDataSourceCollection(e.target.value)}
            >
              <option value="" disabled>
                Select a collection
              </option>
              <option value="userenrollments">userenrollments</option>
              <option value="users">users</option>
            </select>
            <label>Aggregate Query</label>

            <CodeMirror
              value={dataSourceString}
              onChange={(e) => setDataSourceString(e)}
              style={{ overflowY: "scroll" }}
              options={codemirrorConfig}
            />
            <div className="text-right mt-2">
              <button
                className="btn btn-link mr-2"
                onClick={closeDataSourceModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => updateDataSource()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
