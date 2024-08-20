"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import MathJax from "@/components/assessment/mathjax";
import ItemPrice from "@/components/ItemPrice";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import SVG from "@/components/svg";
import { addItem } from "@/services/shopping-cart-service";
import * as authSvc from "@/services/auth";
import * as serviceSvc from "@/services/suportService";
import * as userSvc from "@/services/userService";
import * as classRoomService from "@/services/classroomService";
import * as settingSvc from "@/services/settingService";
import alertify from "alertifyjs";
import { slugify } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import Multiselect from "multiselect-react-dropdown";
import { FileDrop } from "react-file-drop";
import { round } from "@/lib/common";
import SelectCountryComponent from "@/components/SelectCountry";
import { Modal } from "react-bootstrap";

const ServiceSettings = ({ service, setService, user, id }: any) => {
  const fileBrowseRef = useRef(null);

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<any>(service);
  const [settings, setSettings] = useState<any>(null);
  const [files, setFiles] = useState<any>([]);
  const [locations, setLocations] = useState<any>([]);
  const [allCls, setAllCls] = useState<any>([]);
  const [selectedLocations, setSelectedLocations] = useState<any>([]);
  const [loadedClassrooms, setLoadedClassrooms] = useState<any>({});
  const [selectedClassrooms, setSelectedClassrooms] = useState<any>([]);
  const { push } = useRouter();
  const [selectedCountries, setSelectedCountries] = useState<any>();

  const setServiceFunc = (value: any) => {
    setService(value);
    onServiceChanged(value);
  };

  const getClientData = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    const inputElements = document.querySelectorAll("#search_input");
    inputElements.forEach((inputElement) => {
      inputElement.removeAttribute("disabled");
    });
  }, [document.querySelectorAll("#search_input")]);

  useEffect(() => {
    getClientData();

    if (!editingService.descriptive) {
      setEditingService({
        ...editingService,
        description: "",
      });
    }
    // create durationString for binding
    if (service.duration) {
      setEditingService({
        ...editingService,
        durationString: service.duration + "_" + service.durationUnit,
      });
    }

    loadData();
  }, []);

  const loadData = async () => {
    let tmp_selectedL = selectedLocations;
    if (user.role === "admin") {
      const res = await classRoomService.getAllInstitutes();
      res.sort((a, b) => a.name.localeCompare(b.name));
      setLocations(res);
      setSelectedLocations(
        res.filter((loc) => service.locations.indexOf(loc._id) > -1)
      );
      tmp_selectedL = res.filter(
        (loc) => service.locations.indexOf(loc._id) > -1
      );
    }

    if (service.locations?.length) {
      const locs =
        user.role == "admin" ? [...service.locations] : [user.activeLocation];
      classRoomService.getClassRoomByLocation(locs).then((data: any[]) => {
        for (const r of data) {
          if (tmp_selectedL.length) {
            const loc = tmp_selectedL.find((loc) => loc._id == r.location);
            if (loc) {
              r.name = `${loc.name} - ${r.name}`;
            }
          }

          const tmp = loadedClassrooms;
          if (!loadedClassrooms[r.location]) {
            setLoadedClassrooms((prevState) => ({
              ...prevState,
              [r.location]: [],
            }));
            tmp[r.location] = [];
          }
          tmp[r.location]?.push(r);
          setLoadedClassrooms(tmp);
        }
        data.sort((a, b) => a.name.localeCompare(b.name));

        setAllCls(data);
        setSelectedClassrooms(
          data.filter((loc) => service.classrooms.indexOf(loc._id) > -1)
        );
      });
    }
  };

  const onServiceChanged = (value: any) => {
    setEditingService({ ...value });
  };

  const editCountries = () => {
    setSelectedCountries(editingService.countries.map((c) => c.code));
    // setCountries(editingService.countries);
    setIsShowModal(true);
  };

  const onClose = async (res: any) => {
    const newCountries: any[] = [];
    for (const c of res) {
      const currentC = editingService.countries.find((pc) => pc.code == c.code);
      if (currentC) {
        newCountries.push(currentC);
      } else {
        const newCountry = {
          code: c.code,
          name: c.name,
          currency: c.currency,
          price: 0,
          marketPlacePrice: 0,
          discountValue: 0,
        };
        if (editingService.countries[0] && editingService.countries[0].price) {
          try {
            const currencyRate: any = await settingSvc.getCurrencyRate(
              editingService.countries[0].currency,
              c.currency
            );
            newCountry.price = round(
              editingService.countries[0].price * currencyRate,
              c.currency == "INR" ? 0 : 2
            );
            newCountry.marketPlacePrice = round(
              editingService.countries[0].marketPlacePrice * currencyRate,
              c.currency == "INR" ? 0 : 2
            );
          } catch (ex) {
            console.log(ex);
          }
        }
        newCountries.push(newCountry);
      }
    }
    setEditingService({
      ...editingService,
      countries: newCountries,
    });
    setIsShowModal(false);
  };
  const updatePrice = (index, e) => {
    const updatedPrice = e.target.value;
    const updatedCountries = editingService.countries.map((country, i) =>
      i === index
        ? {
          ...country,
          price: updatedPrice,
        }
        : country
    );
    setEditingService({ ...editingService, countries: updatedCountries });
  };
  const updateMarketPlacePrice = (index: any, e: any) => {
    const updatedPrice = Number(e.target.value);
    const updatedCountries = editingService.countries.map((country, i) =>
      i === index
        ? {
          ...country,
          marketPlacePrice:
            country.currency === "INR"
              ? Math.round(updatedPrice)
              : updatedPrice,
        }
        : country
    );
    setEditingService({ ...editingService, countries: updatedCountries });
  };

  const dropped = (files: any) => {
    setFiles(files[0]);
  };

  const uploadImage = async () => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", files, files.name);
    formData.append("uploadType", "file");

    const session = await getSession();

    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((data: any) => {
        if (data) {
          setEditingService({
            ...editingService,
            imageUrl: data.data.fileUrl,
          });
          setFiles([]);
          alertify.success("File uploaded successfully.");
        }
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      });
  };

  const removeImage = () => {
    setEditingService({
      ...editingService,
      imageUrl: "",
    });
  };
  const save = (form, publish?) => {
    if (!editingService.title) {
      alertify.alert("Message", "Please enter membership name.");
      return;
    }
    if (!editingService.shortDescription) {
      alertify.alert("Message", "Please enter membership summary.");
      return;
    }

    let classData = allCls.filter(
      (cl) => selectedClassrooms.findIndex((s) => s._id == cl._id) > -1
    );
    classData = classData.filter(
      (item, index, self) => index === self.findIndex((t) => t._id === item._id)
    );
    for (let i = 0; i < classData.length; i++) {
      for (let j = i + 1; j < classData.length; j++) {
        if (classData[i].location == classData[j].location) {
          const loc = selectedLocations.find(
            (loc) => loc._id == classData[i].location
          );

          alertify.alert(
            "Message",
            "Multiple classrooms are selected for [" +
            loc.name +
            "] center. Please select only one classroom per location."
          );
          return;
        }
      }
    }

    if (processing) {
      return;
    }
    let tmp = editingService;

    if (publish) {
      setEditingService({
        ...editingService,
        status: "published",
      });
      tmp.status = "published";
    }

    if (editingService.durationString) {
      setEditingService({
        ...editingService,
        duration: Number(editingService.durationString.split("_")[0]),
        durationUnit: editingService.durationString.split("_")[1],
      });

      tmp.duration = Number(tmp.durationString.split("_")[0]);
      tmp.durationUnit = tmp.durationString.split("_")[1];
    }

    if (user.role == "admin") {
      setEditingService({
        ...editingService,
        locations: selectedLocations.map((loc) => loc._id),
      });
      tmp.locations = selectedLocations.map((loc) => loc._id);
    }

    setEditingService({
      ...editingService,
      classrooms: selectedClassrooms.map((cl) => cl._id),
    });
    tmp.classrooms = selectedClassrooms.map((cl) => cl._id);

    setProcessing(true);
    serviceSvc
      .updateService(tmp)
      .then((res) => {
        alertify.success(
          publish ? "Membership is published!" : "Membership is updated"
        );
        setServiceFunc({ ...tmp });
        // serviceChange.emit(this.service)
        setProcessing(false);
      })
      .catch((res) => {
        console.log(res);
        if (res.error && res.error.message) {
          alertify.alert("Message", res.error.message);
        } else {
          alertify.alert("Message", "Failed to update membership.");
        }
        setProcessing(false);
      });
  };

  const cancel = () => {
    setEditingService({ ...service });
  };

  const onLocationSelect = async (ev: any) => {
    setSelectedLocations(ev);
    const id = ev[ev.length - 1]._id;
    let tmp_loadedCls = loadedClassrooms;
    if (!loadedClassrooms[id]) {
      const classes: any = await classRoomService.getClassRoomByLocation([id]);

      classes.forEach((lc) => {
        lc.name = `${ev[ev.length - 1].name} - ${lc.name}`;
      });
      setLoadedClassrooms({
        ...loadedClassrooms,
        [id]: classes,
      });
      tmp_loadedCls[id] = classes;
    }

    let classrooms: any = [];

    for (const loc of ev) {
      if (tmp_loadedCls[loc._id]) {
        classrooms = classrooms.concat(tmp_loadedCls[loc._id]);
      }
    }
    classrooms.sort((a, b) => a.name.localeCompare(b.name));

    setAllCls(classrooms);
  };

  const onLocationSelectAll = async () => {
    const toLoad = locations.filter((loc) => !(loc._id in loadedClassrooms));
    let tmp_loadedCls = loadedClassrooms;
    if (toLoad.length) {
      const classes: any = await classRoomService.getClassRoomByLocation(
        toLoad.map((loc) => loc._id)
      );

      for (const loc of toLoad) {
        setLoadedClassrooms({
          ...loadedClassrooms,
          [loc._id]: [],
        });
        tmp_loadedCls[loc._id] = [];
        for (const cl of classes) {
          if (cl.location == loc._id) {
            cl.name = `${loc.name} - ${cl.name}`;
            tmp_loadedCls[loc._id].push(cl);
            setLoadedClassrooms(tmp_loadedCls);
          }
        }
      }
    }

    let classrooms = [];

    for (const loc of selectedLocations) {
      if (tmp_loadedCls[loc._id]) {
        classrooms = classrooms.concat(tmp_loadedCls[loc._id]);
      }
    }
    classrooms.sort((a, b) => a.name.localeCompare(b.name));

    setAllCls(classrooms);
  };

  const onLocationDeSelect = (ev: any) => {
    const removed = selectedLocations.filter((item) => !ev.includes(item));
    let classrooms = [];

    for (const loc of selectedLocations) {
      if (loadedClassrooms[loc._id]) {
        classrooms = classrooms.concat(loadedClassrooms[loc._id]);
      }
    }
    setSelectedLocations(ev);

    setAllCls(classrooms);

    const newClassrooms = [];

    let classData = classrooms.filter(
      (cl) => selectedClassrooms.findIndex((s) => s._id == cl._id) > -1
    );
    classData = classData.filter(
      (item, index, self) => index === self.findIndex((t) => t._id === item._id)
    );

    for (const room of classData) {
      if (room.location != removed[0]._id) {
        newClassrooms.push(room);
      }
    }
    setSelectedClassrooms(newClassrooms);
  };

  const deactivate = (service: any) => {
    alertify.confirm(
      "Are you sure you want to deactivate this Membership?",
      (msg) => {
        setEditingService({
          ...editingService,
          status: "revoked",
        });
        const tmp_editingservice = {
          ...editingService,
          status: "revoked",
        };
        setProcessing(true);
        serviceSvc
          .revokeService(service)
          .then((res) => {
            alertify.success("Membership is deactivated!");
            setServiceFunc({ ...tmp_editingservice });
            setProcessing(false);
          })
          .catch((err) => {
            setProcessing(false);
          });
      }
    );
  };

  const activate = (service: any) => {
    setEditingService({
      ...editingService,
      status: "published",
    });
    const tmp_editingservice = {
      ...editingService,
      status: "published",
    };
    setProcessing(true);
    serviceSvc
      .publishService(service)
      .then((res) => {
        setServiceFunc({ ...tmp_editingservice });
        setProcessing(false);
      })
      .catch((err) => {
        setProcessing(false);
      });
  };

  const deleteFunc = (service: any) => {
    alertify.confirm(
      "Are you sure you want to delete this Membership?",
      (msg) => {
        setProcessing(true);
        serviceSvc
          .deleteService(service)
          .then((res) => {
            alertify.success("Membership is deleted!");
            push("/services");
            setProcessing(false);
          })
          .catch((err) => {
            setProcessing(false);
          });
      }
    );
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      <form
        className="text-dark"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="form-group bg-white py-3 px-4">
          <strong htmlFor="title">Membership Name</strong>
          <input
            style={{ border: "none" }}
            type="text"
            className="form-control p-0 border-bottom"
            name="title"
            id="title"
            value={editingService?.title}
            onChange={(e) =>
              setEditingService({ ...editingService, title: e.target.value })
            }
            maxLength="200"
            placeholder="Name"
            readOnly={user.role !== "admin"}
            required
          />
          {editingService?.title === "" && (
            <p className="label label-danger text-danger">Name is required</p>
          )}
        </div>
        <div className="form-group bg-white py-3 px-4">
          <strong>Summary</strong>
          <textarea
            style={{ border: "none", resize: "none" }}
            type="text"
            className="form-control pl-0 border-top-0 border-left-0 border-right-0"
            name="shortDescription"
            placeholder="Summary"
            readOnly={user.role !== "admin"}
            rows={1}
            id="shortDescription"
            value={editingService?.shortDescription}
            onChange={(e) =>
              setEditingService({
                ...editingService,
                shortDescription: e.target.value,
              })
            }
            required
          />
          {editingService?.shortDescription === "" && (
            <p className="label label-danger text-danger">
              Summary is required
            </p>
          )}
        </div>

        <div className="form-group bg-white py-3 px-4">
          <strong>Description</strong>
          {user.role === "admin" ? (
            <CKEditorCustomized
              defaultValue={editingService?.description}
              onChangeCon={(data) => {
                setEditingService({ ...editingService, description: data });
              }}
              config={{
                placeholder: "Write Description",
              }}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: editingService?.description }}
            ></div>
          )}
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group bg-white py-3 px-4">
              <strong>Features includes</strong>
              {user.role === "admin" ? (
                <TagsInput
                  //@ts-ignore
                  value={editingService?.highlights}
                  //@ts-ignore
                  onChange={(e) =>
                    setEditingService({ ...editingService, highlights: e })
                  }
                  name="tags"
                  placeHolder="+ Add Features"
                  separators={[" "]}
                />
              ) : (
                <div>
                  {editingService?.highlights?.map((highlight, index) => (
                    <div key={index}>{highlight}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col">
            <div className="bg-white py-3 px-4 form-group">
              <strong>Tags</strong>
              {user.role === "admin" ? (
                <TagsInput
                  //@ts-ignore
                  value={editingService?.tags}
                  //@ts-ignore
                  onChange={(e) =>
                    setEditingService({ ...editingService, tags: e })
                  }
                  name="tags"
                  placeHolder="+ Add Tag"
                  separators={[" "]}
                />
              ) : (
                <div className="d-flex gap-xs flex-wrap mt-2">
                  {editingService?.tags.map((tag, index) => (
                    <span key={index} className="badge badge-primary f-14">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="bg-white py-3 px-4 form-group">
              <strong>Duration</strong>
              <div className="row">
                {["1_month", "2_month", "3_month", "6_month", "1_year"].map(
                  (duration) => (
                    <div className="col-4" key={duration}>
                      <label>
                        <input
                          type="radio"
                          name="durationString"
                          className="d-radio"
                          value={duration}
                          disabled={user.role !== "admin"}
                          checked={editingService.durationString === duration}
                          onChange={(e) => {
                            setEditingService({
                              ...editingService,
                              durationString: e.target.value,
                            });
                          }}
                        />
                        <span
                          className={`${editingService.type}_${duration} mx-1`}
                        ></span>
                        <span>{duration.replace("_", " ")}</span>
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-white py-3 px-4 form-group">
              <strong>Price</strong>
              <div className="mt-2">
                {settings?.countries.length > 1 && user.role === "admin" && (
                  <strong className="form-box_title my-2">
                    Set Currency:{" "}
                    <a className="ml-2" onClick={() => editCountries()}>
                      <i className="far fa-edit"></i>
                    </a>
                  </strong>
                )}
                {editingService.countries.map((country, index) => (
                  <div key={index} className="mt-2">
                    {settings?.countries.length > 1 && (
                      <div className="bold">{country.name}</div>
                    )}
                    <div className="col-md-12">
                      <div className="form-row align-items-center mb-2">
                        <div className="col-auto">
                          <strong className="form-box_subtitle main-sub-title">
                            Individual Price(
                            {country.currency === "INR" ? "₹" : "$"})
                          </strong>
                        </div>
                        <form className="col ml-3">
                          <input
                            type="number"
                            name={"country_price_" + country.code}
                            value={country.price}
                            readOnly={user.role !== "admin"}
                            onChange={(e) => updatePrice(index, e)}
                            className="form-control border-bottom rounded-0"
                          />
                        </form>
                      </div>
                      <div className="form-row align-items-center mb-2">
                        <div className="col-auto">
                          <strong className="form-box_subtitle main-sub-title">
                            Marketplace Price(
                            {country.currency === "INR" ? "₹" : "$"})
                          </strong>
                        </div>
                        <form className="col">
                          <input
                            type="text"
                            name={`country_marketplaceprice_${country.code}`}
                            readOnly={user.role !== "admin"}
                            value={country.marketPlacePrice}
                            onChange={(e) => updateMarketPlacePrice(index, e)}
                            className="form-control border-bottom rounded-0"
                          />
                        </form>
                      </div>
                      <div className="form-row align-items-center">
                        <div className="col-auto mr-3">
                          <strong className="form-box_subtitle main-sub-title">
                            Discount (%)
                          </strong>
                        </div>
                        <form className="col ml-4 pl-3">
                          <input
                            className="form-control border-bottom rounded-0"
                            type="text"
                            name="discountValue"
                            readOnly={user.role !== "admin"}
                            value={country.discountValue}
                            onChange={(e) => {
                              setEditingService((prevState) => {
                                const updatedCountries =
                                  prevState.countries.map((c, i) => {
                                    if (i === index) {
                                      return {
                                        ...country,
                                        discountValue: e.target.value, // Corrected the key here
                                      };
                                    }
                                    return c;
                                  });
                                return {
                                  ...prevState,
                                  countries: updatedCountries,
                                };
                              });
                            }}
                            placeholder="Enter discount percentage"
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="form-group bg-white py-3 px-4">
              {user.role === "admin" && (
                <div>
                  <strong className="form-box_title">Location</strong>
                  <div className="border-bottom LibraryChange_new">
                    <Multiselect
                      options={locations}
                      selectedValues={selectedLocations}
                      onSelect={onLocationSelect}
                      onRemove={onLocationDeSelect}
                      displayValue="name"
                      placeholder="Select locations"
                      avoidHighlightFirstOption
                    />
                  </div>
                </div>
              )}
              <div>
                <strong className="form-box_title">Classroom</strong>
                <div className="border-bottom LibraryChange_new">
                  <Multiselect
                    options={allCls}
                    selectedValues={selectedClassrooms}
                    onSelect={(e) => setSelectedClassrooms(e)}
                    onRemove={(e) => setSelectedClassrooms(e)}
                    displayValue="name"
                    placeholder="Select Classroom"
                    singleSelect={user.role !== "admin"}
                  />
                </div>
              </div>
            </div>

            <div className="form-group bg-white py-3 px-4">
              <strong>Upload Membership Picture</strong>
              {editingService.status !== "revoked" && user.role === "admin" ? (
                <div className="standard-upload-box mt-2">
                  {!editingService.imageUrl && (
                    <FileDrop onDrop={(f) => dropped(f)}>
                      <h2 className="upload_icon text-center">
                        <span className="material-icons setting-image">
                          file_copy
                        </span>
                      </h2>
                      <p className="pro-text-drug text-center d-block">
                        {files?.name}
                      </p>
                      <span className="title text-center helPer_txT">
                        Drag and drop or{" "}
                        <a
                          className="active text-primary"
                          onClick={() => filePicker()}
                        >
                          Browse
                        </a>{" "}
                        your files.
                      </span>
                      <p className="text-dark">
                        For optimal view, we recommend size{" "}
                        <span className="text-danger">190px * 200px</span>
                      </p>
                      <input
                        accept=""
                        value=""
                        style={{ display: "none", opacity: 0 }}
                        ref={fileBrowseRef}
                        type="file"
                        onChange={(e) => dropped(e.target.files)}
                      />
                      <a
                        className="btn btn-primary btn-sm mx-2"
                        onClick={filePicker}
                      >
                        Browse
                      </a>
                      <a
                        className="btn btn-secondary btn-sm"
                        onClick={uploadImage}
                      >
                        Upload
                      </a>
                    </FileDrop>
                  )}
                  {editingService.imageUrl && (
                    <div className="uploaded-image bg-white mt-2">
                      <button
                        type="reset"
                        className="close btn p-0 mb-2"
                        onClick={removeImage}
                      >
                        <img
                          src="/assets/images/close.png"
                          alt=""
                          className="remove-uploaded-image_btn"
                        />
                      </button>
                      <figure>
                        <img
                          src={editingService.imageUrl}
                          className="actual-uploaded-image"
                        />
                      </figure>
                    </div>
                  )}
                </div>
              ) : (
                <div className="uploaded-image bg-white mt-2">
                  <figure>
                    <img
                      src={
                        editingService.imageUrl || "/assets/images/st-img5.png"
                      }
                      className="actual-uploaded-image"
                    />
                  </figure>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-xs">
          {user.role === "admin" && editingService.status === "draft" && (
            <button
              className="btn btn-danger"
              onClick={() => deleteFunc(editingService)}
              disabled={processing}
            >
              Delete
            </button>
          )}

          {user.role === "admin" && editingService.status === "published" && (
            <button
              className="btn btn-danger"
              onClick={() => deactivate(editingService)}
              disabled={processing}
            >
              Deactivate
            </button>
          )}

          {user.role === "admin" && editingService.status === "revoked" && (
            <button
              className="btn btn-success"
              onClick={() => activate(editingService)}
              disabled={processing}
            >
              Activate
            </button>
          )}

          {user.role === "admin" && editingService.status === "draft" && (
            <button
              type="button"
              className="btn btn-light"
              onClick={cancel}
              disabled={processing}
            >
              Reset
            </button>
          )}

          {editingService.status === "draft" && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => save(editingService, true)}
              disabled={processing}
            >
              Publish
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={processing}
            onClick={() => save(service)}
          >
            Save
          </button>
        </div>
      </form>
      <Modal
        show={isShowModal}
        onHide={() => setIsShowModal(false)}
        backdrop="static"
        keyboard={false}
        className="currency-modal"
      >
        <SelectCountryComponent
          settings={settings}
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          onCloseFunction={onClose}
        />
      </Modal>
    </>
  );
};
export default ServiceSettings;
