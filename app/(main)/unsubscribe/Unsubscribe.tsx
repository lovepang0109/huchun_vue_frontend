"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";


const Unsubscribe = () => {
  const user : any = useSession()?.data?.user?.info || {};
  const {update} = useSession();

  const [reason, setReason] = useState('');

  const unsubscribe = async () => {
    if (!reason) {
      return;
    }

    await clientApi.put(`/api/users/unsubscribe`,{reason});
    success("Successfully unsubscribed.");
    user.optoutEmail = true
    await update();
  }

  useEffect(() => {

  }, []);
  return (
    <div>
      {/* <header>
          <div className="container">
              <div className="header-area classroommx-auto">
                  <nav className="navbar navbar-expand-lg navbar-light p-0">
                      <a className="navbar-brand p-0" href="/">
                          app logo
                      </a>
                  </nav>
              </div>
          </div>
      </header> */}

      <section className="details mt-0">
          <div className="container">
              <div className="banner-blue">
                  <h3 className="text-white text-center">Unsubscribe</h3>
              </div>
          </div>
      </section>

      <main className="privacy-home bg-white">
        {
          !user.optoutEmail && 
          <div className="container" >
              <h4>Are you sure about unsubscribing?</h4>
              <input type="text" className="form-control px-0 border-bottom" name="reason" value={reason} onChange={e => setReason(e.target.value)} required placeholder="Your reason"/>
              <p className="my-2">You will not receive any more emails from us.</p>
              <button className="btn btn-secondary mt-2" onClick={unsubscribe} disabled={!reason}>Unsubscribe</button>
          </div>
        }

      {
        user.optoutEmail && 
        <div className="container">
            <h4>You have been unsubscribed.</h4>
        </div>
      }
      </main>
    </div>
  );
};
export default Unsubscribe;
