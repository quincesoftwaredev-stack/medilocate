import React from 'react'
import styles from '../../styles/User/Navigator.module.css'
import Image from 'next/image'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import MapIcon from '@mui/icons-material/Map'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import LogoutIcon from '@mui/icons-material/Logout'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRouter } from 'next/router'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useSelector } from 'react-redux'

const Navigator = () => {
  const router = useRouter()
  const userInfo = useSelector(state => state.user.userInfo)
  const userId = userInfo?.id || userInfo?._id
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div className={styles.avater}>
          <Image
            src='https://cdn-icons-png.flaticon.com/128/13799/13799254.png'
            width={60}
            height={60}
            alt=''
          />
        </div>
        <div className={styles.name}>Sohanur Rahman</div>
        <div className={styles.joined}>Joined Mar Thu 2024</div>
      </div>
      <div className={styles.navigators}>
        <div className={styles.item} onClick={() => router.push('/admin')}>
          <div className={styles.icon}>
            <AdminPanelSettingsIcon />
          </div>
          <div className={styles.title}>Admin Panel</div>
        </div>
        <div className={styles.item} onClick={() => router.push(userId ? `/user/${userId}/dashboard` : '/login')}>
          <div className={styles.icon}>
            <DashboardIcon />
          </div>
          <div className={styles.title}>Dashboard</div>
        </div>
        <div className={styles.item}>
          <div className={styles.icon}>
            <AccountBoxIcon />
          </div>
          <div className={styles.title}>Profile</div>
        </div>
        <div
          className={styles.item}
          onClick={() => router.push(userId ? `/user/${userId}/orders` : '/login')}
        >
          <div className={styles.icon}>
            <AssignmentTurnedInIcon />
          </div>
          <div className={styles.title}>Orders</div>
        </div>
        <div className={styles.item}>
          <div className={styles.icon}>
            <MapIcon />
          </div>
          <div className={styles.title}>Address</div>
        </div>
        <div className={styles.item}>
          <div className={styles.icon}>
            <BookmarkIcon />
          </div>
          <div className={styles.title}>Wishlist</div>
        </div>

        <div className={styles.item}>
          <div className={styles.icon}>
            <DeleteIcon />
          </div>
          <div className={styles.title}>Delete Account</div>
        </div>
        <div className={styles.item}>
          <div className={styles.icon}>
            <LogoutIcon />
          </div>
          <div className={styles.title}>Logout</div>
        </div>
      </div>
    </div>
  )
}

export default Navigator
