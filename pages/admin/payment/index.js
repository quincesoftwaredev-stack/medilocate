import React from 'react'
import styles from '../../../styles/Admin/Home.module.css'
import Dashboard from '@/components/Admin/Dashboard/Dashboard'
import Product from '@/components/Product'
import Payments from '@/components/Admin/Dashboard/Payments'
import BASE_URL from '@/config'
import axios from 'axios'
import { parse } from 'cookie'

const index = ({ payments, totalPages, currentPage, page }) => {
  return (
    <div className={styles.wrapper}>
      <Payments
        title={'Payments List'}
        payments={payments}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}

export default index

export async function getServerSideProps (context) {
  try {
    const { page, query, position } = context.query
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

    const response = await axios.get(
      `${BASE_URL}/api/transaction?page=${page || 1}&query=${query || ''}`,
      {
        headers
      }
    )
    const { payments, totalPages, page: currentPage } = response.data
    return {
      props: {
        title: 'Payments List',
        payments,
        totalPages,
        currentPage
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      props: {
        title: 'Payments List',
        payments: [],
        totalPages: 0,
        currentPage: 0
      }
    }
  }
}
