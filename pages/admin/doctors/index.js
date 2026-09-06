import Pagination from "@/components/Utility/Pagination";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import axios from "axios";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";



import styles from "@/styles/Admin/Doctors/Doctors.module.css";


const verificationOptions = [
    {
        value: "all",
        label: "All Verification",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "verified",
        label: "Verified",
    },
    {
        value: "rejected",
        label: "Rejected",
    },
];


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
    {
        value: "suspended",
        label: "Suspended",
    },
];


const getVerificationMeta = (
    status
) => {

    switch (status) {

        case "verified":
            return {
                label: "Verified",
                className: "verified",
                icon:
                    VerifiedOutlinedIcon,
            };

        case "rejected":
            return {
                label: "Rejected",
                className: "rejected",
                icon:
                    BlockOutlinedIcon,
            };

        default:
            return {
                label: "Pending",
                className: "pending",
                icon:
                    PendingOutlinedIcon,
            };

    }
};


const formatDoctor = (
    doctor
) => {

    const user =
        doctor.user || {};

    return {

        id:
            doctor._id,

        name:
            user.fullName ||
            [
                user.firstName,
                user.lastName,
            ]
                .filter(Boolean)
                .join(" ") ||
            "Unknown Doctor",

        image:
            user.image || "",

        phone:
            user.phone ||
            user.phoneNumber ||
            "",

        email:
            user.email ||
            "",

        speciality:
            doctor.speciality ||
            "Not specified",

        bmdcNumber:
            doctor.bmdcNumber ||
            "Not provided",

        education:
            doctor.education ||
            "",

        workingIn:
            doctor.workingIn ||
            "",

        experience:
            Number(
                doctor.totalExperience ||
                0
            ),

        consultationFee:
            Number(
                doctor.consultationFee ||
                0
            ),

        verificationStatus:
            doctor.verificationStatus ||
            "pending",

        status:
            doctor.status ||
            "inactive",

        departments:
            doctor.departments ||
            [],

        createdAt:
            doctor.createdAt ||
            null,

    };

};


const formatDate = (
    value
) => {

    if (!value) {
        return "N/A";
    }

    return new Intl.DateTimeFormat(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ).format(
        new Date(value)
    );
};


