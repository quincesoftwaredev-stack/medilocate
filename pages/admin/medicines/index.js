import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import axios from "axios";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";



import styles from "@/styles/Admin/Medicines/Medicines.module.css";

import { useSelector } from "react-redux";


/*
|--------------------------------------------------------------------------
| FILTER OPTIONS
|--------------------------------------------------------------------------
*/

const statusOptions = [
    {
        value: "all",
        label: "All Status",
    },
    {
        value: "active",
        label: "Active",
    },
    {
        value: "inactive",
        label: "Inactive",
    },
];


const stockOptions = [
    {
        value: "all",
        label: "All Stock",
    },
    {
        value: "in_stock",
        label: "In Stock",
    },
    {
        value: "low_stock",
        label: "Low Stock",
    },
    {
        value: "out_of_stock",
        label: "Out of Stock",
    },
];


const prescriptionOptions = [
    {
        value: "all",
        label: "All Medicines",
    },
    {
        value: "required",
        label: "Prescription Required",
    },
    {
        value: "not_required",
        label: "No Prescription",
    },
];


/*
|--------------------------------------------------------------------------
| STOCK META
|--------------------------------------------------------------------------
*/

const getStockMeta = (
    stock,
    reorderLevel
) => {

    if (
        Number(stock) <= 0
    ) {

        return {
            label: "Out of stock",
            className: "outOfStock",
            icon: ErrorOutlineRoundedIcon,
        };

    }


    if (
        Number(stock) <=
        Number(reorderLevel)
    ) {

        return {
            label: "Low stock",
            className: "lowStock",
            icon: WarningAmberRoundedIcon,
        };

    }


    return {
        label: "In stock",
        className: "inStock",
        icon: CheckCircleOutlineRoundedIcon,
    };

};


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function AdminMedicinesPage(
    props
) {

    const router = useRouter();


    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const userInfo =
        useSelector(
            (state) =>
                state.user?.userInfo
        );


    /*
    |--------------------------------------------------------------------------
    | SERVER DATA
    |--------------------------------------------------------------------------
    */

    const [medicines, setMedicines] =
        useState(
            props.medicines || []
        );


    /*
    |--------------------------------------------------------------------------
    | SEARCH / FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState(
            props.filters?.search || ""
        );


    const [status, setStatus] =
        useState(
            props.filters?.status || "all"
        );


    const [stockStatus, setStockStatus] =
        useState(
            props.filters?.stock || "all"
        );


    const [prescription, setPrescription] =
        useState(
            props.filters?.prescription ||
            "all"
        );


    const [category, setCategory] =
        useState(
            props.filters?.category || "all"
        );


    /*
    |--------------------------------------------------------------------------
    | UI STATE
    |--------------------------------------------------------------------------
    */

    const [deleteMedicine, setDeleteMedicine] =
        useState(null);


    const [deleting, setDeleting] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | UPDATE DATA WHEN SSR PROPS CHANGE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setMedicines(
            props.medicines || []
        );

    }, [
        props.medicines
    ]);


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    |
    | Your current API does not return a separate category list.
    | We derive available categories from the current response.
    |
    */

    const categories =
        Array.from(
            new Set(
                (medicines || [])
                    .map(
                        (medicine) =>
                            medicine.category
                    )
                    .filter(Boolean)
            )
        );


    /*
    |--------------------------------------------------------------------------
    | STATS
    |--------------------------------------------------------------------------
    */

    const activeCount =
        medicines.filter(
            (medicine) =>
                medicine.status ===
                "active"
        ).length;


    const prescriptionCount =
        medicines.filter(
            (medicine) =>
                medicine.prescriptionRequired
        ).length;


    const lowStockCount =
        medicines.filter(
            (medicine) =>
                Number(
                    medicine.stock
                ) > 0 &&
                Number(
                    medicine.stock
                ) <= Number(
                    medicine.reorderLevel
                )
        ).length;


    const outOfStockCount =
        medicines.filter(
            (medicine) =>
                Number(
                    medicine.stock
                ) <= 0
        ).length;


    /*
    |--------------------------------------------------------------------------
    | APPLY FILTERS
    |--------------------------------------------------------------------------
    */

    const handleFilterSubmit = (
        event
    ) => {

        event.preventDefault();


        const query = {};


        if (
            search.trim()
        ) {

            query.search =
                search.trim();

        }


        if (
            status !== "all"
        ) {

            query.status =
                status;

        }


        if (
            stockStatus !== "all"
        ) {

            query.stock =
                stockStatus;

        }


        if (
            prescription !== "all"
        ) {

            query.prescription =
                prescription;

        }


        if (
            category !== "all"
        ) {

            query.category =
                category;

        }


        query.page = 1;


        router.push({
            pathname:
                "/admin/medicines",
            query,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | RESET FILTERS
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {

        setSearch("");

        setStatus("all");

        setStockStatus("all");

        setPrescription("all");

        setCategory("all");


        router.push(
            "/admin/medicines"
        );

    };


    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const handleRefresh = () => {

        router.replace(
            router.asPath
        );

    };


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const handleDelete = async () => {

        if (
            !deleteMedicine
        ) {
            return;
        }


        try {

            setDeleting(true);


            await axios.delete(

                `/api/admin/medicines/${deleteMedicine._id}`,

                {
                    headers: {

                        Authorization:
                            `Bearer ${
                                userInfo?.token ||
                                ""
                            }`,

                    },

                }

            );


            /*
             * Remove immediately from UI.
             */

            setMedicines(
                (previous) =>
                    previous.filter(
                        (medicine) =>
                            medicine._id !==
                            deleteMedicine._id
                    )
            );


            setDeleteMedicine(
                null
            );


        } catch (error) {

            console.error(
                "Delete medicine error:",
                error
            );


            alert(
                error
                    ?.response
                    ?.data
                    ?.message ||
                "Failed to delete medicine."
            );


        } finally {

            setDeleting(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const pagination =
        props.pagination || {

            page: 1,

            limit: 20,

            total:
                medicines.length,

            pages: 1,

        };


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


        router.push({

            pathname:
                "/admin/medicines",

            query: {

                ...router.query,

                page,

            },

        });

    };


    return (
        <>

            <Head>

                <title>
                    Medicines | MediLocate Admin
                </title>


                <meta
                    name="description"
                    content="Manage the MediLocate medicine catalog."
                />

            </Head>




            <main
                className={
                    styles.page
                }
            >

                <div
                    className={
                        styles.container
                    }
                >


                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header
                        className={
                            styles.pageHeader
                        }
                    >

                        <div>

                            <div
                                className={
                                    styles.titleRow
                                }
                            >

                                <div
                                    className={
                                        styles.titleIcon
                                    }
                                >

                                    <MedicalServicesOutlinedIcon />

                                </div>


                                <div>

                                    <span
                                        className={
                                            styles.eyebrow
                                        }
                                    >
                                        PHARMACY CATALOG
                                    </span>


                                    <h1>
                                        Medicines
                                    </h1>

                                </div>

                            </div>


                            <p>
                                Manage your medicine catalog,
                                prices, stock and prescription requirements.
                            </p>

                        </div>


                        <div
                            className={
                                styles.headerActions
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.refreshButton
                                }
                                onClick={
                                    handleRefresh
                                }
                            >

                                <RefreshRoundedIcon />

                                Refresh

                            </button>


                            <Link
                                href="/admin/medicines/new"
                                className={
                                    styles.addButton
                                }
                            >

                                <AddRoundedIcon />

                                Add Medicine

                            </Link>

                        </div>

                    </header>


                    {/* =====================================================
                        STATS
                    ====================================================== */}

                    <section
                        className={
                            styles.statsGrid
                        }
                    >

                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={
                                    styles.statIcon
                                }
                            >

                                <MedicalServicesOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Total Medicines
                                </span>

                                <strong>
                                    {
                                        pagination.total
                                    }
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.activeIcon}`}
                            >

                                <CheckCircleOutlineRoundedIcon />

                            </div>


                            <div>

                                <span>
                                    Active
                                </span>

                                <strong>
                                    {
                                        activeCount
                                    }
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.prescriptionIcon}`}
                            >

                                <DescriptionOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Prescription Required
                                </span>

                                <strong>
                                    {
                                        prescriptionCount
                                    }
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.lowStockIcon}`}
                            >

                                <WarningAmberRoundedIcon />

                            </div>


                            <div>

                                <span>
                                    Low Stock
                                </span>

                                <strong>
                                    {
                                        lowStockCount
                                    }
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.outStockIcon}`}
                            >

                                <ErrorOutlineRoundedIcon />

                            </div>


                            <div>

                                <span>
                                    Out of Stock
                                </span>

                                <strong>
                                    {
                                        outOfStockCount
                                    }
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        FILTER BAR
                    ====================================================== */}

                    <form
                        className={
                            styles.filterCard
                        }
                        onSubmit={
                            handleFilterSubmit
                        }
                    >

                        <div
                            className={
                                styles.searchWrapper
                            }
                        >

                            <SearchRoundedIcon />


                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search medicine, generic name, code or manufacturer..."
                            />

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <FilterListRoundedIcon />


                            <select
                                value={
                                    status
                                }
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                            >

                                {statusOptions.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <Inventory2OutlinedIcon />


                            <select
                                value={
                                    stockStatus
                                }
                                onChange={(event) =>
                                    setStockStatus(
                                        event.target.value
                                    )
                                }
                            >

                                {stockOptions.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <DescriptionOutlinedIcon />


                            <select
                                value={
                                    prescription
                                }
                                onChange={(event) =>
                                    setPrescription(
                                        event.target.value
                                    )
                                }
                            >

                                {prescriptionOptions.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <CategoryOutlinedIcon />


                            <select
                                value={
                                    category
                                }
                                onChange={(event) =>
                                    setCategory(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Categories
                                </option>


                                {categories.map(
                                    (
                                        item
                                    ) => (

                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {(search ||
                            status !== "all" ||
                            stockStatus !== "all" ||
                            prescription !== "all" ||
                            category !== "all") && (

                            <button
                                type="button"
                                className={
                                    styles.clearFilters
                                }
                                onClick={
                                    resetFilters
                                }
                            >
                                Clear
                            </button>

                        )}

                    </form>


                    {/* =====================================================
                        MEDICINES
                    ====================================================== */}

                    <section
                        className={
                            styles.medicinesCard
                        }
                    >

                        <div
                            className={
                                styles.medicinesHeader
                            }
                        >

                            <div>

                                <h2>
                                    Medicine catalog
                                </h2>


                                <span>

                                    {
                                        pagination.total
                                    }

                                    {" "}

                                    {
                                        pagination.total ===
                                        1
                                            ? "medicine"
                                            : "medicines"
                                    }

                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div
                            className={
                                styles.tableWrapper
                            }
                        >

                            <table
                                className={
                                    styles.table
                                }
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Manufacturer
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Stock
                                        </th>

                                        <th>
                                            Prescription
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {medicines.map(
                                        (
                                            medicine
                                        ) => {

                                            const stockMeta =
                                                getStockMeta(
                                                    medicine.stock,
                                                    medicine.reorderLevel
                                                );


                                            const StockIcon =
                                                stockMeta.icon;


                                            return (

                                                <tr
                                                    key={
                                                        medicine._id
                                                    }
                                                >

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.medicineInfo
                                                            }
                                                        >

                                                            <div
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

                                                                    <MedicalServicesOutlinedIcon />

                                                                )}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        medicine.name
                                                                    }
                                                                </strong>


                                                                <span>
                                                                    {
                                                                        medicine.genericName
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        medicine.strength
                                                                    }
                                                                </span>


                                                                <small>
                                                                    {
                                                                        medicine.code
                                                                    }
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                styles.categoryBadge
                                                            }
                                                        >

                                                            {
                                                                medicine.category
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.manufacturer
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    medicine.manufacturer
                                                                }
                                                            </strong>

                                                            <span>

                                                                {
                                                                    medicine.dosageForm
                                                                }

                                                                {" • "}

                                                                {
                                                                    medicine.packSize
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <strong
                                                            className={
                                                                styles.price
                                                            }
                                                        >

                                                            ৳
                                                            {
                                                                medicine.price
                                                            }

                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.stockCell
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    medicine.stock
                                                                }
                                                            </strong>


                                                            <span
                                                                className={`${styles.stockBadge} ${styles[stockMeta.className]}`}
                                                            >

                                                                <StockIcon />

                                                                {
                                                                    stockMeta.label
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        {medicine.prescriptionRequired ? (

                                                            <span
                                                                className={
                                                                    styles.prescriptionBadge
                                                                }
                                                            >

                                                                <DescriptionOutlinedIcon />

                                                                Required

                                                            </span>

                                                        ) : (

                                                            <span
                                                                className={
                                                                    styles.noPrescription
                                                                }
                                                            >
                                                                Not required
                                                            </span>

                                                        )}

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`${styles.statusBadge} ${
                                                                medicine.status ===
                                                                "active"
                                                                    ? styles.statusActive
                                                                    : styles.statusInactive
                                                            }`}
                                                        >

                                                            {medicine.status ===
                                                            "active" ? (

                                                                <CheckCircleOutlineRoundedIcon />

                                                            ) : (

                                                                <BlockOutlinedIcon />

                                                            )}


                                                            {
                                                                medicine.status ===
                                                                "active"
                                                                    ? "Active"
                                                                    : "Inactive"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.actionGroup
                                                            }
                                                        >

                                                            <Link
                                                                href={`/admin/medicines/${medicine._id}`}
                                                                className={
                                                                    styles.manageButton
                                                                }
                                                            >

                                                                <VisibilityOutlinedIcon />

                                                                Manage

                                                            </Link>


                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.deleteButton
                                                                }
                                                                onClick={() =>
                                                                    setDeleteMedicine(
                                                                        medicine
                                                                    )
                                                                }
                                                                aria-label={`Delete ${medicine.name}`}
                                                            >

                                                                <DeleteOutlineRoundedIcon />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE
                        ================================================== */}

                        <div
                            className={
                                styles.mobileMedicines
                            }
                        >

                            {medicines.map(
                                (
                                    medicine
                                ) => {

                                    const stockMeta =
                                        getStockMeta(
                                            medicine.stock,
                                            medicine.reorderLevel
                                        );


                                    const StockIcon =
                                        stockMeta.icon;


                                    return (

                                        <article
                                            key={
                                                medicine._id
                                            }
                                            className={
                                                styles.mobileMedicine
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.mobileTop
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.mobileIdentity
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.mobileImage
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

                                                            <MedicalServicesOutlinedIcon />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <span
                                                            className={
                                                                styles.mobileCode
                                                            }
                                                        >
                                                            {
                                                                medicine.code
                                                            }
                                                        </span>


                                                        <h3>
                                                            {
                                                                medicine.name
                                                            }
                                                        </h3>


                                                        <span
                                                            className={
                                                                styles.mobileGeneric
                                                            }
                                                        >

                                                            {
                                                                medicine.genericName
                                                            }

                                                            {" • "}

                                                            {
                                                                medicine.strength
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                <strong
                                                    className={
                                                        styles.mobilePrice
                                                    }
                                                >

                                                    ৳
                                                    {
                                                        medicine.price
                                                    }

                                                </strong>

                                            </div>


                                            <div
                                                className={
                                                    styles.mobileInfo
                                                }
                                            >

                                                <div>

                                                    <CategoryOutlinedIcon />

                                                    <span>
                                                        {
                                                            medicine.category
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <Inventory2OutlinedIcon />

                                                    <span>

                                                        Stock:
                                                        {" "}

                                                        <strong>
                                                            {
                                                                medicine.stock
                                                            }
                                                        </strong>

                                                    </span>

                                                </div>


                                                <div>

                                                    <DescriptionOutlinedIcon />

                                                    <span>
                                                        {medicine.prescriptionRequired
                                                            ? "Prescription required"
                                                            : "No prescription required"}
                                                    </span>

                                                </div>


                                                <div>

                                                    <span>
                                                        {
                                                            medicine.manufacturer
                                                        }
                                                    </span>

                                                </div>

                                            </div>


                                            <div
                                                className={
                                                    styles.mobileFooter
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.mobileBadges
                                                    }
                                                >

                                                    <span
                                                        className={`${styles.stockBadge} ${styles[stockMeta.className]}`}
                                                    >

                                                        <StockIcon />

                                                        {
                                                            stockMeta.label
                                                        }

                                                    </span>


                                                    <span
                                                        className={`${styles.statusBadge} ${
                                                            medicine.status ===
                                                            "active"
                                                                ? styles.statusActive
                                                                : styles.statusInactive
                                                        }`}
                                                    >

                                                        {
                                                            medicine.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                        }

                                                    </span>

                                                </div>


                                                <div
                                                    className={
                                                        styles.mobileActions
                                                    }
                                                >

                                                    <Link
                                                        href={`/admin/medicines/${medicine._id}`}
                                                        className={
                                                            styles.mobileManageButton
                                                        }
                                                    >

                                                        Manage

                                                        <ArrowForwardRoundedIcon />

                                                    </Link>


                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.mobileDeleteButton
                                                        }
                                                        onClick={() =>
                                                            setDeleteMedicine(
                                                                medicine
                                                            )
                                                        }
                                                        aria-label={`Delete ${medicine.name}`}
                                                    >

                                                        <DeleteOutlineRoundedIcon />

                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>


                        {/* =================================================
                            EMPTY
                        ================================================== */}

                        {medicines.length ===
                            0 && (

                            <div
                                className={
                                    styles.emptyState
                                }
                            >

                                <MedicalServicesOutlinedIcon />


                                <h3>
                                    No medicines found
                                </h3>


                                <p>
                                    Try changing your
                                    search or filters.
                                </p>


                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Reset filters
                                </button>

                            </div>

                        )}


                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {pagination.pages >
                            1 && (

                            <div
                                className={
                                    styles.pagination
                                }
                            >

                                <button
                                    type="button"
                                    disabled={
                                        pagination.page <=
                                        1
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page -
                                                1
                                        )
                                    }
                                >
                                    Previous
                                </button>


                                <span>

                                    Page
                                    {" "}
                                    {
                                        pagination.page
                                    }
                                    {" "}
                                    of
                                    {" "}
                                    {
                                        pagination.pages
                                    }

                                </span>


                                <button
                                    type="button"
                                    disabled={
                                        pagination.page >=
                                        pagination.pages
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page +
                                                1
                                        )
                                    }
                                >
                                    Next
                                </button>

                            </div>

                        )}

                    </section>

                </div>

            </main>




            {/* =====================================================
                DELETE MODAL
            ====================================================== */}

            {deleteMedicine && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        !deleting &&
                        setDeleteMedicine(
                            null
                        )
                    }
                >

                    <div
                        className={
                            styles.deleteModal
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.modalClose
                            }
                            onClick={() =>
                                !deleting &&
                                setDeleteMedicine(
                                    null
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.deleteIcon
                            }
                        >

                            <DeleteOutlineRoundedIcon />

                        </div>


                        <h2>
                            Delete medicine?
                        </h2>


                        <p>

                            Are you sure you want to
                            permanently delete

                            {" "}

                            <strong>
                                {
                                    deleteMedicine.name
                                }
                            </strong>

                            ? This action cannot be undone.

                        </p>


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                onClick={() =>
                                    setDeleteMedicine(
                                        null
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    styles.confirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                onClick={
                                    handleDelete
                                }
                            >

                                <DeleteOutlineRoundedIcon />

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Medicine"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    const {
        req,
        query
    } = context;


    const cookies =
        req.headers.cookie || "";


    try {

        const protocol =
            String(req.headers["x-forwarded-proto"] ||
                (req.socket.encrypted ? "https" : "http"))
                .split(",")[0].trim();
        const baseUrl = `${protocol}://${req.headers.host}`;


        const response =
            await axios.get(
                `${baseUrl}/api/admin/medicines`,
                {

                    params: {

                        search:
                            query.search ||
                            "",

                        status:
                            query.status ||
                            "all",

                        stock:
                            query.stock ||
                            "all",

                        prescription:
                            query.prescription ||
                            "all",

                        category:
                            query.category ||
                            "all",

                        page:
                            query.page ||
                            1,

                        limit:
                            query.limit ||
                            20,

                    },

                    headers: {

                        Cookie:
                            cookies,

                    },

                }
            );


        return {

            props: {

                medicines:
                    response
                        ?.data
                        ?.medicines ||
                    [],

                pagination:
                    response
                        ?.data
                        ?.pagination ||
                    {
                        page: 1,
                        limit: 20,
                        total: 0,
                        pages: 1,
                    },

                filters: {

                    search:
                        query.search ||
                        "",

                    status:
                        query.status ||
                        "all",

                    stock:
                        query.stock ||
                        "all",

                    prescription:
                        query.prescription ||
                        "all",

                    category:
                        query.category ||
                        "all",

                },

            },

        };


    } catch (error) {

        console.error(
            "SSR medicines fetch error:",
            error?.response?.data ||
            error.message
        );


        return {

            props: {

                medicines: [],

                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    pages: 1,
                },

                filters: {

                    search:
                        query.search ||
                        "",

                    status:
                        query.status ||
                        "all",

                    stock:
                        query.stock ||
                        "all",

                    prescription:
                        query.prescription ||
                        "all",

                    category:
                        query.category ||
                        "all",

                },

            },

        };

    }

}