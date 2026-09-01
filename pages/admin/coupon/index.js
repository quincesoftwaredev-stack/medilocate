import React from 'react'
import styles from '../../../styles/Admin/Home.module.css'
import Dashboard from '@/components/Admin/Dashboard/Dashboard'
import Product from '@/components/Product'
import Orders from '@/components/Admin/Dashboard/Orders'
import Coupons from '@/components/Admin/Dashboard/Coupons'
import axios from 'axios'
import BASE_URL from '@/config'
import { parse } from 'cookie'

const index = ({ coupons, totalPages, currentPage }) => {
  return (
    <div className={styles.wrapper}>
      <Coupons
        coupons={coupons}
        totalPages={totalPages}
        currentPage={currentPage}
        title={'Coupon List'}
      />
    </div>
  )
}

export default index

export async function getServerSideProps (context) {
  try {
    const { page } = context.query
    const { id } = context.query
    const { locale, req } = context
    const cookies = parse(req.headers.cookie || '')

    const userInfo = cookies['userInfo']
      ? JSON.parse(cookies['userInfo'])
      : null

    if (!userInfo || !userInfo.token) {
      throw new Error('User is not authenticated')
    }

    const headers = { Authorization: `Bearer ${userInfo.token}` }

    const response = await axios.get(`${BASE_URL}/api/coupon?page=${page}`, {
      headers
    })

    const { coupons, totalPages, page: currentPage } = response.data
    return {
      props: {
        coupons,
        totalPages,
        currentPage
      }
    }
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return {
      props: {
        title: 'Coupon List',
        Coupons: []
      }
    }
  }
}
