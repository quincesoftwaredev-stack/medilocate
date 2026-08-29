import React, { useEffect, useState } from 'react'
import styles from '@/styles/Category/List.module.css'
import { useSelector } from 'react-redux'
import SubCategories from './SubCategories'
import { useRouter } from 'next/router'
import SkeletonDiv from '../Utility/SkeletonDiv'
import SubCategories2 from './SubCategories2'

const List = () => {
  const categories = useSelector(state => state.category.categories)
  const [selected, setSelected] = useState(categories && categories[1])
  const router = useRouter()

  useEffect(() => {
    setSelected(categories && categories[1])
  }, [categories])

  return (
    <div className={styles.container} onMouseLeave={() => setSelected(null)}>
      {' '}
      <div
        className={styles.wrapper}
        style={categories?.length > 5 ? { justifyContent: 'flex-start' } : {}}
      >
        {categories
          ? categories?.map((i, index) => (
              <>
                {' '}
                <div
                  className={styles.item}
                  onMouseEnter={() => setSelected(i)}
                  onMouse
                  onClick={() => router.push(`/medicines?categories=${i._id}`)}
                  style={{ minWidth: `${i.name.length * 9.4}px` }}
                >
                  {i.name}
                  
                </div>
              </>
            ))
          : [1, 2, 3, 4, 5].map((item, index) => (
              <div className={styles.item} key={index}>
                {<SkeletonDiv />}
              </div>
            ))}
      </div>
      {selected?.children.length > 0 && (
        <div className={styles.subcategories}>
          <SubCategories
            categories={selected.children}
            setSelected={setSelected}
          />
        </div>
      )}
    </div>
  )
}

export default List
