"use client";
import { useEffect, useState, useRef } from "react";
// import { alert } from "alertifyjs";
import TestSkeleton from "@/components/skeleton/TestSkeleton";
import { toQueryString } from "@/lib/validator";
import { error, success, alert } from "alertifyjs";
import alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import { useSession } from "next-auth/react";
import { Modal } from "react-bootstrap";
import * as classroomService from "@/services/classroomService";
import * as authService from '@/services/auth'
import { FileDrop } from "react-file-drop";
import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";
import { TagsInput } from "react-tag-input-component";
import Multiselect from "multiselect-react-dropdown";

export default function HomeRoute() {
  const [toggleJoin, setToggleJoin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seqCode, setSeqCode] = useState("");
  const [total, setTotal] = useState(0);
  const [classrooms, setClassrooms]: any = useState([]);
  const [keyWord, setKeyword]: any = useState("");
  const user: any = useSession()?.data?.user?.info || {};
  const [showCreateClassrommModal, setShowCreateClassroomModal] = useState(false)
  const [classroom, setClassroom] = useState<any>({
    name: ''
  })
  const [instructors, setInstructors] = useState<any>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 12,
    checkSession: false,
    home: true,
    searchText: ""
  })
  const fileBrowseRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState<any>({
    progress: 0,
    state: 'pending'
  })
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [imageReview, setImageReview] = useState<boolean>(false)
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>(false)


  const { push } = useRouter();

  const onSessionStatusChanged = (d: any) => {
    for (const cls of classrooms) {
      if (cls._id == d.class) {
        cls.sessionStarted = d.session.running;
        break;
      }
    }
  };

  const viewDetails = (id: any) => {
    // this.router.navigate(['/classroom/details', id])
    push("/classroom/details/" + id);
  };

  const truncate = (str: string) => {
    return str.length > 20 ? str.substr(0, 22 - 1) + "…" : str;
  };

  const loadClassrooms = async (empty?: string) => {
    setLoading(true);
    let params_temp = {
      limit: 12,
      page: 1,
      checkSession: true,
      home: true,
      searchText: empty ? "" : keyWord,
    };
    setParams({
      limit: 12,
      page: 1,
      checkSession: true,
      home: true,
      searchText: empty ? "" : keyWord,
    })
    setClassrooms([]);
    const classrooms = await clientApi.get(
      "/api/classrooms" + toQueryString(params_temp)
    );
    setClassrooms(classrooms.data.classrooms);
    setLoading(false);
  };

  const loadMore = () => {
    setParams({
      ...params,
      page: params.page + 1
    })
    classroomService.find(params).then((res: any) => {
      const temp_classrooms = [...classrooms, ...res.classrooms]
      setClassrooms(temp_classrooms)
      setLoading(false)
    }).catch(err => {

      console.log(err)
      alertify.alert("Message", "Failed to load data")
      setLoading(false)

    })
  };

  const submitCode = async (seqCode: any) => {
    if (seqCode) {
      try {
        const res = await clientApi.post(`/api/classrooms/submitCode`, {
          seqCode,
        });
        // alert("Message","Classroom joined Successfully.");
        // alert("Message","Classroom joined Successfully.").setHeader(
        //   "<em> Success </em> "
        // );
        alertify.success("Classroom joined Successfully.");
        setSeqCode("");
        loadClassrooms();
        toggleJoinCode(toggleJoin);
      } catch (e) {
        alertify.warning("Wrong classroom code!. Please check the code.");
        // alert("Message","Wrong classroom code!. Please check the code.").setHeader(
        //   "<em> Warning! </em> "
        // );
      }
    } else {
      alertify.warning("Please enter classroom code.");
      // alert("Message","Please enter classroom code.").setHeader("<em> Warning! </em> ");
    }
  };

  const toggleJoinCode = (param: boolean) => {
    setToggleJoin(!param);
  };

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    loadClassrooms();
  }, []);

  const openCreateModal = async () => {
    setClassroom({
      name: '',
      joinByCode: true
    })
    await getTeacher()
    setShowCreateClassroomModal(true)
  }

  const getTeacher = async () => {
    // if (!instructors) {
    setInstructors([])
    if (user.activeLocation && (user.role == 'admin' || user.role == 'teacher' || user.role == 'director' || user.role == 'support')) {
      authService.findUsers({ teacherOnly: true, location: user.activeLocation }).then(({ users }: { users: [] }) => {
        setInstructors(users)
      }).catch(err => {
        console.log(err)
      })
    }
    // }
  }

  const save = async (e) => {
    e.preventDefault()
    const classroom_temp = { ...classroom }
    if (classroom.owners && classroom.owners.length > 0) {
      classroom_temp.owners = classroom.owners.map(d => d._id);

    } else {
      classroom_temp.owners = []
    }
    setSubmitted(true)
    // if (form.valid) {
    classroomService.checkExits({
      name: classroom.name,
      location: user.activeLocation, showAnalysis: classroom.showAnalysis
    }).then((data) => {
      if (data) {
        alertify.alert('Warning', 'Classroom already exists. It may be inactive.')
      } else {
        classroomService.create(classroom_temp).then((data: any) => {
          alertify.success('Classroom added successfully.')
          viewDetails(data._id)

          setSubmitted(false)

          setClassroom({
            name: '',
            joinByCode: true
          })
          setShowCreateClassroomModal(false)
        }).catch(err => {

          if (err) {
            if (err.isArray) {
              let msg = ''
              for (const i in err) {
                msg += err[i].msg + '<br>'
              }
              alertify.alert('Error ', msg)
            }
            if (err.error) {
              alertify.alert('Message', err.error.error)
            }
          }

        })
      }
    })
    // }
  }

  const cancel = () => {
    setShowCreateClassroomModal(false)
  }


  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const fileUpload = async () => {
    const formData: FormData = new FormData()
    formData.append('file', uploadFile, uploadFile.name)
    //   formData.append('uploadType', this.uploadType)
    try {

      const res = await uploaddFileFunc(uploadFile, uploadFile.name, 'file');
      setUploadedUrl(res.data.fileUrl)
      setClassroom({
        ...classroom,
        imageUrl: res.data.fileUrl
      })
      setImageReview(true)
    } catch (err) {
      alert('message', err)
    }
  }

  return (
    <main className="pt-3 classroom_student-new">
      <div className="container">
        <div className="dashboard-area classroom mx-auto mw-100">
          <div className="form-row align-items-center mb-2">

            {(user.role !== 'student') && (
              <div className="col text-right text-md-left mb-2">
                <a className="btn btn-primary" onClick={() => openCreateModal()}>Create Classroom</a>
              </div>
            )}
            {user.role === 'student' && (
              <div className="col-md">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">My Classrooms</h3>
                </div>
              </div>
            )}

            {(user.role === 'student') && (
              toggleJoin === false && (
                <div className="form-group col-md-auto ml-auto mb-2 text-right">
                  <a
                    className="btn btn-primary join-with-code-btn-remove-join-with-code-btn_new1"
                    onClick={() => toggleJoinCode(toggleJoin)}
                  >
                    Join with code
                  </a>
                </div>
              )
            )}
            {toggleJoin === true && (
              <div className="col-md-auto ml-auto text-right">
                <div className="form-row justify-content-end mt-2 pt-1">
                  <div className="col form-group">
                    <input
                      value={seqCode}
                      onChange={(e) => setSeqCode(e.target.value)}
                      placeholder="Enter Code"
                      type="text"
                      className="form-control mt-0"
                    />
                  </div>
                  <div className="col-auto">
                    <a
                      className="btn btn-primary join-btn-remove"
                      onClick={() => submitCode(seqCode)}
                    >
                      Join
                    </a>
                    <a
                      className="btn btn-light ml-2 join-cancel-btn-remove"
                      onClick={() => {
                        setSeqCode("");
                        toggleJoinCode(toggleJoin);
                      }}
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className="w-100-xs mb-2">
              <div className="search-form">
                <form
                  className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadClassrooms();
                  }}
                >
                  <input
                    type="text"
                    className="form-control border-0 my-0"
                    maxLength={50}
                    placeholder="Search"
                    name="txtSearch"
                    value={keyWord}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  {keyWord.length > 0 && (
                    <span
                      className="search-pause"
                      onClick={() => {
                        setKeyword("");
                        loadClassrooms("empty");
                      }}
                    >
                      <FontAwesomeIcon icon={faXmarkCircle} />
                    </span>
                  )}

                  <span className="m-0 w-auto h-auto">
                    <figure className="m-0 w-auto">
                      <img
                        className="m-0 h-auto mw-100"
                        src="/assets/images/search-icon-2.png"
                        alt=""
                      />
                    </figure>
                  </span>
                </form>
              </div>
            </div>
          </div>

          {classrooms.length ? (
            <div className="my-class-area my-class-area_new1 mw-100">
              <div className="row">
                {classrooms.map((classroom: any, index: any) => {
                  return (
                    <div className="col-lg-3 col-md-4 col-6" key={index}>
                      <div
                        className="course-item_new class-item ah-cursor bg-white d-block"
                        onClick={() => viewDetails(classroom._id)}
                      >
                        <img
                          width="100%"
                          style={{ height: 128 }}
                          src={
                            classroom.imageUrl
                              ? classroom.imageUrl
                              : "/assets/images/classroomjpgimg.jpg"
                          }
                          alt={classroom.name}
                        />
                        <div className="class-info class-info-com_new box-inner_new">
                          <h4
                            data-toggle="tooltip"
                            data-placement="top"
                            title={classroom.name}
                            className="text-truncate"
                          >
                            {classroom.name}
                            {classroom.sessionStarted && (
                              <span className="float-right btn btn-success btn-xs text-white rounded f-12 pt-0 pb-0 pl-1 pr-1">
                                <i
                                  className="fas fa-circle text-danger f-10"
                                  aria-hidden="true"
                                ></i>{" "}
                                Live
                              </span>
                            )}
                          </h4>
                          <p
                            data-toggle="tooltip"
                            data-placement="top"
                            title={classroom.user?.name}
                            className="text-truncate"
                          >
                            {classroom.user?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <></>
          )}

          {loading && <TestSkeleton />}

          {/* {total > classrooms.length && !loading && (
              <div className="mt-4 text-center">
                <button className="btn btn-light" onClick={() => loadMore()}>
                  Load More
                </button>
              </div>
            )} */}

          {!loading && !classrooms.length && (
            <div className="addNoDataFullpageImgs">
              <figure>
                <img
                  src="/assets/images/undraw_predictive_analytics_kf9n.svg"
                  alt="Not Found"
                />
              </figure>
              <h4 className="text-center">No Classroom found</h4>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={showCreateClassrommModal}
        onHide={() => setShowCreateClassroomModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h3 className="form-box_title">Add Classroom</h3>
          </div>
          <div className="modal-body form-boxes">
            <div className="create-course-modal create-ClassModalMain">
              <div className="class-board-info">
                <div className="mx-auto">
                  <form onSubmit={save}>
                    <div className="form-group">
                      <h4 className="form-box_subtitle">Classroom Name</h4>
                      <input type="text" name="name" placeholder=" Name" className="form-control form-control-sm" value={classroom.name} onChange={(e) => setClassroom({ ...classroom, name: e.target.value })} required />
                      <hr />
                      <div>
                        {submitted && classroom.name.length === 0 && <p className="label label-danger text-danger">Name is required</p>}
                        {submitted && classroom.name.length > 0 && classroom.name.length < 3 && <p className="label label-danger text-danger">Name must be greater than 2 characters.</p>}
                        {submitted && classroom.name.length > 50 && <p className="label label-danger text-danger">Name must be smaller than 50 characters.</p>}
                      </div>
                    </div>

                    <div className="form-group">
                      <h4 className="form-box_subtitle">Instructor</h4>
                      <div className="contee1 class-instructor d-block w-100 float-none ">
                        {/* Your tag input component goes here */}
                        <Multiselect
                          options={instructors}
                          displayValue="name"
                          selectedValues={classroom.owners}
                          onSelect={(selectedList) => setClassroom({
                            ...classroom,
                            owners: selectedList
                          })}
                          onRemove={(selectedList) => setClassroom({
                            ...classroom,
                            owners: selectedList
                          })}
                          placeholder='Add Instructor'
                          closeOnSelect={false}
                        />
                      </div>
                    </div>

                    <div className="row cameraToggleCombine">
                      <div className="col-lg-12">
                        <div className="camera-sec-box form-group ">
                          <h4 className="form-box_subtitle upload-modal-subtitle">Upload Classroom Picture
                          </h4>

                          {imageReview && uploadedUrl ? (
                            <div className="standard-upload-box mt-2 bg-white" >
                              <button type="reset" aria-label="remove uploaded image" className="close btn p-0 mb-2" onClick={() => { setImageReview(false) }} >
                                <img src="/assets/images/close.png" alt="user_uploaded image" />
                              </button>
                              <figure>
                                <img src={uploadedUrl} alt="actually uploaded image" className="actual-uploaded-image" />
                              </figure>
                            </div>
                          ) : (
                            <div className="standard-upload-box mt-2">
                              <FileDrop onDrop={(f: any) => dropped(f)}>
                                <h2 className="upload_icon mb-0">
                                  <span className="material-icons">file_copy</span>
                                </h2>
                                <p className="pro-text-drug text-center d-block active text-primary">
                                  {uploadFile?.name}
                                </p>
                                <span className="title">
                                  Drag and Drop or{" "}
                                  <a onClick={filePicker} className="text-primary">
                                    {" "}
                                    browse{" "}
                                  </a>{" "}
                                  your files
                                  <br></br>
                                  For optimal view, we recommend size 190px * 200px
                                </span>
                                {uploading && (
                                  <div className="info mx-auto mt-1 mb-2">
                                    <p className="text-center text-dark">
                                      Uploading(
                                      <span style={{ color: '#8C89F9' }}>
                                        {uploadProgress.progress.toFixed(0)}%
                                      </span>{' '}
                                      <i className="fa fa-spinner fa-pulse"></i>)
                                    </p>
                                  </div>
                                )}
                                {uploadProgress.state === 'inprogress' && (
                                  <div className="progress mb-2 mx-auto" style={{ height: '6px', width: '60%' }}>
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{ width: `${uploadProgress.progress}%`, backgroundColor: '#8C89F9' }}
                                      aria-valuenow={uploadProgress.progress}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-label="progress-bar"
                                    ></div>
                                  </div>
                                )}

                                <div className="d-flex justify-content-center gap-xs">
                                  {!uploadFile?.name && (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        filePicker()
                                      }}
                                    >
                                      Browse
                                    </button>
                                  )}
                                  {uploadFile?.name && (
                                    <>
                                      <button className="btn btn-secondary btn-sm ml-2" type="button" onClick={fileUpload} >Upload</button>
                                      <button className="btn btn-danger btn-sm" type="button" onClick={() => { setUploadFile({ ...uploadFile, name: '' }) }}>Cancel</button>
                                    </>
                                  )}
                                </div>
                                <input
                                  accept=""
                                  value=""
                                  style={{ display: "none", opacity: 0 }}
                                  ref={fileBrowseRef}
                                  type="file"
                                  onChange={(e) => dropped(e.target.files)}
                                />
                              </FileDrop>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="toggleAllowCustom2-remove switch-item float-none ml-0" style={{ position: 'relative', zIndex: '0' }}>
                          <span className="form-box_subtitle assess-set-head">Allow Students to join by code?</span>
                          <label className="switch my-0">
                            <input type="checkbox" name="joinByCode" checked={classroom.joinByCode} onChange={(e) => setClassroom({ ...classroom, joinByCode: e.target.checked })} />
                            <span className="slider round"></span>
                          </label>
                        </div>
                        <p className="mt-2">Enable to allow students to join with a unique code</p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end align-items-center mt-2">
                      <div className="create-course my-0">
                        <button className="btn btn-light" onClick={(e) => cancel()}>Cancel</button>
                      </div>
                      <div className="my-0 ml-2">
                        <button type="submit" className="btn btn-primary" disabled={classroom.name.length === 0 || classroom.name.length > 50 || classroom.name.length < 3}>Create Classroom</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}




