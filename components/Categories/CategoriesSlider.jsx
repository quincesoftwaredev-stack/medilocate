import React, { useEffect, useState } from 'react'
import SkeletonDiv from '../Utility/SkeletonDiv'
import { useSelector } from 'react-redux'
import styles from '../../styles/Category/CategoriesSlider.module.css'
import Logo from '../Utility/Logo'
import { useRouter } from 'next/router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { themeBg } from '@/utility/const'
import FindNearMe from '../Utility/FindNearMe'

const CategoriesSlider = ({ setOpen }) => {
  const categories = useSelector(state => state.category.categories)
  const [expand, setExpand] = useState('')
  const router = useRouter()
  const [history, setHistory] = useState([])

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        {' '}
        {history.length > 0 ? (
          <Expanded
            categories={history[history.length - 1].children}
            setHistory={setHistory}
            history={history}
            setOpen={setOpen}
          />
        ) : (
          <>
            <div className={styles.top}>
              {' '}
              <Logo color={'white'} />
              <div className={styles.close__btn} onClick={() => setOpen(false)}>
                X
              </div>
            </div>
            <div className={styles.categories}>
              {categories && (
                <>
                  {' '}
                  <div className={styles.category}>
                    <div onClick={() => router.push(`/`)}>Home</div>
                  </div>
                  <div className={styles.category}>
                    <FindNearMe text={"Find Doctor"} />
                  </div>
                  <div className={styles.category}>
                    <button>Order Medicine</button>
                  </div>
                </>
              )}

              {categories
                ? categories.map((i, index) => (
                  <>
                    {' '}
                    <div className={styles.category} key={index}>
                      <div
                        onClick={() =>
                          router.push(`/dr?categories=${i._id}`)
                        }
                      >
                        {i.name}
                      </div>
                      {i.children.length > 0 && (
                        <div
                          className={styles.plus}
                          onClick={() => setHistory([...history, i])}
                        >
                          {i._id == expand ? '-' : '+'}
                        </div>
                      )}
                    </div>
                  </>
                ))
                : [1, 2, 3, 4, 5].map((i, index) => (
                  <div className={styles.category} key={index}>
                    <SkeletonDiv key={index} />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <div
        className={styles.right}
        onClick={() => {
          setOpen(false)
        }}
      ></div>
    </div>
  )
}

const Expanded = ({ categories, setHistory, history, setOpen }) => {
  const router = useRouter()
  console.log({ categories })
  return (
    <>
      <div
        className={styles.top}
        style={{ color: 'white' }}
        onClick={() =>
          setHistory(
            history.filter(i => i._id != history[history.length - 1]._id)
          )
        }
      >
        <div className={styles.icon}>
          <ArrowBackIcon />
        </div>
        <div className={styles.name}>{history[history.length - 1].name}</div>
        <div className={styles.close__btn} onClick={() => setOpen(false)}>
          X
        </div>
      </div>
      <div className={styles.categories}>
        {categories &&
          categories.map((i, index) => (
            <div className={styles.category} key={index}>
              <div onClick={() => router.push(`/medicines?categories=${i._id}`)}>
                {i.name}
              </div>
              {i.children.length > 0 && (
                <div
                  className={styles.plus}
                  onClick={() => setHistory([...history, i])}
                >
                  +{' '}
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  )
}

export default CategoriesSlider
