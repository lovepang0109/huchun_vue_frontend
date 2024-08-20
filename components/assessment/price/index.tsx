import React from 'react'

interface Props {
  price: number
  discountValue?: number
  showOldPrice?: boolean
  showDiscount?: boolean
  currencyCode?: string
  digitsInfo?: string
  newPriceClass?: string
  oldPriceClass?: string
  priceClass?: string
}

const Price: React.FC<Props> = ({
  price,
  discountValue,
  showOldPrice = true,
  showDiscount = true,
  currencyCode = 'USD',
  digitsInfo = '1.2-2',
  newPriceClass = '',
  oldPriceClass = '',
  priceClass = '',
}) => {
  const discountedPrice = discountValue
    ? price - (discountValue / 100) * price
    : null

  return (
    <>
      {discountedPrice ? (
        <span className={newPriceClass}>
          <strong className={priceClass}>{currencyCode == "INR" ? '₹' : '$'}{discountedPrice.toFixed(0)}</strong>
        </span>
      ) : (
        <span className={newPriceClass}>
          <strong className={priceClass}>{currencyCode == "INR" ? '₹' : '$'}{price.toFixed(0)}</strong>
        </span>
      )}

      {discountValue && showDiscount ? (
        <span className="px-2">{discountValue}% OFF</span>
      ) : (<></>)}

      {showOldPrice && discountedPrice ? (
        <span className={oldPriceClass}>{currencyCode == "INR" ? '₹' : '$'}{price.toFixed(0)}</span>
      ) : (<></>)}
    </>
  )
}

export default Price
