import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Admin/Doctors/DoctorDetails.module.css";


/*
|--------------------------------------------------------------------------
| TEMPORARY DATA
|--------------------------------------------------------------------------
*/

const doctors = {
    "1": {
        id: "1",
        doctorCode: "ML-D-10021",

        name: "Dr. Ahsan Rahman",
        specialty: "Medicine Specialist",

        degree: "MBBS, FCPS",
        university: "Rajshahi Medical University",

        hospital: "Rangpur Medical College Hospital",

        phone: "01712345678",
        email: "ahsan.rahman@example.com",

        location: "Rangpur Sadar",

        experience: "12 years",

        consultationFee: 500,

        status: "active",
        verification: "verified",

        joinedAt: "20 Aug 2026",

        available: true,

        onsiteConsultation: true,

        consultationDuration: 30,

        about:
            "Experienced medicine specialist with a focus on general adult medicine, chronic disease management and primary healthcare.",

        credentials: [
            {
                id: "c1",
                title: "MBBS Certificate",
                type: "Academic",
                status: "verified",
            },
            {
                id: "c2",
                title: "FCPS Certificate",
                type: "Professional",
                status: "verified",
            },
            {
                id: "c3",
                title: "Medical Registration",
                type: "BMDC",
                status: "verified",
            },
        ],

        schedule: [
            {
                day: "Saturday",
                available: true,
                start: "5:00 PM",
                end: "8:00 PM",
            },
            {
                day: "Sunday",
                available: true,
                start: "5:00 PM",
                end: "8:00 PM",
            },
            {
                day: "Monday",
                available: false,
                start: "",
                end: "",
            },
            {
                day: "Tuesday",
                available: true,
                start: "5:00 PM",
                end: "8:00 PM",
            },
            {
                day: "Wednesday",
                available: true,
                start: "5:00 PM",
                end: "8:00 PM",
            },
            {
                day: "Thursday",
                available: false,
                start: "",
                end: "",
            },
            {
                day: "Friday",
                available: true,
                start: "10:00 AM",
                end: "1:00 PM",
            },
        ],
    },

    "2": {
        id: "2",
        doctorCode: "ML-D-10020",

        name: "Dr. Nusrat Karim",
        specialty: "Gynecology",

        degree: "MBBS, FCPS",
        university: "Dhaka Medical College",

        hospital: "Prime Medical College",

        phone: "01812345678",
        email: "nusrat.karim@example.com",

        location: "Dhap, Rangpur",

        experience: "9 years",

        consultationFee: 600,

        status: "active",
        verification: "verified",

        joinedAt: "18 Aug 2026",

        available: true,

        onsiteConsultation: true,

        consultationDuration: 30,

        about:
            "Gynecology specialist providing women's health, reproductive health and general gynecology consultations.",

        credentials: [
            {
                id: "c1",
                title: "MBBS Certificate",
                type: "Academic",
                status: "verified",
            },
            {
                id: "c2",
                title: "FCPS Certificate",
                type: "Professional",
                status: "verified",
            },
            {
                id: "c3",
                title: "Medical Registration",
                type: "BMDC",
                status: "verified",
            },
        ],

        schedule: [],
    },
};


