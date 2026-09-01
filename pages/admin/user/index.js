import React from 'react'
import styles from '../../../styles/Admin/Home.module.css'
import Dashboard from '@/components/Admin/Dashboard/Dashboard'
import Product from '@/components/Product'
import Users from '@/components/Admin/Dashboard/Users'
import BASE_URL from '@/config'
import axios from 'axios'
import { parse } from 'cookie'

const index = ({ users, totalPages, currentPage, page }) => {
  return (
    <div className={styles.wrapper}>
      <Users
        title={'Users List'}
        users={users}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}

export default index

export async function getServerSideProps(context) {
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
      `${BASE_URL}/api/user?page=${page || 1}&query=${query || ''
      }`,
      {
        headers
      }
    )
    const { users, totalPages, page: currentPage } = response.data
    return {
      props: {
        title: 'Users List',
        users,
        totalPages,
        currentPage
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      props: {
        title: 'Users List',
        users: [],
        totalPages: 0,
        currentPage: 0
      }
    }
  }
}
