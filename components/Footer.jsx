import React from 'react'
import styles from '../styles/Footer.module.css'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Logo from './Utility/Logo'
import { useSelector } from 'react-redux'
import { chunkArray } from '@/utility/helper'
import { feacebook_page, instagram, whatsapp, footerP, support_number, support_mail } from '@/utility/const'

const Footer = () => {
  const router = useRouter()
  const categories = useSelector(state => state.category.categories)

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <Logo />
          <p className={styles.about}>{footerP}</p>
        </div>
        <div className={styles.mid}>
          <h2 className={styles.heading}>Links</h2>
          <div className={styles.flex}>
            <div className={styles.link} onClick={() => router.push('/')}>
              Home
            </div>{' '}
            <div className={styles.link} onClick={() => router.push('/')}>
              Doctor
            </div>
          </div>
          {categories &&
            chunkArray(categories, 2)?.map((i, index) => (
              <div className={styles.flex} key={index}>
                <div
                  className={styles.link}
                  onClick={() => router.push(`/dr?categories=${i[0]._id}`)}
                >
                  {i[0]?.name}
                </div>
                <div
                  className={styles.link}
                  onClick={() => router.push(`/dr?categories=${i[1]._id}`)}
                >
                  {i[1]?.name}
                </div>
              </div>
            ))}

          <div className={styles.flex}>
            <div className={styles.link} onClick={() => router.push('/login')}>
              Login
            </div>
            <div
              className={styles.link}
              onClick={() => router.push('/register')}
            >
              Register
            </div>
          </div>
          <div className={styles.flex}>
            <div
              className={styles.link}
              onClick={() => router.push('/privacy-policy')}
            >
              Privacy Policy
            </div>
            <div
              className={styles.link}
              onClick={() => router.push('/terms')}
            >
              Terms and Conditions
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <h2 className={styles.heading}>Contact</h2>
          <div className={styles.mail}>
            Medical Purbogate , Rangpur
          </div>
          <div className={styles.mail}>
            Mail: <span>
              {support_mail}
            </span>
          </div>
          <div className={styles.call}>
            Phone: <span>{support_number}</span>
          </div>
          <div className={styles.social__media__links}>
            <Image
              src={'https://cdn-icons-png.flaticon.com/128/5968/5968764.png'}
              width='35'
              height='35'
              alt=''
              onClick={() => router.push(feacebook_page)}
            />
            <Image
              src={'https://cdn-icons-png.flaticon.com/128/3955/3955024.png'}
              width='35'
              height='35'
              alt=''
              onClick={() => router.push(instagram)}
            />
            <Image
              src={'https://cdn-icons-png.flaticon.com/128/733/733585.png'}
              width='35'
              height='35'
              alt=''
              // onClick={() => router.push(whatsapp)}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer
