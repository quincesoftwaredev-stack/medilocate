import React, { useEffect, useState } from 'react'
import styles from '../../../styles/Products/Product/ProductAsRow.module.css'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { getPrice, hexToRgba } from '@/utility/helper'
import { useDispatch, useSelector } from 'react-redux'
import { handleViewProduct } from '@/redux/pixelSlice'
import { motion } from 'framer-motion'
import Ratings from '@/components/Utility/Rating'


const ProductAsRow = ({ item, redirect, rowDirection }) => {
    const dispatch = useDispatch()
    const userInfo = useSelector(state => state.user.userInfo)
    const router = useRouter()
    const handleClick = () => {
        redirect && router.push('/medicines')
        dispatch(handleViewProduct(item))
    }

    return (
        <motion.div
            // initial={{ opacity: 0.4, scale: 0.9 }}
            // whileInView={{ opacity: 1 }}
            // transition={{ duration: 0.9 }}
            className={`${styles.wrapper} ${rowDirection && styles.wrapperC}`}
            onClick={() => handleClick()}
            onDoubleClick={() => { userInfo?.role == "admin" && router.push(`/admin/product/create?id=${item._id}`) }}
        // style={{ background: `${hexToRgba(item.imageColors[0], 0.5)}` }}
        >
            <div className={styles.pic}>
                {item.blurData ? (
                    <Image
                        src={item.thumbnail}
                        width={250}
                        height={250}
                        alt=''
                        placeholder='blur'
                        blurDataURL={item.blurData}
                    />
                ) : (
                    <Image src={item.thumbnail} width={250} height={250} alt='' />
                )}
            </div>
            <div className={styles.details}>
                <div className={styles.category}>
                    {item.categories?.map(i => i.name)[0]}
                </div>
                <div className={styles.title}>{item.name}</div>
                <Ratings ratings={item.ratings} />
                {item.discount ? (
                    <div className={styles.price__wrapper}>
                        <div className={styles.price}>
                            ৳{getPrice(item.price, item.discount)}
                        </div>
                        <div className={styles.flex}>
                            <div className={styles.price}>
                                <s>৳{getPrice(item.price)}</s>
                            </div>
                            <div className={styles.discount}>{item.discount}%</div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.price}>৳{getPrice(item.price)}</div>
                )}
            </div>
        </motion.div>
    )
}

export default ProductAsRow
