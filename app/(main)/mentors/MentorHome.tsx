"use client";

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AllMentors from './AllMentors';
import MyMentors from './MyMentors';
import InviteMentor from './InviteMentor';

interface MenuItem {
  _id: string;
  name: string;
}


export default function MentorHome() {

  const sideMenus: MenuItem[] = [
    {
      name: 'All Mentors',
      _id: 'allmentors'
    },
    {
      name: 'My Mentors',
      _id: 'mymentor'
    },
    {
      name: 'Invite Mentor',
      _id: 'invite'
    },
    // Add more menu items as needed
  ];

  const [loadedMenus, setLoadedMenus] = useState<Record<string, boolean>>({});
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(undefined);

  useEffect(() => {
    const savedMenu = sessionStorage.getItem('student_mentor_current_page');
    if (savedMenu) {
      sessionStorage.removeItem('student_mentor_current_page');

      const toOpenMenu = sideMenus.find((m) => m._id === savedMenu);
      if (toOpenMenu) {
        handleMenuChange(toOpenMenu);
        return;
      }
    }

    handleMenuChange(sideMenus[0]);
  }, []); // Empty dependency array to execute only once on component mount

  const handleMenuChange = (menu: MenuItem): void => {
    setSelectedMenu(menu);
    setLoadedMenus((prevLoadedMenus) => ({ ...prevLoadedMenus, [menu._id]: true }));
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (selectedMenu) {
        sessionStorage.setItem('student_mentor_current_page', selectedMenu._id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedMenu]);

  return (
    <>
      <Head>
        <title>My Mentor</title>
      </Head>

      <section className="details details_top_area_common mt-0">
        <div className="container">
          <div className="asses-info">
            <h3 className="main_title text-white">My Mentor</h3>
          </div>
        </div>
      </section>

      <main className="mentor-homepage pt-lg-3">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="row">
              <div className="col-lg-2">
                <nav className="navbar navbar-expand-lg navbar-light sidebar p-0">
                  <button
                    className="navbar-toggler ml-auto"
                    aria-label="mentors_mobileview_navbar"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarContentMobile"
                    aria-controls="navbarContentMobile"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarContentMobile">
                    <ul className="navbar-nav ml-auto">
                      {sideMenus.map((item) => (
                        <li key={item._id} onClick={() => handleMenuChange(item)}>
                          <a className={item._id === selectedMenu?._id ? 'active' : ''}>{item.name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="col-lg-10">
                {selectedMenu?._id === 'allmentors' && <AllMentors />}
                {selectedMenu?._id === 'mymentor' && <MyMentors />}
                {selectedMenu?._id === 'invite' && <InviteMentor />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};