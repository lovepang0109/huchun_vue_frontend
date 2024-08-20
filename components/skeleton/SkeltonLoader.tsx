const SkeletonLoaderComponent = (props: any) => {
  const getMyStyles = () => {
    return {
      width: props.Cwidth ? `${props.Cwidth}%` : '',
      height: props.Cheight ? `${props.Cheight}px` : '',
      borderRadius: props.circle ? '50%' : '',
      margin: props.margin ? props.margin : '0',
    }
  }

  return <div style={getMyStyles()} className="skelt-load loader"></div>
}

export default SkeletonLoaderComponent
