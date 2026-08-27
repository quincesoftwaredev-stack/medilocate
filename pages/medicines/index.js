import Head from "next/head";
import Link from "next/link";

import { useEffect, useState } from "react";

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

import PaginationComponent from "../../components/common/Pagination";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

import styles from "../../styles/Medicines/Medicines.module.css";

import { useDispatch, useSelector } from "react-redux";

import {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
} from "../../redux/cartSlice";


/*
|--------------------------------------------------------------------------
| API PATH
|--------------------------------------------------------------------------
*/

const API_PATH =
    "/api/medicines";


/*
|--------------------------------------------------------------------------
| MEDICINES PAGE
|--------------------------------------------------------------------------
*/

export default function MedicinesPage({

    initialMedicines,

    initialPagination,

    initialCategories

}) {


    /*
    |--------------------------------------------------------------------------
    | REDUX
    |--------------------------------------------------------------------------
    */

    const dispatch =
        useDispatch();


    const cartItems =
        useSelector(
            (state) =>
                state.cart.items
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
        initialMedicines || []
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

        initialPagination || {

            page: 1,

            limit: 24,

            total: 0,

            pages: 0

        }

    );


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */

    const [
        categories,
        setCategories
    ] = useState(

        [
            "All Medicines",
            ...(initialCategories || [])
        ]

    );


    /*
    |--------------------------------------------------------------------------
    | SELECTED CATEGORY
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
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch
    ] = useState("");


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
    | FIND CART ITEM
    |--------------------------------------------------------------------------
    */

    const getCartQuantity = (
        medicineId
    ) => {

        const item =
            cartItems.find(
                (item) =>
                    item.id === medicineId
            );


        return item?.quantity || 0;

    };


    /*
    |--------------------------------------------------------------------------
    | FETCH MEDICINES
    |--------------------------------------------------------------------------
    */

    const fetchMedicines = async ({

        searchValue = search,

        categoryValue = selectedCategory,

        page = 1

    } = {}) => {

        try {

            setLoading(true);


            const params = {

                page,

                limit: 24,

                search:
                    searchValue.trim(),

                status:
                    "active",

                category:

                    categoryValue ===
                        "All Medicines"

                        ? "all"

                        : categoryValue,

                prescription:
                    "all",

                stock:
                    "all"

            };


            const {
                data
            } = await axios.get(

                API_PATH,

                {
                    params
                }

            );


            setMedicines(
                data.medicines || []
            );


            setPagination(

                data.pagination || {

                    page: 1,

                    limit: 24,

                    total: 0,

                    pages: 0

                }

            );

        } catch (error) {

            console.error(
                "Failed to fetch medicines:",
                error
            );


            setMedicines([]);

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SEARCH / CATEGORY EFFECT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                fetchMedicines({

                    searchValue:
                        search,

                    categoryValue:
                        selectedCategory,

                    page: 1

                });

            }, 400);


        return () => {

            clearTimeout(
                timer
            );

        };

    }, [
        search,
        selectedCategory
    ]);


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
                    medicine.image?.url || "",

                prescriptionRequired:
                    medicine.prescriptionRequired,

            })

        );

    };


    /*
    |--------------------------------------------------------------------------
    | INCREASE CART QUANTITY
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
    | DECREASE CART QUANTITY
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
                    (item.quantity || 0)
                );

            },

            0

        );


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (
        page
    ) => {

        if (
            page < 1 ||
            page >
            pagination.pages
        ) {

            return;

        }


        fetchMedicines({

            searchValue:
                search,

            categoryValue:
                selectedCategory,

            page

        });


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {

        setSearch("");

        setSelectedCategory(
            "All Medicines"
        );

    };


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


            <Navbar />


            <main
                className={
                    styles.page
                }
            >


                {/* =====================================================
                    HERO
                ====================================================== */}

                <section
                    className={
                        styles.hero
                    }
                >

                    <div
                        className={
                            styles.container
                        }
                    >

                        <div
                            className={
                                styles.heroContent
                            }
                        >

                            <div
                                className={
                                    styles.heroText
                                }
                            >

                                <span
                                    className={
                                        styles.eyebrow
                                    }
                                >

                                    MEDICINE DELIVERY

                                </span>


                                <h1>

                                    Get your medicines

                                    <span>
                                        delivered fast.
                                    </span>

                                </h1>


                                <p>

                                    Search for medicines,
                                    add them to your cart
                                    or simply upload your
                                    prescription.

                                </p>

                            </div>


                            {/* SEARCH */}

                            <div
                                className={
                                    styles.searchBox
                                }
                            >

                                <SearchIcon />


                                <input

                                    type="text"

                                    value={
                                        search
                                    }

                                    onChange={event =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }

                                    placeholder="Search medicine, generic name or brand..."

                                />


                                {search && (

                                    <button

                                        type="button"

                                        onClick={() =>
                                            setSearch("")
                                        }

                                        className={
                                            styles.clearSearch
                                        }

                                        aria-label="Clear search"
                                    >

                                        <CloseRoundedIcon />

                                    </button>

                                )}

                            </div>


                            {/* DELIVERY FEATURES */}

                            <div
                                className={
                                    styles.heroFeatures
                                }
                            >

                                <div>

                                    <LocalShippingOutlinedIcon />

                                    <span>
                                        Fast local delivery
                                    </span>

                                </div>


                                <div>

                                    <VerifiedOutlinedIcon />

                                    <span>
                                        Genuine medicines
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* PRESCRIPTION */}

                        <div
                            className={
                                styles.prescriptionCard
                            }
                        >

                            <div
                                className={
                                    styles.prescriptionIcon
                                }
                            >

                                <CloudUploadOutlinedIcon />

                            </div>


                            <div
                                className={
                                    styles.prescriptionContent
                                }
                            >

                                <span
                                    className={
                                        styles.prescriptionLabel
                                    }
                                >

                                    HAVE A PRESCRIPTION?

                                </span>


                                <h2>

                                    Upload it.

                                    <br />

                                    We'll handle the rest.

                                </h2>


                                <p>

                                    Don't want to search
                                    for each medicine?
                                    Upload your complete
                                    prescription and we'll
                                    help prepare your order.

                                </p>


                                <Link

                                    href="/medicines/prescription"

                                    className={
                                        styles.uploadButton
                                    }
                                >

                                    <CloudUploadOutlinedIcon />

                                    Upload Prescription

                                    <ArrowForwardRoundedIcon />

                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


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

                        {categories.length > 0 && (

                            <div
                                className={
                                    styles.categoriesWrapper
                                }
                            >

                                <div
                                    className={
                                        styles.categories
                                    }
                                >

                                    {categories.map(
                                        category => (

                                            <button

                                                key={
                                                    category
                                                }

                                                type="button"

                                                onClick={() =>
                                                    handleCategoryChange(
                                                        category
                                                    )
                                                }

                                                className={

                                                    selectedCategory ===
                                                        category

                                                        ? styles.categoryActive

                                                        : styles.category

                                                }
                                            >

                                                {category}

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {/* RESULTS COUNT */}

                        {!loading && (

                            <div
                                className={
                                    styles.resultsInfo
                                }
                            >

                                <span>

                                    {pagination.total || 0}

                                    {" "}

                                    medicines found

                                </span>

                            </div>

                        )}


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

                        ) : medicines.length > 0 ? (


                            /* GRID */

                            <div
                                className={
                                    styles.medicineGrid
                                }
                            >

                                {medicines.map(
                                    medicine => {

                                        const quantity =
                                            getCartQuantity(
                                                medicine._id
                                            );


                                        return (

                                            <article

                                                key={
                                                    medicine._id
                                                }

                                                className={
                                                    styles.medicineCard
                                                }
                                            >


                                                {/* IMAGE */}

                                                <Link

                                                    href={`/medicines/${medicine._id}`}

                                                    className={
                                                        styles.medicineImage
                                                    }
                                                >

                                                    {medicine.image?.url ? (

                                                        <img

                                                            src={
                                                                medicine.image.url
                                                            }

                                                            alt={
                                                                medicine.name
                                                            }

                                                        />

                                                    ) : (

                                                        <div
                                                            className={
                                                                styles.imagePlaceholder
                                                            }
                                                        >

                                                            {medicine.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}

                                                        </div>

                                                    )}

                                                </Link>


                                                {/* PRESCRIPTION */}

                                                {medicine.prescriptionRequired && (

                                                    <span
                                                        className={
                                                            styles.prescriptionBadge
                                                        }
                                                    >

                                                        Prescription
                                                        required

                                                    </span>

                                                )}


                                                {/* INFORMATION */}

                                                <div
                                                    className={
                                                        styles.medicineInfo
                                                    }
                                                >

                                                    <Link

                                                        href={`/medicines/${medicine._id}`}

                                                        className={
                                                            styles.medicineName
                                                        }
                                                    >

                                                        {
                                                            medicine.name
                                                        }

                                                    </Link>


                                                    <span
                                                        className={
                                                            styles.genericName
                                                        }
                                                    >

                                                        {
                                                            medicine.genericName
                                                        }

                                                    </span>


                                                    {medicine.strength && (

                                                        <span
                                                            className={
                                                                styles.strength
                                                            }
                                                        >

                                                            {
                                                                medicine.strength
                                                            }

                                                        </span>

                                                    )}


                                                    {medicine.packSize && (

                                                        <span
                                                            className={
                                                                styles.strength
                                                            }
                                                        >

                                                            {
                                                                medicine.packSize
                                                            }

                                                        </span>

                                                    )}


                                                    {medicine.manufacturer && (

                                                        <span
                                                            className={
                                                                styles.manufacturer
                                                            }
                                                        >

                                                            {
                                                                medicine.manufacturer
                                                            }

                                                        </span>

                                                    )}


                                                    {/* PRICE */}

                                                    <div
                                                        className={
                                                            styles.priceRow
                                                        }
                                                    >

                                                        <div>

                                                            <strong>

                                                                ৳
                                                                {Number(
                                                                    medicine.price ||
                                                                    0
                                                                ).toFixed(
                                                                    2
                                                                )}

                                                            </strong>

                                                        </div>


                                                        {/* CART */}

                                                        {quantity === 0 ? (

                                                            <button

                                                                type="button"

                                                                onClick={() =>
                                                                    handleAddToCart(
                                                                        medicine
                                                                    )
                                                                }

                                                                className={
                                                                    styles.addButton
                                                                }
                                                            >

                                                                <AddRoundedIcon />

                                                                Add

                                                            </button>

                                                        ) : (

                                                            <div
                                                                className={
                                                                    styles.quantityControl
                                                                }
                                                            >

                                                                <button

                                                                    type="button"

                                                                    onClick={() =>
                                                                        handleDecreaseQuantity(
                                                                            medicine
                                                                        )
                                                                    }

                                                                    aria-label="Decrease quantity"
                                                                >

                                                                    <RemoveRoundedIcon />

                                                                </button>


                                                                <strong>
                                                                    {quantity}
                                                                </strong>


                                                                <button

                                                                    type="button"

                                                                    onClick={() =>
                                                                        handleIncreaseQuantity(
                                                                            medicine
                                                                        )
                                                                    }

                                                                    aria-label="Increase quantity"
                                                                >

                                                                    <AddRoundedIcon />

                                                                </button>

                                                            </div>

                                                        )}

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </div>


                        ) : (


                            /* NO RESULTS */

                            <div
                                className={
                                    styles.noResults
                                }
                            >

                                <SearchIcon />


                                <h3>
                                    No medicines found
                                </h3>


                                <p>

                                    Try searching with
                                    another medicine or
                                    generic name.

                                </p>


                                <button

                                    type="button"

                                    onClick={
                                        clearFilters
                                    }
                                >

                                    Clear filters

                                </button>

                            </div>

                        )}


                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {pagination.pages > 1 && (

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


            {/* =====================================================
                MOBILE CART
            ====================================================== */}

            {cartCount > 0 && (

                <div
                    className={
                        styles.mobileCartBar
                    }
                >

                    <div>

                        <span>

                            {cartCount}

                            {" "}

                            item
                            {cartCount > 1
                                ? "s"
                                : ""}

                        </span>


                        <strong>
                            Ready in your cart
                        </strong>

                    </div>


                    <Link
                        href="/cart"
                    >

                        <ShoppingCartOutlinedIcon />

                        View Cart

                        <ArrowForwardRoundedIcon />

                    </Link>

                </div>

            )}


            <Footer />

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
            req.headers["x-forwarded-proto"] ||
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


        const {
            data
        } = await axios.get(

            `${baseUrl}${API_PATH}`,

            {

                params: {

                    page: 1,

                    limit: 24,

                    search: "",

                    status:
                        "active",

                    category:
                        "all",

                    prescription:
                        "all",

                    stock:
                        "all"

                },

                headers: {

                    Cookie:
                        req.headers.cookie ||
                        ""

                }

            }

        );


        const categories =
            data.categories ||
            [];


        return {

            props: {

                initialMedicines:
                    data.medicines || [],

                initialPagination:
                    data.pagination || {

                        page: 1,

                        limit: 24,

                        total: 0,

                        pages: 0

                    },

                initialCategories:
                    categories

            }

        };

    } catch (error) {

        console.error(
            "Medicines getServerSideProps error:",
            error.message
        );


        return {

            props: {

                initialMedicines:
                    [],

                initialPagination: {

                    page: 1,

                    limit: 24,

                    total: 0,

                    pages: 0

                },

                initialCategories:
                    []

            }

        };

    }

}