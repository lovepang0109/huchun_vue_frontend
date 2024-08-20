import { useState } from 'react'

const ReadMore = ({ children }: { children: any }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  // readmore
  return (
    <>
      <div style={
        !isCollapsed ? { height: '65px', overflow: 'hidden' } : {}
      }>{children}</div>
      <a className='pull-right mt-1' style={{ float: 'right' }} onClick={() => setIsCollapsed(!isCollapsed)}>{
        !isCollapsed ? "Read more" : 'Read less'}</a>
    </>
  )
}

export default ReadMore