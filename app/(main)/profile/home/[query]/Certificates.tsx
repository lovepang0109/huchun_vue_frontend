"use client";
import { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import { toQueryString, slugify } from "@/lib/validator";
import _ from "lodash";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { getFileNameFromResponse, saveBlobFromResponse } from "@/lib/common";
import * as adminSvc from "@/services/adminService";

const CertificatesProfile = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData]: any = useState();
  const [certificates, setCertificates] = useState([]);

  const params: any = {
    limit: 100,
    page: 1,
  };
  let total = 0;
  const [loading, setLoading] = useState(false);
  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const getAllCertificates = async () => {
    const { data } = await clientApi.get(
      `/api/certificates${toQueryString({ ...params })}`
    );
    setCertificates(data.certs);
    setLoading(false);
  };

  const loadMore = () => {
    params.page++;
    setLoading(true);
    // this.ceritficateService.getCertificates({ ...this.params }).subscribe((res: any) => {
    //   this.certificates = [...this.certificates, ...res.certs];
    // }).add(() => this.loading = false)
  };

  const download = async (item: any) => {
    try {
      await clientApi.get(
        `/api/course/verifyCourseUserProgress/${item.course._id}`
      );
      const query = {
        user: user._id,
        course: item.course._id,
        directDownload: true,
      };
      const session = await getSession();

      const response = await clientApi.get(
        `https://newapi.practiz.xyz/api/v1/admin/reportData/exportcerificate${toQueryString(
          query
        )}`,
        {
          responseType: "blob",
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );

      saveBlobFromResponse({
        fileName: slugify(item.course.title),
        blob: response.data,
      });

      adminSvc
        .downloadReportData("exportcerificate", query)
        .then((res: any) => {
          saveBlobFromResponse({
            fileName: slugify(item.course.title),
            blob: res,
          });
        });
    } catch (error: any) {
      console.log(error, "dd");
      if (error?.response?.data) {
        alertify.alert("Message", error?.response?.data).setHeader("Error");
      } else {
        alertify
          .alert("Message", "Fail to download certification!")
          .setHeader("Error");
      }
    }
  };

  // const download = async (item: any) => {
  //   const {data} = await clientApi.get(`/api/course/verifyCourseUserProgress/${item.course._id}`);
  //   const query = { user: user._id, course: item.course._id, directDownload: true };

  //   // this.ceritficateService.verifyCourseUserProgress(item.course._id).subscribe(d => {
  //   //   const query = { user: this.authSvc.userId, course: item.course._id, directDownload: true }
  //   //   this.adminService.downloadReportData('exportcerificate', query).subscribe((res: any) => {
  //   //     this.helper.saveBlobFromResponse({ fileName: this.helper.slugify(item.course.title), blob: res.blob })
  //   //     item.issuedCertificateDate = new Date()
  //   //     item.issuedCertificate = true
  //   //   }, (err) => {
  //   //     this.alertify.alert("Message",'Fail to download certification!', 'Download Course Certificate');
  //   //   })
  //   // }, (err) => {
  //   //   this.alertify.alert("Message",err.error, 'Download Course Certificate')
  //   // })
  // }

  const openLinkedin = async (item: any) => {
    try {
      const { data } = await clientApi.get(
        `/api/course/verifyCourseUserProgress/${item.course._id}`
      );
    } catch (error: any) {
      alertify.alert("Message", error.response.data);
    }
    if (!item.issuedCertificate || !item.issuedCertificateDate) {
      alertify.alert(
        "Message",
        "LinkedIn is a great showcase of your achievement. However, please download your certificate before posting to LinkedIn."
      );
      return;
    }
    window.open(
      "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=" +
        item.course.title +
        "&organizationId=" +
        getClientData.linkedInOrgId +
        "&issueYear=" +
        new Date(item.issuedCertificateDate).getFullYear() +
        "&issueMonth=" +
        new Date(item.issuedCertificateDate).getMonth() +
        "&expirationYear=" +
        new Date(item.course.expiresOn).getFullYear() +
        "&expirationMonth=" +
        new Date(item.course.expiresOn).getMonth() +
        "&certUrl=" +
        getClientData.baseUrl +
        "public/profile/student/" +
        user._id,
      "_blank"
    );

    // this.ceritficateService.verifyCourseUserProgress(item.course._id).subscribe(d => {
    //   if (!item.issuedCertificate || !item.issuedCertificateDate) {
    //     this.alertify.alert("Message",'LinkedIn is a great showcase of your achievement. However, please download your certificate before posting to LinkedIn.', "Add to LinkedIn profile.")
    //     return
    //   }
    //   window.open('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=' + item.course.title + '&organizationId=' + this.getClientData.linkedInOrgId + '&issueYear=' +
    //     new Date(item.issuedCertificateDate).getFullYear() + '&issueMonth=' + new Date(item.issuedCertificateDate).getMonth() + '&expirationYear='
    //     + new Date(item.course.expiresOn).getFullYear() + '&expirationMonth=' + new Date(item.course.expiresOn).getMonth() + '&certUrl=' + this.getClientData.baseUrl + 'public/profile/student/' + this.authSvc.userId, "_blank");
    // }, (error) => {
    //   this.alertify.alert("Message",error.error, "Add to LinkedIn profile.")
    // })
  };

  useEffect(() => {
    getClientDataFunc();
    getAllCertificates();
  }, []);

  return (
    <div>
      <div className="clearfix">
        {certificates.map((item: any, index: any) => {
          return (
            <div
              className="box-item"
              key={index}
              style={{ marginBottom: 30, paddingLeft: 15, paddingRight: 15 }}
            >
              <div className="box box_new bg-white pt-0">
                <div className="image-wrap">
                  <img
                    src={item?.course?.imageUrl}
                    style={{ width: "100%", height: 141 }}
                  ></img>
                  {/* <p-image [height]="141" [width]="100" [type]="'course'" [imageUrl]=""
                                  [backgroundColor]="item.colorCode" [text]="item.title" [radius]="9" [fontSize]="15">
                              </p-image> */}
                </div>
                <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                  <div className="info p-0 m-0">
                    <h4
                      data-toggle="tooltip"
                      data-placement="top"
                      title="{{item?.course?.title}}"
                    >
                      {item?.course?.title}
                    </h4>
                  </div>

                  <div className="form-row mt-2">
                    <div className="col-12">
                      <a
                        className="btn btn-outline btn-sm d-block"
                        onClick={() => download(item)}
                      >
                        Download
                      </a>
                    </div>
                    {getClientData?.linkedInOrgId && (
                      <div className="col-12 mt-2 mx-auto text-center">
                        <img
                          className="mx-auto cursor-pointer"
                          src="https://download.linkedin.com/desktop/add2profile/buttons/en_US.png"
                          onClick={() => openLinkedin(item)}
                          alt="LinkedIn Add to Profile button"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div>
          <div className="row">
            <div className="box-item">
              <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
            </div>
            <div className="box-item">
              <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
            </div>
            <div className="box-item">
              <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
            </div>
            <div className="box-item">
              <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
            </div>
            <div className="box-item">
              <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
            </div>
          </div>
        </div>
      )}

      {total > certificates.length && !loading && (
        <div className="mt-4 text-center">
          <button className="btn btn-light" onClick={() => loadMore()}>
            Load More
          </button>
        </div>
      )}

      {!loading && !certificates.length && (
        <div className="text-center">
          <img
            className="mx-auto"
            src="/assets/images/certificates.svg"
            alt=""
          />
          <p>
            In order to download a certificate, you must complete your profile
            100% and finish at least one course.
          </p>
        </div>
      )}
    </div>
  );
};
export default CertificatesProfile;
