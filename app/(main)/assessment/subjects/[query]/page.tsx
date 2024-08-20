"use client";

import {
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import PImageComponent from "@/components/AppImage";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { AppLogo } from "@/components/AppLogo";
import CustomCarousel from "@/components/assessment/carousel";
import Price from "@/components/assessment/price";
import { userInfo } from "os";
import { useSession } from "next-auth/react";

const Subjects = () => {
  const param = useParams();
  const id = useSearchParams().get("id");
  const [subject, setSubject] = useState<any>({
    id: "",
    name: "",
    imageUrl: "",
  });
  const [searchVal, setSearchVal] = useState<string>("");
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [subjectLoaded, setSubjectLoaded] = useState<boolean>(false);
  const [recommendedTests, setRecommendedTests] = useState<any[]>([]);
  const [recommendedLoaded, setRecommendedLoaded] = useState<boolean>(false);
  const [practices, setPractices] = useState<any[]>([]);
  const [practiceLoaded, setPracticeLoaded] = useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { value } = e.target as HTMLInputElement;
    setSearchVal(value);
    setIsSearch(!!value);
  };

  useEffect(() => {
    if (!!searchVal) {
      const timeout = setTimeout(() => getPractices(), 500);
      return () => clearTimeout(timeout);
    }
  }, [searchVal]);

  const getRecommendedTests = useCallback(async () => {
    const { data } = await clientApi.get(
      `/api/tests/recommended/${id}${toQueryString({
        searchText: searchVal,
        limit: 5,
      })}`
    );
    setRecommendedTests(
      data.map((d: any) => ({
        _id: d._id,
        title: d.title,
        slugfly: d.title.replace(/\s+/g, "-"),
        accessMode: d.accessMode,
        testMode: d.testMode,
        totalQuestion: d.totalQuestion,
        totalTime: d.totalTime,
        grades: d.grades,
        subjects: d.subjects,
        colorCode: d.colorCode,
        imageUrl: d.imageUrl,
      }))
    );
    setRecommendedLoaded(true);
  }, []);

  const getPractices = useCallback(async () => {
    const { data } = await clientApi.get(
      `/api/tests/testBySubject/${id}${toQueryString({
        searchText: searchVal,
        limit: 35,
      })}`
    );
    setPractices(
      data.map((d: any) => ({
        _id: d._id,
        title: d.title,
        slugfly: d.title.replace(/\s+/g, "-"),
        accessMode: d.accessMode,
        testMode: d.testMode,
        totalQuestion: d.totalQuestion,
        totalTime: d.totalTime,
        grades: d.grades,
        subjects: d.subjects,
        colorCode: d.colorCode,
        imageUrl: d.imageUrl,
      }))
    );
    setPracticeLoaded(true);
  }, []);

  useEffect(() => {
    const getSubjectInfo = async () => {
      const { data } = await clientApi.get(`/api/subjects/getOne/${id}`);
      setSubject((prev: any) => ({
        ...prev,
        id: id,
        name: param.query.replace(/\-/g, " ").replace(/%20/g, " "),
        imageUrl: data.imageUrl,
      }));
      setSubjectLoaded(true);
    };
    if (!!id) {
      getSubjectInfo();
      getRecommendedTests();
      getPractices();
    }
  }, [getRecommendedTests, getPractices]);

  return (
    <>
      {" "}
      <div className="container">
        <div className="search-bar d-block d-lg-none mx-0">
          <div className="form-group mb-0">
            <input
              type="text"
              name="search"
              value={searchVal}
              onChange={handleSearch}
              className="form-control border-bottom rounded-0"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
      <div className="header-secondary bg-white d-block d-lg-none">
        <div className="container">
          <div className="header-area d-block d-lg-none mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <a href="/">
                <figure>
                  <img src="/assets/images/arrow-left.png" alt="" />
                </figure>
              </a>

              <ul className="mr-auto">
                <li className="nav-item">{subject?.name}</li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <main className="pt-3">
        <div className="main-area mx-auto mw-100">
          <div className="main-area-top p-0 d-none d-lg-block">
            <div className="container">
              <div className="info mx-auto mb-3">
                <div className="row align-items-center">
                  <div className="col-9 col-md-7">
                    <div className="d-flex align-items-center clearfix">
                      <figure>
                        {subjectLoaded ? (
                          <>
                            {!!subject.imageUrl ? (
                              <PImageComponent
                                height={98}
                                fullWidth
                                imageUrl={subject.imageUrl}
                                radius={9}
                                fontSize={15}
                                type="subject"
                              />
                            ) : (
                              <div className="squared-rounded_wrap_80 image-wrap position-relative">
                                <img
                                  src="/assets/images/fluid-mechnic.png"
                                  alt="image"
                                />

                                <div className="subjectItemIcon">
                                  <img
                                    src="/assets/images/subjectcodemode(1).png"
                                    alt=""
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <SkeletonLoaderComponent Cwidth={100} Cheight={90} />
                        )}
                      </figure>

                      <div className="subject_title_wrapper inner ml-2 p-0">
                        {subjectLoaded ? (
                          <>
                            <h3 className="subject_title">{subject.name}</h3>
                            <span className="subject_number">
                              {!practices.length
                                ? `No Assessments`
                                : `${practices.length} Assessments`}
                            </span>
                          </>
                        ) : (
                          <>
                            <SkeletonLoaderComponent Cwidth="80" Cheight="40" />
                            <SkeletonLoaderComponent Cwidth="40" Cheight="40" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-3 col-md-5">
                    <form
                      className="common_search-type-1 form-half topic_form-remove ml-auto my-0"
                      action="search.html"
                    >
                      <div className="form-group">
                        <input
                          type="text"
                          name="search"
                          value={searchVal}
                          onChange={handleSearch}
                          className="form-control border-0"
                          placeholder="Search..."
                        />
                        <span>
                          <figure>
                            <img
                              src="/assets/images/search-icon-2.png"
                              alt=""
                            />
                          </figure>
                        </span>
                      </div>
                    </form>

                    <div className="search-btn ml-auto">
                      <a href="#">
                        <figure className="mt-0">
                          <img src="/assets/images/search.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            {!isSearch && user.role === "student" && (
              <div className="genarated-test-box-area mx-auto mw-100 p-0">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading d-none d-lg-block">
                    System Generated Tests
                  </h3>
                </div>

                <div className="genarated-testbox-wrap mb-3">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="genarated-test-box bg-white mb-0">
                        <div className="row align-items-center">
                          <div className="col-12">
                            <h6>{subject.name}</h6>
                          </div>
                          <div className="col-8">
                            <div className="inner">
                              <AppLogo />
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="ml-auto text-right">
                              <Link
                                className="btn btn-outline btn-sm"
                                href={{
                                  pathname: `/assessment/adaptive/`,
                                  query: {
                                    subject: subject.id,
                                    mode: "practice",
                                  },
                                }}
                              >
                                Practice
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="container student_assessment">
            {!recommendedLoaded ? (
              <div className="box-area-wrap box-area-wrap_new  clearfix d-none d-lg-block">
                <div className="heading heading_new ">
                  <div className="row p-4">
                    <div className="col-3">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                    </div>
                  </div>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
              </div>
            ) : (
              <>
                {!isSearch && !!recommendedTests.length && (
                  <>
                    <div className="row">
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Recommended Assessments
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="box-area-wrap box-area-wrap_new  clearfix d-none d-lg-block">
                      <CustomCarousel
                        items={recommendedTests.map((test) => (
                          <div
                            key={test._id}
                            style={{ width: 255 }}
                            className="slider"
                          >
                            <div className="box px-2 w-100 bg-white pt-0">
                              <Link
                                className="cursor-pointer"
                                href={{
                                  pathname: `/assessment/home/${test.slugfly}`,
                                  query: { id: test._id },
                                }}
                              >
                                <PImageComponent
                                  height={128}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                />
                              </Link>

                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <Link
                                    href={{
                                      pathname: `/assessment/home/${test.slugfly}`,
                                      query: { id: test._id },
                                    }}
                                  >
                                    <h4
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.title}
                                      className="text-truncate cursor-pointer"
                                    >
                                      {test.title}
                                    </h4>
                                  </Link>
                                  <ul className="nav pb-1">
                                    <li>
                                      <a>{test?.subjects[0].name}</a>
                                    </li>
                                  </ul>
                                </div>

                                <div className="row">
                                  <div className="col">
                                    <div className="question-count">
                                      <span>
                                        {test.totalQuestion} questions
                                      </span>
                                    </div>
                                  </div>

                                  <div className="col-auto ml-auto">
                                    <div className="time text-right">
                                      <span>{test.totalTime} minutes</span>
                                    </div>
                                  </div>
                                </div>
                                {test.accessMode === "buy" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <Price {...test} />
                                  </div>
                                )}
                              </div>

                              <div className="view-detail view-detail_new">
                                <Link
                                  className="text-center"
                                  href={{
                                    pathname: `/assessment/home/${test.slugfly}`,
                                    query: { id: test._id },
                                  }}
                                >
                                  VIEW DETAILS
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      />
                    </div>
                    <div className="d-block d-lg-none">
                      <div className="box-area-wrap box-area-wrap_new topic">
                        {recommendedTests.map((test: any) => (
                          <div
                            className="box-item w-100"
                            key={test._id}
                            style={{ width: 220 }}
                          >
                            <Link
                              href={{
                                pathname: `/assessment/home/${test.slugfly}`,
                                query: { id: test._id },
                              }}
                            >
                              <div className="box bg-white clearfix py-0">
                                <PImageComponent
                                  height={111}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                />
                                <div className="box-inner box-inner_new py-0 px-4">
                                  <div className="info p-0 m-0">
                                    <h4
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title="{{test.title}}"
                                      className="text-truncate"
                                    >
                                      {test.title}
                                    </h4>
                                  </div>
                                  <div className="row">
                                    <div className="col">
                                      <div className="question-count mb-1">
                                        <span>
                                          {test.totalQuestion} questions
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-auto ml-auto">
                                      <div className="time">
                                        <span>{test.totalTime} minutes</span>
                                      </div>
                                    </div>
                                  </div>
                                  {test.accessMode === "buy" && (
                                    <div className="selling-price-info selling-price-info_new d-flex">
                                      <Price {...test} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                    {recommendedTests.length == 0 && (
                      <div className="box-item clearfix w-100">
                        <div className="box pt-0">
                          <div className="box-inner box-inner_new">
                            <h3 style={{ color: "black" }}>
                              {" "}
                              No Data Available
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {!practiceLoaded ? (
              <div className="box-area-wrap box-area-wrap_new  clearfix d-none d-lg-block">
                <div className="heading heading_new ">
                  <div className="row p-4">
                    <div className="col-3">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                    </div>
                  </div>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                </div>
              </div>
            ) : (
              <>
                {!!practices.length ? (
                  <div className="box-area box-area_new">
                    <div className="row">
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            {isSearch
                              ? "Search Results"
                              : "Your College Assessments"}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="box-area-wrap box-area-wrap_new  clearfix d-none d-lg-block">
                      <CustomCarousel
                        items={practices.map((test) => (
                          <div key={test._id} style={{ width: 255 }}>
                            <div className="box px-2 w-100 bg-white pt-0">
                              <Link
                                href={{
                                  pathname: `/assessment/home/${test.slugfly}`,
                                  query: { id: test._id },
                                }}
                                className="cursor-pointer"
                              >
                                <PImageComponent
                                  height={128}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                />
                              </Link>
                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <Link
                                    href={{
                                      pathname: `/assessment/home/${test.slugfly}`,
                                      query: { id: test._id },
                                    }}
                                  >
                                    <h4
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.title}
                                      className="text-truncate cursor-pointer"
                                    >
                                      {test.title}
                                    </h4>
                                  </Link>
                                  <ul className="nav pb-1">
                                    <li>
                                      <a href="#">{test.subjects[0].name}</a>
                                    </li>
                                  </ul>
                                </div>

                                <div className="row">
                                  <div className="col">
                                    <div className="question-count">
                                      <span>
                                        {test.totalQuestion} questions
                                      </span>
                                    </div>
                                  </div>

                                  <div className="col-auto ml-auto">
                                    <div className="time text-right">
                                      <span>{test.totalTime} minutes</span>
                                    </div>
                                  </div>
                                </div>
                                {test.accessMode === "buy" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <Price {...test} />
                                  </div>
                                )}
                              </div>

                              <div className="view-detail view-detail_new">
                                <Link
                                  className="text-center"
                                  href={{
                                    pathname: `/assessment/home/${test.slugfly}`,
                                    query: { id: test._id },
                                  }}
                                >
                                  VIEW DETAILS
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      />
                    </div>
                    <div className="d-block d-lg-none">
                      <div className="box-area-wrap box-area-wrap_new  topic">
                        {practices.map((test) => (
                          <div
                            className="box-item"
                            key={test._id}
                            style={{ width: 220 }}
                          >
                            <Link
                              href={{
                                pathname: `/assessment/home/${test.slugfly}`,
                                query: { id: test._id },
                              }}
                            >
                              <div className="box bg-white clearfix py-0">
                                <PImageComponent
                                  height={111}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                />

                                <div className="box-inner box-inner_new py-0 px-4">
                                  <div className="info p-0 m-0">
                                    <h4
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title="{{test.title}}"
                                      className="text-truncate"
                                    >
                                      {test?.title}
                                    </h4>
                                  </div>
                                  <div className="row">
                                    <div className="col">
                                      <div className="question-count mb-1">
                                        <span>
                                          {test?.totalQuestion} questions
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-auto ml-auto">
                                      <div className="time">
                                        <span>{test?.totalTime} minutes</span>
                                      </div>
                                    </div>
                                  </div>
                                  {test.accessMode === "buy" && (
                                    <div className="selling-price-info selling-price-info_new d-flex">
                                      <Price {...test} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {((practices.length == 0 && isSearch) ||
                      (practices.length == 0 &&
                        recommendedTests.length == 0)) && (
                      <div className="main-area mx-auto mw-100">
                        <div className="container">
                          <div className="search-area empty-data">
                            <figure className="mx-auto">
                              <img
                                src="/assets/images/Search-engines-rafiki1.png"
                                alt=""
                                className="img-fluid d-block mx-auto mb-4"
                              />
                            </figure>
                            <h3 className="text-center">No Data Available</h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Subjects;
