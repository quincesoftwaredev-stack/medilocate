import React from 'react'
import styles from '@/styles/TermsAndCondition.module.css'
import { termsAndConditions } from '@/utility/data'
import { NextSeo } from 'next-seo'
import { TermsAndConditionSeoData } from '@/utility/const'
import Link from 'next/link'

const termAndCondition = () => {
  return (
    <>
      {' '}
      <NextSeo {...TermsAndConditionSeoData} />
      <div className={styles.wrapper}>
        <div>
          <h2>Terms and Conditions</h2>
          <p>
            Welcome to Medilocate.Health! These terms and conditions outline
            the rules and regulations for the use of [Your Company Name]'s
            Website, located at <Link href="https://medilocate.health" >https://medilocate.health</Link>.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and
            conditions. Do not continue to use Medilocate.health if you do not
            agree to take all of the terms and conditions stated on this page.
          </p>
        </div>
        {termsAndConditions
          .slice(0, termsAndConditions.length - 2)
          .map((item, index) => (
            <div className={styles.item} key={index}>
              <h3>
                {' '}
                {item.section}. {item.title}
              </h3>
              <p>{item.content}</p>
            </div>
          ))}
        <div className={styles.item}>
          <h3>{termsAndConditions[termsAndConditions.length - 1].title}</h3>
          <p>{termsAndConditions[termsAndConditions.length - 1].content}</p>
        </div>
      </div>
    </>
  )
}

export default termAndCondition
