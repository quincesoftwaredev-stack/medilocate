import React, { useState } from 'react'
import styles from '@/styles/Search/SearchBox2.module.css'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import SkeletonDiv from '../Utility/SkeletonDiv'
import SearchBox from '../SearchBox'
import SearchIcon from '@mui/icons-material/Search'

const SearchBox2 = ({ setOpen }) => {
  const router = useRouter()
  const categories = useSelector(state => state.category.categories)

  const updateRoute = data => {
    const queryParams = { ...router.query, ...data }
    router.push({
      pathname: '/medicines',
      query: queryParams,
      shallow: false
    })
    setOpen(false)
  }

  const [name, setName] = useState('')
  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={styles.flex}>
          <h2>
            Search
          </h2>
          <h3 onClick={() => setOpen(false)}>X</h3>
        </div>

        <div className={styles.serach}>
          <input
            type='text'
            placeholder='Search doctors ..'
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <span onClick={() => router.push(`/dr?name=${name}`)}>
            <SearchIcon />
          </span>
        </div>
        {/* price filter */}

        {/* Category Filter */}
        <div className={styles.heading}>Category</div>
        <div className={styles.filterOptions}>
          {categories
            ? categories.map((item, index) => (
              <>
                <div className={styles.option} key={index}>
                  {router.query.categories
                    ?.split(',')
                    .find(each => each == item._id) ? (
                    <div
                      className={styles.option}
                      onClick={() =>
                        updateRoute({
                          categories: null
                        })
                      }
                    >
                      <CheckBoxIcon />
                      <span
                        style={
                          item.children.length > 0
                            ? { fontWeight: 'bold' }
                            : {}
                        }
                      >
                        {item.name}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={styles.option}
                      onClick={() =>
                        updateRoute({
                          categories: item._id
                        })
                      }
                    >
                      {' '}
                      <CheckBoxOutlineBlankIcon />
                      <span
                      // style={
                      //   item.children.length > 0
                      //     ? { fontWeight: 'bold' }
                      //     : {}
                      // }
                      >
                        {item.name}
                      </span>
                    </div>
                  )}{' '}
                </div>
                {item.children.length > 0 &&
                  item.children.map((item, index) => (
                    <div
                      className={styles.option}
                      key={index}
                      style={{ marginLeft: '25px', display: 'none' }}
                    >
                      {router.query.categories
                        ?.split(',')
                        .find(each => each == item._id) ? (
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                          }}
                          onClick={() =>
                            updateRoute({
                              categories: null
                            })
                          }
                        >
                          {' '}
                          <CheckBoxIcon />
                          <span
                            style={
                              item.children.length > 0
                                ? { fontWeight: 'bold' }
                                : {}
                            }
                          >
                            {item.name}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                          }}
                          onClick={() =>
                            updateRoute({
                              categories: item._id
                            })
                          }
                        >
                          {' '}
                          <CheckBoxOutlineBlankIcon />{' '}
                          <span
                            style={
                              item.children.length > 0
                                ? { fontWeight: 'bold' }
                                : {}
                            }
                          >
                            {item.name}
                          </span>
                        </div>
                      )}{' '}
                    </div>
                  ))}
              </>
            ))
            : [1, 2, 3, 4].map((item, index) => (
              <div className={styles.option} key={index}>
                <SkeletonDiv />
              </div>
            ))}
        </div>
      </div>
      <div className={styles.right} onClick={() => setOpen(false)}></div>
    </div>
  )
}

export default SearchBox2
