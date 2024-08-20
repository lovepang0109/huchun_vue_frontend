"use client";
import { useState, useEffect, useRef } from "react";
import * as supportSvc from "@/services/suportService";
import clientApi from "@/lib/clientApi";
import moment from "moment";
import PaginationComponent from "@/components/Pagination";

const InstituteLicenses = ({ institute, user }: any) => {
  const [summary, setSummary] = useState<any>({
    total: 0,
    available: 0,
    used: 0,
  });
  const licenseType = institute.licenseType;
  const [transactions, setTransactions] = useState<any>([]);
  const [settings, setSettings] = useState({ maxFreeAttempts: 0 });
  const [params, setParams] = useState({ page: 1, limit: 10 });
  const [usedLicenses, setUsedLicenses] = useState<any>([]);
  const [totalUsed, setTotalUsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await clientApi.get(`/api/settings`);
      setSettings(data);
      const settingsData = data;

      if (settingsData.maxFreeAttempts) {
        setLoading(true);
        const usedLicensesData = await supportSvc.getUsedLicenses({ ...params, count: true });
        setTotalUsed(usedLicensesData.total);
        setUsedLicenses(usedLicensesData.licenses);
        setLoading(false);
      }

      supportSvc.getLicenseSummary().then((res: any) => {
        setSummary({
          total: res.total,
          available: res.available,
          used: res.used,
        });
      });
      
      supportSvc.getOndemandTransactionHistory().then((data: []) => {
        setTransactions(data);
      });
    };

    fetchData();
  }, [params]);

  const usedLicensePageChanged = async (newPage: number) => {
    setLoading(true);
    setParams(prevParams => ({ ...prevParams, page: newPage }));
    const usedLicensesData = await supportSvc.getUsedLicenses({ ...params, page: newPage });
    setUsedLicenses(usedLicensesData.licenses);
    setLoading(false);
  };

  return (
    <div className="institute-onboarding">
      <div className="rounded-boxes bg-white">
        <div className="section_heading_wrapper mb-0">
          <div className="d-flex justify-content-between">
                <h3 className="section_top_heading">Licenses</h3>
                <h3 className="h5 mb-0"><span className="badge badge-primary pt-1">{licenseType}</span></h3>
          </div>
          <p className="section_sub_heading">
            View licenses Summary and transactions history.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="rounded-boxes bg-white">
            <label className="bold">Transaction History</label>

            <div className="row border-bottom">
              <div className="col">
                <label>Date</label>
              </div>
              <div className="col text-center">
                <label>Number of licenses</label>
              </div>
              <div className="col text-center">
                <label>Amount</label>
              </div>
              <div className="col text-center">
                <label>Amount Paid</label>
              </div>
            </div>

            {transactions.length ? (
              transactions.map((history, index) => (
                <div key={index} className="row my-2">
                  <div className="col">
                    {new Date(history.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="col text-center">{history.note.licenses}</div>
                  <div className="col text-center">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: history.currency,
                    }).format(history.price)}
                  </div>
                  <div className="col text-center">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: history.currency,
                    }).format(history.totalPayment)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center">
                <img
                  className="mx-auto mt-3 mb-2"
                  src="/assets/images/empty-chart.svg"
                  alt="No data"
                />
                <h6 className="text-muted">No data yet</h6>
              </div>
            )}
          </div>
        </div>

        <div className="col">
          <div className="rounded-boxes bg-white">
            <label className="bold">Summary</label>

            <div className="d-flex justify-content-between">
              <div className="text-center">
                <label className="bold">{summary.total}</label>
                Total Licenses
              </div>
              <div className="text-center">
                <label className="bold">{summary.available}</label>
                Available Licenses
              </div>
              <div className="text-center">
                <label className="bold">{summary.used}</label>
                Used licenses
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-boxes bg-white">
            {settings?.maxFreeAttempts && (
                <>
                    <div className="section_heading_wrapper mb-0">
                        <div className="d-flex justify-content-between">
                            <h3 className="section_top_heading">Used License History</h3>
                        </div>
                        <p className="section_sub_heading">
                            System calculates a license when a student takes more than {settings.maxFreeAttempts} tests.
                        </p>
                    </div>

                    <div className="row border-bottom mt-3">
                        <div className="col-3">
                            <b>Student</b>
                        </div>
                        <div className="col-2 text-center">
                            <b>Assessments</b>
                        </div>
                        <div className="col-2 text-center">
                            <b>Questions</b>
                        </div>
                        <div className="col-3 text-center">
                            <b>Last Assessment Date</b>
                        </div>
                        <div className="col-2 text-center">
                            <b>License Update Date</b>
                        </div>
                    </div>

                    {!loading ? (
                        <>
                            {usedLicenses.map((license, index) => (
                                <div key={index} className="row my-2">
                                    <div className="col-3">
                                        <label>
                                            {license.user.name}
                                            <br />
                                            <em>{license.user.userId}</em>
                                        </label>
                                    </div>
                                    <div className="col-2 text-center">
                                        <label>{license.tests}</label>
                                    </div>
                                    <div className="col-2 text-center">
                                        <label>{license.questions}</label>
                                    </div>
                                    <div className="col-3 text-center">
                                        <label>{moment(license.lastAttemptDate).format('MMMM Do YYYY')}</label>
                                    </div>
                                    <div className="col-2 text-center">
                                        <label>{moment(license.startDate).format('MMMM Do YYYY')}</label>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="d-flex justify-content-center pt-4">
                            <i className="fa fa-spinner fa-pulse fa-2x"></i>
                        </div>
                    )}

                    {totalUsed > params.limit && (
                        <div className="text-center mt-2">
                            <div className="d-inline-block">
                                <PaginationComponent totalItems={totalUsed} itemsPerPage={params.limit} currentPage={params.page} onPageChange={usedLicensePageChanged(params.page)}/>
                            </div>
                        </div>
                    )}

                    {!loading && usedLicenses.length === 0 && (
                        <div className="text-center">
                            <img className="mx-auto mt-3 mb-2" src="/assets/images/empty-chart.svg" alt="No data" />
                            <h2 className="text-muted">No License is used</h2>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default InstituteLicenses;
