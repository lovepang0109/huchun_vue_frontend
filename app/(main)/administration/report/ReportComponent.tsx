"use client";
import { useEffect, useState, useRef } from "react";
import * as adminSvc from "@/services/adminService";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";

export default function ReportComponent() {
  const [searchText, setSearchText] = useState<string>("");
  const [modules, setModules] = useState<any>([]);
  const [filteredModules, setFilteredModules] = useState<any>([]);
  const [reports, setReports] = useState<any>([]);

  useEffect(() => {
    adminSvc.getReports({ all: true }).then((res: any[]) => {
      setReports(res);
      let tmp_modules = modules;
      for (const report of res) {
        let myModule = tmp_modules.find((m) => m.name == report.module);

        if (!myModule) {
          myModule = {
            name: report.module,
            reports: [],
          };
          setModules([...tmp_modules, myModule]);
          tmp_modules = [...tmp_modules, myModule];
        }
        myModule.reports.push(report);
      }
      setFilteredModules(tmp_modules);
    });
  }, []);

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      const result = reports?.filter(
        (r) => r.name.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      const modules_tmp = [];
      for (const report of result) {
        let myModule = modules_tmp.find((m) => m.name == report.module);

        if (!myModule) {
          myModule = {
            name: report.module,
            reports: [],
          };
          modules_tmp.push(myModule);
        }

        myModule.reports.push(report);
      }
      setFilteredModules(modules_tmp);
    } else {
      setFilteredModules(modules);
    }
  };

  return (
    <main className="my-gap-common">
      <div className="container">
        <div className="rounded-boxes bg-white">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Report</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="asseess-search QuestiopnAssessInnerBind">
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
                    placeholder="Search for report"
                    name="txtSearch"
                    value={searchText}
                    onChange={(e) => search(e.target.value)}
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
          </div>
          {filteredModules.map((module, mi) => (
            <div
              key={module.name}
              className="mt-3 accordion"
              id={`accordion_${module.name}`}
            >
              <div
                className={`rounded-boxes shadow row no-gutters mb-3 ${
                  mi > 0 ? "collapsed" : ""
                }`}
                data-toggle="collapse"
                data-target={`#collapseContent${module.name}`}
                aria-expanded={mi === 0}
                aria-controls={`collapseContent${module.name}`}
                role="banner"
              >
                <div className="col">
                  <h4 className="inst-head d-inline-block">
                    {module.name === "testseries"
                      ? "Test Series"
                      : module.name?.charAt(0).toUpperCase() +
                        module.name?.slice(1)}
                  </h4>
                  <span className="ml-2 text_secondary">
                    <span
                      className="material-icons"
                      style={{ fontSize: "15px", verticalAlign: "middle" }}
                    >
                      assignment
                    </span>{" "}
                    {module.reports.length} Reports
                  </span>
                  <p className="instance-head-rep mt-1">
                    You can download all report use for {module.name}
                  </p>
                </div>
                <div className="col-auto">
                  <button
                    className={`btn btn-link ${mi > 0 ? "collapsed" : ""}`}
                    aria-controls={`collapseContent${module.name}`}
                    data-toggle="collapse"
                    aria-label="button dropdown for teacher report"
                    data-target={`#collapseContent${module.name}`}
                    aria-expanded={mi === 0}
                  >
                    <i className="fas fa-angle-up f-20"></i>
                  </button>
                </div>
              </div>

              {module.reports.map((report, i) => (
                <div
                  key={report._id}
                  className={`mb-3 collapse ${mi === 0 ? "show" : ""}`}
                  id={`collapseContent${module.name}`}
                  aria-labelledby={`heading${module.name}`}
                  data-parent={`#accordion_${module.name}`}
                >
                  <div className="form-row">
                    <div className="col-auto">
                      <h4 className="inst-head">
                        <strong className="mark1">{i + 1}</strong>
                      </h4>
                    </div>
                    <div className="col align-self-center">
                      <h4 className="inst-head">{report.name}</h4>
                      <p className="instance-head-rep1">{report.description}</p>
                    </div>
                    <div className="col-auto">
                      <Link
                        className="btn btn-outline"
                        href={`./report/${report._id}`}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
