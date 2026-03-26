import React, { useEffect, useState } from 'react'
import styles from '../../../styles/Admin/ProductCreate.module.css'
import Upload from '@/components/Utility/Upload'
import axios from 'axios'
import BASE_URL from '@/config'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { showSnackBar } from '@/redux/notistackSlice'
import { buttonC, themeBg } from '@/utility/const'
import AddCategory from '@/components/Admin/AddCategory'
import { setFetchAgain } from '@/redux/categorySlice'
import SelectParentCategory from '@/components/Categories/SelectParentCategory'
// Order Craetion Form
const Create = ({ category: data }) => {
  const [category, setCategory] = useState(data)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const [newCategory, setNewCategory] = useState(false)
  const categories = useSelector(state => state.category.categories)
  useEffect(() => {
    setCategory(data)
  }, [router.query])
  const userInfo = useSelector(state => state.user.userInfo)
  const headers = { Authorization: `Bearer ${userInfo?.token}` }

  const saveCategory = async () => {
    if (!category.name) {
      dispatch(
        showSnackBar({
          message: 'Please fill all the necessaary field',
          option: {
            variant: 'error'
          }
        })
      )
      return
    }
    try {
      dispatch(startLoading())
      const { data } = await axios.post(
        '/api/department',
        {
          ...category
        },
        {
          headers
        }
      )
      if (data.error) {
        dispatch(
          showSnackBar({
            message: data.error,
            option: {
              variant: 'error'
            }
          })
        )
        dispatch(finishLoading())
        return
      }
      dispatch(setFetchAgain())
      setCategory({
        name: '',
        image: ''
      })
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'New Category Created ',
          option: {
            variant: 'success'
          }
        })
      )
    } catch (error) {
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'Error While Creating Category !',
          option: {
            variant: 'error'
          }
        })
      )
    }
  }

  console.log({ categories })
  const updateCategory = async () => {
    if (!category.name) {
      setError('Pleas fill all the necessaary field')
      dispatch(
        showSnackBar({
          message: 'Please fill all the necessaary field',
          option: {
            variant: 'error'
          }
        })
      )
      return
    }
    try {
      dispatch(startLoading())
      const { data } = await axios.put(
        `/api/department/${router.query.id}`,
        {
          ...category
        },
        { headers }
      )
      // setCategory(data)
      dispatch(setFetchAgain())
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'Category Updated',
          option: {
            variant: 'default'
          }
        })
      )
    } catch (error) {
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'Error While Updating Category !',
          option: {
            variant: 'error'
          }
        })
      )
      setError('Error While Updating Category !')
    }
  }
  return (
    <div className={styles.wrapper}>
      <h2>{router.query.id ? 'Update' : 'Add'} Category</h2>
      <form className={styles.forms}>
        <div className={styles.left}>
          <div className={styles.field}>
            <label>Category Name</label>
            <input
              type='text'
              placeholder='Enter Category Name'
              value={category.name}
              onChange={e => setCategory({ ...category, name: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Category Icon</label>
            <Upload
              handle={files => {
                setCategory(prev => ({ ...prev, image: files.url }))
              }}
            />
          </div>
          <div className={styles.images}>
            {category.image ? (
              <div className={styles.image__container}>
                <Image src={category.image} alt='' width='180' height={180} />
              </div>
            ) : (
              <div
                className={styles.image__container}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                No Photo Uploaded
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label>Chose Parent Category</label>
            <div className={styles.options}>
              <SelectParentCategory
                category={category}
                setCategory={setCategory}
              />

              {/* <span
                style={{
                  background: `${themeBg}`,
                  color: `${buttonC}`,
                  padding: '3px 9px'
                }}
                onClick={() => setNewCategory(prev => !prev)}
              >
                {newCategory ? '-' : '+'}
              </span> */}
            </div>
          </div>
          {newCategory && (
            <div className={styles.field}>
              <AddCategory categories={categories} />
            </div>
          )}

          <div
            className={styles.field}
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <span
              onClick={() =>
                setCategory({ ...category, isFeatured: !category.isFeatured })
              }
            >
              {category.isFeatured ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </span>
            <span> This Category will be shown in home page</span>{' '}
          </div>
          <div
            className={styles.field}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start'
            }}
          >
            {/* <span
              onClick={() =>
                setCategory({ ...category, isShown: !category.isShown })
              }
            >
              {category.isShown ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}{' '}
            </span>
            <span>
              {' '}
              This category name will be shown in product details page
            </span>{' '} */}
          </div>
        </div>
        {/* <div className={styles.right}></div> */}
      </form>
      {error && <p style={{ color: 'red', margin: '10px' }}>{error}</p>}
      <button
        onClick={() => (router.query.id ? updateCategory() : saveCategory())}
      >
        Save Category
      </button>
    </div>
  )
}

export default Create

export async function getServerSideProps ({ query }) {
  const { id } = query

  const fetchCategory = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/department/${id}`)
    return data
  }

  const fetchCategories = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/department`)
    return data.departments
  }

  // const categories = await fetchCategories()

  if (id) {
    const category = await fetchCategory()
    return {
      props: {
        category
        // categories
      }
    }
  }

  return {
    props: {
      category: {
        name: '',
        image: '',
        children: []
      }
      // categories: categories
    }
  }
}
