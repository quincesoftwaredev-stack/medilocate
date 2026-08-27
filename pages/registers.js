import React, { useState } from 'react'
import styles from '../styles/Login.module.css'
import Logo from '@/components/Utility/Logo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { login } from '@/redux/userSlice'
import axios from 'axios'
import { showSnackBar } from '@/redux/notistackSlice'
import { NextSeo } from 'next-seo'
import { registerSeoData } from '@/utility/const'
import { finishLoading, startLoading } from '@/redux/stateSlice'
import { validate } from 'email-validator'

const Register = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [user, setUser] = useState({})
  const createAccount = async () => {
    if (
      // !user.email ||
      // !validate(user.email) ||
      !user.password ||
      // !user.firstName ||
      // !user.lastName ||
      !user.phone ||
      !user.role

    ) {
      dispatch(
        showSnackBar({
          message: 'FIll All The Field',
          option: {
            variant: 'error'
          }
        })
      )
      return
    }
    try {
      dispatch(startLoading())

      const { data } = await axios.post('/api/user', {
        ...user
      })

      if (!data.error) {
        dispatch(login(data))
        router.push('/verify')
        dispatch(
          showSnackBar({
            message: 'Account Created',
            option: {
              variant: 'success'
            }
          })
        )
      } else {
        dispatch(
          showSnackBar({
            message: data.error,
            option: {
              variant: 'error'
            }
          })
        )
      }

      dispatch(finishLoading())
    } catch (error) {
      console.log(error)
      dispatch(finishLoading())
      dispatch(
        showSnackBar({
          message: 'Error While Creating Account !',
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
      <NextSeo {...registerSeoData} />
      <div className={styles.wrapper}>
        <div className={styles.form__container}>
          {' '}
          <div className={styles.logo}>
            <Logo />
          </div>
          <h2>Create an Account</h2>
          <form>
            {/* <input
              type='text'
              placeholder='Enter Your First Name'
              value={user?.firstName}
              onChange={e => setUser({ ...user, firstName: e.target.value })}
            />
            <input
              type='text'
              placeholder='Enter Your Last Name'
              value={user.lastName}
              onChange={e => setUser({ ...user, lastName: e.target.value })}
            /> */}

            <input
              type='text'
              placeholder='Enter Your Phone Number'
              value={user.phone}
              onChange={e => setUser({ ...user, phone: e.target.value })}
            />

            {/* <input
              type='email'
              placeholder='Enter Your Email'
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
            /> */}
            <input
              type='password'
              placeholder='Set Your Password'
              value={user.password}
              onChange={e => setUser({ ...user, password: e.target.value })}
            />
            <div className={styles.field}>
              <div >Chose Your Role</div>
              <div className={styles.flex}>
                {["doctor", "patient", "nurse"].map(i => (
                  <span onClick={() => setUser({
                    ...user, role: i
                  })} style={user.role == i ? { background: "black", color: "white" } : {}}>{i}</span>
                ))}
              </div>
            </div>
            <div className={styles.btn} onClick={() => createAccount()}>
              Create Account
            </div>
          </form>
          <p className={styles.route}>
            Already have an account ?{' '}
            <Link href='/login'>&nbsp;Sign In Here</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register
