"use client"

import React, { useState, useEffect } from 'react';
import clientApi from '@/lib/clientApi';
import { useParams } from 'next/navigation';

export default function AssignedTasks() {

  const { studentId } = useParams();
  const [assignedPractice, setAssignedPractice] = useState<object[]>([]);


  const loadTasks = async () => {
    const { data } = await clientApi(`/api/classrooms/getAssignedTasks/${studentId}`);
    setAssignedPractice(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <>
      <main className="mentor-homepage pt-lg-0">
        {
          (assignedPractice && assignedPractice.length > 0) && (<>
            <div className="dashboard-area classroom mx-auto">
              <div className="container5-remove rounded-boxes bg-white ml-0">
                <h3 className="admin-head2 mb-2">Assigned Tasks</h3>
                <div className="row">
                  {assignedPractice.map((p, i) => (
                    <div className="col-lg-4 student" key={i}>
                      <div className="border-box">
                        <h6 className="ind-line-1 ml-0">{p.title}</h6>
                        {p.mentors && p.mentors[0] && (
                          <p className="ind-line-1 ml-0 f-12">
                            <strong>AssignedBy-</strong> {p.mentors[0].name}
                          </p>
                        )}
                        <p className="ind-line-1 ml-0 f-12 ">
                          <strong>Assigned On -</strong> {new Date(p.assignDate).toLocaleDateString()}
                        </p>
                        {p.a && p.a.length > 0 && (
                          <p className="ind-line-1 ml-0 f-12">
                            <i className="fas fa-check mr-1"></i>
                            <strong>Completed On -</strong> {new Date(p.a[0].createdAt).toLocaleDateString()}
                          </p>
                        )}
                        <div className="ment-create-btn-remove mt-2 text-right">
                          {p.a && p.a.length > 0 && (
                            <a className="btn btn-outline btn-sm" href={`./../../attempt-summary/${p.a[0]._id}`}>
                              Review
                            </a>
                          )}
                          {p.a && p.a.length === 0 && (
                            <a className="btn btn-outline btn-sm" href={`./../../assessment/${p.title}?id=${p.practiceId}`}>
                              Start
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
          )}
      </main>
    </>
  );
};