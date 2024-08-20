import { useIsMobile } from "@/hooks/useMobileSize";
import PImageComponent from "../../AppImage";
import AppImage from "../../AppImage";
import Link from "next/link";
import ItemPrice from "@/components/ItemPrice";

export default function TestCard({
  test,
  addFavorite,
  removeFavorite,
}: {
  test: any;
  addFavorite: any;
  removeFavorite: any;
}) {
  const { isMobile } = useIsMobile();

  return (
    <div
      className="slider"
      style={{ width: isMobile ? 220 : 255 }}
      id={test._id}
    >
      <div className="box-item w-100" >
        <div className="box box_new bg-white pt-0">
          {isMobile ? (
            <AppImage
              height={135}
              fullWidth
              imageUrl={test.imageUrl}
              backgroundColor={test.colorCode}
              text={test.title}
              radius={9}
              fontSize={15}
              type="assessment"
              testMode={test.testMode}
            />
          ) : (
            <>
              <Link
                href={`/assessment/home/${test.title}?id=${test._id}`}
                passHref
              >
                <PImageComponent
                  height={135}
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
              <div
                className="favorite-icon"
                style={{ position: "absolute", top: "12px", right: "10px" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {!test.isFavorite ? (
                  <a onClick={() => addFavorite(test)}>
                    <figure>
                      <img
                        className="addfavrouite"
                        src="/assets/images/like-white-bg.png"
                        alt="this add favourite"
                      />
                    </figure>
                  </a>
                ) : (
                  <a onClick={() => removeFavorite(test)}>
                    <figure>
                      <img
                        className="removeFavorite"
                        src="/assets/images/like-red-bg.png"
                        alt="Remove from my favortie"
                      />
                    </figure>
                  </a>
                )}
              </div>
            </>
          )}
          <div className="box-inner box-inner_new" style={{height: '102px'}}>
            <div className="info p-0 m-0">
              <h4
                data-toggle="tooltip"
                data-placement="top"
                title={test.title}
                className="text-truncate cursor-pointer"
              >
                <Link
                  href={`/assessment/home/${test.title}?id=${test._id}`}
                  passHref
                >
                  {test.title}
                </Link>
              </h4>
              {isMobile ? (
                <div className="row pb-2">
                  {test.subjects && test.subjects.length > 0 ? (
                    <div className="col-9">
                      <a>{test.subjects[0].name}</a>
                    </div>
                  ) : null}
                  {test.subjects && test.subjects.length > 1 ? (
                    <div className="col-3">
                      <a>{test.subjects.length - 1}</a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="form-row subjectAndMore_new small">
                  <div className="col sub1_new text-truncate">
                    <a
                      data-toggle="tooltip"
                      data-placement="top"
                      title={test?.subjects[0].name}
                    >
                      {test.subjects[0].name}
                      {test.subjects.length > 1 && (
                        <span className="mb-1">
                          {" "}
                          + {test.subjects.length - 1} more{" "}
                        </span>
                      )}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-6">
                <div className="question-count">
                  <span>
                    {test.questionsToDisplay || test.totalQuestion} questions
                  </span>
                </div>
              </div>
              <div className="col-6">
                <div className="time text-right">
                  <span>{test.totalTime} minutes</span>
                </div>
              </div>
            </div>
            {test.accessMode === "buy" && (
            <div className="selling-price-info selling-price-info_new d-flex">
              <ItemPrice {...test} />
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
  );
}
