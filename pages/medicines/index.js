import Head from "next/head";
import Link from "next/link";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import PaginationComponent from "@/components/common/Pagination";

import MedicineHero from "../../components/medicines/MedicineHero";
import MedicineCategories from "../../components/medicines/MedicineCategories";
import MedicineGrid from "../../components/medicines/MedicineGrid";
import MobileCartBar from "../../components/medicines/MobileCartBar";

import styles from "../../styles/Medicines/Medicines.module.css";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
} from "../../redux/cartSlice";


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_PATH = "/api/medicines";

const ITEMS_PER_PAGE = 20;


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function MedicinesPage({
    initialMedicines = [],
    initialPagination = {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        pages: 0,
    },
    initialCategories = [],
}) {

    /*
    |--------------------------------------------------------------------------
    | REDUX
    |--------------------------------------------------------------------------
    */

    const dispatch = useDispatch();

    const cartItems = useSelector(
        (state) =>
            state.cart.items || []
    );


    /*
    |--------------------------------------------------------------------------
    | MEDICINES
    |--------------------------------------------------------------------------
    */

    const [
        medicines,
        setMedicines
    ] = useState(
        initialMedicines
    );


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [
        pagination,
        setPagination
    ] = useState(
        initialPagination
    );


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    const [
        selectedCategory,
        setSelectedCategory
    ] = useState(
        "All Medicines"
    );


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    const [
        loading,
        setLoading
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */

    const categories = useMemo(() => {

        const values = (
            initialCategories || []
        )
            .map((category) => {

                if (
                    typeof category === "object" &&
                    category !== null
                ) {

                    return (
                        category.name ||
                        category.title ||
                        ""
                    );

                }

                return String(category);

            })
            .map((category) =>
                category.trim()
            )
            .filter(Boolean);


        return [
            "All Medicines",
            ...new Set(values)
        ];

    }, [
        initialCategories
    ]);


    /*
    |--------------------------------------------------------------------------
    | FETCH MEDICINES
    |--------------------------------------------------------------------------
    */

    const fetchMedicines = async ({
        page = 1,
        searchValue = search,
        categoryValue = selectedCategory,
    } = {}) => {

        try {

            setLoading(true);


            const response =
                await axios.get(
                    API_PATH,
                    {
                        params: {
                            page,
                            limit: ITEMS_PER_PAGE,
                            search:
                                searchValue.trim(),
                            status: "active",
                            category:
                                categoryValue ===
                                    "All Medicines"
                                    ? "all"
                                    : categoryValue,
                            prescription: "all",
                            stock: "all",
                        },
                    }
                );


            const data =
                response.data || {};


            setMedicines(
                data.medicines || []
            );


            setPagination(
                data.pagination || {
                    page,
                    limit:
                        ITEMS_PER_PAGE,
                    total: 0,
                    pages: 0,
                }
            );

        } catch (error) {

            console.error(
                "Failed to fetch medicines:",
                error.response?.data ||
                error.message
            );


            setMedicines([]);

            setPagination({
                page: 1,
                limit:
                    ITEMS_PER_PAGE,
                total: 0,
                pages: 0,
            });

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SEARCH / CATEGORY
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                /*
                |--------------------------------------------------------------------------
                | Do not fetch again for the initial
                | empty/default state.
                |--------------------------------------------------------------------------
                */

                if (
                    search.trim() === "" &&
                    selectedCategory ===
                        "All Medicines"
                ) {

                    return;

                }


                fetchMedicines({
                    page: 1,
                    searchValue: search,
                    categoryValue:
                        selectedCategory,
                });

            }, 400);


        return () => {
            clearTimeout(timer);
        };

    }, [
        search,
        selectedCategory
    ]);


    /*
    |--------------------------------------------------------------------------
    | CART QUANTITY
    |--------------------------------------------------------------------------
    */

    const getCartQuantity = (
        medicineId
    ) => {

        const item =
            cartItems.find(
                (item) =>
                    String(item.id) ===
                    String(medicineId)
            );


        return (
            item?.quantity || 0
        );

    };


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const handleSearchChange = (
        event
    ) => {

        setSearch(
            event.target.value
        );

        if (
            event.target.value.trim() === "" &&
            selectedCategory ===
                "All Medicines"
        ) {

            setMedicines(
                initialMedicines
            );

            setPagination(
                initialPagination
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CLEAR SEARCH
    |--------------------------------------------------------------------------
    */

    const handleClearSearch = () => {

        setSearch("");

        if (
            selectedCategory ===
                "All Medicines"
        ) {

            setMedicines(
                initialMedicines
            );

            setPagination(
                initialPagination
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    const handleCategoryChange = (
        category
    ) => {

        setSelectedCategory(
            category
        );

    };


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (
        page
    ) => {

        if (
            page < 1 ||
            page > pagination.pages
        ) {
            return;
        }


        fetchMedicines({

            page,

            searchValue:
                search,

            categoryValue:
                selectedCategory,

        });


        window.scrollTo({

            top: 0,

            behavior: "smooth",

        });

    };


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

    const handleClearFilters = () => {

        setSearch("");

        setSelectedCategory(
            "All Medicines"
        );

        setMedicines(
            initialMedicines
        );

        setPagination(
            initialPagination
        );

    };


    /*
    |--------------------------------------------------------------------------
    | ADD TO CART
    |--------------------------------------------------------------------------
    */

    const handleAddToCart = (
        medicine
    ) => {

        dispatch(

            addToCart({

                id:
                    medicine._id,

                name:
                    medicine.name,

                genericName:
                    medicine.genericName,

                strength:
                    medicine.strength,

                dosageForm:
                    medicine.dosageForm,

                manufacturer:
                    medicine.manufacturer,

                price:
                    medicine.price,

                packSize:
                    medicine.packSize,

                image:
                    medicine.image?.url ||
                    "",

                prescriptionRequired:
                    medicine.prescriptionRequired,

            })

        );

    };


    /*
    |--------------------------------------------------------------------------
    | INCREASE
    |--------------------------------------------------------------------------
    */

    const handleIncreaseQuantity = (
        medicine
    ) => {

        dispatch(
            increaseQuantity(
                medicine._id
            )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | DECREASE
    |--------------------------------------------------------------------------
    */

    const handleDecreaseQuantity = (
        medicine
    ) => {

        dispatch(
            decreaseQuantity(
                medicine._id
            )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CART COUNT
    |--------------------------------------------------------------------------
    */

    const cartCount =
        cartItems.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    (
                        Number(
                            item.quantity
                        ) || 0
                    )
                );

            },
            0
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <>

            <Head>

                <title>
                    Order Medicine Online | MediLocate
                </title>

                <meta
                    name="description"
                    content="Order medicines online with MediLocate. Browse medicines, upload prescriptions and get fast local medicine delivery."
                />

            </Head>


            <main
                className={
                    styles.page
                }
            >


                {/* =====================================================
                    HERO
                ====================================================== */}

                <MedicineHero

                    search={
                        search
                    }

                    onSearchChange={
                        handleSearchChange
                    }

                    onClearSearch={
                        handleClearSearch
                    }

                />


                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <section
                    className={
                        styles.content
                    }
                >

                    <div
                        className={
                            styles.container
                        }
                    >


                        {/* HEADER */}

                        <div
                            className={
                                styles.sectionHeader
                            }
                        >

                            <div>

                                <span>
                                    MEDICINES
                                </span>

                                <h2>
                                    Browse medicines
                                </h2>

                            </div>


                            {cartCount > 0 && (

                                <Link
                                    href="/cart"
                                    className={
                                        styles.cartButton
                                    }
                                >

                                    <ShoppingCartOutlinedIcon />

                                    <span>
                                        Cart
                                    </span>

                                    <b>
                                        {cartCount}
                                    </b>

                                </Link>

                            )}

                        </div>


                        {/* CATEGORIES */}

                        <MedicineCategories

                            categories={
                                categories
                            }

                            selectedCategory={
                                selectedCategory
                            }

                            onCategoryChange={
                                handleCategoryChange
                            }

                        />


                        {/* RESULTS */}

                        <div
                            className={
                                styles.resultsInfo
                            }
                        >

                            <span>

                                {pagination.total || 0}

                                {" "}

                                {
                                    pagination.total === 1
                                        ? "medicine"
                                        : "medicines"
                                }

                                {" "}
                                found

                            </span>

                        </div>


                        {/* LOADING */}

                        {loading ? (

                            <div
                                className={
                                    styles.noResults
                                }
                            >

                                <p>
                                    Loading medicines...
                                </p>

                            </div>

                        ) : (

                            <MedicineGrid

                                medicines={
                                    medicines
                                }

                                getCartQuantity={
                                    getCartQuantity
                                }

                                onAdd={
                                    handleAddToCart
                                }

                                onIncrease={
                                    handleIncreaseQuantity
                                }

                                onDecrease={
                                    handleDecreaseQuantity
                                }

                                onClearFilters={
                                    handleClearFilters
                                }

                            />

                        )}


                        {/* PAGINATION */}

                        {!loading &&
                            pagination.pages >
                                1 && (

                                <PaginationComponent

                                    page={
                                        pagination.page
                                    }

                                    pages={
                                        pagination.pages
                                    }

                                    onChange={
                                        handlePageChange
                                    }

                                />

                            )}

                    </div>

                </section>

            </main>


            {/* MOBILE CART */}

            <MobileCartBar
                cartCount={
                    cartCount
                }
            />

        </>

    );

}


/*
|--------------------------------------------------------------------------
| GET SERVER SIDE PROPS
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    try {

        const {
            req
        } = context;


        const protocol =
            req.headers[
                "x-forwarded-proto"
            ] ||
            (
                process.env.NODE_ENV ===
                    "production"
                    ? "https"
                    : "http"
            );


        const host =
            req.headers.host;


        const baseUrl =
            `${protocol}://${host}`;


        /*
        |--------------------------------------------------------------------------
        | ONLY INITIAL DATA FETCH
        |--------------------------------------------------------------------------
        */

        const response =
            await axios.get(

                `${baseUrl}${API_PATH}`,

                {

                    params: {

                        page: 1,

                        limit:
                            ITEMS_PER_PAGE,

                        search: "",

                        status:
                            "active",

                        category:
                            "all",

                        prescription:
                            "all",

                        stock:
                            "all",

                    },

                    headers: {

                        Cookie:
                            req.headers.cookie ||
                            "",

                    },

                }

            );


        const data =
            response.data || {};


        console.log(
            "SSR medicines:",
            data.medicines?.length || 0
        );


        return {

            props: {

                initialMedicines:
                    data.medicines || [],

                initialPagination:
                    data.pagination || {
                        page: 1,
                        limit:
                            ITEMS_PER_PAGE,
                        total: 0,
                        pages: 0,
                    },

                initialCategories:
                    data.categories || [],

            },

        };

    } catch (error) {

        console.error(
            "Medicines SSR error:",
            error.response?.data ||
            error.message
        );


        return {

            props: {

                initialMedicines: [],

                initialPagination: {
                    page: 1,
                    limit:
                        ITEMS_PER_PAGE,
                    total: 0,
                    pages: 0,
                },

                initialCategories: [],

            },

        };

    }

}