import React, { useEffect, useState } from 'react'
import styles from '../../../styles/Admin/Orders.module.css'
import Pages from '@/components/Utility/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/router'
import Image from 'next/image'
import axios from 'axios'
import { showSnackBar } from '@/redux/notistackSlice'
import { useDispatch, useSelector } from 'react-redux'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import { setFetchAgain } from '@/redux/categorySlice'

const Categories = ({
  title,
  dashboard,
  currentPage,
  totalPages,
  categories
}) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState(categories)
  const dispatch = useDispatch()
  const userInfo = useSelector(state => state.user.userInfo)
  const headers = { Authorization: 'Bearer ' + userInfo?.token }
  useEffect(() => {
    setFilteredCategories(categories)
  }, [categories])

  // Function to handle search query change
  const handleSearchChange = e => {
    const query = e.target.value
    setSearchQuery(query)

    // Filter products based on the search query
    const filtered = categories.filter(
      c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c._id.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredCategories(filtered)
  }

  const remove = async id => {
    try {
      dispatch(startLoading())
      const { data } = await axios.delete(`/api/category/${id}`, { headers })
      setFilteredCategories(filteredCategories.filter(i => i._id != id))
      dispatch(finishLoading())
      dispatch(showSnackBar({ message: 'Category Removed !' }))
      dispatch(setFetchAgain())
    } catch (error) {
      console.log({ error })
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'Error While Deleting Category !',
          option: {
            variant: 'error'
          }
        })
      )
    }
  }

  return (
    <>
      {' '}
      {!dashboard && <h2>{title}</h2>}
      <div className={styles.wrapper} id='categories'>
        {dashboard && <h2>{title}</h2>}
        {!dashboard && (
          <div className={styles.flex}>
            <div className={styles.left}>
              <input
                type='text'
                placeholder=''
                onChange={e => handleSearchChange(e)}
              />
              <span>
                <SearchIcon />
              </span>
            </div>
            <div className={styles.right}>
              <button onClick={() => router.push('/admin/department/create')}>
                <span className={styles.plus__btn}>Add One</span>
                <span className={styles.plus__icon}>+</span>
              </button>{' '}
            </div>
          </div>
        )}
        <div className={styles.table__wrapper}>
          {' '}
          <table>
            <thead>
              <tr>
                <th>Category Id</th>
                <th>Category Name</th>
                <th>Category Icon</th>
                {/* <th>CreatedAt</th> */}
                <th>Action</th>
                {/* Add more table headers as needed */}
              </tr>
            </thead>
            <tbody>
              {[...filteredCategories]?.map((c, index) => (
                <tr key={index}>
                  <td>{c._id}</td>
                  <td>{c.name}</td>
                  <td>
                    {c.image && (
                      <Image src={c.image} width='50' height='50' alt='' />
                    )}
                   
                  </td>

                  <td className={styles.action}>
                    <span onDoubleClick={() => remove(c._id)}>Delete</span>
                    <span
                      onClick={() =>
                        router.push(`/admin/department/create?id=${c._id}`)
                      }
                    >
                      View
                    </span>
                  </td>
                  {/* Add more table cells as needed */}
                </tr>
              ))}
            </tbody>
          </table>{' '}
        </div>
        {!dashboard && (
          <div className={styles.pagination}>
            <Pages totalPages={totalPages} currentPage={currentPage} />
          </div>
        )}
      </div>
    </>
  )
}

export default Categories
