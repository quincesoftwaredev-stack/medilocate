import React, { useEffect, useState } from 'react'
import styles from '../../../styles/Admin/Orders.module.css'
import Pages from '@/components/Utility/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/router'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { showSnackBar } from '@/redux/notistackSlice'

const Payments = ({ title, dashboard, payments, totalPages, currentPage }) => {
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(router.query.query)
  const dispatch = useDispatch()
  const userInfo = useSelector(state => state.user.userInfo)
  const headers = { Authorization: `Bearer ${userInfo?.token}` }

  useEffect(() => {
    setFilteredPayments(payments)
  }, [payments])

  const updateRoute = data => {
    const queryParams = { ...router.query, ...data, page: 1 }
    router.push({
      pathname: router.pathname,
      query: queryParams,
      shallow: false
    })
  }

  const refund = async payment => {
    try {
      dispatch(startLoading())
      const { data } = await axios.get(
        `/api/payment/refund/${payment._id}`,

        {
          headers
        }
      )
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
                  // 'Select Address Status',
                  'All',
                  'Inside Dhaka',
                  'Outside Dhaka	',
                  'Dhaka Subburb'
                ].map((item, index) => (
                  <option key={index}>{item}</option>
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
                <th>Transaction ID</th>
                <th>Order Id </th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Card Brand</th>
                <th style={{ minWidth: '250px' }}>Action</th>
                {/* Add more table headers as needed */}
              </tr>
            </thead>
            <tbody>
              {[...filteredPayments]?.map((payment, index) => (
                <tr key={index}>
                  <td>{payment._id.split('').slice(0, 9)}...</td>
                  <td>{payment.orderId.split('').slice(0, 9)}...</td>
                  <td
                    onClick={() =>
                      router.push(`/admin/orders?query=${payment.phone}`)
                    }
                  >
                    {payment.currency} {payment.amount}
                  </td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.paymentStatus}</td>
                  <td>{payment.cardBrand}</td>
                  <td className={styles.action}>
                    <span onClick={() => refund(payment)}>Refund</span>
                    <span
                      onClick={() =>
                        router.push(
                          `/api/payment/refund/query?id=${payment._id}`
                        )
                      }
                    >
                      Refund Status
                    </span>
                    <span
                      onClick={() =>
                        router.push(
                          `/api/payment/transaction?id=${payment._id}`
                        )
                      }
                    >
                      Transaction
                    </span>
                  </td>
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

export default Payments
