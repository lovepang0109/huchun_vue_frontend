import CustomCarousel from "../carousel";
import Link from "next/link";

import TestSkeleton from "@/components/skeleton/TestSkeleton";
import TestCard from ".";

interface Props {
  title: string;
  subTitle: string;
  list: any[];
  showList: boolean;
  hasView?: boolean;
  link?: string;
  addFavorite: any;
  removeFavorite: any;
}

export default function TestCardContainerWithCarousel({
  title,
  subTitle,
  list,
  showList,
  hasView,
  link,
  addFavorite,
  removeFavorite,
}: Props) {
  return (
    <>
      {/* {list?.length > 0 && <TestSkeleton />} */}
      {showList && !!list?.length && (
        <div className="box-area box-area_new">
          <div className="card-common products_slider">
            <div className="card-header-common">
              <div className="row align-items-center">
                <div className="col">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">{title}</h3>
                    <p className="section_sub_heading">{subTitle}</p>
                  </div>
                </div>
                {hasView && list.length > 5 && (
                  <div className="col-auto ml-auto">
                    <div>
                      <Link
                        className="btn btn-outline btn-sm"
                        aria-label="adaptive assessments"
                        href={link!}
                      >
                        View All
                      </Link>
                    </div>

                    <div className="arrow ml-auto"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body-common">
              <div className="box-area-wrap box-area-wrap_new  clearfix d-none d-lg-block">
                <CustomCarousel
                  items={list?.map((test: any) => (
                    <TestCard
                      key={test._id}
                      test={test}
                      addFavorite={addFavorite}
                      removeFavorite={removeFavorite}
                    />
                  ))}
                />
              </div>
              <div className="box-area-wrap box-area-wrap_new  clearfix d-block d-lg-none mx-0">
                <CustomCarousel
                  items={list?.map((test: any) => (
                    <TestCard
                      key={test._id}
                      test={test}
                      addFavorite={addFavorite}
                      removeFavorite={removeFavorite}
                    />
                  ))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