export default function DoctorDetailsPage() {

    const router = useRouter();

    const { id } = router.query;

    const doctor = doctors[id];


    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [verification, setVerification] =
        useState(
            doctor?.verification ||
            "pending"
        );


    const [status, setStatus] =
        useState(
            doctor?.status ||
            "inactive"
        );


    const [available, setAvailable] =
        useState(
            doctor?.available ||
            false
        );


    const [onsiteConsultation, setOnsiteConsultation] =
        useState(
            doctor?.onsiteConsultation ||
            false
        );


    const [consultationFee, setConsultationFee] =
        useState(
            doctor?.consultationFee ||
            0
        );


    const [consultationDuration, setConsultationDuration] =
        useState(
            doctor?.consultationDuration ||
            30
        );


    const [saving, setSaving] =
        useState(false);


    const [showDeactivateModal, setShowDeactivateModal] =
        useState(false);


    const [showRejectModal, setShowRejectModal] =
        useState(false);


    const [adminNote, setAdminNote] =
        useState("");


    if (!router.isReady) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!doctor) {

        return (
            <>
                <Head>

                    <title>
                        Doctor Not Found | MediLocate Admin
                    </title>

                </Head>

                <Navbar />

                <main className={styles.notFound}>

                    <MedicalServicesOutlinedIcon />

                    <h1>
                        Doctor not found
                    </h1>

                    <p>
                        The doctor you're looking for
                        does not exist.
                    </p>

                    <Link href="/admin/doctors">

                        <ArrowBackRoundedIcon />

                        Back to Doctors

                    </Link>

                </main>

                <Footer />
            </>
        );

    }


    /*
    |--------------------------------------------------------------------------
    | SAVE SETTINGS
    |--------------------------------------------------------------------------
    */

    const handleSave = async () => {

        try {

            setSaving(true);


            /*
             * Later:
             *
             * PATCH /api/admin/doctors/:id
             */

            console.log(
                "Save doctor:",
                {
                    id: doctor.id,
                    verification,
                    status,
                    available,
                    onsiteConsultation,
                    consultationFee,
                    consultationDuration,
                    adminNote,
                }
            );


            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        600
                    )
            );


            alert(
                "Doctor settings saved."
            );

        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | VERIFY
    |--------------------------------------------------------------------------
    */

    const handleVerify = () => {

        setVerification(
            "verified"
        );

        setShowRejectModal(false);

    };


    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    const handleReject = () => {

        setVerification(
            "rejected"
        );

        setShowRejectModal(false);

    };


    /*
    |--------------------------------------------------------------------------
    | DEACTIVATE
    |--------------------------------------------------------------------------
    */

    const handleDeactivate = () => {

        setStatus("inactive");

        setAvailable(false);

        setShowDeactivateModal(false);

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS LABEL
    |--------------------------------------------------------------------------
    */

    const statusLabel =
        status === "active"
            ? "Active"
            : "Inactive";


    const verificationLabel =
        verification === "verified"
            ? "Verified"
            : verification === "rejected"
                ? "Rejected"
                : "Pending";


    return (
        <>
            <Head>

                <title>
                    {doctor.name} | Doctor Management
                </title>

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        TOP NAV
                    ====================================================== */}

                    <div className={styles.topNav}>

                        <Link
                            href="/admin/doctors"
                            className={
                                styles.backLink
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Doctors

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            {doctor.doctorCode}
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div
                            className={
                                styles.identity
                            }
                        >

                            <div
                                className={
                                    styles.avatar
                                }
                            >

                                {
                                    doctor.name
                                        .replace(
                                            "Dr. ",
                                            ""
                                        )
                                        .charAt(0)
                                }

                            </div>


                            <div>

                                <span
                                    className={
                                        styles.eyebrow
                                    }
                                >
                                    DOCTOR PROFILE
                                </span>


                                <h1>
                                    {doctor.name}
                                </h1>


                                <p>
                                    {
                                        doctor.specialty
                                    }
                                    {" • "}
                                    {
                                        doctor.degree
                                    }
                                </p>

                            </div>

                        </div>


                        <div
                            className={
                                styles.headerBadges
                            }
                        >

                            <span
                                className={`${styles.verificationBadge} ${
                                    verification ===
                                    "verified"
                                        ? styles.verified
                                        : verification ===
                                          "rejected"
                                            ? styles.rejected
                                            : styles.pending
                                }`}
                            >

                                {
                                    verification ===
                                    "verified"
                                        ? (
                                            <VerifiedRoundedIcon />
                                        )
                                        : verification ===
                                          "rejected"
                                            ? (
                                                <CancelOutlinedIcon />
                                            )
                                            : (
                                                <PendingOutlinedIcon />
                                            )
                                }

                                {verificationLabel}

                            </span>


                            <span
                                className={`${styles.statusBadge} ${
                                    status ===
                                    "active"
                                        ? styles.active
                                        : styles.inactive
                                }`}
                            >

                                {status === "active" ? (

                                    <CheckCircleRoundedIcon />

                                ) : (

                                    <BlockOutlinedIcon />

                                )}

                                {statusLabel}

                            </span>

                        </div>

                    </header>


                    {/* =====================================================
                        QUICK ACTIONS
                    ====================================================== */}

                    <section
                        className={
                            styles.quickBar
                        }
                    >

                        <div>

                            <span>
                                Doctor ID
                            </span>

                            <strong>
                                {
                                    doctor.doctorCode
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Joined
                            </span>

                            <strong>
                                {
                                    doctor.joinedAt
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Experience
                            </span>

                            <strong>
                                {
                                    doctor.experience
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Consultation
                            </span>

                            <strong>
                                ৳
                                {
                                    consultationFee
                                }
                            </strong>

                        </div>


                        <div
                            className={
                                styles.quickActions
                            }
                        >

                            <Link
                                href={`/doctors/${doctor.id}`}
                                target="_blank"
                                className={
                                    styles.previewButton
                                }
                            >

                                <VisibilityOutlinedIcon />

                                View Public Profile

                            </Link>

                        </div>

                    </section>


                    {/* =====================================================
                        MAIN GRID
                    ====================================================== */}

                    <div className={styles.mainGrid}>


                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className={styles.mainColumn}>


                            {/* =============================================
                                BASIC INFORMATION
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <PersonOutlineRoundedIcon />

                                        <div>

                                            <h2>
                                                Basic information
                                            </h2>

                                            <span>
                                                Doctor profile details
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className={
                                            styles.editButton
                                        }
                                    >

                                        <EditOutlinedIcon />

                                        Edit

                                    </button>

                                </div>


                                <div
                                    className={
                                        styles.infoGrid
                                    }
                                >

                                    <div>

                                        <span>
                                            Full name
                                        </span>

                                        <strong>
                                            {
                                                doctor.name
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Specialty
                                        </span>

                                        <strong>
                                            {
                                                doctor.specialty
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Degree
                                        </span>

                                        <strong>
                                            {
                                                doctor.degree
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            University
                                        </span>

                                        <strong>
                                            {
                                                doctor.university
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Hospital / Institution
                                        </span>

                                        <strong>
                                            {
                                                doctor.hospital
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Experience
                                        </span>

                                        <strong>
                                            {
                                                doctor.experience
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                doctor.phone
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                doctor.email
                                            }
                                        </strong>

                                    </div>


                                    <div
                                        className={
                                            styles.fullWidth
                                        }
                                    >

                                        <span>
                                            Location
                                        </span>

                                        <strong>
                                            {
                                                doctor.location
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                ABOUT
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <DescriptionOutlinedIcon />

                                        <div>

                                            <h2>
                                                About doctor
                                            </h2>

                                            <span>
                                                Public profile description
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <p
                                    className={
                                        styles.aboutText
                                    }
                                >
                                    {
                                        doctor.about
                                    }
                                </p>

                            </section>


                            {/* =============================================
                                CREDENTIALS
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <SchoolOutlinedIcon />

                                        <div>

                                            <h2>
                                                Credentials
                                            </h2>

                                            <span>
                                                Documents and verification
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.credentials
                                    }
                                >

                                    {doctor.credentials.map(
                                        (credential) => (

                                            <div
                                                key={
                                                    credential.id
                                                }
                                                className={
                                                    styles.credential
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.credentialIcon
                                                    }
                                                >

                                                    <DescriptionOutlinedIcon />

                                                </div>


                                                <div
                                                    className={
                                                        styles.credentialInfo
                                                    }
                                                >

                                                    <strong>
                                                        {
                                                            credential.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            credential.type
                                                        }
                                                    </span>

                                                </div>


                                                <span
                                                    className={`${styles.credentialStatus} ${
                                                        credential.status ===
                                                        "verified"
                                                            ? styles.verified
                                                            : styles.pending
                                                    }`}
                                                >

                                                    <VerifiedRoundedIcon />

                                                    {
                                                        credential.status ===
                                                        "verified"
                                                            ? "Verified"
                                                            : "Pending"
                                                    }

                                                </span>


                                                <button
                                                    type="button"
                                                    className={
                                                        styles.viewCredential
                                                    }
                                                >

                                                    View

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>


                            {/* =============================================
                                SCHEDULE
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <CalendarMonthOutlinedIcon />

                                        <div>

                                            <h2>
                                                Consultation schedule
                                            </h2>

                                            <span>
                                                Onsite visiting availability
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.schedule
                                    }
                                >

                                    {doctor.schedule.map(
                                        (day) => (

                                            <div
                                                key={
                                                    day.day
                                                }
                                                className={
                                                    day.available
                                                        ? styles.scheduleRow
                                                        : styles.scheduleRowDisabled
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.dayName
                                                    }
                                                >

                                                    {day.available ? (

                                                        <EventAvailableOutlinedIcon />

                                                    ) : (

                                                        <EventBusyOutlinedIcon />

                                                    )}

                                                    <strong>
                                                        {
                                                            day.day
                                                        }
                                                    </strong>

                                                </div>


                                                {day.available ? (

                                                    <span
                                                        className={
                                                            styles.timeSlot
                                                        }
                                                    >

                                                        <AccessTimeOutlinedIcon />

                                                        {
                                                            day.start
                                                        }
                                                        {" – "}
                                                        {
                                                            day.end
                                                        }

                                                    </span>

                                                ) : (

                                                    <span
                                                        className={
                                                            styles.unavailable
                                                        }
                                                    >
                                                        Not available
                                                    </span>

                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            RIGHT SIDEBAR
                        ================================================== */}

                        <aside
                            className={
                                styles.sidebar
                            }
                        >


                            {/* =============================================
                                VERIFICATION
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <VerifiedRoundedIcon />

                                    <div>

                                        <h2>
                                            Verification
                                        </h2>

                                        <span>
                                            Doctor approval
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.verificationBox
                                    }
                                >

                                    <div
                                        className={`${styles.largeVerificationIcon} ${
                                            verification ===
                                            "verified"
                                                ? styles.verifiedIcon
                                                : verification ===
                                                  "rejected"
                                                    ? styles.rejectedIcon
                                                    : styles.pendingIcon
                                        }`}
                                    >

                                        {verification ===
                                        "verified" ? (

                                            <VerifiedRoundedIcon />

                                        ) : verification ===
                                          "rejected" ? (

                                            <CancelOutlinedIcon />

                                        ) : (

                                            <PendingOutlinedIcon />

                                        )}

                                    </div>


                                    <strong>
                                        {verificationLabel}
                                    </strong>


                                    <span>
                                        {verification ===
                                        "verified"
                                            ? "This doctor's profile and credentials have been verified."
                                            : verification ===
                                              "rejected"
                                                ? "This doctor's verification was rejected."
                                                : "This doctor is waiting for verification."}
                                    </span>

                                </div>


                                {verification !==
                                    "verified" && (

                                    <div
                                        className={
                                            styles.verificationActions
                                        }
                                    >

                                        <button
                                            type="button"
                                            className={
                                                styles.verifyButton
                                            }
                                            onClick={
                                                handleVerify
                                            }
                                        >

                                            <CheckCircleRoundedIcon />

                                            Verify Doctor

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                styles.rejectButton
                                            }
                                            onClick={() =>
                                                setShowRejectModal(
                                                    true
                                                )
                                            }
                                        >

                                            <CancelOutlinedIcon />

                                            Reject

                                        </button>

                                    </div>

                                )}

                            </section>


                            {/* =============================================
                                ONSITE CONSULTATION
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <LocalHospitalOutlinedIcon />

                                    <div>

                                        <h2>
                                            Onsite consultation
                                        </h2>

                                        <span>
                                            Doctor visiting settings
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.settingList
                                    }
                                >

                                    {/* AVAILABILITY */}

                                    <div
                                        className={
                                            styles.settingRow
                                        }
                                    >

                                        <div>

                                            <strong>
                                                Available now
                                            </strong>

                                            <span>
                                                Show doctor as available
                                                to patients
                                            </span>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAvailable(
                                                    !available
                                                )
                                            }
                                            className={
                                                available
                                                    ? styles.toggleActive
                                                    : styles.toggle
                                            }
                                            aria-label="Toggle availability"
                                        >

                                            <span />

                                        </button>

                                    </div>


                                    {/* ONSITE */}

                                    <div
                                        className={
                                            styles.settingRow
                                        }
                                    >

                                        <div>

                                            <strong>
                                                Onsite visits
                                            </strong>

                                            <span>
                                                Allow patients to contact
                                                this doctor for onsite visits
                                            </span>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOnsiteConsultation(
                                                    !onsiteConsultation
                                                )
                                            }
                                            className={
                                                onsiteConsultation
                                                    ? styles.toggleActive
                                                    : styles.toggle
                                            }
                                            aria-label="Toggle onsite consultation"
                                        >

                                            <span />

                                        </button>

                                    </div>

                                </div>


                                {/* CONSULTATION SETTINGS */}

                                <div
                                    className={
                                        styles.formSettings
                                    }
                                >

                                    <div
                                        className={
                                            styles.settingField
                                        }
                                    >

                                        <label>
                                            Consultation fee
                                        </label>

                                        <div
                                            className={
                                                styles.moneyInput
                                            }
                                        >

                                            <span>
                                                ৳
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    consultationFee
                                                }
                                                onChange={(event) =>
                                                    setConsultationFee(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.settingField
                                        }
                                    >

                                        <label>
                                            Duration
                                        </label>

                                        <select
                                            value={
                                                consultationDuration
                                            }
                                            onChange={(event) =>
                                                setConsultationDuration(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="15">
                                                15 minutes
                                            </option>

                                            <option value="20">
                                                20 minutes
                                            </option>

                                            <option value="30">
                                                30 minutes
                                            </option>

                                            <option value="45">
                                                45 minutes
                                            </option>

                                            <option value="60">
                                                60 minutes
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                CONTACT
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <PhoneOutlinedIcon />

                                    <div>

                                        <h2>
                                            Contact
                                        </h2>

                                        <span>
                                            Direct contact information
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.contactList
                                    }
                                >

                                    <a
                                        href={`tel:${doctor.phone}`}
                                    >

                                        <PhoneOutlinedIcon />

                                        <span>
                                            {
                                                doctor.phone
                                            }
                                        </span>

                                    </a>


                                    <div>

                                        <LocationOnOutlinedIcon />

                                        <span>
                                            {
                                                doctor.location
                                            }
                                        </span>

                                    </div>


                                    <div>

                                        <LocalHospitalOutlinedIcon />

                                        <span>
                                            {
                                                doctor.hospital
                                            }
                                        </span>

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                ADMIN NOTE
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <EditOutlinedIcon />

                                    <div>

                                        <h2>
                                            Admin note
                                        </h2>

                                        <span>
                                            Internal only
                                        </span>

                                    </div>

                                </div>


                                <textarea
                                    className={
                                        styles.adminNote
                                    }
                                    rows={4}
                                    value={
                                        adminNote
                                    }
                                    onChange={(event) =>
                                        setAdminNote(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Add an internal note..."
                                />

                            </section>


                            {/* =============================================
                                SAVE
                            ============================================== */}

                            <button
                                type="button"
                                className={
                                    styles.saveButton
                                }
                                onClick={
                                    handleSave
                                }
                                disabled={
                                    saving
                                }
                            >

                                <SaveOutlinedIcon />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>


                            {/* =============================================
                                ACCOUNT CONTROL
                            ============================================== */}

                            {status === "active" ? (

                                <button
                                    type="button"
                                    className={
                                        styles.deactivateButton
                                    }
                                    onClick={() =>
                                        setShowDeactivateModal(
                                            true
                                        )
                                    }
                                >

                                    <BlockOutlinedIcon />

                                    Deactivate Doctor

                                </button>

                            ) : (

                                <button
                                    type="button"
                                    className={
                                        styles.activateButton
                                    }
                                    onClick={() =>
                                        setStatus(
                                            "active"
                                        )
                                    }
                                >

                                    <CheckCircleRoundedIcon />

                                    Activate Doctor

                                </button>

                            )}

                        </aside>

                    </div>

                </div>

            </main>


            {/* =====================================================
                DEACTIVATE MODAL
            ====================================================== */}

            {showDeactivateModal && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowDeactivateModal(
                            false
                        )
                    }
                >

                    <div
                        className={
                            styles.modal
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
                                setShowDeactivateModal(
                                    false
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalWarning
                            }
                        >

                            <BlockOutlinedIcon />

                        </div>


                        <h2>
                            Deactivate doctor?
                        </h2>


                        <p>
                            This doctor will no longer be
                            shown as active to patients and
                            won't receive new onsite visit requests.
                        </p>


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.secondaryButton
                                }
                                onClick={() =>
                                    setShowDeactivateModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    styles.dangerButton
                                }
                                onClick={
                                    handleDeactivate
                                }
                            >
                                Deactivate
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                REJECT MODAL
            ====================================================== */}

            {showRejectModal && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowRejectModal(
                            false
                        )
                    }
                >

                    <div
                        className={
                            styles.modal
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
                                setShowRejectModal(
                                    false
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalReject
                            }
                        >

                            <WarningAmberRoundedIcon />

                        </div>


                        <h2>
                            Reject doctor verification?
                        </h2>


                        <p>
                            The doctor will remain unverified.
                            Add a reason for internal records.
                        </p>


                        <textarea
                            className={
                                styles.modalTextarea
                            }
                            rows={4}
                            placeholder="Reason for rejection..."
                        />


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.secondaryButton
                                }
                                onClick={() =>
                                    setShowRejectModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    styles.dangerButton
                                }
                                onClick={
                                    handleReject
                                }
                            >
                                Reject Doctor
                            </button>

                        </div>

                    </div>

                </div>

            )}


            <Footer />

        </>
    );
}