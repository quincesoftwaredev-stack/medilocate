import React from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import InsertCommentIcon from '@mui/icons-material/InsertComment'
import styles from '../../../styles/Admin/Users.module.css'
import Image from 'next/image'
import { useRouter } from 'next/router'

const RecentUsers = () => {
  const router = useRouter()
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>New Users</h3>
        <div className={styles.btn} onClick={() => router.push('/admin/user')}>
          See All
        </div>
      </div>
      <div className={styles.users}>
        {[1, 2, 2].map((item, index) => (
          <div className={styles.user} key={index}>
            <div className={styles.left}>
              <div className={styles.pic}>
                <Image
                  src='https://cdn-icons-png.flaticon.com/512/4140/4140048.png'
                  width='35'
                  height='35'
                  alt=''
                />
              </div>

              <div className={styles.info}>
                <div className={styles.name}>A test user</div>
                <div className={styles.mail}>Atest@gmail.com</div>
              </div>
            </div>
            <div className={styles.right}>
              <AccountCircleIcon />
              <InsertCommentIcon />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentUsers
