import React from 'react'
import SkeletonLoaderComponent from './skeleton/SkeltonLoader'

const Loading = () => {
  return (
    <div className="box-area-wrap clearfix d-none d-lg-block">
      <div className="heading heading_new">
        <div className="row">
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
  )
}

export default Loading
