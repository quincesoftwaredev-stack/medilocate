import React from 'react'
import styles from '../../../styles/Admin/Home.module.css'
import Dashboard from '@/components/Admin/Dashboard/Dashboard'
import Product from '@/components/Product'
import Orders from '@/components/Admin/Dashboard/Orders'
import Symptoms from '@/components/Admin/Dashboard/Symptoms'
import axios from 'axios'
import BASE_URL from '@/config'

const index = ({ symptoms, totalPages, currentPage }) => {
  return (
    <div className={styles.wrapper}>
      <Symptoms
        symptoms={symptoms}
        totalPages={totalPages}
        currentPage={currentPage}
        title={'Symptom List'}
      />
    </div>
  )
}

export default index

export async function getServerSideProps(context) {
  try {
    const { page } = context.query
    const response = await axios.get(`${BASE_URL}/api/symptom?page=${page}`)
    const { symptoms, totalPages, page: currentPage } = response.data
    return {
      props: {
        symptoms,
        totalPages,
        currentPage
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      props: {
        title: 'Symptom List',
        symptoms: []
      }
    }
  }
}
