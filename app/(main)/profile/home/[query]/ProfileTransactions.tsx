"use client";
import { useEffect, useState } from "react";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import _ from "lodash";
import moment from 'moment';

const ProfileTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  alertify.set("notifier", "position", "top-right");

  useEffect(() => {
    const getTransactionHistory = async () => {
        const { data } = await clientApi.get(`/api/payments/transactionHistory`);
        setTransactions(data);
    };

    getTransactionHistory();
  }, []);

  return (
    <div className="institute-onboarding">
      <div className="container6 rounded-boxes bg-white m-0">
        <div className="section_heading_wrapper mb-md-0">
          <h3 className="section_top_heading">Transaction History</h3>
        </div>

        <div className="mt-3">
          {transactions ? (
            transactions.length > 0 ? (
              <>
                <div className="row border-bottom">
                  <div className="col">
                    <label>Date</label>
                  </div>
                  <div className="col text-center">
                    <label>Amount</label>
                  </div>
                  <div className="col text-center">
                    <label>Item</label>
                  </div>
                  <div className="col text-center">
                    <label>Discount Code</label>
                  </div>
                  <div className="col text-center">
                    <label>Transaction Amount</label>
                  </div>
                  <div className="col text-center">
                    <label>Mode of Payment</label>
                  </div>
                </div>

                {transactions.map((history, index) => (
                  <div key={index} className="row my-2">
                    <div className="col">
                      {moment(history.createdAt).fromNow()}
                    </div>
                    <div className="col text-center">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: history.currency,
                      }).format(history.price)}
                    </div>
                    <div className="col text-center">
                      {history.itemType}
                    </div>
                    <div className="col text-center">
                      {history.discountCode || 'N/A'}
                    </div>
                    <div className="col text-center">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: history.currency,
                      }).format(history.totalPayment)}
                    </div>
                    <div className="col text-center">
                      {history.paymentMethod}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center">
                <img className="mx-auto mt-3 mb-2" src="/assets/images/empty-chart.svg" alt="No data" />
                <h2 className="text-muted">No data yet</h2>
              </div>
            )
          ) : (
            <div className="d-flex justify-content-center pt-4">
              <i className="fa fa-spinner fa-2x fa-pulse"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfileTransactions;
