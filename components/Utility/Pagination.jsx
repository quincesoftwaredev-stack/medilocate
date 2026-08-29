import React from 'react'
import { useRouter } from 'next/router'
import styles from '../../styles/Utility/Pagination.module.css'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

const Pages = ({ totalPages, currentPage }) => {
  const router = useRouter()
  const updateRoute = data => {
    const queryParams = { ...router.query, ...data }
    router.push({
      pathname: router.pathname,
      query: queryParams,
      shallow: false
    })
  }

  return (
    <div className={styles.flex}>
      <Stack spacing={2}>
        <Pagination
          count={parseInt(totalPages)}
          shape='rounded'
          page={parseInt(currentPage || router.query.page)}
          onChange={(event, newPage) => updateRoute({ page: newPage })}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'var(--ml-navy)',
              borderRadius: '10px',
              fontWeight: 'var(--ml-weight-semibold)',
              transition: 'var(--ml-transition)'
            },
            '& .MuiPaginationItem-root:hover': {
              color: 'var(--ml-teal-dark)',
              backgroundColor: 'var(--ml-mint)'
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              color: 'var(--ml-white)',
              backgroundColor: 'var(--ml-teal)'
            },
            '& .MuiPaginationItem-root.Mui-selected:hover': {
              color: 'var(--ml-white)',
              backgroundColor: 'var(--ml-teal-dark)'
            },
            '& .MuiPaginationItem-previousNext': {
              color: 'var(--ml-teal-dark)'
            }
          }}
        />
      </Stack>
    </div>
  )
}

export default Pages
