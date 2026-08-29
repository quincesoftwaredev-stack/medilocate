import React, { useEffect, useState } from 'react'
import styles from '@/styles/Category/List2.module.css'
import { useSelector } from 'react-redux'
import SubCategories from './SubCategories'
import { useRouter } from 'next/router'
import SkeletonDiv from '../Utility/SkeletonDiv'
import SubCategories2 from './SubCategories2'

const List2 = () => {
  const categories = useSelector(state => state.category.categories)?.slice(
    0,
    7
  )
  const [selected, setSelected] = useState({})
  const router = useRouter()
  const [expanded, setExapanded] = useState({})

  return (
    <div className={styles.container}>
      <div className={styles.wrapper} onMouseLeave={() => setSelected(null)}>
        {categories?.length > 0
          ? <>
            <div
              className={styles.item}
              style={{ minWidth: `${"home".length * 9.8}px` }}
            >
              <span

                onClick={() => router.push(`/`)}
              >
                Home
              </span>
            </div>
            <div
              className={styles.item}
              style={{ minWidth: `${"shop".length * 8.5}px` }}
            >
              <span

                onClick={() => router.push(`/medicines`)}
              >
                Shop
              </span>
            </div>
            {categories?.map((i, index) => (
              <>
                <div
                  className={styles.item}
                  style={{ minWidth: `${i.name.length * 8.1}px` }}
                >
                  <span
                    onMouseEnter={() => {
                      setSelected(i)
                      setExapanded()
                    }}
                    onClick={() => router.push(`/medicines?categories=${i._id}`)}
                  >
                    {i.name}
                  </span>
                  {i == selected && i.children.length > 0 && (
                    <div className={styles.items}>
                      {i.children.map((i, index) => (
                        <div
                          className={styles.category}
                          onMouseEnter={() => {
                            setExapanded(i)
                          }}
                          // onMouseLeave={() => setExapanded({})}
                          style={expanded == i ? { position: 'relative' } : {}}
                        >
                          <span
                            onClick={() =>
                              router.push(`/medicines?categories=${i._id}`)
                            }
                          >
                            {i.name}
                          </span>
                          {i.children.length > 0 && (
                            <span className={styles.plus}>
                              +
                              {expanded && expanded == i && (
                                <div
                                  className={styles.moreItems}
                                  onMouseLeave={() => setExapanded({})}
                                  style={
                                    categories.findIndex(
                                      i => i._id === selected._id
                                    ) >=
                                      categories.length / 2
                                      ? { right: '160px' }
                                      : { left: '160px' }
                                  }
                                >
                                  {expanded?.children?.map((i, index) => (
                                    <div
                                      className={styles.expanded_category}
                                      onClick={() =>
                                        router.push(`/medicines?categories=${i._id}`)
                                      }
                                    >
                                      {i.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ))}
          </>
          : [1, 2, 3, 4, 5].map((item, index) => (
            <div className={styles.item} key={index}>
              {<SkeletonDiv />}
            </div>
          ))}
      </div>
    </div>
  )
}

export default List2
