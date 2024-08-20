import Link from 'next/link'
import { useIsMobile } from '@/hooks/useMobileSize'
import PImageComponent from '@/components/AppImage'
import Price from '../price'

const TestCardContainer = ({ list, len }: { list: any[]; len: number }) => {
  const { isMobile } = useIsMobile()

  return (
    <div className="box-area box-area_new">
      {!!len && (
        <div className="row align-items-center">
          <div className="col-8">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading"> {len} Assessments</h3>
            </div>
          </div>
        </div>
      )}
      <div className="box-area-wrap box-area-wrap_new  clearfix position-relative">
        <div className="row">
          {list.map((test) => (
            <div
              key={test._id}
              className="col-lg-3 col-md-4 col-6 box-item-remove mb-3"
            >
              <div className="slider">
                <div className="box box_new bg-white pt-0">
                  {isMobile ? (
                    <PImageComponent
                      height={135}
                      fullWidth
                      imageUrl={test.imageUrl}
                      backgroundColor={test.colorCode}
                      text={test.title}
                      radius={9}
                      fontSize={15}
                      type={'assessment'}
                      testMode={test.testMode}
                    />
                  ) : (
                    <Link
                      className="cursor-pointer"
                      href={`/assessment/home/${test.title}?id=${test._id}`}
                    >
                      <PImageComponent
                        height={135}
                        fullWidth
                        imageUrl={test.imageUrl}
                        backgroundColor={test.colorCode}
                        text={test.title}
                        radius={9}
                        fontSize={15}
                        type={'assessment'}
                        testMode={test.testMode}
                      />
                    </Link>
                  )}

                  <div className="box-inner box-inner_new">
                    <div className="info p-0 m-0">
                      <h4
                        data-toggle="tooltip"
                        data-placement="top"
                        title={test.title}
                        className="text-truncate cursor-pointer"
                      >
                        {!isMobile ? (
                          <Link
                            href={`/assessment/home/${test.title}?id=${test._id}`}
                            as={`/assessment/home/${test.title}`}
                            passHref
                          >
                            {test.title.length > 40
                              ? test.title.substr(0, 40).concat('...')
                              : test.title}
                          </Link>
                        ) : (
                          <>
                            {test.title.length > 40
                              ? `${test.title.substr(0, 40)}...`
                              : test.title}
                          </>
                        )}
                      </h4>
                      <div className="form-row subjectAndMore_new small">
                        <div className="col sub1_new text-truncate">
                          <a>
                            {test.subjects &&
                              test.subjects.length &&
                              `${test.subjects[0].name}`}
                            <span className="mb-1">
                              {test.subjects?.length > 1 &&
                                `+ ${test.subjects.length - 1} more`}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="form-row small mt-1">
                      <div className="col-6">
                        <div className="question-count">
                          <span>{`${
                            test.questionsToDisplay || test.totalQuestion
                          } questions`}</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="time text-right">
                          <span>{`${test.totalTime} minutes`}</span>
                        </div>
                      </div>
                    </div>

                    {test.accessMode === 'buy' && (
                      <div className="selling-price-info selling-price-info_new d-flex">
                        <Price {...test} />
                      </div>
                    )}
                  </div>

                  <div className="view-detail view-detail_new">
                    <Link
                      href={`/assessment/home/${test.title}?id=${test._id}`}
                      className="text-center"
                    >
                      VIEW DETAILS
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestCardContainer
