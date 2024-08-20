import React, { useEffect, useState } from "react";
import { getContentById } from "@/services/contentService";
import { embedVideo, getElearningFullPath } from "@/lib/helpers";
import ContentRenderer from "../content-renderer";
import Mathjax from "@/components/assessment/mathjax";
import VideoPlayer from "../video-player";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

const SectionRevieComponent = ({ settings, section, Cancel }: any) => {
  const [contents, setContents] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getContentsData();
  }, []);

  const getContentsData = async () => {
    const filteredContents = section.contents.filter(
      (content: any) => content.type !== "quiz" && content.type !== "assessment"
    );

    const processedContents = await Promise.all(
      filteredContents.map(async (content: any) => {
        if (content.type === "video") {
          if (content.url) {
            content.embedUrl = embedVideo(content.url);
          } else if (content.source) {
            content.loading = true;
            try {
              const video = await getContentById(content.source);
              if (video.filePath) {
                video.url = getElearningFullPath(
                  settings.baseUrl,
                  video.filePath
                );
                content.local = true;
              }
              content.embedUrl = embedVideo(video.url);
              content.url = video.url;
            } catch (err) {
              console.error("Error fetching video content:", err);
            } finally {
              content.loading = false;
            }
          }
        } else if (content.contentType === "ebook") {
          let url = content.url;
          if (content.filePath) {
            url = getElearningFullPath(settings.baseUrl, content.filePath);
          }
          content.url = url;
        }
        return content;
      })
    );
    setLoading(false);
    setContents(processedContents);
  };

  const onCancel = () => {
    Cancel();
  };

  return (
    <>
      <div className="rounded-boxes form-boxes bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">Chapter: {section.title}</h1>
          </div>
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
      {loading ? (
        <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
      ) : contents.length ? (
        <div>
          {contents.length > 0 &&
            contents.map((content: any, index: number) => (
              <div key={index} className="rounded-boxes form-boxes bg-white">
                {content.type === "note" && (
                  <div>
                    <div className="iconc-content-lock ml-3">
                      <span className="v-align-top ml-2">{content.title}</span>
                    </div>
                    <br />
                    <ContentRenderer _content={content.note} />
                    {content.summary && (
                      <div>
                        <br />
                        <h2>Summary</h2>
                        <Mathjax value={content.summary} />
                      </div>
                    )}
                  </div>
                )}

                {["quiz", "assessment"].includes(content.type) && (
                  <div className={`iconc-${content.type}-lock ml-3`}>
                    <span className="v-align-top ml-2">{content.title}</span>
                  </div>
                )}

                {content.type === "video" && (
                  <div>
                    <div className="iconc-video-lock ml-3">
                      <span className="v-align-top ml-2">{content.title}</span>
                    </div>
                    <br />
                    <div>
                      <div className="content-item-top">
                        {!content.loading && (
                          <div>
                            {content.embedUrl && (
                              <div>
                                {!content.local ? (
                                  <iframe
                                    className="w-100"
                                    height="400"
                                    src={content.embedUrl}
                                    frameBorder="0"
                                    allowFullScreen
                                  ></iframe>
                                ) : (
                                  <div className="video-player">
                                    <VideoPlayer
                                      _link={content.embedUrl}
                                      _height={400}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            {!content.embedUrl && (
                              <figure>
                                <img
                                  src="/assets/images/emptycontent.jpeg"
                                  alt=""
                                ></img>
                              </figure>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {content.summary && (
                      <div>
                        <br />
                        <h2 className="text-dark mb-2">Summary</h2>
                        <Mathjax value={content.summary} />
                      </div>
                    )}
                  </div>
                )}

                {content.type === "ebook" && (
                  <div>
                    <div className="iconc-ebook-lock ml-3">
                      <span className="v-align-top ml-2">{content.title}</span>
                    </div>
                    <br />
                    {content.url && (
                      <div>
                        <a href={content.url} target="_blank"></a>
                      </div>
                    )}
                    {!content.url && (
                      <figure>
                        <img
                          src="/assets/images/emptycontent.jpeg"
                          alt=""
                        ></img>
                      </figure>
                    )}
                    {content.summary && (
                      <div>
                        <br />
                        <h2 className="text-dark mb-2">Summary</h2>
                        <Mathjax value={content.summary} />
                      </div>
                    )}
                  </div>
                )}

                {content.type === "onlineSession" && (
                  <div>
                    <div className="iconc-onlineSession-lock ml-3">
                      <span className="v-align-top ml-2">{content.title}</span>
                    </div>
                    <br />
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center">
          <img
            src="/assets/images/no-data-board.svg"
            className="mx-auto mb-2"
            alt="No data"
          ></img>
          <p>No content to review</p>
        </div>
      )}
    </>
  );
};

export default SectionRevieComponent;
