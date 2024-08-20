"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";
import * as evaluationSvc from "@/services/evaluationService"

const Evaluation = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    title: "",
    page: 1,
    limit: 15,
  });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pendingTests, setPendingTests] = useState<any>([]);
  const [searchText, setSearchText] = useState<string>('')

  useEffect(() => {
    search();
  }, []);

  const search = (text = '') => {
    setSearchParams((prevParams) => ({ 
      ...prevParams, 
      page: 1,
      title: text 
    }));
    const params = searchParams;
    params.title = text;
    setIsSearching(true);
    setTotalItems(0);
    setPendingTests([]);
    evaluationSvc.getPendingTests({ ...params, includeCount: true }).then((res: any) => {
      setTotalItems(res.count)
      setPendingTests(res.tests)
      setIsSearching(false)
    }).catch(err => {
      setIsSearching(false)
    })
  };

  const loardMoreSearchResult = () => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      page: prevParams.page + 1,
    }));
    const params = searchParams;
    params.page = params.page + 1;
    setIsSearching(true);

    evaluationSvc.getPendingTests(params).then((res: any) => {

      const updated_pendingTests = pendingTests.concat(res.series)
      setPendingTests(updated_pendingTests)
    }).catch(err => {
      setIsSearching(false)
    })
  };

  const viewDetails = (testId: string) => {
    router.push(`/evaluation/details/${testId}`);
  };

  const reset = () => {
    setSearchParams({
      ...searchParams,
      title: ''
    });
    setSearchText('')
    search()
  }


  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">Evaluate your assessments</h1>
              <form>
                <div className="form-group mb-0">
                  <input
                    name="searchInput"
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for Assessments"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value)
                      search(e.target.value);
                    }}
                  />
                  <span>
                    <figure>
                      <img src="/assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  {searchParams.title && (
                    <button type="button" className="btn p-0" onClick={reset}>
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
      </section>
      <main className="pt-lg-3">
        <div className="main-area mx-auto mw-100">
          <div className="container">
            {pendingTests?.length > 0 ? (
              <div className="box-area box-area_new">
                <div className="card-common products_withoutslider">
                  <div className="card-header-common">
                    <div className="section_heading_wrapper">
                      <h2 className="section_top_heading">Pending Assessment</h2>
                      <p className="section_sub_heading">Assessment in which student attempt evaluation is pending</p>
                    </div>
                  </div>
                  <div className="card-body-common">
                    <div className="row">
                      {pendingTests.map((test: any) => (
                        <div key={test._id} className="col-lg-3 col-md-4 col-6 mb-3 box-item1-remove-eval-box-shadow">
                          <div className="course-item_new">
                            <div className="box box_new pt-0">
                              <div className="image-wrap cursor-pointer" onClick={() => viewDetails(test._id)}>
                                <PImageComponent
                                  height={118}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={8}
                                  type="assessment"
                                  testMode={test.testMode}
                                />
                              </div>
                              <div className="box-inner_new eval-box-inner">
                                <div className="info p-0 m-0 cursor-pointer" onClick={() => viewDetails(test._id)}>
                                  <h4 className="text-truncate">{test.title}</h4>
                                </div>
                                <div className="d-flex align-items-center my-1">
                                  <span className="material-icons mr-1">people_alt</span>
                                  <span className="stud">{test.questions} questions</span>
                                </div>
                                {test.classRooms?.length ? (
                                  <p className="text-ellipsis" title={test.classRooms.map(room => room.name).join(', ')}>
                                    {test.classRooms.map(room => room.name).join(', ')}
                                  </p>
                                ) : (
                                  <p className="mt-1">&nbsp;</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {isSearching && (
                  <div className="box-area">
                    <div className="box-area-wrap clearfix mx-0">
                      {[1, 2, 3, 4, 5].map((_, index) => (
                        <div key={index} className="box-item">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {totalItems > pendingTests.length && pendingTests.length > 0 && totalItems > searchParams.limit && (
                  <div className="load-more-result mx-auto">
                    <a className="text-center btn-outline-black px-2" onClick={loardMoreSearchResult}>Load more results</a>
                  </div>
                )}
              </div>
            ) : (
              <div className="addNoDataFullpageImgs">
                <figure>
                  <img src="/assets/images/evaluationempty.svg" alt="Not Found" />
                </figure>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Evaluation;
