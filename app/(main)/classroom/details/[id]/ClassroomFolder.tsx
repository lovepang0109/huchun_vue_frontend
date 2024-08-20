"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import * as classroomService from "@/services/classroomService";
import clientApi from "@/lib/clientApi";
import moment from "moment";
import alertify from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";
import _ from "lodash";

const ClassroomFolder = () => {
  const { id } = useParams();
  const user: any = useSession()?.data?.user?.info || {};

  const docUploader = useRef(null);

  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(false);
  const [defaultView, setDefaultView] = useState<boolean>(true);
  const [searchText, setSearchText]: any = useState("");
  const [files, setFiles]: any = useState([]);
  const [allFiles, setAllFiles]: any = useState([]);

  useEffect(() => {
    classroomService
      .getFilesByClassroom(id)
      .then((res: any) => {
        setAllFiles(res);
        if (res && res.length > 0) {
          setFirstLoad(true);
        }
        setFiles(res);
      })
      .catch((err) => {
        setFiles([]);
      });
  }, []);

  const toggleView = () => {
    setDefaultView(!defaultView);
  };

  const search = (text: any) => {
    setSearchText(text);
    if (text) {
      setFiles(
        allFiles.filter(
          (d) => d.originalName.toLowerCase().toString().indexOf(text) != -1
        )
      );
    } else {
      setFiles(allFiles);
    }
  };

  const redirectToFile = (file: any) => {
    window.open(file.fileUrl, "_blank");
  };

  const addFolderItem = (res: any) => {
    res = _.omit(res, ["_id"]);
    const params = {
      item: {},
      _id: "",
    };
    params.item = res;
    params._id = id;
    classroomService.addFolderItem(params).then((data) => {
      classroomService
        .getFilesByClassroom(id)
        .then((re: any) => {
          setAllFiles(re);
          setFiles(re);
          setUploading(false);
          setFirstLoad(true);
        })
        .catch((err) => {
          setFiles([]);
        });
    });
  };

  const uploadItem = async ($event: any) => {
    setUploading(true);
    const session = await getSession();
    const apiVersion = "/api/v1";
    const file = $event.target.files[0];
    const fileName = file.name;

    const formData: FormData = new FormData();
    formData.append("file", file, fileName);
    formData.append("uploadType", file.type);
    clientApi
      .post(
        `${process.env.NEXT_PUBLIC_API}${apiVersion}/files/upload`,
        formData,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      )
      .then((res: any) => {
        addFolderItem(res.data);
        console.log(res.data, "aresda");
        alertify.success("Uploaded successfully");
      })
      .catch((err) => {
        if (err.status === "200") {
          alertify.success("Uploaded successfully");
        }
        alertify.success("upload failed");
      });
  };

  const deleteFolderItem = (item: any) => {
    setDeleting(true);
    classroomService.deleteFolderItem(id, item._id).then((da) => {
      classroomService
        .getFilesByClassroom(id)
        .then((res: any) => {
          setAllFiles(res);
          setFiles(res);
          setDeleting(false);
        })
        .catch((err) => {
          setFiles([]);
        });
    });
  };

  return (
    <>
      {defaultView ? (
        <div className="rounded-boxes folder-board bg-white classFoldermainCls1">
          <div className="title px-0 mb-3">
            <div className="row">
              <div className="col-6 col-sm">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">My Folder and Files</h3>
                </div>
              </div>

              <div className="col-sm-auto col-12">
                <div className="d-flex align-items-center">
                  {firstLoad && (
                    <div className="flex-grow-1">
                      <form
                        onClick={(e) => e.preventDefault()}
                        className="common_search-type-1 form-half mw-100"
                      >
                        <input
                          type="text"
                          className="form-control border-0 my-0"
                          maxLength="50"
                          value={searchText}
                          onChange={(e) => search(e.target.value)}
                          placeholder="Search"
                        />
                        <span className="m-0 w-auto h-auto">
                          <figure className="m-0 w-auto">
                            <img
                              className="search-1Fldr-remove m-0 h-auto mw-100"
                              src="/assets/images/search-icon-2.png"
                              alt=""
                            />
                          </figure>
                        </span>
                      </form>
                    </div>
                  )}
                  {user.role !== "student" && (
                    <div className="ml-2">
                      <button
                        onClick={() => docUploader.current.click()}
                        className="btn btn-primary btn-sm"
                      >
                        Add File
                      </button>
                    </div>
                  )}
                  <input
                    hidden
                    type="file"
                    accept="text/plain, .doc, .docx, .xls, .xlsx, .ppt, .pptx, application/pdf, image/*"
                    ref={docUploader}
                    onChange={(f) => uploadItem(f)}
                  />
                  <div>
                    <a onClick={toggleView}>
                      <figure className="w-auto ml-2">
                        <img
                          src="/assets/images/ic_baseline-view-list.png"
                          alt=""
                        />
                      </figure>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {files && files.length > 0 ? (
            <div className="folder-area clearfix">
              <div className="row">
                {files.map((item) => (
                  <div key={item._id} className="col-lg-4 col-md-6">
                    <div className="folder form-row align-items-center mb-3">
                      <div className="col">
                        <a
                          onClick={() => redirectToFile(item)}
                          className="text-ellipsis"
                        >
                          <span className="ml-2">{item?.originalName}</span>
                        </a>
                        {(user.role === "admin" ||
                          item.ownerId?._id === user._id) && (
                          <span
                            className="col-auto ml-auto cursor-pointer new-button-clo"
                            onClick={() => deleteFolderItem(item)}
                          >
                            <figure className="w-auto">
                              <img
                                className="crossForDeltFile1-remove"
                                src="/assets/images/close.png"
                                alt=""
                              />
                            </figure>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {uploading && (
                <div>
                  Uploading...<i className="fa fa-pulse fa-spinner"></i>
                </div>
              )}
              {deleting && (
                <div>
                  Deleting...<i className="fa fa-pulse fa-spinner"></i>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-data addNoDataFullpageImgs">
              {uploading ? (
                <div>
                  Uploading...<i className="fa fa-pulse fa-spinner"></i>
                </div>
              ) : (
                <>
                  <figure>
                    <img
                      src="/assets/images/teacherEmptyFolder.svg"
                      alt="Not Found"
                    />
                  </figure>
                  <h3>Nothing added Yet</h3>
                  <p>Add some content here to start!</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-boxes folder-board bg-white classFoldermainCls1">
          <div className="title px-0 mb-3">
            <div className="row">
              <div className="col-6 col-sm">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">My Folder and Files</h3>
                </div>
              </div>

              <div className="col-sm-auto col-12">
                <div className="d-flex align-items-center">
                  {firstLoad && (
                    <div className="flex-grow-1">
                      <form
                        onClick={(e) => e.preventDefault()}
                        className="common_search-type-1 form-half mw-100"
                      >
                        <input
                          type="text"
                          className="form-control border-0"
                          maxLength="50"
                          value={searchText}
                          onChange={(e) => search(e.target.value)}
                          placeholder="Search"
                        />
                        <span className="m-0 w-auto h-auto">
                          <figure className="m-0 w-auto">
                            <img
                              className="search-1Fldr-remove m-0 h-auto mw-100"
                              src="/assets/images/search-icon-2.png"
                              alt=""
                            />
                          </figure>
                        </span>
                      </form>
                    </div>
                  )}
                  {user.role !== "student" && (
                    <div className="ml-2">
                      <button
                        onClick={() => docUploader.current.click()}
                        className="btn btn-primary btn-sm"
                      >
                        Add File
                      </button>
                    </div>
                  )}

                  <input
                    hidden
                    type="file"
                    accept="text/plain, .doc, .docx, .xls, .xlsx, .ppt, .pptx, application/pdf, image/*"
                    ref={docUploader}
                    onChange={(f) => uploadItem(f)}
                  />
                  <div>
                    <a onClick={toggleView}>
                      <figure className="w-auto ml-2">
                        <img
                          src="/assets/images/ic_baseline-view-list.png"
                          alt=""
                        />
                      </figure>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {files && files.length > 0 ? (
            <div className="folder-area clearfix">
              <div className="table-wrap table-responsive">
                <table className="table vertical-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0">Owner</th>
                      <th className="border-0">Published Date</th>
                      <th className="border-0">File Size</th>
                    </tr>
                  </thead>

                  <tbody>
                    {files.map((item) => (
                      <tr key={item._id}>
                        <td className="px-0">
                          <div className="folder mb-0 p-0">
                            <a
                              className="p-0 border-0"
                              onClick={() => redirectToFile(item)}
                            >
                              <span>{item?.originalName}</span>
                            </a>
                          </div>
                        </td>
                        <td>{item?.ownerId?.name}</td>
                        <td>
                          {new Date(item?.updatedAt).toLocaleDateString()}
                        </td>
                        <td>{(item?.size / 1024).toFixed(0)} MB</td>
                        {(user.role === "admin" ||
                          item.ownerId?._id === user._id) && (
                          <td>
                            <a
                              className="col-auto ml-auto cursor-pointer"
                              onClick={() => deleteFolderItem(item)}
                            >
                              <figure className="w-auto">
                                <img
                                  className="crossForDeltFile1-remove"
                                  src="/assets/images/close.png"
                                  alt=""
                                />
                              </figure>
                            </a>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-data addNoDataFullpageImgs">
              <figure>
                <img
                  src="/assets/images/teacherEmptyFolder.svg"
                  alt="Not Found"
                />
              </figure>
              <h3>Nothing added Yet</h3>
              <p>Add some content here to start!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default ClassroomFolder;
