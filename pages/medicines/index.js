import PageSeo from "@/components/SEO/PageSeo";
import Link from "next/link";
import { useRouter } from "next/router";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import axios from "axios";

import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import PaginationComponent from "@/components/common/Pagination";

import MedicineHero from "../../components/medicines/MedicineHero";
import MedicineCategories from "../../components/medicines/MedicineCategories";
import MedicineGrid from "../../components/medicines/MedicineGrid";

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

    const router = useRouter();

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

    const [catalogMedicines, setCatalogMedicines] =
        useState([]);

    useEffect(() => {
        fetch('/data/medicines-catalog.json')
            .then((response) => response.ok ? response.json() : [])
            .then((data) => {
                if (Array.isArray(data)) {
                    setCatalogMedicines(data);
                    setMedicines(data.slice(0, ITEMS_PER_PAGE));
                    setPagination({
                        page: 1,
                        limit: ITEMS_PER_PAGE,
                        total: data.length,
                        pages: Math.ceil(data.length / ITEMS_PER_PAGE),
                    });
                }
            })
            .catch(() => {
                // Database API remains the fallback until the catalog is exported.
            });
    }, []);


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
    ] = useState(
        typeof router.query.search === "string"
            ? router.query.search
            : ""
    );


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

    const resultsRef = useRef(null);

    const shouldScrollToResultsRef =
        useRef(false);


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */

    const categories = useMemo(() => {

        const values = (
            catalogMedicines.length
                ? catalogMedicines.map((medicine) => medicine.category)
                : initialCategories || []
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
        initialCategories,
        catalogMedicines
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

            if (catalogMedicines.length) {
                const normalizedSearch = searchValue.trim().toLowerCase();
                const filtered = catalogMedicines
                    .filter((medicine) => {
                        const matchesSearch =
                            !normalizedSearch ||
                            [
                                medicine.name,
                                medicine.genericName,
                                medicine.manufacturer,
                            ].some((value) =>
                                String(value || "")
                                    .toLowerCase()
                                    .includes(normalizedSearch)
                            );

                        const matchesCategory =
                            categoryValue === "All Medicines" ||
                            medicine.category === categoryValue;

                        return matchesSearch && matchesCategory;
                    })
                    .sort((a, b) => {
                        if (!normalizedSearch) return 0;

                        const aName = String(a.name || "").toLowerCase();
                        const bName = String(b.name || "").toLowerCase();

                        const aGeneric = String(
                            a.genericName || ""
                        ).toLowerCase();

                        const bGeneric = String(
                            b.genericName || ""
                        ).toLowerCase();

                        const getScore = (name, generic) => {
                            // Exact name: Napa
                            if (name === normalizedSearch) {
                                return 100;
                            }

                            // Starts with: Napa Extra
                            if (name.startsWith(normalizedSearch)) {
                                return 80;
                            }

                            // Contains: Extra Napa Plus
                            if (name.includes(normalizedSearch)) {
                                return 60;
                            }

                            // Exact generic
                            if (generic === normalizedSearch) {
                                return 40;
                            }

                            // Generic contains
                            if (generic.includes(normalizedSearch)) {
                                return 20;
                            }

                            return 0;
                        };

                        return (
                            getScore(bName, bGeneric) -
                            getScore(aName, aGeneric)
                        );
                    });
                const pageNumber = Math.max(Number(page) || 1, 1);
                const start = (pageNumber - 1) * ITEMS_PER_PAGE;
                setMedicines(filtered.slice(start, start + ITEMS_PER_PAGE));
                setPagination({
                    page: pageNumber,
                    limit: ITEMS_PER_PAGE,
                    total: filtered.length,
                    pages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
                });
                setLoading(false);
                return;
            }


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

            if (
                shouldScrollToResultsRef.current
            ) {

                shouldScrollToResultsRef.current =
                    false;

                window.requestAnimationFrame(
                    () => {
                        resultsRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }
                );

            }

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

        if (!catalogMedicines.length) {
            return undefined;
        }

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
        selectedCategory,
        catalogMedicines
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

        if (
            event.target.value.trim()
        ) {
            shouldScrollToResultsRef.current =
                true;
        }

        setSearch(
            event.target.value
        );

        if (
            event.target.value.trim() === "" &&
            selectedCategory ===
            "All Medicines"
        ) {

            const source = catalogMedicines.length
                ? catalogMedicines
                : initialMedicines;
            setMedicines(source.slice(0, ITEMS_PER_PAGE));
            setPagination({
                page: 1,
                limit: ITEMS_PER_PAGE,
                total: catalogMedicines.length
                    ? catalogMedicines.length
                    : initialPagination.total,
                pages: catalogMedicines.length
                    ? Math.ceil(catalogMedicines.length / ITEMS_PER_PAGE)
                    : initialPagination.pages,
            });

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

            const source = catalogMedicines.length
                ? catalogMedicines
                : initialMedicines;
            setMedicines(source.slice(0, ITEMS_PER_PAGE));
            setPagination({
                page: 1,
                limit: ITEMS_PER_PAGE,
                total: catalogMedicines.length
                    ? catalogMedicines.length
                    : initialPagination.total,
                pages: catalogMedicines.length
                    ? Math.ceil(catalogMedicines.length / ITEMS_PER_PAGE)
                    : initialPagination.pages,
            });

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

        shouldScrollToResultsRef.current =
            true;

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

        router.push(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page,
                },
            },
            undefined,
            { shallow: true }
        );


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

            <PageSeo title="Search & Order Medicines Online | MediLocate" description="Search medicines by brand or generic name, compare essential details and add the quantity you need to your MediLocate cart for convenient delivery." path="/medicines" keywords="search medicine online, order medicine Bangladesh, generic medicine search, medicine delivery" schemaType="CollectionPage" />


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



                        </div>


                        {/* CATEGORIES */}

                        {/* <MedicineCategories

                            categories={
                                categories
                            }

                            selectedCategory={
                                selectedCategory
                            }

                            onCategoryChange={
                                handleCategoryChange
                            }

                        /> */}


                        {/* RESULTS */}

                        <div
                            ref={
                                resultsRef
                            }
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


        </>

    );

}


/*
|--------------------------------------------------------------------------
| GET SERVER SIDE PROPS
|--------------------------------------------------------------------------
*/

