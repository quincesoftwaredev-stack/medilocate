import React from 'react'
import { useRouter } from 'next/router'
import styles from '../../styles/Utility/Pagination.module.css'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

const Pages = ({ totalPages, currentPage, count = totalPages, page = currentPage, onChange, ...props }) => {
  const router = useRouter()
  const updateRoute = data => {
    const queryParams = { ...router.query, ...data }
    router.push({
      pathname: router.pathname,
      query: queryParams
    })
  }

  return (
    <div className={styles.flex}>
      <Stack spacing={2}>
        <Pagination
          count={Math.max(1, parseInt(count, 10) || 1)}
          shape='rounded'
          page={Math.max(1, parseInt(page ?? router.query.page, 10) || 1)}
          onChange={onChange || ((event, newPage) => updateRoute({ page: newPage }))}
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
          {...props}
        />
      </Stack>
    </div>
  )
}

export default Pages
