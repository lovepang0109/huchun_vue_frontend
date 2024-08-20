"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import Chart from "react-apexcharts";
import moment from "moment";
import { slugify, toQueryString } from "@/lib/validator";
import { alert, success } from "alertifyjs";
import { isArray } from "lodash";

export default function MyEduCoins() {
  const { user } = useSession()?.data || {};
  const [rules, setRules] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [totalRedeem, setTotalRedeem] = useState<number>(0);
  const [totalEarn, setTotalEarn] = useState<number>(0);
  const [inProcess, setInProcess] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [invalid, setInvalid] = useState<boolean>();
  const [currYear, setCurrYear] = useState<number>(new Date().getFullYear());
  const [currentOffer, setCurrentOffer] = useState<any>({
    _id: "",
    activityId: "",
    value: "",
  });
  const [userCoins, setUserCoins] = useState<any>([]);
  const [allDates, setAllDates] = useState<any>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [modalRef, setModalRef] = useState<any>();

  const onChangeEvent = (value: any) => {
    setInvalid(true);
    setTitle(value);
  };

  const [educoinsChartOptions, setEducoinsChartOptions] = useState<any>({
    series: [],
    options: {
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: [],
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              color: "#fff",
              show: true,
              value: {
                fontSize: "16px",
                fontWeight: 200,
                color: "#fff",
                formatter: (val: any, opts: any) => {
                  const total = opts.globals.series.reduce(
                    (p: any, c: any) => p + c,
                    0
                  );
                  return Math.round((val * 100) / total) + "%";
                },
              },
              total: {
                show: true,
                label: "Total Earned",
                fontSize: "16px",
                fontWeight: 400,
                color: "#fff",
                formatter: (w: any) => {
                  const total = Math.round(
                    w.globals.seriesTotals.reduce((a: any, b: any, c: any) => {
                      return a + b;
                    }, 0)
                  );
                  return total;
                },
              },
            },
          },
          expandOnClick: true,
        },
      },
      legend: {
        show: false,
        position: "bottom",
        formatter: function (seriesName: any, opts: any) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex].toFixed(2)
          );
          return [seriesName, Number(val.toFixed(2)) || "0"];
        },
      },
      tooltip: {
        enabled: true,
      },
      labels: [],
      responsive: [
        {
          breakpoint: 1200,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  const [currentTab, setCurrentTab] = useState<string>("earn");

  useEffect(() => {
    // this.spinner.show('appLoader');
    clientApi
      .get(`/api/users/getSupercoinsActivities/${user?.info?._id}`)
      .then((d: any) => {
        const rules = d.data.filter((e: any) => e.type == "rule");
        const offers = d.data.filter((e: any) => e.type == "offer");
        setRules(rules);
        setOffers(offers);
      });

    getTotalCoins();
    // this.currentMonth = new Date().getMonth()
    setCurrentMonth(new Date().getMonth());
    getUserHistory(new Date());

    const savedTab = sessionStorage.getItem(
      "student_educoin_current_page_" + user?.info?._id
    );
    if (savedTab) {
      sessionStorage.removeItem(
        "student_educoin_current_page_" + user?.info?._id
      );
      setCurrentTab(savedTab);
    }

    if (typeof window !== "undefined") {
      const tabElement = document.getElementById(currentTab);
      const tabHeaderElement = document.getElementById(currentTab + "_header");
      if (tabElement) {
        tabElement.classList.add("active", "show", "fade");
      }
      if (tabHeaderElement) {
        tabHeaderElement.classList.add("active");
      }
    }
  }, [user]);

  const openModal = (offer: any) => {
    if (
      Number((totalEarn - (totalRedeem + inProcess)).toFixed(0)) < offer?.value
    ) {
      alert("Message", "You don't have enough coins to redeem it !!");
      return;
    }
    setCurrentOffer(offer);
    // this.modalRef = this.modalService.show(template);
  };

  const cancel = () => {
    setTitle("");
    // this.modalService.hide();
  };

  const redeem1 = () => {
    const body = {
      activityId: currentOffer._id,
      value: currentOffer.value,
      studentMsg: title,
    };
    clientApi
      .post(`/api/users/redeemCoins/${user?.info?._id}`, body)
      .then((d: any) => {
        cancel();
        getTotalCoins();
        getUserHistory(new Date());
        success("Successfully Redeemed");
      })
      .catch((err: any) => {
        console.log(err);
        alert("Message", err.error);
      });
  };

  const checkDate = (uc: any, d: any) => {
    let day = uc._id.day.toString();
    switch (uc._id.month) {
      case 1:
        day = day + " Jan";
        break;
      case 2:
        day = day + " Feb";
        break;
      case 3:
        day = day + " Mar";
        break;
      case 4:
        day = day + " Apr";
        break;
      case 5:
        day = day + " May";
        break;
      case 6:
        day = day + " Jun";
        break;
      case 7:
        day = day + " Jul";
        break;
      case 8:
        day = day + " Aug";
        break;
      case 9:
        day = day + " Sept";
        break;
      case 10:
        day = day + " Oct";
        break;
      case 11:
        day = day + " Nov";
        break;
      case 12:
        day = day + " Dec";
        break;
    }
    if (day == d) {
      return true;
    }
    return false;
  };

  const getUserHistory = (date: any) => {
    const currentMonth = new Date(date).getMonth();
    date = new Date(date.setDate(2));
    const monthStart = moment(date).startOf("month").add(1, "days");
    const monthEnd = moment(date).endOf("month");
    setUserCoins([]);
    setAllDates([]);
    if (user) {
      clientApi
        .get(
          `/api/users/getUserSuperCoinActivities/${
            user?.info?._id
          }/timezoneOffset=${new Date().getTimezoneOffset()}&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`
        )
        .then((d: any) => {
          // setUserCoins(d.data.filter((c: any) => new Date(c.createdAt).getMonth() == currentMonth));
          // setAllDates(getAllDates(d.data.filter((c: any) => new Date(c.createdAt).getMonth() == currentMonth)))
          const responseData = isArray(d.data) ? d.data : [d.data];
          const filter = responseData.filter(
            (c: any) => new Date(c.createdAt).getMonth() == currentMonth
          );
          setUserCoins(filter);
          const response = getAllDates(filter);
          const sortobj = response.map((d: any) => ({
            slugfly: d.split(" "),
            data: d,
          }));

          const sortdata = sortobj.map((d: any) => ({
            slugify: Number(d.slugfly[0]),
            data: d.data,
          }));
          setAllDates(sortdata.reverse());
        })
        .catch((error) => console.log(error));
    }
  };

  const changeMonth = (mon: any) => {
    switch (mon) {
      case "jan":
        const jan = new Date(new Date().setMonth(0));
        getUserHistory(jan);
        break;
      case "feb":
        const feb = new Date(new Date().setMonth(1));
        getUserHistory(feb);
        break;
      case "mar":
        const mar = new Date(new Date().setMonth(2));
        getUserHistory(mar);
        break;
      case "apr":
        const apr = new Date(new Date().setMonth(3));
        getUserHistory(apr);
        break;
      case "may":
        const may = new Date(new Date().setMonth(4));
        getUserHistory(may);
        break;
      case "jun":
        const jun = new Date(new Date().setMonth(5));
        getUserHistory(jun);
        break;
      case "july":
        const jul = new Date(new Date().setMonth(6));
        getUserHistory(jul);
        break;
      case "aug":
        const aug = new Date(new Date().setMonth(7));
        getUserHistory(aug);
        break;
      case "sept":
        const sept = new Date(new Date().setMonth(8));
        getUserHistory(sept);
        break;
      case "oct":
        const oct = new Date(new Date().setMonth(9));
        getUserHistory(oct);
        break;
      case "nov":
        const nov = new Date(new Date().setMonth(10));
        getUserHistory(nov);
        break;
      case "dec":
        const dec = new Date(new Date().setMonth(11));
        getUserHistory(dec);
        break;
    }
  };

  const getTotalCoins = () => {
    clientApi
      .get(`/api/users/getTotalCoins/${user?.info?._id}`)
      .then((d: any) => {
        if (d.data && d.data.length > 0) {
          setTotalEarn(d.data[0].earned);
          setTotalRedeem(d.data[0].redeem);
          setInProcess(d.data[0].inprocess);
          const data = [
            {
              name: "Available",
              val: d.data[0].earned - (d.data[0].redeem + d.data[0].inprocess),
            },
            {
              name: "Processing",
              val: d.data[0].inprocess,
            },
            {
              name: "Redeemed",
              val: d.data[0].redeem,
            },
          ];
          drawLearningEffortDistribution(data);
        }
      });
  };

  const getAllDates = (d: any) => {
    let dates: any = [];
    d.sort((a: any, b: any) => b._id.day - a._id.day);
    d.sort((a: any, b: any) => moment(a.createdAt).diff(moment(b.createdAt)));
    d.map((el: any) => {
      let day = new Date(el.createdAt).getDate().toString();
      const month = moment(el.createdAt).month();
      // console.log(day, month, el.)
      switch (month) {
        case 0:
          day = day + " Jan";
          break;
        case 1:
          day = day + " Feb";
          break;
        case 2:
          day = day + " Mar";
          break;
        case 3:
          day = day + " Apr";
          break;
        case 4:
          day = day + " May";
          break;
        case 5:
          day = day + " Jun";
          break;
        case 6:
          day = day + " Jul";
          break;
        case 7:
          day = day + " Aug";
          break;
        case 8:
          day = day + " Sept";
          break;
        case 9:
          day = day + " Oct";
          break;
        case 10:
          day = day + " Nov";
          break;
        case 11:
          day = day + " Dec";
          break;
      }
      const includeDate = dates.findIndex(
        (e: any) => e.toString() === day.toString()
      );
      if (includeDate == -1 && checkDate(el, day.toString())) {
        dates = [...dates, day];
      }
    });
    return dates;
  };

  const drawLearningEffortDistribution = (data: any) => {
    let vals: any = [];
    let labels: any = [];
    data.forEach((element: any) => {
      vals = [...vals, element.val];
      labels = [...labels, element.name];
    });
    setEducoinsChartOptions((prev: any) => ({
      ...prev,
      series: vals,
      options: {
        ...prev.options,
        chart: {
          height: 230,
          type: "donut",
        },
        labels: labels,
        fill: {
          ...prev.options.fill,
          colors: ["#008ffb", "#00e396", "#ffe363"],
        },
      },
    }));
  };

  const NoData = () => {
    return (
      <div>
        <div className="text-center">
          <svg
            width="74"
            height="74"
            viewBox="0 0 74 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.6678 33.1747H22.8795C20.4391 33.0865 18.0065 33.5008 15.7329 34.3919C13.4592 35.283 11.3929 36.6318 9.66228 38.3547L9.16895 38.9303V55.9503H17.5556V46.2892L18.6862 45.0147L19.2001 44.4186C21.8762 41.6693 25.208 39.6462 28.8817 38.5397C27.0424 37.1402 25.5918 35.2933 24.6678 33.1747Z"
              fill="#D4D4EA"
            />
            <path
              d="M64.4214 38.2961C62.6908 36.5732 60.6245 35.2244 58.3508 34.3333C56.0772 33.4422 53.6447 33.0279 51.2042 33.1161C50.4557 33.1182 49.7078 33.1594 48.9636 33.2395C48.0224 35.227 46.6114 36.9555 44.8525 38.2756C48.7745 39.3606 52.3273 41.4923 55.1303 44.4422L55.6442 45.0178L56.7542 46.2922V55.9739H64.8531V38.8717L64.4214 38.2961Z"
              fill="#D4D4EA"
            />
            <path
              d="M22.8167 29.1697H23.454C23.1579 26.6275 23.6039 24.0539 24.7383 21.7596C25.8727 19.4653 27.6469 17.5484 29.8467 16.2403C29.0493 15.0221 27.9492 14.0318 26.6541 13.3665C25.3589 12.7012 23.9132 12.3837 22.4585 12.445C21.0038 12.5063 19.5899 12.9443 18.3554 13.7162C17.1208 14.4881 16.1079 15.5674 15.4158 16.8484C14.7237 18.1294 14.3762 19.5682 14.4072 21.0239C14.4382 22.4795 14.8467 23.9022 15.5928 25.1526C16.3389 26.4029 17.3968 27.4381 18.6632 28.1567C19.9295 28.8753 21.3607 29.2527 22.8167 29.2519V29.1697Z"
              fill="#D4D4EA"
            />
            <path
              d="M50.2153 27.6242C50.2403 28.0966 50.2403 28.5701 50.2153 29.0425C50.6098 29.105 51.0082 29.1394 51.4075 29.1453H51.7981C53.2477 29.068 54.6526 28.6167 55.876 27.8352C57.0994 27.0538 58.0996 25.9689 58.7793 24.6862C59.4589 23.4035 59.7949 21.9666 59.7544 20.5155C59.7139 19.0644 59.2984 17.6485 58.5482 16.4057C57.7981 15.1629 56.7389 14.1354 55.4739 13.4234C54.2088 12.7114 52.7809 12.3391 51.3293 12.3428C49.8776 12.3465 48.4516 12.7259 47.1902 13.4443C45.9287 14.1626 44.8747 15.1954 44.1309 16.442C45.9913 17.6567 47.5211 19.3142 48.5831 21.2659C49.645 23.2175 50.2059 25.4023 50.2153 27.6242Z"
              fill="#D4D4EA"
            />
            <path
              d="M36.7313 36.8357C41.8059 36.8357 45.9196 32.7219 45.9196 27.6473C45.9196 22.5727 41.8059 18.459 36.7313 18.459C31.6567 18.459 27.543 22.5727 27.543 27.6473C27.543 32.7219 31.6567 36.8357 36.7313 36.8357Z"
              fill="#D4D4EA"
            />
            <path
              d="M37.2265 41.7303C34.5421 41.622 31.8634 42.0578 29.3518 43.0116C26.8401 43.9654 24.5474 45.4174 22.6115 47.2803L22.0977 47.8559V60.8676C22.1057 61.2914 22.1971 61.7095 22.3668 62.098C22.5364 62.4864 22.7809 62.8377 23.0863 63.1317C23.3917 63.4256 23.7521 63.6565 24.1468 63.8112C24.5414 63.9659 24.9627 64.0413 25.3865 64.0331H49.0049C49.4287 64.0413 49.85 63.9659 50.2447 63.8112C50.6393 63.6565 50.9997 63.4256 51.3051 63.1317C51.6105 62.8377 51.855 62.4864 52.0247 62.098C52.1943 61.7095 52.2858 61.2914 52.2938 60.8676V47.897L51.8004 47.2803C49.8771 45.4117 47.5924 43.9555 45.0863 43.0012C42.5802 42.0468 39.9057 41.6144 37.2265 41.7303Z"
              fill="#D4D4EA"
            />
          </svg>
          <h2 className="text-muted">No data yet</h2>
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="myeducoins-section">
        <div className="container">
          <div className="educoin-body">
            <div className="chart-box">
              {educoinsChartOptions.series.length && (
                <div className="image">
                  <Chart
                    series={educoinsChartOptions.series}
                    options={educoinsChartOptions.options}
                    type="donut"
                    className="flex justify-content-center"
                    width={300}
                    isDisabled={false}
                  ></Chart>
                </div>
              )}

              {!educoinsChartOptions.series.length && (
                <div className="image mb-2">
                  <svg
                    width="160"
                    height="144"
                    viewBox="0 0 160 144"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M65.5762 19.7228L65.5762 124.278C65.5762 125.482 66.6594 126.457 67.997 126.457L92.2001 126.457C93.5377 126.457 94.6209 125.482 94.6209 124.278L94.6209 19.7228C94.6209 18.519 93.5377 17.5441 92.2001 17.5441L67.9954 17.5441C66.6594 17.5441 65.5762 18.519 65.5762 19.7228Z"
                      fill="#D4D4EA"
                    />
                    <path
                      d="M28.5584 62.9847L28.4736 62.9847L28.4736 124.278C28.4736 125.482 29.5568 126.457 30.8944 126.457L55.0976 126.457C56.4352 126.457 57.5184 125.482 57.5184 124.278L57.5184 62.9847L57.4336 62.9847C57.3009 62.5179 56.9996 62.104 56.577 61.8081C56.1545 61.5123 55.6346 61.3512 55.0992 61.3503L30.8928 61.3503C29.7664 61.3503 28.8288 62.0458 28.5584 62.9847Z"
                      fill="#D4D4EA"
                    />
                    <path
                      d="M102.484 49.129L102.484 124.278C102.484 125.482 103.568 126.457 104.905 126.457L129.108 126.457C130.446 126.457 131.529 125.482 131.529 124.278L131.529 49.129C131.529 47.9252 130.446 46.9503 129.108 46.9503L104.905 46.9503C103.568 46.9503 102.484 47.9252 102.484 49.129Z"
                      fill="#D4D4EA"
                    />
                  </svg>
                  <h2 className="text-white">No coin earned</h2>
                </div>
              )}

              <div className="data-box">
                <ul>
                  <li>
                    <div className="name-b">
                      {totalEarn - (totalRedeem + inProcess)}
                    </div>
                    <small>Available</small>
                  </li>
                  <li>
                    <div className="name-b">{inProcess}</div>
                    <small>Processing</small>
                  </li>
                  <li>
                    <div className="name-b">{totalRedeem}</div>
                    <small>Redeemed</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="educoin-teb">
            <ul className="nav nav-tabs" role="tablist">
              <li role="presentation">
                <a
                  href="#earn"
                  id="earn_header"
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setCurrentTab("earn")}
                >
                  <span>How to Earn</span>
                </a>
              </li>
              <li role="presentation">
                <a
                  href="#redeem"
                  id="redeem_header"
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setCurrentTab("redeem")}
                >
                  <span>Redeem</span>
                </a>
              </li>
              <li role="presentation">
                <a
                  href="#history"
                  id="history_header"
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setCurrentTab("history")}
                >
                  <span>History</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div className="tab-pane" id="earn" role="tabpanel">
              {rules.length > 0 && (
                <div className="earn-body">
                  <div>
                    {rules.map((r: any, i: any) => (
                      <div key={i} className="earn-cart">
                        <div className="icone-box">
                          <img src="/assets/images/mark-cal.png" alt="" />
                        </div>
                        <div className="earn-content">
                          <div className="left-box">
                            <h5>
                              <span>{r?.title}</span>{" "}
                              <b className="rigth-n">+{r?.value}</b>
                            </h5>
                            <p>
                              <span>{r?.summary}</span>{" "}
                              <span className="rigth-n">EduCoins</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="tab-pane" id="redeem" role="tabpanel">
              {offers.length > 0 ? (
                <div className="redeem-body">
                  <div className="row">
                    {offers.map((o: any, i: any) => (
                      <div key={i} className="col-12 col-sm-6 col-md-4">
                        <div className="redeem-cart">
                          <div className="image">
                            <img
                              src="/assets/images/redeem-image1.png"
                              alt=""
                            />
                          </div>
                          <div className="content-box">
                            <h6 title="{o.title}">{o?.title}</h6>
                            <div className="count-box">
                              <div className="box">
                                <span>{o?.value}</span>
                              </div>
                              <div className="text">EduCoins</div>
                            </div>
                            <a
                              onClick={() => openModal(o)}
                              className="btn-theme-b"
                            >
                              Redeem
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <NoData />
              )}
            </div>
            <div className="tab-pane" id="history" role="tabpanel">
              <div className="history-body">
                <div>
                  <div className="history-select-body">
                    <div className="history-select">
                      <span>Month: </span>
                      <select
                        name=""
                        onChange={(event) => changeMonth(event.target.value)}
                      >
                        <option selected={currentMonth == 0} value="jan">
                          January {currYear}
                        </option>
                        <option selected={currentMonth == 1} value="feb">
                          February {currYear}
                        </option>
                        <option selected={currentMonth == 2} value="mar">
                          March {currYear}
                        </option>
                        <option selected={currentMonth == 3} value="apr">
                          April {currYear}
                        </option>
                        <option selected={currentMonth == 4} value="may">
                          May {currYear}
                        </option>
                        <option selected={currentMonth == 5} value="jun">
                          {" "}
                          June {currYear}
                        </option>
                        <option selected={currentMonth == 6} value="july">
                          {" "}
                          July {currYear}
                        </option>
                        <option selected={currentMonth == 7} value="aug">
                          {" "}
                          August {currYear}
                        </option>
                        <option selected={currentMonth == 8} value="sept">
                          {" "}
                          September {currYear}
                        </option>
                        <option selected={currentMonth == 9} value="oct">
                          {" "}
                          October {currYear}
                        </option>
                        <option selected={currentMonth == 10} value="nov">
                          {" "}
                          November {currYear}
                        </option>
                        <option selected={currentMonth == 11} value="dec">
                          {" "}
                          December {currYear}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                {allDates.length > 0 ? (
                  <div>
                    {allDates.map((d: any, i: any) => (
                      <div className="history-cart" key={i}>
                        <div className="date-box">
                          <h5>
                            <span>
                              <img src="/assets/images/calendar.png" alt="" />
                            </span>{" "}
                            {d.slugify}
                          </h5>
                        </div>
                        {userCoins.map((uc: any, i: any) => (
                          <div key={i}>
                            {checkDate(uc, d.data)}
                            {checkDate(uc, d.data) && (
                              <div>
                                {uc.activityType == "earned" && (
                                  <div className="content-box">
                                    <div className="left-box">
                                      {uc && uc.supercoins.length !== 0 && (
                                        <h6>
                                          Completed {uc.count}
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode !==
                                              "code" &&
                                            uc?.supercoins[0]?.mode !==
                                              "profile" && (
                                              <span>
                                                &nbsp;{uc?.supercoins[0]?.mode}
                                              </span>
                                            )}
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode ===
                                              "code" && (
                                              <span> coding questions</span>
                                            )}
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode ===
                                              "profile" && (
                                              <span>% profile details </span>
                                            )}
                                        </h6>
                                      )}
                                      {uc && !uc.supercoins.length && (
                                        <h6> Rewarded by admin</h6>
                                      )}
                                      <p>Credited {uc.coins} EduCoins</p>
                                    </div>
                                    <div className="right-box">
                                      <h5 className="green">+{uc.coins}</h5>
                                    </div>
                                  </div>
                                )}
                                {uc.activityType == "redeemed" && (
                                  <div className="content-box">
                                    <div className="left-box">
                                      {uc && uc.supercoins.length > 0 && (
                                        <h6>
                                          Purchased
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode ==
                                              "phoneRecharge" && (
                                              <span>phone recharge</span>
                                            )}
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode ==
                                              "liveClasses" && (
                                              <span> live classes</span>
                                            )}
                                          {uc &&
                                            uc.supercoins.length > 0 &&
                                            uc?.supercoins[0]?.mode !==
                                              "phoneRecharge" &&
                                            uc?.supercoins[0]?.mode !==
                                              "liveClasses" && (
                                              <span>
                                                &nbsp;{uc?.supercoins[0]?.mode}
                                              </span>
                                            )}
                                          {uc.supercoins.length}
                                        </h6>
                                      )}
                                      {uc && !uc.supercoins.length && (
                                        <h6> Deducted by admin</h6>
                                      )}
                                      <p>Debited {uc.coins} EduCoins</p>
                                    </div>
                                    <div className="right-box">
                                      <h5 className="red">-{uc.coins}</h5>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <NoData />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
