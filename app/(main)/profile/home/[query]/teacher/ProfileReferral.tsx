"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import * as alertify from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import _ from "lodash";
import * as helper from "@/lib/helpers";

import * as couponSvc from '@/services/couponService';
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from 'react-share';
import { FaLinkedin, FaFacebookSquare, FaTwitterSquare } from 'react-icons/fa';
import moment from 'moment';



const ProfileReferral = ({settings}: any) => {
  const user: any = useSession()?.data?.user?.info || {};
  const [processing, setProcessing] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [refLink, setRefLink] = useState('');
  const [invitingEmail, setInvitingEmail] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [referral, setReferral] = useState(null);
  const [totalClick, setTotalClick] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);

  alertify.set("notifier", "position", "top-right");

  useEffect(() => {
    couponSvc.getAmbassadorCode().then((referral) => {
      setReferral(referral);
      const rc = referral.code;
      setRefCode(referral.code);
      setRefLink(`${settings.baseUrl}signup?atrb=${rc}`);
    
      couponSvc.getUtmStats(rc).then((data: any) => {
        setTotalClick(data.total);
      })
      couponSvc.getReferralTransactions(rc).then((data: []) => {
        setTransactions(data);
      })
    });
  }, []);
  
  const copyText = async () => {
    helper.copyText(refLink)
    alertify.success("Referral link is copied to clipboard.")
  };

  const sendInviteEmail = async () => {
    if (!invitingEmail) {
      return;
    }
    try {
      const {data} = await clientApi.post(`/api/users/sendReferralInvitation`, {invitingEmail, refLink, refCode});
      alertify.success("Invitation is sent");
    } catch (error) {
      console.log(error)
      alertify.alert("Message","Failed to send invitation. Please try again later!")
    } finally{
      setInvitingEmail('');
      setEmailTouched(false);
    }
  }

  const requestPayout = async () => {
    try {
      const payout = referral.earning - referral.payout;
      const {data} = await clientApi.post(`/api/users/sendPayoutRequest`, {payout});
      alertify.success("Payout request is sent");
    } catch (error) {
      console.log(error)
      alertify.alert("Message","Failed to send payout request. Please try again later!")
    }
  }

  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const handleEmailChange = (e: any) => {
    setInvitingEmail(e.target.value);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  return (
    <div className="mentor-homepage-profile Stu_profile">
      <div className="institute-onboarding">
        <div>
          <div className="container6 rounded-boxes bg-white m-0">
            <div className="row">
              <div className="col">
                <div className="section_heading_wrapper mb-md-0">
                    <div className="d-flex justify-content-between">
                        <h3 className="section_top_heading">Be Our Ambassador</h3>
                        <p className="bg-color7 px-2 bold">{refCode}</p>
                    </div>
                    <p className="section_sub_heading">
                        Register to become our brand ambassador and grow with us.
                        Once you enroll into this program, our team will get in
                        touch with you to verify your identity and confirm. While
                        you learn, earn & represent us like our partner. You grow
                        our brand in your college, friends and social media and earn
                        accordingly.
                    </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
                <div className="col-lg-6">
                    <div className="rounded bg-white p-3 mb-3">
                        <label className="bold">Invite your friends through email</label>

                        <input 
                           type="text" 
                           name="txtInvitingEmail"
                           className="form-control border"
                           placeholder="Enter email address"
                           value={invitingEmail}
                           onChange={handleEmailChange}
                           onBlur={handleEmailBlur}
                           style={{marginBottom: 6, marginTop: 6}}
                        />
                        {emailTouched && !emailPattern.test(invitingEmail) && (
                          <div>
                            <p className="label label-danger text-danger">
                                Invalid email.
                            </p>
                          </div>
                        )}
                        
                        <button className="btn btn-outline" disabled={!emailPattern.test(invitingEmail)} onClick={sendInviteEmail} >Invite</button>
                    </div>

                </div>
                <div className="col-lg-6">
                    <div className="rounded bg-white p-3 mb-3">
                        <label className="bold">Share through social media</label>
                        <div className="text-center mt-3">
                            <span>{refLink}</span>&nbsp;&nbsp;<a onClick={copyText}><i className="fa fa-copy"></i></a>
                        </div>

                        <div className="d-flex justify-content-center gap-sm mt-4">
                          <LinkedinShareButton url={refLink} aria-label="LinkedIn">
                            <FaLinkedin size={32} />
                          </LinkedinShareButton>
                          <FacebookShareButton url={refLink} aria-label="Facebook">
                            <FaFacebookSquare size={32} />
                          </FacebookShareButton>
                          <TwitterShareButton url={refLink} aria-label="Twitter">
                            <FaTwitterSquare size={32} />
                          </TwitterShareButton>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {referral && (
                  <div className="col-lg-6">
                      <div className="rounded bg-white p-3 mb-3">
                          <div className="d-flex justify-content-between">
                              <div className="text-center">
                                  <label className="bold">{`${referral.earning.toFixed(2)}$`}</label>
                                  Total Earned
                              </div>
                              <div className="text-center">
                                  <label className="bold">{`${referral?.payout.toFixed(2)}$`}</label>
                                  Total Payout
                              </div>
                              <div className="text-center">
                                  <label className="bold">{`${(referral?.earning - referral?.payout).toFixed(2)}$`}</label>
                                  Total Available
                              </div>
                          </div>
                          {((referral.earning - referral.payout) > 0) && (
                            <button className="btn btn-outline mt-2" onClick={requestPayout}>Request Payout</button>
                          )}
                          
                        </div>
                  </div>
                )}
                <div className="col-lg-6">
                    <div className="rounded bg-white p-3 mb-3">
                        <label className="bold">Criteria for new referrals</label>
                        <div className="my-3">

                        </div>
                        <a className="btn btn-outline bold" href={ "/terms"}>Terms of Service</a>

                    </div>
                </div>
              </div>

              <div className="rounded bg-white p-3 mb-3 d-flex">
                <div className="text-center">
                    <h6 className="h6">{totalClick}</h6>
                    <h6 className="h6">Number of clicks</h6>
                </div>
                <div className="ml-4 text-center">
                    <h6 className="h6">{transactions.length}</h6>
                    <h6 className="h6">Purchased</h6>
                </div>
              </div>

                <div className="rounded bg-white p-3 mb-3">
                        <label className="bold">Transaction History</label>

                        <div className="row border-bottom">
                            <div className="col">
                                <label>Date</label>
                            </div>

                            <div className="col text-center">
                                <label>Transaction Amount</label>
                            </div>

                            <div className="col text-center">
                                <label>Referral Amount</label>
                            </div>

                            <div className="col text-center">
                                <label>Transaction Type</label>
                            </div>

                            <div className="col text-center">
                                <label>Institute Code</label>
                            </div>
                        </div>

                        {transactions.length > 0 ? (
                            transactions.map((history, index) => (
                              <div key={index} className="row">
                                <div className="col">
                                  <label>{moment(history.createdAt).fromNow()}</label>
                                </div>
                                <div className="col text-center">
                                  <label>{new Intl.NumberFormat('en-US', { style: 'currency', currency: history.currency }).format(history.amount)}</label>
                                </div>
                                <div className="col text-center">
                                  <label>{new Intl.NumberFormat('en-US', { style: 'currency', currency: history.currency }).format(history.referralAmount)}</label>
                                </div>
                                <div className="col text-center">
                                  <label>{history.type}</label>
                                </div>
                                <div className="col text-center">
                                  <label>{history.instituteName}</label>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center">
                              <img className="mx-auto mt-3 mb-2" src="/assets/images/empty-chart.svg" alt="No data" />
                              <h2 className="text-muted">No data yet</h2>
                            </div>
                          )}
            </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileReferral;
