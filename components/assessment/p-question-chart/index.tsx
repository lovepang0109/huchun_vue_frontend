import clientApi from "@/lib/clientApi";
import { elipsisText, randomColor, toQueryString } from "@/lib/validator";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";

interface CharProps {
  practice: any;
  pieChartTitle: string;
  summarySubject: any;
}
const PQuestionChart = ({
  practice,
  pieChartTitle,
  summarySubject,
}: CharProps) => {
 
  const total = useMemo(
    () =>
      summarySubject.reduce((total: number, cur: any) => total + cur.count, 0),
    [summarySubject]
  );
 
  const [caloption, setCalOption] = useState<number>(0);
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 330,
        width: 480,
        type: "radialBar",
      },
      fill: {
        colors: [],
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: "16px",
            },
            total: {
              show: true,
              label: "Total",
              formatter: (val: any) => {
                return total;
              },
            },
          },
        },
      },
      labels: [],
    },
  });
  const [summary, setSummary] = useState<any>(summarySubject)

  const [piceData, setPiceData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    console.log(summarySubject, "simmmm")
    const fetchData = async (summarySubject: any) => {
      if (summarySubject?.length > 0) {
        let total = summarySubject.reduce(
          (total: number, cur: any) => total + cur.count,
          0
        );
        let dataItem = await summarySubject?.map((data: any) => ({
          name: elipsisText(data.name, 20),
          color: randomColor(),
          count: data.count,
          topics: data.units,
          percent:
            (data.count / total) * 100 > 100 ? 100 : (data.count / total) * 100,
        }));

        console.log(dataItem, "data item")
        const priced = await dataItem.map((d: any) => {
          return {
            ...d,
          };
        });
         setPiceData(priced);
         setChartOptions((prev: any) => ({
          ...prev,
          series: dataItem.map((data: any) => data.percent.toFixed(2)),
          options: {
            ...prev.options,
            labels: dataItem.map((data: any) => data.name),
            fill: {
              ...prev.options.fill,
              colors: dataItem.map((data: any) => data.color),
            },
            plotOptions: {
              ...prev.options.plotOptions,
              radialBar: {
                ...prev.options.plotOptions.radialBar,
                dataLabels: {
                  ...prev.options.plotOptions.radialBar.dataLabels,
                  total: {
                    show: true,
                    label: "Total",
                    formatter: (val: any) => {
                      return total;
                    },
                  },
                },
              },
            },
          },
        }));
      }
    };
    // if (caloption == 0) {
    //   setCalOption((prev) => prev + 1);
      fetchData(summarySubject);
    // }
  }, [summarySubject,caloption ]);
 

  return (
    <>
      <h1 className="mb-0 describe-chart">{pieChartTitle}</h1>
      <figure className="mx-auto">
        {chartOptions?.series?.length ? (
          <Chart
            series={chartOptions.series}
            options={chartOptions.options}
            height={330}
            width={300}
            type="radialBar"
          />
        ) : (
          <></>
        )}

        <div id="chart" className="content-chart-overflow"></div>
      </figure>
      <div className="subject-box clearfix">
        {piceData.map((data, index) => (
          <div className="accordion" id="accordion" key={index}>
            <div
              id={`dataOne_distributionbysubject_${index}`}
              className={`${activeIndex === index ? "show" : ""}`}
            >
              <a
                aria-label="subjects"
                type="button"
                data-toggle="collapse"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                aria-expanded={activeIndex === index || false}
                data-target={`#collapsedata_distributionbysubject_${index}`}
                aria-controls={`collapsedata_distributionbysubject_${index}`}
              >
                <div className="form-row row_set_for_collapsewith_icon w-100">
                  <div className="col-auto">
                    <p
                      className="dot_circle position-relative"
                      style={{ background: data.color }}
                    >
                      <span className="float-none text-left"></span>
                    </p>
                  </div>
                  <div className="col text-truncate">
                    <small>{data.name}</small>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="marks">
                      <small>{data.count}</small>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        style={{ paddingLeft: "5px", marginTop: "3px" }}
                      />
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div
              id={`collapsedata_distributionbysubject_${index}`}
              className={`collapse py-2 ${activeIndex === index ? "show" : ""}`}
              aria-labelledby="dataOne"
              data-parent="#accordion"
            >
              {data?.topics?.map((topic: any, topicIndex: number) => (
                <div
                  className="form-row row_set_for_collapsewith_icon pl-2"
                  key={topicIndex}
                >
                  <div className="col-auto">
                    <div className="name">
                      <p
                        className="dot_circle position-relative"
                        style={{ background: data.color }}
                      >
                        <span className="float-none text-left"></span>
                      </p>
                    </div>
                  </div>
                  <div className="col text-truncate">
                    <small>{topic.name}</small>
                  </div>
                  <div className="col-auto ml-auto pr-3">
                    <div className="number">
                      <span>{topic.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PQuestionChart;
