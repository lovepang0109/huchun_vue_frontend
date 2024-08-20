import React from 'react'

type AppImageProps = {
  height?: number
  width?: number
  imageUrl?: string
  backgroundColor?: string
  fullWidth?: boolean
  fullHeight?: boolean
  text?: string
  fontSize?: number
  radius?: number
  tBoxWidth?: number
  tBoxHeight?: number
  testMode?: string
  type?: string
  sm?: boolean
  isProctored?: boolean
  status?: ''
}
const PImageComponent: React.FC<AppImageProps> = ({
  height,
  width,
  imageUrl,
  backgroundColor,
  fullWidth = false,
  fullHeight = false,
  text,
  fontSize,
  radius,
  tBoxWidth,
  tBoxHeight,
  testMode,
  type = '',
  sm = false,
  isProctored,
  status
}) => {

  const state = {
    oWidth: fullWidth ? '100%' : `${width}px`,
    oHeight: fullHeight ? '100%' : `${height}px`,
    oRadius: `${radius}px`,
    iWidth: '100%',
    fontSize: `${fontSize}px`,
    tBoxWidth: tBoxWidth ? `${tBoxWidth}%` : '30%',
    tBoxHeight: tBoxHeight ? `${tBoxHeight}%` : '40%',
  }

  const getInitials = (string?: string) => {
    if (string) {
      const names = string.split(' ')
      let initials = names[0].substring(0, 1).toUpperCase()

      if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase()
      }
      return initials
    }
    return ""
  }

  const initialText = getInitials(text)

  return (
    <>
      {!sm && (
        <>
          {!imageUrl && !type && (
            <div
              style={{
                position: 'relative',
                height: state.oHeight,
                width: state.oWidth,
                background: backgroundColor,
                borderTopLeftRadius: state.oRadius,
                borderTopRightRadius: state.oRadius,
              }}
            >
              <div
                className="dynamic-image"
                style={{ width: tBoxWidth, height: tBoxHeight }}
              >
                <div
                  style={{
                    display: 'table',
                    width: '100%',
                    height: '100%',
                    padding: '4px',
                  }}
                >
                  <div
                    style={{ display: 'table-cell', verticalAlign: 'middle' }}
                  >
                    <h4
                      style={{
                        textAlign: 'center',
                        color: '#f45353',
                        fontSize,
                      }}
                    >
                      {initialText}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {imageUrl && type !== 'assessment' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                style={{ height: state?.oHeight, width: state?.iWidth }}
                src={imageUrl}
                alt="..."
              />
            </div>
          )}

          {!imageUrl && type === 'testseries' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                style={{ height: state?.oHeight, width: state?.iWidth }}
                src="/assets/images/testseriesDefault.jpg"
                alt="..."
              />
            </div>
          )}

          {!imageUrl && type === 'course' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                style={{ height: state?.oHeight, width: state?.iWidth }}
                src="/assets/images/defaultCourses.png"
                alt="..."
              />
            </div>
          )}

          {imageUrl && type === 'assessment' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                style={{ height: state?.oHeight, width: state?.iWidth }}
                src={imageUrl}
                alt="..."
              />
              <div className="status">
                <span
                  className="text-center text-white"
                  style={{ textTransform: 'uppercase' }}
                >
                  {isProctored ? 'proctored' : testMode}

                </span>
              </div>
            </div>
          )}
          {!imageUrl && type === 'assessment' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <div className={`image-wrap ${fullHeight ? 'h-100' : ''}`} style={{ height: '100px' }}>
                {testMode === 'learning' && (
                  <>
                    <figure className={`mx-auto ${fullHeight ? 'h-100' : ''}`}>
                      <img
                        alt="..."
                        style={{ height: state?.oHeight, width: state?.oWidth }}
                        src="/assets/images/shape-3.png"
                      />
                    </figure>

                    <div className="icon-small">
                      <figure className="m-0 max-content" >
                        <img src="/assets/images/16.png" alt="" style={{ height: '50px' }} />
                      </figure>
                    </div>

                    {/* <div className="status">
                      <span
                        className="text-center text-white"
                        style={{ textTransform: 'uppercase' }}
                      >
                        {isProctored ? 'proctored' : testMode}
                      </span>
                    </div> */}
                    <div className="flags">
                      <div className="d-flex gap-xxs align-items-start flex-column" style={{ gap: '5px' }}>
                        {/* <span className="flag flag-mode">{type}</span> */}
                        <span className="flag">learning</span>
                        {status && (
                          <span className={`flag flag-status flag-status-${status}`}>{status}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {isProctored && (
                  <>
                    <figure className={`mx-auto ${fullHeight ? 'h-100' : ''}`}>
                      <img
                        style={{ height: state?.oHeight, width: state?.oWidth }}
                        src="/assets/images/shape-2.png"
                        alt=""
                      />
                    </figure>

                    <div className="icon">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/20.png" alt="" style={{ height: '50px' }} />
                      </figure>
                    </div>

                    {/* <div className="status">
                      <span
                        className="text-center text-white"
                        style={{ textTransform: 'uppercase' }}
                      >
                        {isProctored ? 'proctored' : testMode}
                      </span>
                    </div> */}
                    <div className="flags">
                      <div className="d-flex gap-xxs align-items-start flex-column" style={{ gap: '5px' }}>
                        {/* <span className="flag flag-mode">{type}</span> */}
                        <span className="flag">proctored</span>
                        {status && (
                          <span className={`flag flag-status flag-status-${status}`}>{status}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {testMode === 'adaptive' && (
                  <>
                    <figure className={`mx-auto ${fullHeight ? 'h-100' : ''}`}>
                      <img
                        style={{ height: state?.oHeight, width: state?.oWidth }}
                        src="/assets/images/shape-3.png"
                        alt=""
                      />
                    </figure>

                    <div className="icon">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/22.png" alt="" />
                      </figure>
                    </div>

                    {/* <div className="status">
                      <span
                        className="text-center text-white"
                        style={{ textTransform: 'uppercase' }}
                      >
                        {isProctored ? 'proctored' : testMode}
                      </span>
                    </div> */}
                    <div className="flags">
                      <div className="d-flex gap-xxs align-items-start flex-column" style={{ gap: '5px' }}>
                        {/* <span className="flag flag-mode">{type}</span> */}
                        <span className="flag">adaptive</span>
                        {status && (
                          <span className={`flag flag-status flag-status-${status}`}>{status}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {testMode === 'practice' && !isProctored && (
                  <>
                    <figure className={`mx-auto ${fullHeight ? 'h-100' : ''}`}>
                      <img
                        style={{ height: state?.oHeight, width: state?.oWidth }}
                        src="/assets/images/shape-1.png"
                        alt=""
                      />
                    </figure>

                    <div className="icon">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/18.png" alt="" style={{ height: '50px' }} />
                      </figure>
                    </div>
                    {/* <div className="status">
                      <span
                        className="text-center text-white"
                        style={{ textTransform: 'uppercase' }}
                      >
                        {isProctored ? 'proctored' : testMode}
                      </span>
                    </div> */}
                    <div className="flags">
                      <div className="d-flex gap-xxs align-items-start flex-column" style={{ gap: '5px' }}>
                        {/* <span className="flag flag-mode">{type}</span> */}
                        <span className="flag">practice</span>
                        {status && (
                          <span className={`flag flag-status flag-status-${status}`}>{status}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {!imageUrl && type === 'subject' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <div className="image-wrap">
                <figure className="mx-auto">
                  <img src="/assets/images/fluid-mechnic.png" alt="image" />
                </figure>

                <div className="icon">
                  <figure className="m-0">
                    <img
                      src="/assets/images/subjectcodemode(1).png"
                      alt="image"
                    />
                  </figure>
                </div>
              </div>
            </div>
          )}

          {!imageUrl && type === 'classroom' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                src="/assets/images/classroomjpgimg.jpg"
                alt="image"
                style={{ height: state?.oHeight, width: state?.oWidth }}
              />
            </div>
          )}

          {/* testseries */}
          {!imageUrl && type === 'testSeries' && (
            <div
              style={{
                position: 'relative',
                height: state?.oHeight,
                width: state?.oWidth,
                borderTopLeftRadius: state?.oRadius,
                borderTopRightRadius: state?.oRadius,
              }}
            >
              <img
                src="/assets/images/testSSeries.jpg"
                alt="image"
                style={{ height: state?.oHeight, width: state?.oWidth }}
              />
            </div>
          )}
        </>
      )}
      {sm && (
        <>
          <div style={{ position: 'relative' }}>
            {imageUrl && type === 'assessment' && (
              <div
                style={{
                  height: state?.oHeight,
                  width: state?.oWidth,
                  borderTopLeftRadius: state?.oRadius,
                  borderTopRightRadius: state?.oRadius,
                }}
              >
                <img
                  style={{ height: state?.oHeight, width: state?.iWidth }}
                  src={imageUrl}
                  alt="image"
                />
                <div className="status">
                  <span
                    className="text-center text-white"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {isProctored ? 'proctored' : testMode}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            {!imageUrl && type === 'assessment' && (
              <div
                style={{
                  height: state?.oHeight,
                  width: state?.oWidth,
                  borderTopLeftRadius: state?.oRadius,
                  borderTopRightRadius: state?.oRadius,
                }}
              >
                {testMode === 'learning' && (
                  <div className="image-wrap">
                    <figure className="mx-auto">
                      <img
                        style={{ height: state?.oHeight, width: state?.iWidth }}
                        src="/assets/images/shape-3.png"
                        alt="..."
                      />
                    </figure>

                    <div className="icon-small">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/16.png" alt="..." />
                      </figure>
                    </div>
                  </div>
                )}

                {isProctored && (
                  <div className="image-wrap">
                    <figure className="mx-auto">
                      <img
                        style={{ height: state?.oHeight, width: state?.iWidth }}
                        src="/assets/images/shape-2.png"
                        alt="..."
                      />
                    </figure>

                    <div className="icon-small">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/20.png" alt="..." />
                      </figure>
                    </div>
                  </div>
                )}

                {testMode === 'adaptive' && (
                  <div className="image-wrap">
                    <figure className="mx-auto">
                      <img
                        style={{ height: state?.oHeight, width: state?.iWidth }}
                        src="/assets/images/shape-3.png"
                        alt=""
                      />
                    </figure>

                    <div className="icon-small">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/22.png" alt="image" />
                      </figure>
                    </div>
                  </div>
                )}

                {testMode === 'practice' && (
                  <div className="image-wrap">
                    <figure className="mx-auto ">
                      <img
                        style={{ height: state?.oHeight, width: state?.iWidth }}
                        src="/assets/images/shape-1.png"
                        alt="image"
                      />
                    </figure>

                    <div className="icon-small">
                      <figure className="m-0 max-content">
                        <img src="/assets/images/18.png" alt="image" />
                      </figure>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default PImageComponent