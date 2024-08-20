import React from "react";
import { useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { success, alert } from "alertifyjs";
import { useSession } from "next-auth/react";
import Modal from "react-bootstrap/Modal";

const QuestionBank = () => {
  return (
    <div>
      Question Bank
      {/*<main class="pt-lg-3">
    <div class="container">
        <div class="dashboard-area classroom mx-auto">
            <div class="row">
                <div class="d-none d-lg-block col-lg-2">
                    <div class="sidebar" sticky-menu>
                        <ul class="mt-0">
                            <li>
                                <a (click)="activeTab = 'question'" [class.active]="activeTab == 'question'">Question</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="col-lg-10 main-panel">
                    <question-bank-listing [hidden]="activeTab !=='question'"></question-bank-listing>
                </div>
            </div>
        </div>
    </div>
</main>*/}
    </div>
  );
};

export default QuestionBank;
