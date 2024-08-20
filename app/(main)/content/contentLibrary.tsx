"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import axios, { Axios } from "axios";
import alertify, { alert, success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import CustomCarousel from "@/components/assessment/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";
import { FileUploader } from "react-drag-drop-files";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { Tag } from "rsuite";
import PImageComponent from "@/components/AppImage";
import { arrayToString } from "@/lib/pipe";
import { useRouter } from "next/navigation";
import ItemPrice from "@/components/ItemPrice";
import moment from "moment";
import { blob } from "aws-sdk/clients/codecommit";
import "./tags.css";
import LoadingOverlay from "react-loading-overlay-ts";


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

const ContentLibrary = () => {
  const [videoContents, setVideoContents] = useState<ContentItem[]>([]);
  const [searchParams, setSearchParams] = useState<any>({
    limit: 8,
    page: 1,
    title: "",
  });
  const [user, setUser] = useState<any>(useSession()?.data?.user?.info || {});
  const fileBrowseRef = useRef(null);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 15,
    checkSession: false,
    home: true,
    searchText: "",
    title: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [touched, setTouched] = useState({ title: false });
  const [urlValid, setUrlValid] = useState<boolean>(true);
  const [keyWord, setKeyword]: any = useState("");
  const [modalType, setModalType] = useState("");
  const [preview, setPreview] = useState({
    type: "",
    title: "",
    imageUrl: "",
    url: "",
    description: "",
  });
  const [content, setContent] = useState({
    _id: "",
    contentType: "video",
    url: "",
    preview: null,
    title: "",
    summary: "",
    tags: [],
  });

  const [tags, setTags] = useState<string[]>([]);
  const [ebookContents, setEbookContents] = useState<ContentItem[]>([]);
  const fileTypes = ["JPEG", "PNG", "GIF", "DOC", "DOCX", "PDF", "MP4"];
  const [fileURL, setFileURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(true);

  useEffect(() => {
    // Fetch data and initialize component
    setLoading(true);
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
    setLoading(false);
  }, []);

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
        setLoading(false);
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

    getVideoContents();
    getEbookContents();
  };

  const handleShowModal = () => {
    setShowModal(true);
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
    setPreview({
      type: "",
      title: "",
      imageUrl: "",
      url: "",
      description: "",
    });
    setTouched({ title: false });
    setShowModal(false);
  };
  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const addExternalContent = () => {
    // Call the addExternalContent function here
    // For example:
    setModalType("addContent");
    setShowModal(true);
  };
 
  const uploadContent = () => {
    setFile(null);
    setModalType("uploadContent");
    setShowModal(true);
  };

  const validateForm = () => {
    return (content.url !== "" && content.title !== "");
  };
  const validateUploadForm = () => {
    return (file !== null && content.title !== "");
  };

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setContent({
      ...content,
      [name]: value,
    });
    validateUrl(value);
  };
  const handleChangeText = (event: any) => {
    const { name, value } = event.target;
    setContent({
      ...content,
      [name]: value,
    });
  };

  const handleBlur = (e: any) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handlePaste = (event: any) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    setContent({
      ...content,
      url: pastedText,
    });
    validateUrl(pastedText);
  };

  const validateUrl = (url: any) => {
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    //const isValid = urlPattern.test(url);
    setUrlValid(urlPattern.test(url));
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
      limit: 12,
      title: searchTxt
    })
    loadData();
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

  const viewContent = (data: ContentItem) => {
    // Handle content view
    if (data.contentType === "ebook") {
      window.open(data.url, "_blank");
    }
  };

  const byPassSecurity = (data: any) => {
    // Handle content security and embed links
    if (data.contentType === "video") {
      // ...
      data.url ? validateUrl(data.url): validateUrl(fileURL);
      embedVideo(data.url);
    } else if (data.contentType === "ebook") {
      data.url ? validateUrl(data.url): validateUrl(fileURL);
    }
    return data;
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

  {/*const getElearningFullPath = (baseUrl: string, filePath: string) => {
    // Get full path for e-learning content
    return `${baseUrl}/${filePath}`;
  };*/}

  const addContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoaded(false);
    if (event.currentTarget.checkValidity()) {
      try {
        let formData: FormData = new FormData(event.currentTarget);
        if (file) {
          formData.append("file", file, file.name);
          formData.append("url", fileURL);
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

        const response = await axios.post("/api/contents", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newContent = response.data;
        

        setContent({
          _id: "",
          contentType: "video",
          url: "",
          preview: null,
          title: "",
          summary: "",
          tags: [],
        });
        setTouched({ title: false });
        setFile(null);
        setPreview({
          type: "",
          title: "",
          imageUrl: "",
          url: "",
          description: "",
        });
        if (newContent.contentType === "ebook") {
          setEbookContents((prevContents) => [
            ...prevContents,
            byPassSecurity(newContent),
          ]);
        } else {
          setVideoContents((prevContents) => [
            ...prevContents,
            byPassSecurity(newContent),
          ]);
        }
        alertify.success("Content added successfully");
        loadContent();
      } catch (error) {
        console.error("Error adding content:", error);
        alertify.alert("Failure", "Failed to add content");
      } finally {
        handleCloseModal();
        setLoaded(true);
      }
    }
  };

  const onPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Handle URL paste event
    const string = e.clipboardData.getData("text/plain");
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const matches = string.match(urlRegex);

    if (matches && matches.length > 0) {
      const url = matches[matches.length - 1];
      const params = {
        _id: user?._id,
        url: url,
      };

      try {
        const query = toQueryString(params);
        const response = await clientApi.get(`/api/users/link-preview/${params._id}${query}`);
        const res = response.data;

        const data = {
          type: 'link',
          title: res.title,
          imageUrl: res.image,
          url: res.url,
          description: res.description,
        };

        setContent({
          ...content,
          title: res.title,
          url: res.url,
          summary: res.description,
          contentType: res.type === 'video' ? 'video' : 'ebook',
        });
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    }
  };

  const dropped = (files: File[]) => {
    // Handle dropped files
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const getType = (url: string) => {
    // Determine content type from URL
    const result = url.split(".");
    const type = result[result.length - 1];
    if (type === "doc" || type === "docx" || type === "pdf") {
      return "ebook";
    } else {
      return "video";
    }
  };

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
        setPreview({
          type: "",
          title: "",
          imageUrl: "",
          url: "",
          description: "",
        });
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

  const openModal = (type: string) => {
    // Open modal for adding or uploading content
    setModalType(type);
    setShowModal(true);
    setContent({
      _id: "",
      contentType: "video",
      url: "",
      preview: null,
      title: "",
      summary: "",
      tags: [],
    });
    setFile(null);
    setPreview({
      type: "",
      title: "",
      imageUrl: "",
      url: "",
      description: "",
    });
  };

  const editModal = (data: ContentItem[]) => {
    // Open modal for editing content
    setModalType("editContent");
    setShowModal(true);
    setContent(data);
  };

  const cancel = () => {
    // Cancel and close modal
    setShowModal(false);
    setFile(null);
    setTouched({ title: false });
  };

  const copyLink = (item: ContentItem) => {
    // Copy content link to clipboard
    navigator.clipboard.writeText(item.url);
    alertify.success("Link copied to clipboard");
  };
  const copyUploadLink = (url: string) => {
    // Copy content link to clipboard
    navigator.clipboard.writeText(url);
    alertify.success("Link copied to clipboard");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: dropped,
  });

  const isValidUrl = (url: string): boolean => {
    // Check if the provided URL is valid
    // Implement URL validation logic here
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Check if the URL matches the pattern
    return urlRegex.test(url);
  };

  const handleFileChange = (file: File) => {
    //console.log(file);
    setFile(file);
    setFileURL(URL.createObjectURL(file));
    setContent({ ...content, url: fileURL });
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
              <div className="dashboard-area classroom mx-auto">
                {/* Title and search section */}
                <div className="row align-items-center title p-0">
                  <div className="col-12 col-xl-4 col-lg-2 info">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Content Library</h3>
                    </div>
                  </div>

                  <div className="col-lg-10 col-xl-8 col-12">
                    <div className="d-flex gap-sm">
                      <div className="box-area box-area_new d-flex justify-content-end ">
                        <div className="ml-auto">
                          <a className="btn btn-primary" onClick={addExternalContent}>
                            Add External Content
                          </a>
                        </div>
                      </div>
                      <div className="box-area box-area_new d-flex justify-content-end ">
                        <div className="ml-auto">
                          <a className="btn btn-primary" onClick={uploadContent}>
                            Upload Content
                          </a>
                        </div>
                      </div>

                      <div className="flex-grow-1">
                        <form
                          className="w-100-xs common_search-type-1"
                        >
                        <div className="form-group assess-snap mb-0" style={{height: 40}}>
                          <input
                            type="text"
                            className="border-0 form-control"
                            maxLength={50}
                            placeholder="Search for Videos, PDF, Documents"
                            name="txtSearch"
                            value={keyWord}
                            onChange={(e) => search(e.target.value)}
                          />
                          <span>
                            <figure>
                              <img
                                src="/assets/images/search-icon-2.png"
                                alt=""
                              />
                            </figure>
                          </span>
                          {keyWord.length > 0 && (
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
                        </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Video section */}

                {videoContents && videoContents.length > 0 ? (
                  <div className="box-area box-area_new">
                    <div className="card-common products_withoutslider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">Videos</h1>
                              <p className="section_sub_heading">Available Videos</p>
                            </div>
                          </div>
                          {videoContents.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div className="d-none d-lg-block">
                                  <Button variant="outline" size="sm" >
                                    <Link href="/content/view-all/video" style={{color: "white"}}>View All</Link>
                                  </Button>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href="/content/view-all/video"><i className="fas fa-arrow-right"></i></Link>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="card-body-common">
                          <CustomCarousel items={videoContents.map((item: ContentItem, index: number) => (
                            <div
                              className="box-item-remove px-auto"
                              style={{ width: 255 }}
                              key={item._id}
                            >
                              <div className="box box_new bg-white pt-0 overflow-hidden">
                                <div
                                  className="content-video cursor-pointer"
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
                                  <div className="form-row">
                                    <div className="col">
                                    {handleTagsDisplay(item.tags)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {loading && (
                      <div className="mb-3">
                      <SkeletonLoaderComponent Cwidth={30} Cheight={40} />
                      <div className="mt-2">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={235} />
                      </div>
                    </div>
                    )}
                  </>
                )}

                {/* E-book section */}
                <div className="main-area mx-auto mw-100">
                  {ebookContents.length > 0 ? (
                    <div className="box-area box-area_new my-0">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">E-Books</h3>
                                <p className="section_sub_heading">
                                  PDF, word contents
                                </p>
                              </div>
                            </div>
                            {ebookContents.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div className="d-none d-lg-block">
                                  <Button variant="outline" size="sm">
                                    <Link href="/content/view-all/ebook" style={{color: "white"}}>View All</Link>
                                  </Button>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href="/content/view-all/ebook"><i className="fas fa-arrow-right"></i></Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                        <CustomCarousel items={ebookContents.map((item: ContentItem, index: number) => (
                            <div
                              className="box-item-remove px-auto"
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
                                          <a onClick={() => copyUploadLink(fileURL)}>
                                            <i className="fas fa-link ml-1 mr-2"></i>
                                            Copy Link
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  
                                  <div className="form-row">
                                    <div className="col">
                                    {handleTagsDisplay(item.tags)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                    {loading && (
                      <div className="mb-3">
                      <SkeletonLoaderComponent Cwidth={30} Cheight={40} />
                      <div className="mt-2">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={235} />
                      </div>
                    </div>
                    )}
                  </>
                  )}
                </div>
                
                {/* No content message */}
                {!videoContents.length && !ebookContents.length && (
                      <div>
                        <img
                          className="mx-auto"
                          src="/assets/images/teamContent.svg"
                          alt="No content"
                        />
                        <h1 className="text-center">No contents found</h1>
                      </div>
                )}
              </div>
            </div>

            {/* Add Content Modal */}
                <Modal
                  show={showModal && modalType === "addContent"}
                  onHide={handleCloseModal}
                >
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
                      <Modal.Header>
                        <Modal.Title
                          className="col-12 text-center"
                          style={{
                            fontSize: "16px",
                            lineHeight: "18px",
                            textTransform: "capitalize",
                            color: "black",
                          }}
                        >
                          <h5>Add External Content</h5>
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <form onSubmit={addContent}>
                          <h6 className="form-box_subtitle mb-0">Link</h6>
                          <input
                            type="text"
                            name="url"
                            value={content.url}
                            onChange={handleChange}
                            onPaste={onPaste}
                            placeholder="Enter URL"
                            maxLength={100}
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

                          {/* Preview section */}
                          {/* If you have a preview section, you can implement it here */}
                          {preview && (
                            <div className="class-board bg-white mb-0 pb-0">
                                <div className="class-board-info">
                                    <a>
                                        <div className="row mx-0">
                                            <div className="col-3 px-0">
                                                <figure>
                                                    <img src={preview.imageUrl} alt=""/>
                                                </figure>
                                            </div>

                                            <div className="col-9 pr-2">
                                                <div className="inner">
                                                    <div className="wrap">
                                                        <h4>{preview.title}</h4>
                                                        <p>{preview.description}</p>

                                                        <span>{preview.url}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                          )}

                          <h6 className="form-box_subtitle mb-0">Title</h6>
                          <input
                            type="text"
                            name="title"
                            value={content.title}
                            onChange={handleChangeText}
                            onBlur={handleBlur}
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

                          <h6 className="form-box_subtitle mb-0">Summary</h6>
                          <input
                            type="text"
                            name="summary"
                            value={content.summary}
                            onChange={handleChangeText}
                            placeholder="Enter Summary"
                            className="form-control form-control-sm"
                            style={{ outline: 0, border: 0, paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 0, height: 18}}
                          />
                          <hr style={{ marginTop: 1, marginBottom: 5 }} />

                          <h6 className="form-box_subtitle mb-0">Tags</h6>
                          
                          <TagsInput
                            value={tags}
                            onChange={handleTagsChange}
                            placeHolder="Enter a new tag"
                            separators={[" ", ","]}
                          />
                          <hr style={{ marginTop: 1, marginBottom: 5 }} />
                          {/* Implement your tags input component or field here */}

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
             

            {/* Upload Content Modal */}
            <Modal
              show={showModal && modalType === "uploadContent"}
              onHide={handleCloseModal}
            >
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
                  <Modal.Header>
                    <Modal.Title
                      className="col-12 text-center"
                      style={{
                        fontSize: "16px",
                        lineHeight: "18px",
                        textTransform: "capitalize",
                        color: "black",
                      }}
                    >
                      <h5>Upload Content</h5>
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <form onSubmit={addContent}>
                      <div
                        className={`standard-upload-box mt-2`}
                        style={{
                          height: 77,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileUploader
                          multiple={false}
                          handleChange={handleFileChange}
                          name="file"
                          types={fileTypes}
                          style={{ width: "100%", padding: 10 }}
                        >
                          <div className="" style={{ textAlign: "center" }}>
                            <div className="d-flex align-items-center justify-content-center"></div>
                            {file ? <p className="text-primary">{file.name}</p> : ""}
                            <span className="title">
                              <strong>
                                Drag and Drop or{" "}
                                <a
                                  onClick={filePicker}
                                  className="text-primary"
                                  style={{ color: "#007bff" }}
                                >
                                  browse
                                </a>{" "}
                                your files
                              </strong>
                            </span>
                          </div>
                        </FileUploader>
                      </div>

                      <h6 className="form-box_subtitle mb-0">Title</h6>
                      <input
                        type="text"
                        name="title"
                        value={content.title}
                        onChange={handleChangeText}
                        onBlur={handleBlur}
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

                      <h6 className="form-box_subtitle mb-0">Summary</h6>
                      <input
                        type="text"
                        name="summary"
                        value={content.summary}
                        onChange={handleChangeText}
                        placeholder="Enter Summary"
                        className="form-control form-control-sm"
                        style={{ outline: 0, border: 0, paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 0, height: 18}}
                      />
                      <hr style={{ marginTop: 1, marginBottom: 5 }} />

                      <h6 className="form-box_subtitle mb-0">Tags</h6>

                      <TagsInput
                        value={tags}
                        onChange={handleTagsChange}
                        placeHolder="Enter a new tag"
                        separators={[" ", ","]}
                      />

                      {/* Implement your tags input component or field here */}

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
                            disabled={!validateUploadForm()}
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </form>
                  </Modal.Body>
                </LoadingOverlay>
            </Modal>

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
                  {/* Preview of the link (if available) */}
                  {preview && (
                    <div className="class-board bg-white mb-0 pb-0">
                      {/* Display link preview */}
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

export default ContentLibrary;
