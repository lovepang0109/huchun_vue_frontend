"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { getReportData } from "@/services/auth";
import * as adminService from "@/services/adminService";
import { getStudentReportOverview } from "@/services/courseService";
import { saveBlobFromResponse } from "@/lib/common";
import { slugify, toQueryString } from "@/lib/validator";
import { alert } from "alertifyjs";
import { avatar, fromNow } from "@/lib/pipe";
import Chart from "react-apexcharts";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import LoadingOverlay from "react-loading-overlay-ts";

const StudentProgressComponent = ({ user, settings, session }: any) => {
  const { id, studentId } = useParams();
  const [dailyPracticeChart, setDailyPracticeChart] = useState<any>({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: { text: "Mins" },
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: "",
    },
  });
  const [donutchartOptions, setDonutchartOptions] = useState<any>({
    series: [],
    chart: {
      type: "donut",
      width: 300,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
            name: {
              formatter: (val: any, opts: any) => {
                return "";
              },
            },
            value: {
              fontSize: "14px",
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                return opts.globals.series[0] + "%";
              },
            },
            total: {
              show: true,
              label: "",
              fontSize: "18px",
              fontWeight: 600,
              formatter: (w: any) => {
                return w.globals.series[0] + "%";
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "right",
          },
        },
      },
    ],
  });
  const [studentData, setStudentData] = useState<any>();
  const [course, setCourse] = useState<any>();
  const [units, setUnits] = useState<any>([]);
  const [markSeries, setMarkSeries] = useState<any>([]);
  const [completionSeries, setCompletionSeries] = useState<any>([]);
  const [attendanceSeries, setAttendanceSeries] = useState<any>([]);
  const [loadingData, setLoadingData] = useState<any>(true);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setLoadingData(true);
    getReportDataFunction();
    getStudentReportOverviewFunction();
  }, []);

  const getReportDataFunction = () => {
    const query = {
      user: studentId,
      course: id,
      location: user?.activeLocation,
    };
    getReportData("exportweeklyreport", query)
      .then((res: any) => {
        setLoadingData(false);
        if (res.msg) {
          // NO attempt to report
          return;
        }
        let students = studentData;
        students = res.data;
        students.attendance = 100;
        students.completion = Math.round(
          (students.student_test / students.testPublished) * 100
        );
        for (const unit in students.Unit_name) {
          const item: any = {
            name: unit,
            chapters: [],
          };

          for (const i of students.Unit_name[unit]) {
            item.chapters.push({
              chapter: i.Worksheet_numbering,
              completion: i.Complition,
              effort: i.Effort.replace(/&nbsp;/g, ""),
              marks: i.marks,
              attempt: i.attempt,
            });
          }
          setUnits((prev: any) => {
            const newArray = [...prev] || [];
            newArray.push(item);
            return newArray;
          });
        }

        students.timebar = JSON.parse(students.timebar);

        const dateSeries: any = {
          "Student Time Spend": [],
          "Most Time Spend": [],
          "Avg Time Spend": [],
        };
        const dates: any = [];
        for (const dt in students.timebar.Date) {
          dates.push(students.timebar.Date[dt]);
          dateSeries["Student Time Spend"].push(students.timebar.totalTime[dt]);
          dateSeries["Most Time Spend"].push(students.timebar.Max_ts[dt]);
          dateSeries["Avg Time Spend"].push(students.timebar.Mean_ts[dt]);
        }

        const seriesData = dailyPracticeChart.series;

        for (const seri in dateSeries) {
          seriesData.push({
            name: seri,
            data: dateSeries[seri],
          });
        }

        setDailyPracticeChart({
          ...dailyPracticeChart,
          series: seriesData,
          xaxis: {
            categories: dates,
          },
        });

        setMarkSeries([
          Number(students.Accuracy),
          100 - Number(students.Accuracy),
        ]);
        setCompletionSeries([students.completion, 100 - students.completion]);
        setAttendanceSeries([100]);
        setStudentData((prev: any) => {
          return students;
        });
      })
      .catch((err: any) => {
        console.log(err);
        setLoadingData(false);
      });
    setLoaded(true);
  };

  const getStudentReportOverviewFunction = () => {
    getStudentReportOverview(id, studentId).then((course: any) => {
      setCourse(course);
    });
  };

  const exportReport = async () => {
    const query = {
      user: studentId,
      course: id,
      location: user?.activeLocation,
      directDownload: true,
    };

    try {
      const response = await clientApi.get(
        `https://newapi.practiz.xyz/api/v1/admin/reportData/attempt_report_pdf${toQueryString(
          query
        )}`,
        {
          responseType: "blob",
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );

      saveBlobFromResponse({
        fileName: slugify(course.title),
        blob: response.data,
      });
    } catch (err) {
      alert("Message", "Report has no data to download!");
    }
  };

  return (
    <LoadingOverlay
      active={!loaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      <section className="details details_top_area_common mt-0">
        {/* start .details */}
        <div className="container">
          <div className="details-area mw-100">
            {course ? (
              <div className="asses-info overview d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <figure className="mb-0 mr-2 user_img_circled_wrap">
                    <div className="profile-user">
                      <img src={avatar(course.user, "sm")} alt="image" />
                    </div>
                  </figure>
                  <div className="d-flex flex-column">
                    <h2 className="main_title text-white">{course.title}</h2>
                    <div className="bold">{course.user.name}</div>
                    <span className="text-white">
                      {`${(
                        (course.completedContents / course.totalContents) *
                        100
                      ).toFixed(0)}% complete | Last active ${fromNow(
                        course.updatedAt
                      )}`}
                    </span>
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary" onClick={exportReport}>
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
            )}
          </div>
        </div>
      </section>

      <div className="container rounded-boxes bg-white mt-3">
        <h2>Daily Practice</h2>
        <p>
          The purpose of this graph is show effort distribution of the student
          and compare with average effort as well as highest effort put by any
          student on a day. A consistent effort is encouraged for good learn.
        </p>

        <div>
          {!loadingData ? (
            dailyPracticeChart.series.length ? (
              <Chart
                options={dailyPracticeChart}
                series={attendanceSeries}
                type="bar"
              />
            ) : (
              <div className="text-center">
                <svg
                  width="450"
                  height="300"
                  viewBox="0 0 520 520"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                    fill="#DBDBE8"
                  />
                  <path
                    d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                    fill="#D4D4EA"
                  />
                  <path
                    d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                    fill="#DEDEE7"
                  />
                  <path
                    d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                    fill="#E1E1E6"
                  />
                  <path
                    d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                    fill="#D8D8E9"
                  />
                </svg>
                <h2 className="text-muted">No data yet</h2>
              </div>
            )
          ) : (
            <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
          )}
        </div>
      </div>
      <div className="container rounded-boxes bg-white">
        <h3 className="h6">Summary</h3>
        <p>
          Completion is calculated based on allocated lessons/worksheets vs
          completed by student. Marks is calculated based on accuracy. This
          doesn’t reflect true performance because it also includes lessons
          which are geared towards learning and not evaluation.
        </p>

        {!loadingData ? (
          studentData ? (
            <div className="d-flex justify-content-between flex-wrap">
              <div className="text-center position-relative">
                <Chart
                  options={donutchartOptions}
                  series={attendanceSeries}
                  height={200}
                  type="donut"
                />
                <div
                  className="position-absolute m-auto w-100 bold"
                  style={{ top: "45%" }}
                >
                  {studentData.attendance}%
                </div>
                <h1>Attendance: 100%</h1>
              </div>

              <div className="text-center position-relative">
                <Chart
                  options={donutchartOptions}
                  series={completionSeries}
                  type="donut"
                  height={200}
                />
                <div
                  className="position-absolute m-auto w-100 bold"
                  style={{ top: "45%" }}
                >
                  {studentData.completion}%
                </div>
                <h1>
                  Completion: {studentData.student_test}/
                  {studentData.testPublished}
                </h1>
              </div>

              <div className="text-center position-relative">
                <Chart
                  options={donutchartOptions}
                  series={markSeries}
                  height={200}
                  type="donut"
                />
                <div
                  className="position-absolute m-auto w-100 bold"
                  style={{ top: "45%" }}
                >
                  {studentData.Accuracy}%
                </div>
                <h1>Marks: {studentData.Accuracy}%</h1>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <svg
                width="450"
                height="300"
                viewBox="0 0 520 520"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                  fill="#DBDBE8"
                />
                <path
                  d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                  fill="#D4D4EA"
                />
                <path
                  d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                  fill="#DEDEE7"
                />
                <path
                  d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                  fill="#E1E1E6"
                />
                <path
                  d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                  fill="#D8D8E9"
                />
              </svg>
              <h2 className="text-muted">No data yet</h2>
            </div>
          )
        ) : (
          <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
        )}
      </div>

      <div className="container rounded-boxes bg-white">
        <h2>Course</h2>
        <p>
          Progress Each chapter has one lesson and one or more practice
          workbook. When a lesson or workbooks shows 0, most likely student has
          not practiced the chapter.
        </p>
        <br />
        {!loadingData ? (
          studentData ? (
            <div>
              {units.map((unit: any) => (
                <div key={unit.name}>
                  <div className="row bg-secondary text-white mx-auto py-1">
                    <div className="col-4">{unit.name}</div>
                    <div className="col-2">Completion</div>
                    <div className="col-2">Efforts</div>
                    <div className="col-2">Marks</div>
                    <div className="col-2">Attempt</div>
                  </div>
                  {unit.chapters.map((chapter: any) => (
                    <div key={chapter.chapter} className="row mx-auto py-1">
                      <div className="col-4">{chapter.chapter}</div>
                      <div className="col-2">{chapter.completion}%</div>
                      <div className="col-2">{chapter.effort}</div>
                      <div className="col-2">{chapter.marks}%</div>
                      <div className="col-2">{chapter.attempt}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <svg
                width="450"
                height="300"
                viewBox="0 0 520 520"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                  fill="#DBDBE8"
                />
                <path
                  d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                  fill="#D4D4EA"
                />
                <path
                  d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                  fill="#DEDEE7"
                />
                <path
                  d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                  fill="#E1E1E6"
                />
                <path
                  d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                  fill="#D8D8E9"
                />
              </svg>
              <h2 className="text-muted">No data yet</h2>
            </div>
          )
        ) : (
          <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
        )}
      </div>
    </LoadingOverlay>
  );
};

export default StudentProgressComponent;
