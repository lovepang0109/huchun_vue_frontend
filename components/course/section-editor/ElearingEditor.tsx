import React, { useEffect, useState } from "react";
import * as authService from "@/services/auth";
import { getSession } from "next-auth/react";
import { Modal } from "react-bootstrap";
import { confirm, alert } from "alertifyjs";
import { count, findAll } from "@/services/contentService";
import { getLinkPreview } from "@/services/auth";
import { embedVideo, getElearningFullPath } from "@/lib/helpers";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { TagsInput } from "react-tag-input-component";
import { toQueryString } from "@/lib/validator";
import clientApi from "@/lib/clientApi";
import VideoPlayer from "../video-player";
import ShowItemsWithcountComponent from "@/components/ShowItemWithcount";

const ElearningEditorComponent = ({
  settings,
  course,
  content,
  setContent,
  Save,
  Cancel,
}: any) => {
  const ckeOptions = {
    placeholder: "Write Description",
    simpleUpload: {
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  };

  const [edit, setEdit] = useState<boolean>(!content.isNew);
  const [preview, setPreview] = useState<any>([]);
  const [editingContent, setEditingContent] = useState<any>(content);
  const codemirrorConfig = {
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoRefresh: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-java",
  };
  const [contents, setContents] = useState<any>([]);
  const [searchContentText, setSearchContentText] = useState<string>("");
  const [contentCount, setContentCount] = useState<number>(0);
  const [params, setParams] = useState({
    page: 1,
    title: "",
    type: "video",
    limit: 8,
  });
  const [selectedContent, setSelectedContent] = useState<any>([]);
  const [contentlibraryModalShow, setContentLibraryModalShow] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<any>([]);
  const [selectedTag, setSelectedTag] = useState<any>([]);

  useEffect(() => {
    setEdit(!content.isNew);
    const tags: any = [];
    content.tags?.map((tag: any) => {
      tags.push(tag.value);
    });
    setSelectedTag(tags);
  }, []);

  useEffect(() => {
    const tagArray: any = [];
    if (selectedTag.length) {
      selectedTag.map((item: any) => {
        tagArray.push({ display: item, value: item });
      });
    }
    setEditingContent({
      ...editingContent,
      tags: tagArray,
    });
  }, [selectedTag]);

  useEffect(() => {
    console.log(editingContent, "This is updated editingCOntent");
  }, [editingContent]);

  const saveContent = () => {
    const contentData = content;

    for (const sec of course.sections) {
      for (const con of sec.contents) {
        if (
          (con.type == "video" || con.type == "ebook") &&
          con.url &&
          con.url == editingContent.url
        ) {
          confirm(
            "A content with the same url already exists. Are you sure to duplicate it?",
            () => {
              for (const k in editingContent) {
                contentData[k] = editingContent[k];
              }

              Save(contentData);
            }
          );
          return;
        }
      }
    }

    for (const k in editingContent) {
      contentData[k] = editingContent[k];
    }

    Save(contentData);
    setSelectedTag([]);
  };

  const openContentLibrary = (template: any) => {
    if (!editingContent.type || editingContent.type === "") {
      alert("Message", "Please select type");
      return;
    }
    setSearchContentText("");
    setSelectedContent(null);
    searchContent();
    setContentLibraryModalShow(true);
  };

  const closeModal = () => {
    setContentLibraryModalShow(false);
  };

  const searchContent = async () => {
    try {
      const session = await getSession();
      const paramsData = params;
      setContentCount(0);
      paramsData.page = 1;
      paramsData.title = searchContentText;
      paramsData.type = editingContent.type;
      setParams(paramsData);

      clientApi
        .get(
          `https://newapi.practiz.xyz/api/v1/contents/count${toQueryString(
            paramsData
          )}`,
          {
            headers: {
              instancekey: session?.instanceKey,
              Authorization: `bearer ${session?.accessToken}`,
            },
          }
        )
        .then((d: any) => {
          setContentCount(d.data);
        });

      clientApi
        .get(
          `https://newapi.practiz.xyz/api/v1/contents${toQueryString(
            paramsData
          )}`,
          {
            headers: {
              instancekey: session?.instanceKey,
              Authorization: `bearer ${session?.accessToken}`,
            },
          }
        )
        .then((contents: any) => {
          setContents(byPassSecurity(contents.data));
        });
    } catch {
      console.log("this is error");
    }
  };

  const loadMoreContent = async () => {
    const session = await getSession();
    const paramsData = params;
    paramsData.page++;
    setParams(paramsData);
    clientApi
      .get(
        `https://newapi.practiz.xyz/api/v1/contents${toQueryString(
          paramsData
        )}`,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      )
      .then((contents: any) => {
        setContents(contents.data.concat(byPassSecurity(contents.data)));
      });
  };

  const selectContent = () => {
    if (!selectedContent) {
      return;
    }

    setEditingContent({
      ...editingContent,
      url: selectedContent.url,
      title: selectedContent.title,
      summary: selectedContent.summary,
    });
    setContentLibraryModalShow(false);
  };

  const viewContent = (data: any) => {
    window.open(data.url, "_blank");
  };

  const byPassSecurity = (arr: any) => {
    let results = [];
    if (arr.length > 0) {
      results = arr.map((d: any) => {
        const data = d;
        if (data.contentType == "video") {
          if (data.url) {
            data.embededUrl = embedVideo(data.url);
          } else {
            data.local = true;
            data.url = getElearningFullPath(settings?.baseUrl, data.filePath);
            data.embededUrl = embedVideo(data.url);
          }
        } else if (data.contentType == "ebook") {
          if (data.filePath) {
            data.url = getElearningFullPath(settings?.baseUrl, data.filePath);
          }
        }

        return data;
      });
    }
    return results;
  };

  const onPaste = (e: any) => {
    const string = e.clipboardData.getData("text/plain");
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const matches: any = [];

    string.replace(urlRegex, function (url: any) {
      if (matches.indexOf(url) == -1) {
        matches.push(url);
      }
    });
    if (matches.length > 0) {
      getLinkPreview({
        _id: authService.userId,
        url: matches[matches.length - 1],
      }).then((res: any) => {
        const data = {
          type: "link",
          title: res.title,
          imageUrl: res.image,
          url: res.url,
          description: res.description,
        };
        setPreview(data);

        setEditingContent({
          ...editingContent,
          type: res.type === "video" ? "video" : "ebook",
          title: data.title,
          summary: data.description,
          provider: res.source,
          imageUrl: res.imageUrl,
        });
      });
    }
  };

  const onDataChange = () => {
    const contentData = content;
    for (const k in editingContent) {
      if (
        k != "hasChanges" &&
        !contentData[k] &&
        contentData[k] != editingContent[k]
      ) {
        setContent({
          ...content,
          hasChanges: true,
        });
        return;
      }
    }
    setContent({
      ...content,
      hasChanges: false,
    });
  };

  return (
    <>
      <div className="rounded-boxes bg-white">
        <div className="d-flex align-items-center mb-3">
          <h4 className="form-box_subtitle">Content Type:</h4>

          <div className="container1 my-0 ml-3">
            <div className="radio">
              <input
                type="radio"
                value="video"
                name="contentType"
                id="video"
                checked={editingContent?.type === "video"}
                onChange={(e: any) =>
                  setEditingContent({
                    ...editingContent,
                    type: e.target.value,
                  })
                }
                className="custom-control-input"
              />
              <label
                htmlFor="video"
                className="my-0 translate-middle-y"
              ></label>
            </div>
          </div>
          <div className="rights float-none mt-0">Video</div>

          <div className="container1 my-0 ml-3">
            <div className="radio">
              <input
                type="radio"
                value="ebook"
                name="contentType"
                id="ebook"
                checked={editingContent?.type === "ebook"}
                onChange={(e: any) =>
                  setEditingContent({
                    ...editingContent,
                    type: e.target.value,
                  })
                }
                className="custom-control-input"
              />
              <label
                htmlFor="ebook"
                className="my-0 translate-middle-y"
              ></label>
            </div>
          </div>
          <div className="rights float-none mt-0">eBook</div>
        </div>

        <div className="form-group">
          <div className="row">
            <div className="col">
              <h4 className="form-box_subtitle">Url</h4>
              <input
                className={`form-control border-left-0 border-right-0 border-top-0 border-bottom rounded-0 pl-0`}
                type="text"
                name="url"
                value={editingContent?.url}
                onChange={(e: any) => {
                  setEditingContent({
                    ...editingContent,
                    url: e.target.value,
                  });
                  onDataChange();
                }}
                placeholder="Enter URL"
                required
              />
            </div>
            <div className="col-auto d-flex align-items-center">
              <a className="btn btn-light" onClick={openContentLibrary}>
                Select from Library
              </a>
            </div>
          </div>
        </div>

        {preview?.imageUrl && (
          <>
            <figure>
              <img src={preview.imageUrl} alt="" />
            </figure>

            <div>
              <h4>{preview.title}</h4>
              <p>{preview.description} </p>

              <span>{preview.url}</span>
            </div>
          </>
        )}

        <div className="form-group">
          <h4 className="form-box_subtitle">Title</h4>
          <input
            className={`form-control border-left-0 border-right-0 border-top-0  border-bottom rounded-0 pl-0`}
            type="text"
            name="title"
            value={editingContent.title}
            onChange={(e: any) => {
              onDataChange();
              setEditingContent({
                ...editingContent,
                title: e.target.value,
              });
            }}
            placeholder="Enter Title"
            required
          />
        </div>

        <div className="form-group mt-3">
          <h4 className="form-box_subtitle mb-1">Summary (Optional)</h4>
          <CKEditorCustomized
            defaultValue={editingContent.summary}
            onChangeCon={(data: any) => {
              onDataChange();
              // setEditingContent({
              //   ...editingContent,
              //   summary: data,
              // });
            }}
            config={ckeOptions}
          />
        </div>

        <div className="form-group mt-3">
          <h4 className="form-box_subtitle mb-1">Tag (Optional)</h4>
          <TagsInput
            value={selectedTag}
            onChange={setSelectedTag}
            name="tag"
            placeHolder="enter tags"
          />
        </div>

        <div className="d-flex justify-content-end btn-area ml-auto mt-2">
          <button
            type="button"
            className="btn btn-light btn-sm ml-2"
            onClick={() => Cancel()}
          >
            Cancel
          </button>
          <button className="btn btn-primary ml-2 btn-sm" onClick={saveContent}>
            {edit ? "Save" : "Add Content"}
          </button>
        </div>
      </div>

      <Modal show={contentlibraryModalShow} backdrop="static" keyboard={false}>
        <div className="modal-body text-dark px-4">
          <div className="library-content">
            <div className="title mb-2">
              <div className="row">
                <div className="col-auto">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">Content Library</h3>
                  </div>
                </div>

                <div className="col">
                  <div className="d-flex justify-content-end align-items-center gap-xs">
                    <div className="common_search-type-1 form-half">
                      <input
                        type="text"
                        name="txtSearch"
                        className="form-control border-0"
                        placeholder="Search for content"
                        value={searchContentText}
                        onChange={(e) => setSearchContentText(e.target.value)}
                        onKeyDown={(e: any) => {
                          if (e.key === "Enter") {
                            searchContent;
                          }
                        }}
                      />
                      <span>
                        <figure>
                          <img src="/assets/images/search-icon-2.png" alt="" />
                        </figure>
                      </span>
                    </div>

                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setContentLibraryModalShow(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary btn-sm ml-2"
                      disabled={!selectedContent}
                      onClick={selectContent}
                    >
                      Add Content
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {contents.length > 0 && (
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div className="row">
                  {contents?.map((item: any, index: number) => (
                    <div className="col-3" key={index}>
                      <div className="content-item border rounded-1">
                        <div className="content-item-top">
                          {item.contentType === "ebook" && !item.imageUrl && (
                            <figure onClick={() => viewContent(item)}>
                              <img
                                className="w-100"
                                style={{ height: "122px" }}
                                src="/assets/images/ebook.png"
                                alt=""
                              />
                            </figure>
                          )}

                          {item.contentType === "ebook" && item.imageUrl && (
                            <figure onClick={() => viewContent(item)}>
                              <img
                                className="w-100"
                                style={{ height: "122px" }}
                                src={item?.imageUrl}
                                alt=""
                              />
                            </figure>
                          )}

                          {item.contentType === "video" && item.local && (
                            <VideoPlayer _link={item.embededUrl} _height={50} />
                          )}

                          {item.contentType === "video" && !item.local && (
                            <div className="content-item-iframe">
                              <iframe
                                className="w-100"
                                height="122"
                                src={item.embededUrl}
                              ></iframe>
                            </div>
                          )}

                          {item.contentType === "video" && !item.url && (
                            <figure>
                              <img
                                className="w-100"
                                style={{ height: "122px" }}
                                src="/assets/images/emptycontent.jpeg"
                                alt=""
                              />
                            </figure>
                          )}

                          <div className="content-item-radio">
                            <div className="radio">
                              <div className="custom-radio form-check">
                                <input
                                  className="custom-control-input"
                                  type="radio"
                                  value={item}
                                  name="enums"
                                  id={`enum_answer_${item._id}`}
                                  onChange={() =>
                                    setSelectedContent({ ...item })
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={`enum_answer_${item._id}`}
                                ></label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="box-inner box-inner_new"
                          style={{ minHeight: "50px", maxHeight: "50px" }}
                        >
                          <div className="head-title">
                            <h4 className="text-truncate mr-0 float-none">
                              {item.title}
                            </h4>
                          </div>
                          <ShowItemsWithcountComponent
                            arr={item.tags}
                            totalBoxLength={180}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {contentCount > contents.length && (
                  <div className="text-center" onClick={loadMoreContent}>
                    <a className="btn btn-light">Load More</a>
                  </div>
                )}
              </div>
            )}

            {!contents.length && (
              <div className="bg-white">
                <div className="empty-data course-search-empty">
                  <figure className="mx-auto">
                    <img src="/assets/images/Search-rafiki.png" alt="" />
                  </figure>

                  <h3 className="text-center">No contents found</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ElearningEditorComponent;
