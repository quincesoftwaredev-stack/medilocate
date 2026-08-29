import React, { useState } from 'react'
import styles from '../../styles/Cart/Checkout.module.css'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { useRouter } from 'next/router'
import { getPrice } from '@/utility/helper'
import { useDispatch } from 'react-redux'
import { showSnackBar } from '@/redux/notistackSlice'
import axios from 'axios'
import { setCoupon } from '@/redux/cartSlice'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import { handleInitiateCheckout } from '@/redux/pixelSlice'

const calculateSubtotal = cartItems => {
  let subtotal = 0
  cartItems.forEach(item => {
    subtotal +=
      (item.product.price -
        item.product.price * (item.product.discount / 100)) *
      item.quantity
  })
  return subtotal
}

const Checkout = ({ cartItems }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState({})

  const proceed = () => {
    if (cartItems.length < 1) {
      dispatch(
        showSnackBar({
          message: 'Your Cart Is Empty !',
          option: {
            variant: 'error'
          }
        })
      )
      return
    }
    // dispatch(handleInitiateCheckout(cartItems))
    router.push('/checkout')
  }

  const applyCoupon = async () => {
    if (!code) {
      dispatch(
        showSnackBar({
          message: 'Please Enter Coupon Code',
          option: {
            variant: 'error'
          }
        })
      )
      return
    }
    try {
      dispatch(startLoading())
      const { data } = await axios.get(`/api/coupon/${code}`)
      console.log({ data })
      dispatch(finishLoading())
      if (data.error) {
        dispatch(
          showSnackBar({
            message: data.error,
            option: {
              variant: 'error'
            }
          })
        )
        return
      }
      dispatch(setCoupon(data))
      dispatch(
        showSnackBar({
          message: `Enjoy ${
            data.discountType == 'percentage'
              ? `${data.discountValue}% Discount`
              : 'Free Shipping'
          }`,
          option: { variant: 'success' }
        })
      )
    } catch (error) {
      console.log({ error })
      dispatch(finishLoading())

      showSnackBar({
        message: 'Something Went Wrong !',
        option: {
          variant: 'error'
        }
      })
    }
  }
  return (
    <div className={styles.checkout__wrapper}>
      <div className={styles.flex}>
        <div className={styles.left} style={{ visibility: 'none' }}>
          <input
            type='text'
            placeholder='Coupon Code'
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button onClick={() => applyCoupon()}> Apply Coupon</button>
        </div>
        <div className={styles.right} style={{ fontSize: '110%' }}>
          Subtotal:{' '}
          <span style={{ fontWeight: 'bold' }}>
            ${getPrice(calculateSubtotal(cartItems))}
          </span>
        </div>
      </div>
      <div className={styles.flex}>
        <div className={styles.left}>
          <button>Back To Shop</button>
        </div>
        <div className={styles.right}>
          <button onClick={() => proceed()}>Proceed</button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
