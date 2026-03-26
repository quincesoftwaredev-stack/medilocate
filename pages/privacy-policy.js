import React from 'react'
import styles from '@/styles/TermsAndCondition.module.css'
import { privacyPolicy } from '@/utility/data'
import { NextSeo } from 'next-seo'
import { privacyPolicySeoData } from '@/utility/const'

const privacy = () => {
  return (
    <>
      <NextSeo {...privacyPolicySeoData} />{' '}
      <div className={styles.wrapper}>
        <div>
          <h2>Privacy Policy</h2>
         
        </div>
        {privacyPolicy.slice(0, privacyPolicy.length - 2).map((item, index) => (
          <div className={styles.item} key={index}>
            <h3>
              {' '}
              {item.section}. {item.title}
            </h3>
            <p>{item.content}</p>
          </div>
        ))}
        <div className={styles.item}>
          <h3>{privacyPolicy[privacyPolicy.length - 1].title}</h3>
          <p>{privacyPolicy[privacyPolicy.length - 1].content}</p>
        </div>
      </div>
    </>
  )
}

export default privacy
