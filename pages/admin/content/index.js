import React from 'react'
import styles from '../../../styles/Admin/Home.module.css'
import Dashboard from '@/components/Admin/Dashboard/Dashboard'
import Product from '@/components/Product'
import Orders from '@/components/Admin/Dashboard/Orders'
import Contents from '@/components/Admin/Dashboard/Contents'
import axios from 'axios'
import BASE_URL from '@/config'

const index = ({ contents, totalPages, currentPage }) => {
  return (
    <div className={styles.wrapper}>
      <Contents
        contents={contents}
        totalPages={totalPages}
        currentPage={currentPage}
        title={'Content List'}
      />
    </div>
  )
}

export default index

export async function getServerSideProps (context) {
  try {
    const { page } = context.query
    const response = await axios.get(`${BASE_URL}/api/content?page=${page}`)
    const { contents, totalPages, page: currentPage } = response.data
    return {
      props: {
        contents,
        totalPages,
        currentPage
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      props: {
        title: 'Product List',
        contents: []
      }
    }
  }
}
