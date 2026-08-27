import { useRouter } from "next/router";

import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Box from "@mui/material/Box";

import ArrowBackRoundedIcon
    from "@mui/icons-material/ArrowBackRounded";

import ArrowForwardRoundedIcon
    from "@mui/icons-material/ArrowForwardRounded";


export default function MedicinePagination({

    page = 1,

    pages = 1,

    disabled = false

}) {

    const router =
        useRouter();


    /*
    |--------------------------------------------------------------------------
    | CONVERT VALUES TO NUMBERS
    |--------------------------------------------------------------------------
    */

    const currentPage =
        parseInt(
            page,
            10
        ) || 1;


    const totalPages =
        parseInt(
            pages,
            10
        ) || 1;


    /*
    |--------------------------------------------------------------------------
    | NO PAGINATION NEEDED
    |--------------------------------------------------------------------------
    */

    if (
        totalPages <= 1
    ) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | CHANGE PAGE
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (
        event,
        newPage
    ) => {

        const query = {
            ...router.query,
            page: newPage
        };


        router.push({

            pathname:
                router.pathname,

            query

        });

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <Box

            sx={{

                display:
                    "flex",

                justifyContent:
                    "center",

                alignItems:
                    "center",

                width:
                    "100%",

                marginTop:
                    "40px",

                marginBottom:
                    "30px"

            }}

        >

            <Pagination

                count={
                    totalPages
                }

                page={
                    currentPage
                }

                onChange={
                    handlePageChange
                }

                disabled={
                    disabled
                }

                siblingCount={
                    1
                }

                boundaryCount={
                    1
                }

                showFirstButton={
                    false
                }

                showLastButton={
                    false
                }

                renderItem={(
                    item
                ) => (

                    <PaginationItem

                        {...item}

                        slots={{

                            previous:
                                ArrowBackRoundedIcon,

                            next:
                                ArrowForwardRoundedIcon

                        }}

                    />

                )}

                sx={{

                    /*
                    |--------------------------------------------------------------------------
                    | ROOT
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPagination-ul": {

                        gap:
                            "6px"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EVERY BUTTON
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root": {

                        minWidth:
                            "38px",

                        width:
                            "38px",

                        height:
                            "38px",

                        margin:
                            "0",

                        padding:
                            "0",

                        borderRadius:
                            "var(--ml-radius-sm)",

                        border:
                            "1px solid var(--ml-gray-200)",

                        backgroundColor:
                            "var(--ml-white)",

                        color:
                            "var(--ml-navy)",

                        fontSize:
                            "var(--ml-font-sm)",

                        fontWeight:
                            "var(--ml-weight-semibold)",

                        transition:
                            "var(--ml-transition)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | HOVER
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root:hover": {

                        backgroundColor:
                            "var(--ml-teal-light)",

                        borderColor:
                            "var(--ml-teal)",

                        color:
                            "var(--ml-teal-dark)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | ACTIVE / CURRENT PAGE
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root.Mui-selected": {

                        backgroundColor:
                            "var(--ml-teal)",

                        borderColor:
                            "var(--ml-teal)",

                        color:
                            "var(--ml-white)",

                        fontWeight:
                            "var(--ml-weight-bold)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | ACTIVE / CURRENT PAGE HOVER
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root.Mui-selected:hover": {

                        backgroundColor:
                            "var(--ml-teal-dark)",

                        borderColor:
                            "var(--ml-teal-dark)",

                        color:
                            "var(--ml-white)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | ARROWS
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root.MuiPaginationItem-previousNext": {

                        color:
                            "var(--ml-navy)",

                        backgroundColor:
                            "var(--ml-white)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | ELLIPSIS
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root.MuiPaginationItem-ellipsis": {

                        border:
                            "none",

                        backgroundColor:
                            "transparent",

                        color:
                            "var(--ml-gray-500)"

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | DISABLED
                    |--------------------------------------------------------------------------
                    */

                    "& .MuiPaginationItem-root.Mui-disabled": {

                        opacity:
                            1,

                        color:
                            "var(--ml-gray-300)",

                        backgroundColor:
                            "var(--ml-gray-50)",

                        borderColor:
                            "var(--ml-gray-200)"

                    }

                }}

            />

        </Box>

    );

}