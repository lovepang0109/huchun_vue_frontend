import { useState, useEffect } from "react";
import clientApi from "@/lib/clientApi";
import { AppLogo } from "./AppLogo";

export const VideoPlayer = ({ link, height, show, setShow }: any) => {
  const [logo, setLogo] = useState<any>(null);
  const [getClientData, setClientData] = useState<any>({});

  useEffect(() => {
    clientApi
      .get(`/api/settings`)
      .then((res) => {
        setClientData(res.data);
        setLogo(res.data.emailLogo);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const watch = () => {
    setShow(true);
  };

  const open = () => {
    setShow(true);
  };

  const close = () => {
    setShow(false);
  };

  return (
    <>
      <button
        id="openModalButton"
        onClick={watch}
        style={{ display: "none" }}
      ></button>
      {show && (
        <div className="modal">
          <div className="modal-header">
            <AppLogo />
            <span className="pull-right" onClick={close}>
              <i className="fas fa-times"></i>
            </span>
          </div>
          <div className="modal-body">
            <iframe
              width="100%"
              className="yvideo"
              height="315"
              src={link}
              allowFullScreen
              title="Video"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};
