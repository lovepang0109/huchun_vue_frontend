"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import clientApi from "@/lib/clientApi";
import { error } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";

const ClassroomMember = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user }: any = useSession()?.data || {};
  const [classroom, setClassroom]: any = useState(true);
  const [totalTeachers, setTotalTeachers]: any = useState(0);
  const [totalStudents, setTotalStudents]: any = useState(0);
  const [keyword, setKeyWord]: any = useState("");
  const [activeTab, setActiveTab]: any = useState(0);
  const [students, setStudents]: any = useState([]);
  const [teachers, setTeachers]: any = useState([]);
  const [tabs, setTabs]: any = useState({
    student: {
      active: true,
      processing: false,
      loaded: false,
      txtSearch: keyword,
      page: 1,
      limit: 20,
      canLoadMore: true,
    },
    teacher: {
      active: false,
      processing: false,
      loaded: false,
      txtSearch: keyword,
      page: 1,
      limit: 20,
      canLoadMore: true,
    },
  });

  const startClass = () => {
    const params: any = {
      classroom: id,
      chatSupport: true,
      page: tabs.student.page,
      limit: tabs.student.limit,
    };

    let query = toQueryString(params);

    router.push(`/api/classrooms/findClassroomStudents/${id}${query}`);
  };

  const loadStudents = async (loadMore: any) => {
    const params: any = {
      classroom: id,
      chatSupport: true,
      page: tabs.student.page,
      limit: tabs.student.limit,
    };
    if (keyword) {
      params.name = keyword;
    }
    tabs.student.processing = !loadMore;

    // if (!loadMore) {
    let query = toQueryString(params);
    const result = (
      await clientApi.get(`/api/classrooms/findClassroomStudents/${id}${query}`)
    ).data;

    // const param: any = {
    //   classroom: id,
    //   chatSupport: true,
    //   page: tabs.student.page,
    //   limit: tabs.student.limit,
    // };

    // let que = toQueryString(param);

    // // router.push(`/api/classrooms/findClassroomStudents/${id}`);
    const tresult = await clientApi.get(
      `/api/classrooms/findClassroomStudents/${id}${query}`
    );
    setStudents(tresult.data);
    // }
    if (loadMore) {
      setTotalStudents(tresult.data?.length);
    }
  };

  const loadClassroom = async () => {
    let param = {
      includeUser: true,
      studentNotCount: true,
      assignment: true,
    };
    let query = toQueryString(param);
    const result = (
      await clientApi.get(`/api/classrooms/findByClassId/${id}${query}`)
    ).data;
    setClassroom(result);
  };

  const loadTeachers = async (loadMore: any) => {
    // if (tabs.teacher.processing) {
    //   return;
    // }

    tabs.teacher.processing = !loadMore;

    const params: any = {
      classroom: id,
      chatSupport: true,
      page: tabs.teacher.page,
      limit: tabs.teacher.limit,
    };
    if (keyword) {
      params.name = keyword;
    }

    // if (!loadMore) {
    let query = toQueryString(params);
    const result = (
      await clientApi.get(`/api/classrooms/findTeachers/${id}${query}`)
    ).data;
    setTeachers(result);
    if (loadMore) {
      setTotalTeachers(result?.length);
    }
    // }
  };

  const searchStudents = () => {
    // console.log("search....");
    // if (tabs.teacher.processing) {
    //   return;
    // }

    tabs.student.page = 1;
    tabs.student.canLoadMore = true;
    setStudents([]);
    loadStudents(false);
  };

  const searchTeachers = () => {
    // if (tabs.teacher.processing) {
    //   return;
    // }

    tabs.teacher.page = 1;
    tabs.teacher.canLoadMore = true;
    setTeachers([]);
    loadTeachers(false);
  };

  const loadMoreStudents = () => {
    // if (tabs.teacher.processing) {
    //   return;
    // }

    tabs.student.page++;
    loadStudents(true);
  };

  const loadMoreTeachers = () => {
    if (tabs.teacher.processing) {
      return;
    }

    tabs.teacher.page++;
    loadTeachers(true);
  };

  const openStudentChat = (std: any) => {
    // this.chatSvc.openChat(std._id, std.name);
  };

  const openTeacherChat = (teacher: any) => {
    // this.chatSvc.getRoom(teacher._id, teacher.name).then(
    //   (chatInstance: any) => {
    //     this.router.navigate(["/", this.user.role, "chat"], {
    //       queryParams: { id: chatInstance.uid },
    //     });
    //   },
    //   (err) => {
    //     alertify.alert("Message",err.error);
    //   }
    // );
  };

  useEffect(() => {
    loadStudents(true);
    loadClassroom();
    loadTeachers(true);
  }, []);
  return (
    <div>
      <div className="rounded-boxes class-board assignment bg-white">
        <div className="row align-items-center">
          <div className="col-md">
            {classroom && (
              <div className="square_profile_info clearfix classroom-topImage1 d-flex align-items-center">
                {classroom.imageUrl ? (
                  <figure className="squared-rounded_wrap_80">
                    <img
                      src={classroom.imageUrl}
                      alt=""
                      className="user_squared-rounded"
                    />
                  </figure>
                ) : (
                  <figure className="squared-rounded_wrap_80">
                    <img
                      src="/assets/images/classroomjpgimg.jpg"
                      alt=""
                      className="user_squared-rounded"
                    />
                  </figure>
                )}

                {classroom && classroom.user && (
                  <div className="class-board-info ml-0 pl-3">
                    <h3 className="top-title text-truncate">
                      {classroom.name}
                    </h3>

                    <p className="bottom-title text-truncate mb-2">
                      <span>{classroom.user.name}</span>
                    </p>
                    <p>
                      {totalTeachers} Teacher(s) &nbsp;|&nbsp;
                      {totalStudents} Student(s)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="class-board folder-board bg-white p-3 position-relative">
        <div className="tab">
          <button
            className={`tablinks ${activeTab === 0 && "active"}`}
            onClick={() => setActiveTab(0)}
          >
            Students
          </button>
          <button
            className={`tablinks ${activeTab === 1 && "active"}`}
            onClick={() => setActiveTab(1)}
          >
            Teachers
          </button>
        </div>
        {activeTab === 0 && (
          <div className="tab-pane show active fade p-0 mt-3">
            <div className="folder-area clearfix">
              <div className="table-wrap table-responsive">
                <table className="table vertical-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0">Email / Phone Number</th>
                      <th className="border-0">Status</th>
                      <th className="border-0"></th>
                    </tr>
                  </thead>

                  {students?.length ? (
                    <tbody>
                      {students.map((std: any, index: any) => {
                        return (
                          <tr key={index}>
                            <td className="px-0 disabled">
                              <div className="folder mb-0 p-0">
                                <a className="p-0 border-0 clearfix">
                                  <div className="d-flex align-items-center">
                                    <figure className="user_img_circled_wrap">
                                      <img
                                        className="avatar"
                                        // src={std?.userData}
                                        src={
                                          std?.userData?.avatar?.fileUrl
                                            ? "https://www.practiz.xyz" +
                                              std?.userData?.avatar?.fileUrl
                                            : "/assets/images/defaultProfile.png"
                                        }
                                        alt=""
                                      />
                                    </figure>

                                    <div className="inner ml-2">
                                      <a
                                        className="border-0"
                                        href={`/public/profile/${std.studentId}`}
                                      >
                                        <h4 className="profile_user_name">
                                          {std?.userData?.name}
                                        </h4>
                                      </a>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            </td>

                            <td>
                              <div className="email">
                                <a>{std?.userData?.email}</a>
                              </div>
                            </td>

                            <td>
                              <div className="status">
                                <span
                                  className={
                                    std.isOnline ||
                                    std?.userData?._id == user?.info?._id
                                      ? "active"
                                      : ""
                                  }
                                >
                                  {std.isOnline ||
                                  std?.userData?._id == user?.info?._id
                                    ? "Online"
                                    : "Offline"}
                                </span>
                              </div>
                            </td>

                            <td className="text-right">
                              {std.userData?._id != user.info._id && (
                                <a
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => openStudentChat(std.userData)}
                                >
                                  Message
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  ) : (
                    <></>
                  )}
                  {/* {students &&
                    students.length > 0 &&
                    students.length < totalStudents && (
                      <div
                        style={{ width: "240%" }}
                        className="d-block text-center"
                      >
                        <button
                          type="button"
                          className="btn btn-outline-black LoadMoreAll-btn-remove"
                          onClick={() => loadMoreStudents()}
                          style={{ textAlign: "center" }}
                        >
                          Load More
                        </button>
                      </div>
                    )} */}
                  {students?.length === 0 && (
                    <div className="text-center">
                      <div className="text-center" style={{ width: "150%" }}>
                        <svg
                          id="b0225cde-a2d2-4693-8ce5-502a1e8a6144"
                          data-name="Layer 1"
                          xmlns="http://www.w3.org/2000/svg"
                          width="500.38187"
                          height="500.8614"
                          viewBox="0 0 1077.38187 752.8614"
                        >
                          <title>learning</title>
                          <ellipse
                            cx="455"
                            cy="681.8614"
                            rx="455"
                            ry="23"
                            fill="#3f3d56"
                          />
                          <ellipse
                            cx="899.33839"
                            cy="721"
                            rx="178.04348"
                            ry="9"
                            fill="#3f3d56"
                          />
                          <ellipse
                            cx="396.05573"
                            cy="743.8614"
                            rx="178.04348"
                            ry="9"
                            fill="#3f3d56"
                          />
                          <path
                            d="M894.39081,547.00164l15.975-11.10408,33.10933-42.6179a5.803,5.803,0,0,0-1.02243-8.1427h0a5.803,5.803,0,0,0-8.1427,1.02243l-33.10933,42.6179Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M1036.98725,141.8572s-20.09094-18.01257-47.10979,15.93419-69.2791,50.57374-78.97817,63.73677c0,0,40.18187-16.627,54.03769-23.55489s13.163-5.54233,13.163-5.54233S959.39466,205.594,955.9307,218.757s-.69279,24.24768-6.92791,37.41071,119.16,9.00628,119.16,9.00628,12.47024-21.47652,9.00628-43.64583S1075.78354,144.62836,1036.98725,141.8572Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M997.49816,195.20211s4.84954,33.94675-15.93419,41.56745-13.163,18.01257-13.163,18.01257l31.17559,15.2414,33.254-10.39186,11.08466-16.627s-18.01257-4.15674-13.163-16.627,6.23512-16.627,6.23512-16.627Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M997.49816,195.20211s4.84954,33.94675-15.93419,41.56745-13.163,18.01257-13.163,18.01257l31.17559,15.2414,33.254-10.39186,11.08466-16.627s-18.01257-4.15674-13.163-16.627,6.23512-16.627,6.23512-16.627Z"
                            transform="translate(-61.30906 -73.5693)"
                            opacity="0.1"
                          />
                          <path
                            d="M1084.78982,292.19284s-4.84953,63.73677-3.464,66.50794,0,99.0691,0,99.0691,9.69907,51.95933-2.77117,54.73049-9.69907-58.19444-9.69907-58.19444l-12.47024-80.36375,1.38558-79.671Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M1084.78982,292.19284s-4.84953,63.73677-3.464,66.50794,0,99.0691,0,99.0691,9.69907,51.95933-2.77117,54.73049-9.69907-58.19444-9.69907-58.19444l-12.47024-80.36375,1.38558-79.671Z"
                            transform="translate(-61.30906 -73.5693)"
                            opacity="0.1"
                          />
                          <path
                            d="M949.69558,484.09594s-22.8621,86.59887-22.16931,128.85912,9.69908,101.14749,9.69908,101.14749,1.38558,25.63326-.6928,28.40443,10.39187,14.54861,10.39187,14.54861l13.163-7.6207,4.84953-5.54233V739.043s-7.6207-23.55489-1.38558-42.26025,9.69908-65.81514,3.464-80.36375l42.953-127.47354Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M948.31,745.97093s-8.31349-10.39186-13.85582-6.92791-14.54861,27.01885-14.54861,27.01885-31.17559,29.79-9.00628,31.17559,31.86838-6.23512,34.63955-11.77744,28.40443-20.09094,28.40443-20.09094-2.77117-26.32606-6.92791-27.01885-10.39187,10.39186-10.39187,10.39186Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M1025.2098,489.63827v85.90608a265.61637,265.61637,0,0,0,2.07837,31.17559c2.07837,15.24141-11.77744,128.85913-11.77744,128.85913l1.38558,20.09093,17.31977-1.38558,2.07837-17.31977,24.94048-76.207s8.31349-46.417,4.15675-63.73677,21.47652-128.16633,21.47652-128.16633Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M1011.354,750.82047l5.13095-1.1155s3.87533-8.58358,8.72487-6.5052a52.29963,52.29963,0,0,1,9.64308,5.778l2.13437,3.921s4.84953,10.39186,11.08465,17.31977,13.163,22.16932,2.77117,23.5549-24.24769,2.07837-28.40443-1.38558-1.38559-9.00629-5.54233-10.39187-7.6207-5.54233-6.92791-6.92791S1011.354,750.82047,1011.354,750.82047Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <circle
                            cx="963.90073"
                            cy="114.70489"
                            r="33.25397"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M967.01536,242.31189l9.15108-3.19485s-3.60876,5.966,15.78939,9.43,39.48716,4.69031,48.4944-6.66113c0,0,3.46493-1.65236,8.31446,3.19718s7.6207,3.464,7.6207,3.464l-3.46395,18.01257-6.92791,33.254-9.00628,24.94048-25.63327-5.54233-27.71164-20.09094L973.25048,272.1019V247.16143Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M1051.53586,252.011l6.92791-4.84954s23.55489,4.15674,24.94047,15.2414l-18.01256,34.63955a39.43665,39.43665,0,0,1-.6928,29.79c-6.92791,15.93419-6.23511,19.39815-6.23511,19.39815l-4.84954,20.78373-87.98445,6.92791s-3.464-8.31349-4.84954-9.69908-1.38558-6.23512,0-6.23512,0-2.07837-1.38558-4.15674-2.07838-2.77117,0-5.54233-3.464-27.71164-3.464-27.71164V293.57842l-23.55489-31.17559s8.31349-12.47024,12.47024-13.85582,23.93018-6.84988,23.93018-6.84988l4.47425,6.588,6.23511,50.14279,9.00629,30.4828,37.921-6.4431,14.73113-24.73249,9.69908-29.09722Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M1077.86191,258.24608l5.54233,4.15675s4.84954,38.79629,3.464,41.56746-25.63327,5.54233-26.32606,4.15674S1077.86191,258.24608,1077.86191,258.24608Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M927.52627,300.50633s4.84954,63.73677,3.464,66.50794,0,99.06911,0,99.06911-9.69908,51.95932,2.77116,54.73048,9.69907-58.19444,9.69907-58.19444l12.47024-80.36375-1.38558-79.671Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#ffb9b9"
                          />
                          <path
                            d="M963.5514,238.84794l6.92791,45.7242s-6.23512,67.89352-4.84953,81.74934l1.38558,4.15674s-2.77117-1.38558-3.464,1.38558,0,11.77745,0,11.77745-4.15674,4.15675-5.54233,27.01885-18.01256,77.59259-11.77744,79.671,43.64583,12.47024,63.73677,10.39187,92.1412-26.32606,91.44841-32.56118-35.33234-94.21957-35.33234-94.21957-6.23512-10.39187-6.23512-11.77745,8.31349-6.92791,6.23512-12.47024-13.163-63.73677-13.163-63.73677l7.6207-41.56746-10.39187-2.77116-7.6207,40.18188s-29.79,14.54861-60.9656,1.38558l-6.92791-47.10979Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M937.91814,260.32446l-5.54233,2.07837s-10.39187,43.64583-7.6207,43.64583,36.02513,4.15675,36.02513,2.77117-6.23512-35.33234-6.23512-35.33234Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M998.88374,159.177s51.26653,35.33234,65.12235,19.39815-24.24768-29.79-24.24768-29.79l-31.86839-3.464Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M200.92177,73.5693v676h581v-676Zm31,620a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,693.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,644.5693Zm0-48a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,596.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,547.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,498.5693Zm0-48a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,450.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,401.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,352.5693Zm0-48a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,304.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,255.5693Zm0-49a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,206.5693Zm0-47a10,10,0,1,1,10-10A10,10,0,0,1,231.92177,159.5693Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#f2f2f2"
                          />
                          <polygon
                            points="720.613 51.338 720.613 49.338 208.369 49.338 208.369 0 206.369 0 206.369 49.338 139.613 49.338 139.613 51.338 206.369 51.338 206.369 98 139.613 98 139.613 100 206.369 100 206.369 146.662 139.613 146.662 139.613 148.662 206.369 148.662 206.369 195.323 139.613 195.323 139.613 197.323 206.369 197.323 206.369 243.984 139.613 243.984 139.613 245.984 206.369 245.984 206.369 292.646 139.613 292.646 139.613 294.646 206.369 294.646 206.369 341.307 139.613 341.307 139.613 343.307 206.369 343.307 206.369 389.969 139.613 389.969 139.613 391.969 206.369 391.969 206.369 438.63 139.613 438.63 139.613 440.63 206.369 440.63 206.369 487.291 139.613 487.291 139.613 489.291 206.369 489.291 206.369 535.953 139.613 535.953 139.613 537.953 206.369 537.953 206.369 584.614 139.613 584.614 139.613 586.614 206.369 586.614 206.369 633.275 139.613 633.275 139.613 635.275 206.369 635.275 206.369 676 208.369 676 208.369 635.275 720.613 635.275 720.613 633.275 208.369 633.275 208.369 586.614 720.613 586.614 720.613 584.614 208.369 584.614 208.369 537.953 720.613 537.953 720.613 535.953 208.369 535.953 208.369 489.291 720.613 489.291 720.613 487.291 208.369 487.291 208.369 440.63 720.613 440.63 720.613 438.63 208.369 438.63 208.369 391.969 720.613 391.969 720.613 389.969 208.369 389.969 208.369 343.307 720.613 343.307 720.613 341.307 208.369 341.307 208.369 294.646 720.613 294.646 720.613 292.646 208.369 292.646 208.369 245.984 720.613 245.984 720.613 243.984 208.369 243.984 208.369 197.323 720.613 197.323 720.613 195.323 208.369 195.323 208.369 148.662 720.613 148.662 720.613 146.662 208.369 146.662 208.369 100 720.613 100 720.613 98 208.369 98 208.369 51.338 720.613 51.338"
                            fill="#3f3d56"
                            opacity="0.3"
                          />
                          <path
                            d="M330.708,246.74812A115.52164,115.52164,0,0,1,311.3301,258.8944c-4.42374,2.19545-9.332,4.14965-14.184,3.22885s-9.20857-5.87908-7.72695-10.59016a8.37291,8.37291,0,0,1,6.45035-5.32576,14.82177,14.82177,0,0,1,8.56019,1.23515,24.614,24.614,0,0,1,11.61812,10.30863c1.3557,2.36085,2.41819,5.06806,4.66927,6.59912a13.26556,13.26556,0,0,0,5.92919,1.71587c4.90385.613,9.936,1.21989,14.74016.0606s9.40688-4.48312,10.63233-9.27079"
                            transform="translate(-61.30906 -73.5693)"
                            fill="none"
                            stroke="#3f3d56"
                            stroke-miterlimit="10"
                            stroke-width="2"
                          />
                          <path
                            d="M367.77212,223.93324q.5697,22.03112-.6164,44.061l10.422-1.96912c3.84158-.72583,8.21217-1.8346,9.94821-5.33756,1.61855-3.26589.07816-7.38857-2.61649-9.84307s-6.28526-3.62586-9.7586-4.73115l-5.68956-1.81052"
                            transform="translate(-61.30906 -73.5693)"
                            fill="none"
                            stroke="#3f3d56"
                            stroke-miterlimit="10"
                            stroke-width="2"
                          />
                          <path
                            d="M423.94585,240.12547c-3.80521-.52743-7.68742-1.03211-11.46876-.3544s-7.51209,2.73639-9.25544,6.15962c-3.22011,6.323,1.71343,14.10944,7.96549,17.46516a25.7699,25.7699,0,0,0,16.99049,2.55775"
                            transform="translate(-61.30906 -73.5693)"
                            fill="none"
                            stroke="#3f3d56"
                            stroke-miterlimit="10"
                            stroke-width="2"
                          />
                          <path
                            d="M340.27594,189.821q-14.35418,13.49653-28.70834,0a39.49152,39.49152,0,0,1-12.14583-28.83483V73.5693h53v87.41691A39.49152,39.49152,0,0,1,340.27594,189.821Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M636.62178,500.29928c0,81.83-48.64,110.4-108.65,110.4-1.39,0-2.78-.02-4.16-.05-2.78-.06-5.54-.18994-8.26-.38-54.16-3.83-96.23-33.87-96.23-109.97,0-78.74,100.62-178.11,108.2-185.48a.0098.0098,0,0,1,.01-.01c.29-.29.44-.43.44-.43S636.62178,418.47927,636.62178,500.29928Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M524.0118,598.17929l39.74-55.52-39.84,61.62-.1,6.37c-2.78-.06-5.54-.18994-8.26-.38l4.28-81.86-.03-.64.07-.11.41-7.74-39.93994-61.77,40.05994,55.97.1,1.64,3.23-61.85-34.19-63.83,34.61,52.98,3.37-128.24.01-.44v.43l-.56,101.12,34.04-40.09-34.18006,48.80005-.9,55.38,31.79-53.15-31.92,61.3-.5,30.79,46.13-73.98005-46.31,84.72Z"
                            transform="translate(-61.30906 -73.5693)"
                            fill="#3f3d56"
                          />
                        </svg>
                        <h1>No student found</h1>
                      </div>
                    </div>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div className="tab-pane show active fade p-0 mt-0">
            <div className="folder-area clearfix">
              {teachers?.length ? (
                <div className="table-wrap table-responsive">
                  <table className="table vertical-middle mb-0">
                    <thead>
                      <tr>
                        <th className="border-0">Name</th>
                        <th className="border-0">Email / Phone Number</th>
                        <th className="border-0">Status</th>
                        <th className="border-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher: any, index: any) => {
                        return (
                          <tr key={index}>
                            <td className="px-0 disabled">
                              <div className="folder mb-0 p-0">
                                <a className="p-0 border-0 clearfix">
                                  <div className="d-flex align-items-center">
                                    <figure className="user_img_circled_wrap">
                                      <img
                                        className="avatar"
                                        src="/assets/images/defaultProfile.png"
                                        alt=""
                                      />
                                    </figure>

                                    <div className="inner ml-2">
                                      <a
                                        className="border-0"
                                        href={`/public/profile/${teacher._id}`}
                                      >
                                        <h4 className="profile_user_name">
                                          {teacher?.name}
                                        </h4>
                                      </a>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            </td>

                            <td>
                              <div className="email">
                                <a>{teacher?.email}</a>
                              </div>
                            </td>

                            <td>
                              <div className="status">
                                <span className={teacher.isOnline && "active"}>
                                  {teacher.isOnline ? "Online" : "Offline"}
                                </span>
                              </div>
                            </td>

                            <td className="text-right">
                              <div className="msg-btn-remove">
                                <a
                                  className="btn btn btn-outline-primary btn-sm"
                                  onClick={() => openTeacherChat(teacher)}
                                >
                                  Message
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* <div
                    style={{ width: "240%" }}
                    className="text-center d-block"
                  >
                    <button
                      type="button"
                      className="btn btn-outline-black LoadMoreAll-btn-remove"
                      onClick={() => loadMoreTeachers()}
                      style={{ textAlign: "center" }}
                    >
                      Load More
                    </button>
                  </div> */}
                </div>
              ) : (
                <></>
              )}
              {!teachers?.length && (
                <div className="empty-data">
                  <img src="/assets/images/32594.jpg" alt="" />
                  <h3>No teacher</h3>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="position-absolute" style={{ right: 15, top: 8 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchStudents();
            }}
            hidden={activeTab !== 0}
            className="common_search-type-1 form-half ml-auto"
          >
            <input
              type="text"
              placeholder="Search"
              className="form-control min-h-auto"
              value={keyword}
              onChange={(e) => {
                setKeyWord(e.target.value);
              }}
              name="txtStudentSearch"
            />
            <span className="m-0 w-auto h-auto">
              <figure className="m-0 w-auto">
                <img
                  src="/assets/images/search-icon-2.png"
                  alt=""
                  className="m-0 h-auto mw-100"
                />
              </figure>
            </span>
          </form>
          <form
            onSubmit={(e) => {
              console.log(e);
              e.preventDefault();
              searchTeachers();
            }}
            hidden={activeTab !== 1}
            className="common_search-type-1 form-half ml-auto"
          >
            <input
              type="text"
              placeholder="Search"
              className="form-control min-h-auto"
              value={keyword}
              onChange={(e) => setKeyWord(e.target.value)}
              name="txtTeacherSearch"
            />
            <span className="m-0 w-auto h-auto">
              <figure className="m-0 w-auto">
                <img
                  src="/assets/images/search-icon-2.png"
                  alt=""
                  className="m-0 h-auto mw-100"
                />
              </figure>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ClassroomMember;