export default function DoctorsPage({
    doctors = [],
    stats = {},
    pagination = {},
    filters = {},
}) {

    const router =
        useRouter();

    const [search, setSearch] =
        React.useState(
            filters.search || ""
        );

    const [verification, setVerification] =
        React.useState(
            filters.verification ||
            "all"
        );

    const [status, setStatus] =
        React.useState(
            filters.status ||
            "all"
        );


    const applyFilters = () => {

        const query = {};

        if (search.trim()) {
            query.search =
                search.trim();
        }

        if (
            verification !== "all"
        ) {
            query.verification =
                verification;
        }

        if (
            status !== "all"
        ) {
            query.status =
                status;
        }

        router.push({
            pathname:
                "/admin/doctors",
            query,
        });
    };


    const clearFilters = () => {

        setSearch("");
        setVerification("all");
        setStatus("all");

        router.push(
            "/admin/doctors"
        );
    };


    const refresh = () => {

        router.replace(
            router.asPath
        );
    };


    return (
        <>
            <Head>

                <title>
                    Doctors | MediLocate Admin
                </title>

                <meta
                    name="description"
                    content="Manage MediLocate doctors."
                />

            </Head>




            <main className={styles.page}>

                <div
                    className={
                        styles.container
                    }
                >

                    {/* =================================================
                        HEADER
                    ================================================== */}

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
                                        ADMINISTRATION
                                    </span>

                                    <h1>
                                        Doctors
                                    </h1>

                                </div>

                            </div>


                            <p>
                                Manage doctor profiles,
                                verification and account status.
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.refreshButton
                            }
                            onClick={
                                refresh
                            }
                        >

                            <RefreshRoundedIcon />

                            Refresh

                        </button>

                    </header>


                    {/* =================================================
                        STATS
                    ================================================== */}

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
                                    Total Doctors
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
                                    Pending Review
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
                                className={`${styles.statIcon} ${styles.verifiedIcon}`}
                            >

                                <VerifiedOutlinedIcon />

                            </div>

                            <div>

                                <span>
                                    Verified
                                </span>

                                <strong>
                                    {stats.verified || 0}
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
                                    {stats.active || 0}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        FILTER
                    ================================================== */}

                    <form
                        className={
                            styles.filterCard
                        }
                        onSubmit={(event) => {

                            event.preventDefault();

                            applyFilters();

                        }}
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
                                placeholder="Search doctor, BMDC, speciality or phone..."
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
                                    verification
                                }
                                onChange={(event) =>
                                    setVerification(
                                        event.target.value
                                    )
                                }
                            >

                                {verificationOptions.map(
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


                        <button
                            type="submit"
                            className={
                                styles.applyButton
                            }
                        >
                            Apply
                        </button>


                        {(search ||
                            verification !== "all" ||
                            status !== "all") && (

                            <button
                                type="button"
                                className={
                                    styles.clearButton
                                }
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear
                            </button>

                        )}

                    </form>


                    {/* =================================================
                        DOCTOR LIST
                    ================================================== */}

                    <section
                        className={
                            styles.doctorsCard
                        }
                    >

                        <div
                            className={
                                styles.listHeader
                            }
                        >

                            <div>

                                <h2>
                                    Doctor profiles
                                </h2>

                                <span>
                                    {
                                        pagination.total ||
                                        0
                                    }{" "}
                                    {
                                        pagination.total ===
                                        1
                                            ? "doctor"
                                            : "doctors"
                                    }
                                </span>

                            </div>

                        </div>


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
                                            Doctor
                                        </th>

                                        <th>
                                            Professional
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            Verification
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Joined
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {doctors.map(
                                        (item) => {

                                            const doctor =
                                                formatDoctor(
                                                    item
                                                );

                                            const meta =
                                                getVerificationMeta(
                                                    doctor.verificationStatus
                                                );

                                            const VerificationIcon =
                                                meta.icon;


                                            return (

                                                <tr
                                                    key={
                                                        doctor.id
                                                    }
                                                >

                                                    {/* DOCTOR */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.doctorInfo
                                                            }
                                                        >

                                                            <div
                                                                className={
                                                                    styles.avatar
                                                                }
                                                            >

                                                                {doctor.image ? (

                                                                    <img
                                                                        src={
                                                                            doctor.image
                                                                        }
                                                                        alt={
                                                                            doctor.name
                                                                        }
                                                                    />

                                                                ) : (

                                                                    doctor.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()

                                                                )}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        doctor.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    BMDC:{" "}
                                                                    {
                                                                        doctor.bmdcNumber
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* PROFESSIONAL */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.professionalInfo
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    doctor.speciality
                                                                }
                                                            </strong>


                                                            {doctor.workingIn && (

                                                                <span>
                                                                    {
                                                                        doctor.workingIn
                                                                    }
                                                                </span>

                                                            )}


                                                            <small>

                                                                {
                                                                    doctor.experience
                                                                }

                                                                {" "}
                                                                {
                                                                    doctor.experience ===
                                                                    1
                                                                        ? "year"
                                                                        : "years"
                                                                }

                                                            </small>

                                                        </div>

                                                    </td>


                                                    {/* CONTACT */}

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.contactInfo
                                                            }
                                                        >

                                                            {doctor.phone && (

                                                                <span>

                                                                    <PhoneOutlinedIcon />

                                                                    {
                                                                        doctor.phone
                                                                    }

                                                                </span>

                                                            )}


                                                            {doctor.email && (

                                                                <span>

                                                                    <EmailOutlinedIcon />

                                                                    {
                                                                        doctor.email
                                                                    }

                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* VERIFICATION */}

                                                    <td>

                                                        <span
                                                            className={`${styles.badge} ${styles[meta.className]}`}
                                                        >

                                                            <VerificationIcon />

                                                            {
                                                                meta.label
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`${styles.statusBadge} ${styles[doctor.status]}`}
                                                        >
                                                            {
                                                                doctor.status
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* JOINED */}

                                                    <td>

                                                        <span
                                                            className={
                                                                styles.date
                                                            }
                                                        >
                                                            {
                                                                formatDate(
                                                                    doctor.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <Link
                                                            href={`/admin/doctors/${doctor.id}`}
                                                            className={
                                                                styles.viewButton
                                                            }
                                                        >

                                                            <VisibilityOutlinedIcon />

                                                            View

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
                                styles.mobileList
                            }
                        >

                            {doctors.map(
                                (item) => {

                                    const doctor =
                                        formatDoctor(
                                            item
                                        );

                                    const meta =
                                        getVerificationMeta(
                                            doctor.verificationStatus
                                        );

                                    const VerificationIcon =
                                        meta.icon;


                                    return (

                                        <article
                                            key={
                                                doctor.id
                                            }
                                            className={
                                                styles.mobileDoctor
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.mobileTop
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.doctorInfo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.avatar
                                                        }
                                                    >

                                                        {doctor.image ? (

                                                            <img
                                                                src={
                                                                    doctor.image
                                                                }
                                                                alt={
                                                                    doctor.name
                                                                }
                                                            />

                                                        ) : (

                                                            doctor.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                doctor.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                doctor.speciality
                                                            }
                                                        </span>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`${styles.badge} ${styles[meta.className]}`}
                                                >

                                                    <VerificationIcon />

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

                                                    <PhoneOutlinedIcon />

                                                    <span>
                                                        {
                                                            doctor.phone ||
                                                            "No phone"
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <MedicalServicesOutlinedIcon />

                                                    <span>
                                                        BMDC:{" "}
                                                        {
                                                            doctor.bmdcNumber
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <CheckCircleOutlineRoundedIcon />

                                                    <span>
                                                        {
                                                            doctor.experience
                                                        }{" "}
                                                        years experience
                                                    </span>

                                                </div>

                                            </div>


                                            <div
                                                className={
                                                    styles.mobileBottom
                                                }
                                            >

                                                <span>
                                                    Joined{" "}
                                                    {
                                                        formatDate(
                                                            doctor.createdAt
                                                        )
                                                    }
                                                </span>


                                                <Link
                                                    href={`/admin/doctors/${doctor.id}`}
                                                    className={
                                                        styles.viewButton
                                                    }
                                                >

                                                    View

                                                    <VisibilityOutlinedIcon />

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

                        {doctors.length === 0 && (

                            <div
                                className={
                                    styles.emptyState
                                }
                            >

                                <MedicalServicesOutlinedIcon />

                                <h3>
                                    No doctors found
                                </h3>

                                <p>
                                    Try changing your
                                    search or filters.
                                </p>


                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Reset filters
                                </button>

                            </div>

                        )}

                        {pagination.pages > 1 && (
                            <Pagination totalPages={pagination.pages} currentPage={pagination.page} />
                        )}

                    </section>

                </div>

            </main>




        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    try {

        const {
            query,
            req,
        } = context;


        const {
            search = "",
            verification = "all",
            status = "all",
        } = query;


        const params =
            new URLSearchParams();


        if (search) {
            params.set(
                "search",
                search
            );
        }


        if (
            verification &&
            verification !== "all"
        ) {
            params.set(
                "verification",
                verification
            );
        }


        if (
            status &&
            status !== "all"
        ) {
            params.set(
                "status",
                status
            );
        }


        params.set("page", String(Math.max(1, parseInt(query.page, 10) || 1)));


        params.set(
            "limit",
            "50"
        );


        const protocol =
            String(req.headers["x-forwarded-proto"] ||
                (req.socket.encrypted ? "https" : "http"))
                .split(",")[0].trim();
        const baseUrl = `${protocol}://${req.headers.host}`;

        const apiUrl =
            `${baseUrl}/api/admin/doctors?${params.toString()}`;


        const response =
            await axios.get(
                apiUrl,
                {
                    headers: {
                        cookie:
                            req.headers.cookie ||
                            "",
                    },
                }
            );


        const data =
            response.data;


        return {

            props: {

                doctors:
                    data.doctors || [],

                stats:
                    data.stats || {},

                pagination:
                    data.pagination || {},

                filters: {

                    search:
                        search || "",

                    verification:
                        verification ||
                        "all",

                    status:
                        status ||
                        "all",

                },

            },

        };

    } catch (error) {

        console.error(
            "Admin doctors SSR error:",
            error?.response?.data ||
            error.message
        );


        return {

            props: {

                doctors: [],

                stats: {
                    total: 0,
                    pending: 0,
                    verified: 0,
                    rejected: 0,
                    active: 0,
                },

                pagination: {
                    page: 1,
                    limit: 50,
                    total: 0,
                    pages: 0,
                },

                filters: {
                    search: "",
                    verification: "all",
                    status: "all",
                },

            },

        };

    }

}