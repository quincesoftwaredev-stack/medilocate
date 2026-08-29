import React, { useState } from 'react'
import styles from '../../styles/Categories.module.css'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ListIcon from '@mui/icons-material/List'
import { useSelector } from 'react-redux'
import SkeletonDiv from '../Utility/SkeletonDiv'
import Image from 'next/image'
import { useRouter } from 'next/router'

const Categories = () => {
  const [open, setOpen] = useState(false)
  const categories = useSelector(state => state.category.categories)
  const router = useRouter()
  const [opened, setOpened] = useState('')

  return (
    <div className={styles.wrapper}>
      <div className={styles.flex}>
        <div className={styles.category__items}>
          <div className={styles.select__category}>
            Categories{' '}
            <span onClick={() => setOpen(prev => !prev)}>
              <KeyboardArrowDownIcon />
            </span>
          </div>
          {open && (
            <div className={styles.category__list} style={{ color: 'black' }}>
              {categories && (
                <div
                  className={styles.category__item}
                  onClick={() => router.push('/medicines')}
                >
                  Shop
                </div>
              )}{' '}
              {categories
                ? categories.map((item, index) => (
                    <>
                      <div
                        className={styles.category__item}
                        key={index}
                        style={
                          item.children.length > 0 ? { fontWeight: 'bold' } : {}
                        }
                      >
                        <span>{item.name}</span>
                        {item.children.length > 0 && (
                          <span
                            onClick={() =>
                              setOpened(item._id == opened ? '' : item._id)
                            }
                          >
                            {opened == item._id ? '-' : '+'}
                          </span>
                        )}
                      </div>
                      {opened == item._id &&
                        item.children.length > 0 &&
                        item.children.map((item, index) => (
                          <div
                            className={styles.category__item}
                            key={index}
                            style={
                              item.children.length > 0
                                ? { fontWeight: 'bold' }
                                : {}
                            }
                          >
                            <span>{item.name}</span>
                            {item.children.length > 0 && <span>+</span>}
                          </div>
                        ))}
                    </>
                  ))
                : [1, 2, 3, 3, 4].map((item, index) => (
                    <div className={styles.category__item} key={index}>
                      <SkeletonDiv />
                    </div>
                  ))}
            </div>
          )}
        </div>
        <div className={styles.items}>
          {categories && (
            <div
              className={styles.item}
              style={{
                minWidth: `${'Shop'.length * 8}px`
                // background: 'red'
              }}
              onClick={() => router.push(`/medicines`)}
            >
              Shop
            </div>
          )}

          {categories
            ? categories.map((item, index) => (
                <div
                  className={styles.item}
                  key={index}
                  style={{
                    minWidth: `${item.name.length * 9.4}px`,
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                  onClick={() => router.push(`/medicines?categories=${item._id}`)}
                >
                  <Image src={item.image} width='25' height='25' alt='' />
                  {item.name}
                </div>
              ))
            : [1, 2, 3, 4, 5].map((item, index) => (
                <div className={styles.item} key={index}>
                  {<SkeletonDiv />}
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}

export default Categories
