"use client";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// import { StudentHeader } from '@/components/headers/student-header';
// import TeacherHeader from '@/components/headers/teacher-header';
// import PublisherHeader from '@/components/headers/publisher-header';
// import DirectorHeader from '@/components/headers/director-header';
// import OperatorHeader from '@/components/headers/operator-header';
// import MentorHeader from '@/components/headers/mentor-header';

function ClassBoardHome() {
  const { user } = useSession()?.data || {};
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>();
  const [questionCode, setQuestionCode] = useState<string>();

  const openQuestionCode = (e: any) => {
    if (loading) {
      return;
    }
    e.preventDefault();
    if (!questionCode) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    clientApi
      .get(
        `/api/questions/classboard/${questionCode}${toQueryString({
          checkCodeOnly: true,
        })}`
      )
      .then((res: any) => {
        router.push(`/classboard/detail/${questionCode}`);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {}, []);

  return (
    <div>
      {user && (
        <div>
          {/* {user.userRole == 'student' && <StudentHeader />}
        {user.userRole == 'teacher' && <TeacherHeader />}
        {user.userRole == 'publisher' && <PublisherHeader />}
        {user.userRole == 'director' && <DirectorHeader />}
        {user.userRole == 'operator' && <OperatorHeader />}
        {user.userRole == 'mentor' && <MentorHeader />} */}
        </div>
      )}
      <div className="p-2 classboard">
        <div className="code-editor pb-5">
          <div className="code-highlight">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="code-head">Class Board</h3>
            </div>
          </div>

          <div>
            <img
              style={{ height: "300px" }}
              className="mx-auto"
              src="/assets/images/classboard-home.png"
              alt=""
            />
            <form
              style={{ width: "400px" }}
              className="d-flex justify-content-center mx-auto"
              onSubmit={(e) => openQuestionCode(e)}
            >
              <div className="flex-grow-1">
                <input
                  className="form-control border-bottom border-left-0 border-right-0 border-top-0"
                  maxLength={60}
                  placeholder="Enter a valid Question code"
                  name="txtQuestionCode"
                  value={questionCode}
                  onChange={(event) => setQuestionCode(event.target.value)}
                />
                {error && (
                  <em className="text-danger">
                    Invalid Question Code. Question may no longer be asked in
                    your class. Check with your teacher and try again.
                  </em>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="ml-3 btn btn-primary"
                  disabled={loading}
                >
                  Participate{" "}
                  {loading && <i className="ml-2 fa fa-spinner fa-pulse"></i>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassBoardHome;
