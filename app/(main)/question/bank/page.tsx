import React from "react";

import QuestionBank from "./questionBank"; // Use PascalCase for the component name
import "@/public/css/base.style.css";

export default async function ContentRoute() {
  // const [activeTab, setActiveTab] = useState<string>('question')

  return (
    <>
    <main className="pt-lg-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <div className="row">
            <div className="d-none d-lg-block col-lg-2">
              <div className="sidebar" sticky-menu>
                <ul className="mt-0">
                  <li>
                    <a  className={'active'}>Question</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-10 main-panel">
              <QuestionBank  />
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}



