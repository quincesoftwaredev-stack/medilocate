import React from 'react'
import styles from '@/styles/Category/SubCategories.module.css'
import { useRouter } from 'next/router'

const SubCategories = ({ categories, setSelected }) => {
  const router = useRouter()
  return (
    <div className={styles.wrapper} onMouseLeave={() => setSelected(null)}>
      <div className={styles.flex}>
        {categories.map((i, index) => (
          <div className={styles.item}>
            {' '}
            <b
              className={styles.subcategory}
              onClick={() => router.push(`/medicines?categories=${i._id}`)}
            >
              {i.name}
            </b>
            {i.children.length > 0 &&
              i.children.map((i, index) => (
                <div
                  className={styles.subcategory}
                  style={{ fontSize: '95%' }}
                  onClick={() => router.push(`/medicines?categories=${i._id}`)}
                >
                  - {i.name}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubCategories
