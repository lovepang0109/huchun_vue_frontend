import SkeletonLoaderComponent from './SkeltonLoader'

export default function TestSkeleton() {
  return (
    <div
      className={`box-area-wrap box-area-wrap_new clearfix d-none d-lg-block`}
      style={{ padding: '2%' }}
    >
      <div className="heading heading_new">
        <div className="row ">
          <div className="col-3">
            <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
          </div>
        </div>
      </div>
      <div className="box-item">
        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
      </div>
      <div className="box-item">
        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
      </div>
      <div className="box-item">
        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
      </div>
      <div className="box-item">
        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
      </div>
      <div className="box-item">
        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
      </div>
    </div>
  )
}
