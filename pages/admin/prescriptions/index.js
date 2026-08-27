import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";


import styles from "@/styles/Admin/Prescriptions/Prescriptions.module.css";
import BASE_URL from "@/config";


const statusOptions = [
    {
        value: "all",
        label: "All Requests",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "reviewing",
        label: "Reviewing",
    },
    {
        value: "order_created",
        label: "Order Created",
    },
    {
        value: "completed",
        label: "Completed",
    },
    {
        value: "rejected",
        label: "Rejected",
    },
];


const getStatusMeta = (status) => {

    switch (status) {

        case "pending":
            return {
                label: "Pending",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

        case "reviewing":
            return {
                label: "Reviewing",
                className: "reviewing",
                icon: RateReviewOutlinedIcon,
            };

        case "order_created":
            return {
                label: "Order Created",
                className: "orderCreated",
                icon: ShoppingBagOutlinedIcon,
            };

        case "completed":
            return {
                label: "Completed",
                className: "completed",
                icon: CheckCircleOutlineRoundedIcon,
            };

        case "rejected":
            return {
                label: "Rejected",
                className: "rejected",
                icon: DescriptionOutlinedIcon,
            };

        default:
            return {
                label: status || "Unknown",
                className: "pending",
                icon: PendingOutlinedIcon,
            };
    }
};


const formatDate = (date) => {

    if (!date) {
        return "N/A";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(
        new Date(date)
    );
};


const normalizePrescription = (item) => {

    return {
        id:
            item._id?.toString() ||
            item.id,

        requestCode:
            item.requestCode ||
            "N/A",

        patientName:
            item.patient?.name ||
            "N/A",

        phone:
            item.patient?.phone ||
            "N/A",

        address:
            item.patient?.address ||
            "N/A",

        submittedAt:
            formatDate(
                item.createdAt
            ),

        files:
            Array.isArray(item.files)
                ? item.files.length
                : 0,

        status:
            item.status ||
            "pending",

        note:
            item.notes ||
            "",
    };
};


export default function PrescriptionRequestsPage(
    {
        prescriptions = [],
        stats = {},
        pagination = {},
        filters = {},
    }
) {

    const router = useRouter();

    const [search, setSearch] =
        useState(
            filters.search || ""
        );

    const [status, setStatus] =
        useState(
            filters.status || "all"
        );

    const [dateFilter, setDateFilter] =
        useState(
            filters.date || "all"
        );

    const [selectedRequests, setSelectedRequests] =
        useState([]);


    /*
    |--------------------------------------------------------------------------
    | SEARCH / FILTER
    |--------------------------------------------------------------------------
    */

    const applyFilters = (event) => {

        event.preventDefault();

        const query = {};

        if (search.trim()) {
            query.search =
                search.trim();
        }

        if (
            status &&
            status !== "all"
        ) {
            query.status = status;
        }

        if (
            dateFilter &&
            dateFilter !== "all"
        ) {
            query.date =
                dateFilter;
        }

        router.push({
            pathname:
                "/admin/prescriptions",
            query,
        });
    };


    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {

        setSearch("");
        setStatus("all");
        setDateFilter("all");
        setSelectedRequests([]);

        router.push(
            "/admin/prescriptions"
        );
    };


    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const refreshPage = () => {

        router.replace(
            router.asPath
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SELECT
    |--------------------------------------------------------------------------
    */

    const toggleSelect = (id) => {

        setSelectedRequests(
            (previous) => {

                if (
                    previous.includes(id)
                ) {

                    return previous.filter(
                        (item) =>
                            item !== id
                    );
                }

                return [
                    ...previous,
                    id,
                ];
            }
        );
    };


    const selectAll = () => {

        const ids =
            prescriptions.map(
                (request) =>
                    request.id
            );

        if (
            selectedRequests.length ===
            ids.length
        ) {

            setSelectedRequests([]);

            return;
        }

        setSelectedRequests(ids);
    };


    return (
        <>
            <Head>

                <title>
                    Prescription Requests | MediLocate Admin
                </title>

                <meta
                    name="description"
                    content="Manage prescription requests on MediLocate."
                />

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


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

                                    <DescriptionOutlinedIcon />

                                </div>


                                <div>

                                    <span
                                        className={
                                            styles.eyebrow
                                        }
                                    >
                                        ADMINISTRATION
                                    </span>


                                    <h1>
                                        Prescription Requests
                                    </h1>

                                </div>

                            </div>


                            <p>
                                Review submitted prescriptions
                                and create medicine orders for patients.
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.refreshButton
                            }
                            onClick={
                                refreshPage
                            }
                        >

                            <RefreshRoundedIcon />

                            Refresh

                        </button>

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

                                <DescriptionOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Total Requests
                                </span>

                                <strong>
                                    {stats.total || 0}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.pendingIcon}`}
                            >

                                <PendingOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {stats.pending || 0}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.reviewIcon}`}
                            >

                                <RateReviewOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Under Review
                                </span>

                                <strong>
                                    {stats.reviewing || 0}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.orderIcon}`}
                            >

                                <ShoppingBagOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Orders Created
                                </span>

                                <strong>
                                    {stats.orderCreated || 0}
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
                            applyFilters
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
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search request ID, patient name or phone..."
                            />

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <FilterListRoundedIcon />

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                            >

                                {statusOptions.map(
                                    (option) => (

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

                            <CalendarTodayOutlinedIcon />

                            <select
                                value={
                                    dateFilter
                                }
                                onChange={(event) =>
                                    setDateFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Dates
                                </option>

                                <option value="today">
                                    Today
                                </option>

                                <option value="week">
                                    Last 7 Days
                                </option>

                                <option value="month">
                                    This Month
                                </option>

                            </select>

                        </div>


                        <button
                            type="submit"
                            className={
                                styles.clearFilters
                            }
                        >
                            Apply
                        </button>


                        {(search ||
                            status !== "all" ||
                            dateFilter !== "all") && (

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
                        REQUESTS CARD
                    ====================================================== */}

                    <section
                        className={
                            styles.requestsCard
                        }
                    >


                        {/* =================================================
                            REQUEST HEADER
                        ================================================== */}

                        <div
                            className={
                                styles.requestsHeader
                            }
                        >

                            <div>

                                <h2>
                                    Requests
                                </h2>

                                <span>
                                    {
                                        pagination.total ||
                                        0
                                    }{" "}

                                    {
                                        pagination.total === 1
                                            ? "request"
                                            : "requests"
                                    }
                                </span>

                            </div>


                            {selectedRequests.length > 0 && (

                                <div
                                    className={
                                        styles.bulkActions
                                    }
                                >

                                    <span>
                                        {
                                            selectedRequests.length
                                        }{" "}
                                        selected
                                    </span>


                                    <button
                                        type="button"
                                    >
                                        Mark reviewing
                                    </button>

                                </div>

                            )}

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

                                        <th
                                            className={
                                                styles.checkboxCell
                                            }
                                        >

                                            <input
                                                type="checkbox"
                                                checked={
                                                    prescriptions.length > 0 &&
                                                    selectedRequests.length ===
                                                    prescriptions.length
                                                }
                                                onChange={
                                                    selectAll
                                                }
                                            />

                                        </th>


                                        <th>
                                            Request
                                        </th>


                                        <th>
                                            Patient
                                        </th>


                                        <th>
                                            Submitted
                                        </th>


                                        <th>
                                            Files
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

                                    {prescriptions.map(
                                        (request) => {

                                            const meta =
                                                getStatusMeta(
                                                    request.status
                                                );

                                            const StatusIcon =
                                                meta.icon;


                                            return (

                                                <tr
                                                    key={
                                                        request.id
                                                    }
                                                >

                                                    <td
                                                        className={
                                                            styles.checkboxCell
                                                        }
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedRequests.includes(
                                                                    request.id
                                                                )
                                                            }
                                                            onChange={() =>
                                                                toggleSelect(
                                                                    request.id
                                                                )
                                                            }
                                                        />

                                                    </td>


                                                    {/* REQUEST */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.requestInfo
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    request.requestCode
                                                                }
                                                            </strong>

                                                            <span>
                                                                Prescription request
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* PATIENT */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.patientInfo
                                                            }
                                                        >

                                                            <div
                                                                className={
                                                                    styles.patientAvatar
                                                                }
                                                            >

                                                                {
                                                                    request.patientName
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()
                                                                }

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        request.patientName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        request.phone
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* SUBMITTED */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.submittedInfo
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    request.submittedAt
                                                                }
                                                            </span>

                                                            <small>
                                                                {
                                                                    request.address
                                                                }
                                                            </small>

                                                        </div>

                                                    </td>


                                                    {/* FILES */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.fileCount
                                                            }
                                                        >

                                                            <DescriptionOutlinedIcon />

                                                            <strong>
                                                                {
                                                                    request.files
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    request.files === 1
                                                                        ? "page"
                                                                        : "pages"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`${styles.statusBadge} ${styles[meta.className]}`}
                                                        >

                                                            <StatusIcon />

                                                            {
                                                                meta.label
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <Link
                                                            href={`/admin/prescriptions/${request.id}`}
                                                            className={
                                                                styles.viewButton
                                                            }
                                                        >

                                                            <VisibilityOutlinedIcon />

                                                            Review

                                                        </Link>

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
                                styles.mobileRequests
                            }
                        >

                            {prescriptions.map(
                                (request) => {

                                    const meta =
                                        getStatusMeta(
                                            request.status
                                        );

                                    const StatusIcon =
                                        meta.icon;


                                    return (

                                        <article
                                            key={
                                                request.id
                                            }
                                            className={
                                                styles.mobileRequest
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.mobileRequestTop
                                                }
                                            >

                                                <div>

                                                    <span
                                                        className={
                                                            styles.mobileCode
                                                        }
                                                    >
                                                        {
                                                            request.requestCode
                                                        }
                                                    </span>


                                                    <h3>
                                                        {
                                                            request.patientName
                                                        }
                                                    </h3>

                                                </div>


                                                <span
                                                    className={`${styles.statusBadge} ${styles[meta.className]}`}
                                                >

                                                    <StatusIcon />

                                                    {
                                                        meta.label
                                                    }

                                                </span>

                                            </div>


                                            <div
                                                className={
                                                    styles.mobileDetails
                                                }
                                            >

                                                <div>

                                                    <PersonOutlineRoundedIcon />

                                                    <span>
                                                        {
                                                            request.patientName
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <PhoneOutlinedIcon />

                                                    <span>
                                                        {
                                                            request.phone
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <LocationOnOutlinedIcon />

                                                    <span>
                                                        {
                                                            request.address
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <CalendarTodayOutlinedIcon />

                                                    <span>
                                                        {
                                                            request.submittedAt
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
                                                        styles.mobileFileCount
                                                    }
                                                >

                                                    <DescriptionOutlinedIcon />

                                                    {
                                                        request.files
                                                    }{" "}

                                                    {
                                                        request.files === 1
                                                            ? "page"
                                                            : "pages"
                                                    }

                                                </div>


                                                <Link
                                                    href={`/admin/prescriptions/${request.id}`}
                                                    className={
                                                        styles.mobileReviewButton
                                                    }
                                                >

                                                    Review

                                                    <ArrowForwardRoundedIcon />

                                                </Link>

                                            </div>

                                        </article>

                                    );
                                }
                            )}

                        </div>


                        {/* =================================================
                            EMPTY
                        ================================================== */}

                        {prescriptions.length === 0 && (

                            <div
                                className={
                                    styles.emptyState
                                }
                            >

                                <DescriptionOutlinedIcon />

                                <h3>
                                    No prescription requests found
                                </h3>

                                <p>
                                    Try changing your search or
                                    filter options.
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

                    </section>

                </div>

            </main>



        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/
export async function getServerSideProps(context) {
    try {
        const { query, req } = context;

        const {
            search = "",
            status = "all",
            date = "all",
        } = query;

        /*
        |--------------------------------------------------------------------------
        | BUILD API QUERY
        |--------------------------------------------------------------------------
        */

        const params = new URLSearchParams();

        if (search) {
            params.set("search", search);
        }

        if (status && status !== "all") {
            params.set("status", status);
        }

        if (date && date !== "all") {
            params.set("date", date);
        }

        params.set("page", "1");
        params.set("limit", "50");


        /*
        |--------------------------------------------------------------------------
        | USE CURRENT NEXT.JS SERVER
        |--------------------------------------------------------------------------
        |
        | Do not hardcode localhost.
        | This works both locally and in production.
        |
        */

        const protocol =
            req.headers["x-forwarded-proto"] ||
            "http";

        const host =
            req.headers.host;

        const apiUrl =
            `${protocol}://${host}/api/admin/prescriptions?${params.toString()}`;


        /*
        |--------------------------------------------------------------------------
        | CALL EXISTING API
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Forward browser cookies to the API.
        |
        */

        const response = await axios.get(
            apiUrl,
            {
                headers: {
                    cookie: req.headers.cookie || "",
                },

                /*
                | Axios normally follows redirects.
                | Keeping this makes debugging authentication easier.
                */
                maxRedirects: 0,
            }
        );


        const data = response.data;


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE PRESCRIPTIONS
        |--------------------------------------------------------------------------
        */

        const prescriptions =
            (data.prescriptions || []).map(
                (prescription) => ({
                    id: prescription._id,

                    requestCode:
                        prescription.requestCode || "",

                    patientName:
                        prescription.patient?.name || "N/A",

                    phone:
                        prescription.patient?.phone || "N/A",

                    address:
                        prescription.patient?.address || "N/A",

                    city:
                        prescription.patient?.city || "",

                    submittedAt:
                        prescription.createdAt || null,

                    files:
                        Array.isArray(prescription.files)
                            ? prescription.files.length
                            : 0,

                    status:
                        prescription.status || "pending",

                    note:
                        prescription.notes || "",

                    /*
                    | Keep original data too.
                    | Useful later for the review page.
                    */
                    _id:
                        prescription._id,

                    patient:
                        prescription.patient,

                    fileList:
                        prescription.files,

                    medicines:
                        prescription.medicines || [],

                    statusHistory:
                        prescription.statusHistory || [],

                    order:
                        prescription.order || null,

                    reviewedBy:
                        prescription.reviewedBy || null,

                    reviewedAt:
                        prescription.reviewedAt || null,

                    reviewNote:
                        prescription.reviewNote || "",

                    internalNote:
                        prescription.internalNote || "",

                    createdAt:
                        prescription.createdAt,

                    updatedAt:
                        prescription.updatedAt,
                })
            );


        /*
        |--------------------------------------------------------------------------
        | RETURN PAGE PROPS
        |--------------------------------------------------------------------------
        */

        return {
            props: {
                prescriptions,

                stats:
                    data.stats || {
                        total: 0,
                        pending: 0,
                        reviewing: 0,
                        orderCreated: 0,
                        completed: 0,
                        rejected: 0,
                    },

                pagination:
                    data.pagination || {
                        page: 1,
                        limit: 50,
                        total: 0,
                        pages: 0,
                    },

                filters: {
                    search:
                        search || "",

                    status:
                        status || "all",

                    date:
                        date || "all",
                },
            },
        };

    } catch (error) {

        /*
        |--------------------------------------------------------------------------
        | DEBUG
        |--------------------------------------------------------------------------
        */

        console.error(
            "Prescription admin SSR error:"
        );

        console.error(
            "Status:",
            error?.response?.status
        );

        console.error(
            "Location:",
            error?.response?.headers?.location
        );

        console.error(
            "Data:",
            error?.response?.data
        );


        return {
            props: {
                prescriptions: [],

                stats: {
                    total: 0,
                    pending: 0,
                    reviewing: 0,
                    orderCreated: 0,
                    completed: 0,
                    rejected: 0,
                },

                pagination: {
                    page: 1,
                    limit: 50,
                    total: 0,
                    pages: 0,
                },

                filters: {
                    search: "",
                    status: "all",
                    date: "all",
                },
            },
        };
    }
}