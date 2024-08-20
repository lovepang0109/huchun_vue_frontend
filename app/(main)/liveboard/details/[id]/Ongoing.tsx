"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { LiveboardWatchService } from "@/services/liveboardWatchService";
import Pagination from "@/components/Pagination";
import { getStudents } from "@/services/classroomService";
import {
  ongoingTestByClass,
  completedTestStudentsByClass,
} from "@/services/practiceService";
import { downloadReportData } from "@/services/adminService";

interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
}

interface OngoingProps {
  cls: any;
  sideMenu: string;
}

const Ongoing: React.FC<OngoingProps> = ({ cls, sideMenu }) => {
  const chartRef = useRef<typeof Chart>(null);
  const [attempts, setAttempts] = useState<any>([]);
  const [test, setTest] = useState<any>([]);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState<any>({ page: 1, limit: 12 });
  const [students, setStudents] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const liveboardWatchService = LiveboardWatchService();

  const chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "Started",
        "Not Logged In",
        "Not Started",
        "Abandoned",
        "Finished",
      ],
      labels: {
        show: true,
        showDuplicates: false,
        trim: true,
      },
    },
  };

  useEffect(() => {
    getGraph(false).then(() => {
      if (test) {
        const updatedParams = {
          ...params,
          ongoingTest: test._id,
          includeCount: true,
        };
        getStudents(id, updatedParams).then((res: any) => {
          setStudents(res.students);
          setTotalStudents(res.total);

          const updatedStudents = res.students.map((s: any) => ({
            ...s,
            watch: liveboardWatchService.isWatched(test._id, s._id),
          }));
          setStudents(updatedStudents);
        });
      }
    });

    const subscription = liveboardWatchService.changeNotifier.subscribe(
      (data: any) => {
        if (data.action === "remove") {
          setStudents((prevStudents: any) =>
            prevStudents.map((s: any) =>
              s._id === data.student._id ? { ...s, watch: false } : s
            )
          );
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id, params, test]);

  useEffect(() => {
    if (students && students.length > 0) {
      const updatedStudents = students.map((s: any) => ({
        ...s,
        watch: liveboardWatchService.isWatched(test._id, s._id),
      }));
      setStudents(updatedStudents);
    }
  }, [students, test]);

  const getGraph = async (refresh: boolean) => {
    try {
      const d: any = await ongoingTestByClass(id);
      setTest(d.test);
      const data = [
        d.attemptStats.ongoing,
        d.students - d.loggedIn,
        d.students - d.attemptStats.total,
        d.attemptStats.abandoned,
        d.attemptStats.finished,
      ];

      const maxVal = Math.max(data[0], data[1], data[2], data[3], data[4]) || 1;

      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.updateSeries([{ name: "status", data }]);
        }
      }, 500);

      if (refresh) {
        alert("Successfully Refreshed");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onPageChanged = (pageNum: number) => {
    const updatedParams: any = { ...params, page: pageNum };
    if (searchText) {
      updatedParams.search = searchText;
    }
    getStudents(id, updatedParams).then((res: any) => {
      setStudents(res.students);
    });
  };

  const refresh = () => {
    setSearchText("");
    getGraph(true).then(() => {
      if (test) {
        const updatedParams = { ...params, page: 1, includeCount: true };
        getStudents(id, updatedParams).then((res: any) => {
          setStudents(res.students);
          setTotalStudents(res.total);

          const updatedStudents = res.students.map((s: any) => ({
            ...s,
            watch: liveboardWatchService.isWatched(test._id, s._id),
          }));
          setStudents(updatedStudents);
        });
      }
    });
  };

  const addToWatchlist = (student: any, i: number) => {
    student.watch = true;
    student.ongoing = true;

    liveboardWatchService.add(test._id, student);
  };

  const onProctor = (att: any) => {
    navigate(`/liveboard/proctor/${att._id}/${id}`);
  };

  const searchStudent = () => {
    setParams((prevParams: any) => ({ ...prevParams, page: 1 }));

    const updatedParams: any = { ...params, includeCount: true };
    if (searchText) {
      updatedParams.search = searchText;
    }
    getStudents(id, updatedParams).then((res: any) => {
      setStudents(res.students);
      setTotalStudents(res.total);
    });
  };

  const exportPdf = () => {
    if (test) {
      const query = { test: test._id, classroom: id, directDownload: true };
      downloadReportData("get_liveboard_status", query).then(
        () => {
          // Handle successful download
        },
        (err: any) => {
          alert("Fail to download Test as PDF!");
        }
      );
    } else {
      alert("There is no ongoing test");
    }
  };

  const copyCode = (classroom: any) => {
    navigator.clipboard.writeText(classroom.seqCode);
    alert("Successfully Copied");
  };

  return (
    <>
      <div className="topHeader-Liveboard">
        {cls && (
          <div className="rounded-boxes class-board assignment bg-white">
            <div className="row clearfix liveTop-img">
              <div className="col-md-6">
                <div className="square_profile_info d-flex align-items-center">
                  <div className="squared-rounded_wrap_80 liveTop-imgInner">
                    <img
                      height="80"
                      width="100"
                      src={cls.imageUrl}
                      alt={cls?.name}
                      style={{ borderRadius: "9px" }}
                    />
                  </div>
                  <div className="ml-2">
                    <h3 className="top-title text-truncate">{cls?.name}</h3>
                    <p className="bottom-title">{cls?.user.name}</p>
                    <h4 className="d-inline-block mr-1">{cls.seqCode}</h4>
                    <button
                      aria-label="ongoing_copy_classcode"
                      className="btn btn-secondary btn-sm"
                      onClick={() => copyCode(cls)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6 class-board-info">
                <div className="live-icons d-flex justify-content-end">
                  <span
                    className="material-icons cursor-pointer"
                    onClick={exportPdf}
                  >
                    download
                    <p style={{ fontFamily: "Karla" }}>Download</p>
                  </span>
                  <span
                    className="material-icons cursor-pointer"
                    onClick={refresh}
                  >
                    autorenew
                    <p style={{ fontFamily: "Karla" }}>Refresh</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {test && (
        <div className="chart_boxes liveBoard-CurrentGraph">
          <div className="admin-header">
            <div className="admin-head d-flex align-items-center">
              <i className="material-icons mr-1">article</i>
              <p>{test.title}</p>
            </div>
            <div className="admin-head2 d-flex align-items-center">
              <i className="material-icons mr-1 st-BottomLine">people</i>
              <p className="st-BottomTLine">
                <strong>{cls?.students?.length}</strong> students
              </p>
            </div>
          </div>
          <div className="chart_area_body bg-white">
            <Chart
              ref={chartRef}
              options={chartOptions}
              series={chartOptions.series}
              type="bar"
              height={350}
            />
          </div>
        </div>
      )}
      <div className="main-area-top px-0">
        <div className="info mx-auto">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div className="clearfix">
                <div className="inner pl-0">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Participating Students ({totalStudents})
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <form className="common_search-type-1 form-half ml-auto formAllLiveDetails">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for students"
                    name="txtSearch"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onBlur={searchStudent}
                  />
                  <span>
                    <figure>
                      <img src="assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <br />
      {(!students || students.length === 0) && (
        <div className="empty-data addNoDataFullpageImgs">
          <figure>
            <img
              src="/assets/images/participating_sstudents.svg"
              alt="Not Found"
            />
          </figure>
          <h3>No Student yet!</h3>
          <p>There are no students in test!</p>
        </div>
      )}
      {students && students.length > 0 && (
        <div className="row joined-studentsCard watchList-LiveInner">
          {students.map((on: any, i: number) => (
            <div
              key={on._id}
              className="col-lg-3 col-md-6 mb-3 box-item1-remove"
            >
              <div className="box box_new bg-white pt-0">
                <div
                  className="image-wrap text-center"
                  style={{ backgroundColor: "lightgray" }}
                >
                  <div className="ongoing-video">
                    {/* Removed VideoStreaming component */}
                  </div>
                </div>
                <div className="box-inner box-inner_new detailAllCardrInner3">
                  <div className="info p-0 m-0" style={{ minHeight: "36px" }}>
                    <h4>{on.name}</h4>
                    <div className="subject-name">
                      <p>{on.rollNumber}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-12">
                      <a
                        className="btn btn-primary btn-sm btn-block"
                        onClick={() => onProctor(on)}
                      >
                        Proctor
                      </a>
                    </div>
                    {!on.watch && (
                      <div className="col-12 watch-list-btn3-remove mt-1">
                        <a
                          className="btn btn-outline btn-sm btn-block"
                          onClick={() => addToWatchlist(on, i)}
                        >
                          <div className="d-flex align-items-center justify-content-center">
                            <span className="material-icons visibility_off">
                              visibility_off
                            </span>
                            Add To Watchlist
                          </div>
                        </a>
                      </div>
                    )}
                    {on.watch && (
                      <div className="col-12 watch-list-btn3-remove mt-1">
                        <a className="btn btn-outline btn-sm btn-block">
                          <div className="d-flex align-items-center justify-content-center">
                            <span className="material-icons">visibility</span>
                            Added To Watchlist
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {students && totalStudents > params.limit && (
        <div className="text-center mt-5">
          <div className="d-inline-block">
            <Pagination
              totalItems={totalStudents}
              itemsPerPage={params.limit}
              currentPage={params.page}
              onPageChange={onPageChanged}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Ongoing;
