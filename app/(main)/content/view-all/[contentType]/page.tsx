"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import Link from "next/link";
import axios, { Axios } from "axios";
import alertify, { alert, success } from "alertifyjs";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";
import { Tag } from "rsuite";
import LoadingOverlay from "react-loading-overlay-ts";
import "../spinner.css";

interface ContentItem {
  _id: string;
  filePicker: any;
  contentType: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  imageUrl?: string;
  local?: boolean;
  invalidUrl?: boolean;
  embededLink?: string;
  lastModifiedBy?: {
    name: string;
  };
  updatedAt?: string;
}

const ContentViewAll = () => {
  const { contentType } = useParams();
  const id = useSearchParams().get("id");
  const [courses, setCourses] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [touched, setTouched] = useState({ title: false });
  const [urlValid, setUrlValid] = useState<boolean>(true);
  const [params, setParams] = useState<any>({
    limit: 30,
    page: 1,
    title: "",
  });
  const [searchParams, setSearchParams] = useState<any>({
    limit: 30,
    page: 1,
    title: "",
  });
  const [keyword, setKeyword] = useState<string>("")
  const [videoContents, setVideoContents] = useState<ContentItem[]>([]);
  const [ebookContents, setEbookContents] = useState<ContentItem[]>([]);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [ebookCount, setEbookCount] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [content, setContent] = useState({
    _id: "",
    contentType: "video",
    url: "",
    preview: null,
    title: "",
    summary: "",
    tags: [],
  });
  const [fileURL, setFileURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<boolean>(true);
  
  useEffect(() => {
    const getVideoContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "video",
          })}`
        );
        const sortedVideos = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        const processedVideos = sortedVideos.map((video: any) => ({
          ...video,
          embededLink: embedVideo(video.url),
          invalidUrl: !isValidUrl(video.url),
        }));
        setVideoContents(processedVideos);
      } catch (error) {
        console.error("Error fetching video contents:", error);
      }
    };
    const getEbookContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "ebook",
          })}`
        );
        const sortedEbooks = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setEbookContents(sortedEbooks);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };
    const getEbookCount = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents/count${toQueryString({
            type: "ebook",
          })}`
        );
        setEbookCount(data);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };
    const getVideoCount = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents/count${toQueryString({
            type: "video",
          })}`
        );
        setVideoCount(data);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };
    

    getVideoContents();
    getEbookContents();
    getEbookCount();
    getVideoCount();
  }, []);

  const editContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoaded(false);
    if (event.currentTarget.checkValidity()) {
      try {
        const formData = new FormData(event.currentTarget);
        if (file) {
          formData.append("file", file, file.name);
        } else {
          formData.append("url", content.url);
        }
        formData.append("title", content.title);
        formData.append("summary", content.summary || "");
        formData.append("contentType", content.contentType);
        formData.append(
          "tags",
          content.tags ? content.tags.map((t) => t).join(",") : ""
        );

        const response = await axios.put(
          `/api/contents/${content._id}`,
          formData
        );

        setContent({
          _id: "",
          contentType: "video",
          url: "",
          preview:null,
          title: "",
          summary: "",
          tags: [],
        });
        setFile(null);
        loadContent();
        alertify.success("Content updated successfully");
      } catch (error) {
        console.error("Error updating content:", error);
        alertify.alert("Failure", "Failed to update content");
      }finally {
        handleCloseModal();
        setLoaded(true);
      }
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if(newTags.length === 1){
      newTags = newTags[0].split(",")
    }
    setContent({
      ...content,
      tags: newTags,
    });
    setTags(newTags);
  };

  const search = (searchTxt: string) => {
    // Search functionality
    setKeyword(searchTxt);
   
    let param = { ...params, page: 1 };
    setParams(param);
    setSearchParams({
      ...param,
      limit: 15,
      title: searchTxt
    })
    loadData();
  };

  const removeContent = async (contentId: string) => {
    // Handle content removal
    try {
      alertify.confirm("Message","Do you want to delete this content?", async () => {
        await axios.delete(`/api/contents/${contentId}`);
        loadContent();
        alertify.success("Content deleted successfully");
    }, () => {})
    } catch (error) {
      console.error("Error deleting content:", error);
      alertify.alert("Failure","Failed to delete content");
    }
  };

  const loadData = async () => {
    // Load video and e-book contents
    const getVideoContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "video",
            ...searchParams
          })}`
        );
        const sortedVideos = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        const processedVideos = sortedVideos.map((video: any) => ({
          ...video,
          embededLink: embedVideo(video.url),
          invalidUrl: !isValidUrl(video.url),
        }));
        setVideoContents(processedVideos);
      } catch (error) {
        console.error("Error fetching video contents:", error);
      }
    };
    const getEbookContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "ebook",
            ...searchParams
          })}`
        );
        const sortedEbooks = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setEbookContents(sortedEbooks);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };

    const getEbookCount = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents/count${toQueryString({
            type: "ebook",
            ...searchParams
          })}`
        );
        setEbookCount(data);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };
    const getVideoCount = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents/count${toQueryString({
            type: "video",
            ...searchParams
          })}`
        );
        setVideoCount(data);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };

    getVideoContents();
    getEbookContents();
    getEbookCount();
    getVideoCount();
  };

  const embedVideo = (url: any) => {
    // Embed video URL
    const regExp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;

    if (regExp.test(url)) {
      const videoId = url.match(/[?&]v=([^&]+)/)?.[1] || url.split('/').pop();
  
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  };

  const isValidUrl = (url: string): boolean => {
    // Check if the provided URL is valid
    // Implement URL validation logic here
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Check if the URL matches the pattern
    return urlRegex.test(url);
  };

  const copyLink = (item: ContentItem) => {
    // Copy content link to clipboard
    navigator.clipboard.writeText(item.url);
    alertify.success("Link copied to clipboard");
  };

  const viewContent = (data: ContentItem) => {
    // Handle content view
    if (data.contentType === "ebook") {
      window.open(data.url, "_blank");
    }
  };

  const validateForm = () => {
    return (content.url !== "" && content.title !== "");
  };

  const loadMore = async () => {
    setParams((p: any) => ({ ...p, page: p.page + 1 }));
    setLoading(true);
    if (contentType == "video") {
      const { data } = await clientApi.get(
        `/api/contents${toQueryString({
          ...params,
          contentType: "video"
        })}`
      );
      const sortedVideos = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      const processedVideos = sortedVideos.map((video: any) => ({
          ...video,
          embededLink: embedVideo(video.url),
          invalidUrl: !isValidUrl(video.url),
      }));
      setVideoContents(processedVideos);
      setLoading(false);
    } else if (contentType == "ebook") {
      const { data } = await clientApi.get(
        `/api/contents${toQueryString({
          ...params,
          contentType: "ebook"
        })}`
      );
      const sortedEbooks = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setEbookContents(sortedEbooks);
      setLoading(false);
    }
  };

  const handleTagsDisplay = (tags: string[]) => {
    let displayArray = [];
    if(tags.length === 1){
     const tagsArray = tags[0].split(",");
     const len = tagsArray.length;
     let counter = 0;
     for(let i=0; i < len; i++){
       counter += tagsArray[i].length;
       if(counter > 15){
         if(i===0){
           displayArray.push(tagsArray[i]);
           displayArray.push(`+${len-i-1}`);
         }else{
           displayArray.push(`+${len-i}`);
         }
         break;
       }else{
         displayArray.push(tagsArray[i]);
       }
     }
    }else{
       const tagsArray = tags;
       const len = tagsArray.length;
       let counter = 0;
       for(let i=0; i < len; i++){
         counter += tagsArray[i].length;
         if(counter > 15){
           if(i===0){
             displayArray.push(tagsArray[i]);
             displayArray.push(`+${len-i-1}`);
           }else{
             displayArray.push(`+${len-i}`);
           }
           break;
         }else{
           displayArray.push(tagsArray[i]);
         }
       }
    }
 
    return(
     displayArray.map((tag: string, index: number) => <Tag key={index}>{tag.trim()}</Tag>)
    );
   };

  const cancel = () => {
    // Cancel and close modal
    setShowModal(false);
    setFile(null);
    setTouched({ title: false });
  };

  const loadContent = async (empty?: string) => {
    const getVideoContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "video",
          })}`
        );
        const sortedVideos = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        const processedVideos = sortedVideos.map((video: any) => ({
          ...video,
          embededLink: embedVideo(video.url),
          invalidUrl: !isValidUrl(video.url),
        }));
        setVideoContents(processedVideos);
      } catch (error) {
        console.error("Error fetching video contents:", error);
      }
    };
    const getEbookContents = async () => {
      try {
        const { data } = await clientApi.get(
          `/api/contents${toQueryString({
            limit: 15,
            type: "ebook",
          })}`
        );
        const sortedEbooks = data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setEbookContents(sortedEbooks);
      } catch (error) {
        console.error("Error fetching ebook contents:", error);
      }
    };

    getVideoContents();
    getEbookContents();
  };

  const clearSearch = () => {
    setParams((prevParams: any) => ({ ...prevParams, title: "" }));
    setKeyword("");
    loadContent();
  };

  const editModal = (data: ContentItem[]) => {
    // Open modal for editing content
    setModalType("editContent");
    setShowModal(true);
    setContent(data);
  };

  const handleCloseModal = () => {
    setContent({
      _id: "",
      contentType: "video",
      url: "",
      preview: null,
      title: "",
      summary: "",
      tags: [],
    });
    setTags([]);
    setFile(null);
    setTouched({ title: false });
    setShowModal(false);
  };

  return (
    <LoadingOverlay
        active={!loaded}
        spinner
        styles={{
          overlay: (base) => ({
            ...base,
            height: "100vh",
          }),
        }}
    >
        <main className="content-library pt-3">
        <div className="container">
            <div className="dashboard-area classNameroom mx-auto">
                {/*Start Dashboard area*/}
                <div>
                    <div>
                        <div className="rounded-boxes bg-white">
                            <div className="row mb-3">
                                <div className="col-lg-6">
                                    <div className="breadcrumbs_area">
                                        <div className="breadcrumbs_new">
                                            <h2 className="text-capitalize">
                                              <Link href="/content">Content Library</Link> / <span>{contentType}</span></h2>
                                        </div>
                                    </div>

                                </div>
                            
                                <div className="col-lg-6">
                                    <div className="search-form-wrap d-block">
                                        <div className="content-library-view clearfix">
                                            <div className="search-form m-0 w-100">
                                                <form className="common_search-type-1 form-half ml-auto">
                                                  <div className="form-group mb-0" style={{height: 40}}>
                                                    <input 
                                                      type="text" 
                                                      name="search"
                                                      className="form-control"
                                                      value={keyword}
                                                      onChange={(e) => search(e.target.value)}
                                                      placeholder="Search..."
                                                    />
                                                    {keyword.length > 0 && (
                                                        <button
                                                        type="button"
                                                        className="btn p-0"
                                                        onClick={clearSearch}
                                                        >
                                                          <figure>
                                                            <img src="/assets/images/close3.png" alt="" />
                                                          </figure>
                                                        </button>
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
                                                  </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="main-area mx-auto mw-100">
                                {/*start main area*/}
                                
                                    <div className="box-area box-area_new">
                                        <div className="row">
                                            {contentType === "video" && videoContents.map((item: ContentItem, index: number) => (
                                              <div
                                                className="col-lg-3 col-md-4 col-sm-6 box-item-remove mb-3"
                                                style={{ width: 255 }}
                                                key={item._id}
                                              >
                                                <div className="box box_new bg-white pt-0 overflow-hidden">
                                                  <div
                                                    className="content-video cursor-pointer"
                                                    onClick={() => viewContent(item)}
                                                  >
                                                    {item.contentType === "video" && item.local && (
                                                      <video className="w-100" height="180" controls>
                                                        <source src={item.url} />
                                                      </video>
                                                    )}
                                                    {item.contentType === "video" &&
                                                      !item.local &&
                                                      !item.invalidUrl && (
                                                        <iframe
                                                          className="w-100"
                                                          height="180"
                                                          src={item.embededLink}
                                                          allowFullScreen
                                                        ></iframe>
                                                      )}
                                                    {item.contentType === "video" &&
                                                      !item.local &&
                                                      item.invalidUrl && (
                                                        <figure>
                                                          <img
                                                            src="assets/images/video-img.png"
                                                            alt="invalid url"
                                                            className="object-cover"
                                                          />
                                                        </figure>
                                                      )}
                                                  </div>
                                                  <div className="box-inner box-inner_new has-shdow position-relative">
                                                    <div className="info p-0 m-0">
                                                      <h5
                                                        className="width_dropdownminus cursor-pointer text-ellipsis"
                                                        data-toggle="tooltip"
                                                        data-placement="top"
                                                        title={item.title}
                                                        onClick={() => viewContent(item)}
                                                      >
                                                        {item.title}
                                                      </h5>
                                                      <div className="subject-name">
                                                        <p className="text-truncate">
                                                          {item.lastModifiedBy?.name}
                                                        </p>
                                                        <p className="text-truncate">
                                                          {item.updatedAt && moment(item.updatedAt).fromNow()}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="dropdown-edit-delete top-10">
                                                      <div className="dropdown">
                                                        <a
                                                          role="button"
                                                          id="dropdown-profile-box-btn"
                                                          data-toggle="dropdown"
                                                          aria-haspopup="true"
                                                          aria-expanded="false"
                                                        >
                                                          <span className="material-icons">
                                                            more_vert
                                                          </span>
                                                        </a>
                                                        <ul
                                                          className="dropdown-menu dropdown-menu-right py-0 border-0"
                                                          aria-labelledby="dropdown-profile-box-btn"
                                                        >
                                                          <li>
                                                            <a onClick={() => editModal(item)}>
                                                              <i className="fas fa-edit ml-1 mr-2"></i>
                                                              Edit
                                                            </a>
                                                          </li>
                                                          <li>
                                                            <a onClick={() => removeContent(item._id)}>
                                                              <i className="fas fa-trash ml-1 mr-2"></i>
                                                              Delete
                                                            </a>
                                                          </li>
                                                          <li>
                                                            <a onClick={() => copyLink(item)}>
                                                              <i className="fas fa-link ml-1 mr-2"></i>
                                                              Copy Link
                                                            </a>
                                                          </li>
                                                        </ul>
                                                      </div>
                                                    </div>
                                                    {handleTagsDisplay(item.tags)}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                            {contentType === "ebook" && ebookContents.map((item: ContentItem, index: number) => (
                                                <div
                                                  className="col-lg-3 col-md-4 col-sm-6 box-item-remove mb-3"
                                                  style={{ width: 255 }}
                                                  key={item._id}
                                                >
                                                  <div className="box box_new bg-white pt-0 overflow-hidden">
                                                    <div
                                                      className="content-video cursor-pointer"
                                                      onClick={() => viewContent(item)}
                                                    >
                                                      {item.contentType === "ebook" && (
                                                          <figure>
                                                            <img
                                                              src="assets/images/ebook.png"
                                                              alt=""
                                                              className="object-cover"
                                                            />
                                                          </figure>
                                                        )}
                                                    </div>
                                                    <div className="box-inner box-inner_new has-shdow position-relative">
                                                      <div className="info p-0 m-0">
                                                        <h5
                                                          className="width_dropdownminus cursor-pointer text-ellipsis"
                                                          data-toggle="tooltip"
                                                          data-placement="top"
                                                          title={item.title}
                                                          onClick={() => viewContent(item)}
                                                        >
                                                          {item.title}
                                                        </h5>
                                                        <div className="subject-name">
                                                          <p className="text-truncate">
                                                            {item.lastModifiedBy?.name}
                                                          </p>
                                                          <p className="text-truncate">
                                                            {item.updatedAt && moment(item.updatedAt).fromNow()}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <div className="dropdown-edit-delete top-10">
                                                        <div className="dropdown">
                                                          <a
                                                            role="button"
                                                            id="dropdown-profile-box-btn"
                                                            data-toggle="dropdown"
                                                            aria-haspopup="true"
                                                            aria-expanded="false"
                                                          >
                                                            <span className="material-icons">
                                                              more_vert
                                                            </span>
                                                          </a>
                                                          <ul
                                                            className="dropdown-menu dropdown-menu-right py-0 border-0"
                                                            aria-labelledby="dropdown-profile-box-btn"
                                                          >
                                                            <li>
                                                              <a onClick={() => editModal(item)}>
                                                                <i className="fas fa-edit ml-1 mr-2"></i>
                                                                Edit
                                                              </a>
                                                            </li>
                                                            <li>
                                                              <a onClick={() => removeContent(item._id)}>
                                                                <i className="fas fa-trash ml-1 mr-2"></i>
                                                                Delete
                                                              </a>
                                                            </li>
                                                            <li>
                                                              <a onClick={() => copyLink(item)}>
                                                                <i className="fas fa-link ml-1 mr-2"></i>
                                                                Copy Link
                                                              </a>
                                                            </li>
                                                          </ul>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                        </div>
                                    </div>
                                
                              </div>
                            <div className="text-center">
                                {contentType === "video" && videoCount > 30 && (
                                  <button
                                  type="button"
                                  className="btn btn-light" 
                                  onClick={loadMore}
                                  >
                                    Load More
                                  </button>
                                )}
                                {contentType === "ebook" && ebookCount > 30 && (
                                  <button
                                  type="button"
                                  className="btn btn-light" 
                                  onClick={loadMore}
                                  >
                                    Load More
                                  </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*end dashboard here*/}
          </div>

          {/* Edit Content Modal */}
          <Modal show={showModal && modalType === "editContent"} onHide={handleCloseModal}>
             <LoadingOverlay
                active={!loaded}
                spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
                styles={{
                  overlay: (base) => ({
                    ...base,
                    height: "100%",
                  }),
                }}
              >
                <Modal.Header closeButton>
                  <Modal.Title
                    className="col-12 text-center"
                    style={{
                      fontSize: "16px",
                      lineHeight: "18px",
                      textTransform: "capitalize",
                      color: "black",
                    }}
                  >
                    <h5>Edit Content</h5>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <form onSubmit={editContent}>
                    <h6 className="form-box_subtitle mb-0">Link</h6>
                    <input
                      type="text"
                      name="url"
                      value={file ? fileURL : content.url}
                      onChange={(e) => setContent({ ...content, url: e.target.value })}
                      placeholder="Enter URL"
                      required
                      className={`form-control form-control-sm ${
                        content.url && !urlValid ? "is-invalid" : ""
                      }`}
                      style={{ outline: 0, border: 0, paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 0, height: 18}}
                    />
                    {/* Handle URL validation and error messages */}
                    <hr style={{ marginTop: 1, marginBottom: 5 }} />

                    {!urlValid && (
                      <div>
                        <p className="label label-danger text-danger">
                          {content.url ? "Invalid URL" : "URL is required"}
                        </p>
                      </div>
                    )}
                    {/* Title input */}
                    <h6 className="form-box_subtitle mb-0">Title</h6>
                    <input
                      type="text"
                      name="title"
                      value={content.title}
                      onChange={(e) =>
                        setContent({ ...content, title: e.target.value })
                      }
                      placeholder="Enter Title"
                      maxLength={100}
                      required
                      className={`form-control form-control-sm ${
                        content.title.length > 100 ? "is-invalid" : ""
                      }`}
                      style={{ outline: 0, border: 0, paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 0, height: 18}}
                    />
                    {/* Handle title validation and error messages */}
                    <hr style={{ marginTop: 1, marginBottom: 5 }} />
                    <div>
                      {!content.title && touched.title && (
                        <p className="label label-danger text-danger">
                          Title is required
                        </p>
                      )}
                      {content.title.length > 100 && (
                        <p className="label label-danger text-danger">
                          Title must be smaller than 100 characters.
                        </p>
                      )}
                    </div>
                    {/* Summary input */}
                    <h6 className="form-box_subtitle mb-0">Summary</h6>
                    <input
                      type="text"
                      name="summary"
                      value={content.summary}
                      onChange={(e) =>
                        setContent({ ...content, summary: e.target.value })
                      }
                      placeholder="Enter Summary"
                      className="form-control form-control-sm"
                      style={{ outline: 0, border: 0, paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 0, height: 18}}
                    />
                    <hr style={{ marginTop: 1, marginBottom: 5 }} />

                    {/* Tags input (if using a separate component/library) */}
                    <div className="class-board-info">
                      <h6 className="form-box_subtitle mb-0">Tags</h6>
                      <TagsInput
                        value={content.tags}
                        onChange={handleTagsChange}
                        placeHolder="Enter a new tag"
                        separators={[" ", ","]}
                      />
                      <hr style={{ marginTop: 1, marginBottom: 5 }} />
                    </div>
                    {/* ContentType radio buttons */}
                    {/* Buttons for cancel and save */}
                    <div className="mt-2 d-flex align-items-center justify-content-between">
                      <div>
                        <div className="row container1 m-0 mr-2">
                          <div className="d-flex align-items-center radio w-auto">
                            <input
                              type="radio"
                              value="video"
                              checked={content.contentType === "video"}
                              onChange={() =>
                                setContent({ ...content, contentType: "video" })
                              }
                              name="contentType"
                              id="video"
                            />
                            <label htmlFor="video" className="my-0"></label>
                            <span className="pl-4">Video</span>
                          </div>
                        </div>
                        <div className="row container1 m-0 mr-2">
                          <div className="d-flex align-items-center radio w-auto">
                            <input
                              type="radio"
                              value="ebook"
                              checked={content.contentType === "ebook"}
                              onChange={() =>
                                setContent({ ...content, contentType: "ebook" })
                              }
                              name="contentType"
                              id="ebook"
                            />
                            <label htmlFor="ebook" className="my-0"></label>
                            <span className="pl-4">eBook</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn btn-light"
                          type="button"
                          onClick={handleCloseModal}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary ml-2"
                          type="submit"
                          disabled={!validateForm()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </Modal.Body>
              </LoadingOverlay>
          </Modal>
       </main>
    </LoadingOverlay>
  );
};

export default ContentViewAll;
