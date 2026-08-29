import React, { useEffect, useState } from 'react'
import styles from '../../../styles/Admin/Orders.module.css'
import Pages from '@/components/Utility/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/router'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { showSnackBar } from '@/redux/notistackSlice'

const Users = ({
  title,
  dashboard,
  users,
  totalPages,
  currentPage
}) => {
  const [filteredUsers, setFilteredUsers] = useState(users)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(router.query.query)
  const dispatch = useDispatch()
  const userInfo = useSelector(state => state.user.userInfo)
  const headers = { Authorization: `Bearer ${userInfo?.token}` }

  useEffect(() => {
    setFilteredUsers(users)
  }, [users])

  const updateRoute = data => {
    const queryParams = { ...router.query, ...data, page: 1 }
    router.push({
      pathname: router.pathname,
      query: queryParams,
      shallow: false
    })
  }

  const remove = async id => {
    try {
      dispatch(startLoading())
      const { data } = await axios.delete(`/api/user/${id}`, { headers })
      setFilteredUsers(filteredUsers.filter(i => i._id != id))
      if (data.message) {
        dispatch(
          showSnackBar({
            message: data.message
          })
        )
      }
      dispatch(finishLoading())
    } catch (error) {
      dispatch(finishLoading())
      console.log(error)
    }
  }
  return (
    <>
      {!dashboard && <h2>{title}</h2>}

      <div className={styles.wrapper}>
        {' '}
        {dashboard && <h2>{title}</h2>}
        {!dashboard && (
          <div className={styles.flex}>
            <div className={styles.left}>
              <input
                type='text'
                placeholder='Search by name or phone '
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <span onClick={() => updateRoute({ query: searchQuery })}>
                <SearchIcon />
              </span>
            </div>
            <div
              className={styles.right}
              style={{ display: 'flex', gap: '10px' }}
            >
              <select
                onChange={e =>
                  updateRoute({ position: e.target.value.toLowerCase() })
                }
              // value={router.query.position}
              >
                {[
                  // 'Select User Status',
                  'All',
                  'Inside Dhaka',
                  'Outside Dhaka	',
                  'Dhaka Subburb'
                ].map((item, index) => (
                  <option
                    key={index}
                    selected={
                      item.toLocaleLowerCase() == router.query.position
                        ? true
                        : false
                    }
                  >
                    {item}
                  </option>
                ))}
              </select>
              {/* <button onClick={() => router.push('/admin/product/create')}>
                <span className={styles.plus__btn}>Add Product</span>
                <span className={styles.plus__icon}>+</span>
              </button> */}
            </div>
          </div>
        )}
        <div className={styles.table__wrapper}>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th> Name</th>
                <th> Phone</th>
                <th>Role</th>
                <th>Email</th>
                <th>Action</th>
                {/* Add more table headers as needed */}
              </tr>
            </thead>
            <tbody>
              {[...filteredUsers]?.map((user, index) => (
                <tr key={index}>
                  <td >{user._id.split('').slice(0, 9)}...</td>
                  <td onClick={() => router.push(`/profile/${user._id}`)}>{user.firstName}{" "}{user.lastName}</td>
                  <td
                    onClick={() =>
                      router.push(`/admin/orders?query=${user.phone}`)
                    }
                  >
                    {user.phone}
                  </td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td className={styles.action}>
                    <span onDoubleClick={() => remove(user._id)}
                    >Delete</span>
                  </td>

                  {/* Add more table cells as needed */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!dashboard && (
          <div className={styles.pagination}>
            <Pages
              totalPages={totalPages}
              currentPage={router.query.page || currentPage}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Users
