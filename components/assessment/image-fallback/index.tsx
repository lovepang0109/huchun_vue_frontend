import Image from 'next/image'
import { useState } from 'react'

const ImageFallback = (props: any) => {
  const { src, fallbackSrc, ...rest } = props
  const [imgErr, setImgErr] = useState(false)
  return (
    <Image
      src={imgErr ? fallbackSrc : src}
      onError={() => setImgErr(true)}
      {...rest}
    alt=''/>
  )
}

export default ImageFallback
