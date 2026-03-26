// 'use server'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import TopNav from '@/components/TopNav'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import Catergory from './dr/[category]'
import Categories from '@/components/Categories/Categories'
import ProductsByCategory from '@/components/Products/ProductsByCategory'
import Footer from '@/components/Footer'
import BASE_URL from '@/config'
import axios from 'axios'
import Header2 from '@/components/Header/Header2'
import Header3 from '@/components/Header/Header3'
import List from '@/components/Categories/List'
import List2 from '@/components/Categories/List2'
import ProductsByCategory2 from '@/components/Products/ProductsByCategory2'
import ProductsInColumn from '@/components/Products/ProductsInColumn'
import Off from '@/components/Offer/Off'
import Features from '@/components/Offer/Features'
import Row from '@/components/Categories/Explore/Row'
import ShopNow from '@/components/Offer/ShopNow'
import Subscribe from '@/components/Offer/Subscribe'
import { NextSeo } from 'next-seo'
import { generateSeoData } from '@/utility/helper'
import { seoData } from '@/utility/const'
import Grid from '@/components/Categories/Explore/Grid'
import users from '@/utility/data'
import MapPicker from '@/components/Utility/MapPicker'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'


export default function Home({ contents, departments, symptoms }) {
  const location = useSelector(state => state.user.location)
  const [doctors, setDoctors] = useState([])
  const [incoming, setIncoming] = useState(false)

  const fetchUsers = async () => {
    try {
      setIncoming(true)
      let params = location?.lat ? {
        lat: location.lat, lng: location.lng, radius: 10
      } : { radius: 10 }
      const { data } = await axios.get(
        "/api/user/filter",
        { params }
      )
      setDoctors(data.users)
      setIncoming(false)

    } catch (error) {
      console.log(error)

    }
  }

  useEffect(() => {
    fetchUsers()
  }, [location?.lat])

  return (
    <>
      <NextSeo
        title="mediLocate.health – Book a Doctor at Home সহজে"
        description="Connect with licensed doctors and schedule home visits at your convenience. Chat with doctors, agree on a time, and get medical care at your doorstep with mediLocate.health."
        openGraph={{
          title: "mediLocate.health – Doctor at Your Door",
          description:
            "Skip the hospital. Chat with trusted doctors and schedule a home visit at a time that works for you. সহজে ডাক্তার বাসায় আনুন with mediLocate.health.",
          url: BASE_URL,
          site_name: "mediLocate.health",
          images: [
            {
              url:
                contents?.find(i => i.position === "header")?.image ||
                `${BASE_URL}/images/medilocate.jpg`,
              width: 1200,
              height: 630,
              alt: "mediLocate.health – Doctor Home Visit Service",
            },
          ],
          type: "website",
        }}
        twitter={{
          handle: "@medilocate",
          site: "@medilocate",
          cardType: "summary_large_image",
        }}
      />




      <div className={styles.wrapper}>

        <Header3 contents={contents.filter(i => i.position == "header")} />
        <div className={styles.categoriesInRow}>
          <Row items={departments} />
          {/* <Grid /> */}
        </div>

        <ProductsByCategory2
          products={doctors}
          structure={'grid'}
          title={"Doctors Available For You"}
          description={"Find trusted doctors nearby and book appointments easily!"}
          incoming={incoming}
          seeMore={true}
        />

        {/* <ProductsByCategory2
          products={users}
          structure={'grid'}
          title={"Available Doctors Now"}
          description={"Consult verified doctors online anytime, anywhere!"}
        /> */}

        <div className={styles.categoriesInRow} style={{ textAlign: "center" }}>
          {/* <Row /> */}
          <div className={styles.top}>
            <h2>Chose A Symptom</h2>
            <p>Select your symptoms to find relevant healthcare services and specialists</p>
          </div>
          <Grid items={symptoms} />
        </div>
        <div className={styles.features}>
          {/* <Features /> */}
        </div>
        <div className={styles.off}>
          {/* <Subscribe content={contents.filter(i => i.position == "subscription")[0]} /> */}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  try {
    const start = new Date()
    const { data: contents } = await axios.get(
      `${BASE_URL}/api/content?show=true`
    )

    const { data: departments } = await axios.get(
      `${BASE_URL}/api/department/view`
    )

    const { data: symptoms } = await axios.get(
      `${BASE_URL}/api/symptom/view`
    )


    const end = new Date()
    console.log(`time : ${end - start}ms`)
    return {
      props: {
        contents: contents.contents,
        symptoms,
        departments
      },
      revalidate: 60 // Revalidate at most every 10 seconds
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      props: {
        contents: [],
        symptoms: [],
        departments: []
      },
      revalidate: 100 // Revalidate at most every 10 seconds
    }
  }
}
