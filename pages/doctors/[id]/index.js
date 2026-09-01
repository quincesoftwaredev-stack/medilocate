import Head from "next/head";
import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";


import axios from "axios";
import { parse } from "cookie";
import styles from "@/styles/Doctor/Profile.module.css";
import BASE_URL from "@/config";
import { BookingWizard, ConsultationAvailability, ProfessionalOverview } from "@/components/Doctors/Profile";


/*
|--------------------------------------------------------------------------
| DATE FORMAT
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) {
        return "";
    }

    try {

        return new Intl.DateTimeFormat(
            "en-BD",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(
            new Date(date)
        );

    } catch {

        return "";

    }

};


/*
|--------------------------------------------------------------------------
| EXPERIENCE
|--------------------------------------------------------------------------
*/

const formatExperience = (value) => {

    const years =
        Number(value || 0);

    if (!years) {
        return "Experience not specified";
    }

    return `${years} ${years === 1
            ? "Year"
            : "Years"
        } Experience`;

};


/*
|--------------------------------------------------------------------------
| DOCTOR NORMALIZER
|--------------------------------------------------------------------------
*/

const normalizeDoctor = (
    doctor
) => {

    const user =
        doctor?.user || {};


    const name =
        user.fullName ||
        [
            user.firstName,
            user.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Doctor";


    /*
    | User location is available in the old
    | User model.
    */

    const coordinates =
        user.location?.coordinates ||
        [];


    return {

        id:
            doctor._id?.toString(),

        name,

        specialty:
            doctor.speciality ||
            "Medical Practitioner",

        qualification:
            doctor.education ||
            "Qualification not specified",

        experience:
            formatExperience(
                doctor.totalExperience
            ),

        location:
            doctor.workingIn ||
            "Location not specified",

        chamber:
            doctor.workingIn ||
            "Chamber information not available",

        address:
            doctor.workingIn ||
            "Address not available",

        fee:
            doctor.consultationFee
                ? `৳${doctor.consultationFee}`
                : "Contact for fee",

        followUpFee:
            doctor.followUpFee
                ? `৳${doctor.followUpFee}`
                : "",

        gender:
            user.gender ||
            "",

        /*
        | These are not currently present in your
        | Doctor model, so use safe defaults.
        */

        rating:
            doctor.rating ||
            null,

        reviews:
            doctor.reviews ||
            0,

        available:
            doctor.availableForHomeVisit !== false,

        image:
            user.image ||
            "",

        phone:
            user.phone ||
            user.phoneNumber ||
            "",

        email:
            user.email ||
            "",

        about:
            doctor.about ||
            "Doctor information has not been added yet.",

        education:
            doctor.education
                ? [
                    doctor.education,
                ]
                : [],

        experienceDetails:
            doctor.experienceDetails
                ? [
                    doctor.experienceDetails,
                ]
                : [],

        specializations:
            [],

        visitingDays:
            [],

        designation:
            doctor.designation || "",

        languages:
            Array.isArray(doctor.languages) ? doctor.languages : [],

        chambers:
            Array.isArray(doctor.chambers) ? doctor.chambers : [],

        weeklyAvailability:
            Array.isArray(doctor.weeklyAvailability) ? doctor.weeklyAvailability : [],

        unavailablePeriods:
            Array.isArray(doctor.unavailablePeriods) ? doctor.unavailablePeriods : [],

        bookingSettings:
            doctor.bookingSettings || null,

        consultationModes:
            doctor.consultationModes || {},

        bmdcNumber:
            doctor.bmdcNumber ||
            "",

        departments:
            doctor.departments ||
            [],

        coordinates,

        createdAt:
            doctor.createdAt ||
            null,

        verificationStatus:
            doctor.verificationStatus ||
            "pending",

        status:
            doctor.status ||
            "inactive",

    };

};


export default function DoctorProfilePage({
    doctor,
    canEdit = false,
}) {

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
                        Doctor Not Found | MediLocate
                    </title>

                </Head>


                <main
                    className={
                        styles.notFound
                    }
                >

                    <div>

                        <h1>
                            Doctor not found
                        </h1>

                        <p>
                            The doctor profile you're looking
                            for could not be found.
                        </p>

                        <Link
                            href="/doctors"
                            className={
                                styles.backButton
                            }
                        >

                            <ArrowBackIcon />

                            Back to Doctors

                        </Link>

                    </div>

                </main>

            </>
        );

    }


    const hasRating =
        doctor.rating !== null &&
        doctor.rating !== undefined;


    const isVerified =
        doctor.verificationStatus ===
        "verified";

    const hasBookingAvailability =
        doctor.status === "active" &&
        (
            doctor.weeklyAvailability?.some(
                (day) => day.isAvailable && day.slots?.length
            ) ||
            Object.values(doctor.consultationModes || {}).some(
                (mode) => mode?.enabled
            )
        );


    return (
        <>
            <Head>

                <title>
                    {doctor.name} | {doctor.specialty} | MediLocate
                </title>


                <meta
                    name="description"
                    content={`${doctor.name} - ${doctor.specialty}. View qualifications, experience and consultation information on MediLocate.`}
                />

            </Head>




            <main className={styles.page}>


                {/* =====================================================
                    BACK
                ====================================================== */}

                <div
                    className={
                        styles.container
                    }
                >

                    <div className={styles.profileToolbar}>
                        <Link href="/doctors" className={styles.backLink}>
                            <ArrowBackIcon />
                            Back to Doctors
                        </Link>

                    </div>

                </div>


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
                                styles.heroCard
                            }
                        >


                            {/* =================================================
                                IMAGE
                            ================================================== */}

                            <div
                                className={
                                    styles.photoWrapper
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
                                        className={
                                            styles.photo
                                        }
                                    />

                                ) : (

                                    <div
                                        className={
                                            styles.photoPlaceholder
                                        }
                                    >
                                        {
                                            doctor.name
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()
                                        }
                                    </div>

                                )}


                                {hasBookingAvailability && (

                                    <span
                                        className={
                                            styles.availableIndicator
                                        }
                                    >
                                        Booking available
                                    </span>

                                )}

                            </div>


                            {/* =================================================
                                BASIC INFO
                            ================================================== */}

                            <div
                                className={
                                    styles.heroInfo
                                }
                            >

                                {isVerified && (

                                    <div
                                        className={
                                            styles.verified
                                        }
                                    >

                                        <VerifiedOutlinedIcon />

                                        Verified Doctor

                                    </div>

                                )}


                                <h1>
                                    {doctor.name}
                                </h1>


                                <div
                                    className={
                                        styles.specialty
                                    }
                                >
                                    {doctor.specialty}
                                </div>

                                {canEdit && (
                                    <Link
                                        href={`/doctors/${doctor.id}/edit`}
                                        className={styles.updateProfileButton}
                                        aria-label="Update doctor profile"
                                        title="Update profile"
                                    >
                                        <EditOutlinedIcon />
                                        <span>Edit profile</span>
                                    </Link>
                                )}


                                <div
                                    className={
                                        styles.qualification
                                    }
                                >
                                    {
                                        doctor.qualification
                                    }
                                </div>


                                {/* =================================================
                                    RATING
                                ================================================== */}

                                {hasRating ? (

                                    <div
                                        className={
                                            styles.rating
                                        }
                                    >

                                        <div
                                            className={
                                                styles.ratingStars
                                            }
                                        >

                                            <StarRoundedIcon />

                                            <strong>
                                                {
                                                    doctor.rating
                                                }
                                            </strong>

                                        </div>


                                        <span>
                                            {
                                                doctor.reviews
                                            }
                                            {" "}
                                            patient reviews
                                        </span>

                                    </div>

                                ) : (

                                    <div
                                        className={
                                            styles.rating
                                        }
                                    >

                                        <span>
                                            No reviews yet
                                        </span>

                                    </div>

                                )}


                                {/* =================================================
                                    META
                                ================================================== */}

                                <div
                                    className={
                                        styles.heroMeta
                                    }
                                >

                                    {doctor.location && (

                                        <div>

                                            <LocationOnOutlinedIcon />

                                            <span>
                                                {
                                                    doctor.location
                                                }
                                            </span>

                                        </div>

                                    )}


                                    <div>

                                        <WorkOutlineOutlinedIcon />

                                        <span>
                                            {
                                                doctor.experience
                                            }
                                        </span>

                                    </div>

                                    <div>
                                        <VerifiedOutlinedIcon />
                                        <span>
                                            {doctor.status === "active" ? "Active profile" : doctor.status}
                                            {hasBookingAvailability ? " · Accepting bookings" : " · Booking unavailable"}
                                        </span>
                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                HERO ACTION
                            ================================================== */}

                            <div
                                className={
                                    styles.heroAction
                                }
                            >

                                <span>Consultation fees</span>

                                <div className={styles.modeFeeList}>
                                    {[
                                        ["Chamber", "chamber", doctor.consultationModes?.chamber],
                                        ["Online", "online", doctor.consultationModes?.online],
                                        ["Home visit", "home-visit", doctor.consultationModes?.homeVisit],
                                    ].filter(([, modeKey]) => doctor.weeklyAvailability?.some(
                                        (day) => day.isAvailable !== false && day.slots?.some((slot) => (slot.consultationMode || "chamber") === modeKey)
                                    )).map(([label, , mode]) => (
                                        <div className={styles.modeFeeItem} key={label}>
                                            <span>{label}</span>
                                            <strong>৳{Number(mode?.fee || 0).toLocaleString("en-BD")}</strong>
                                        </div>
                                    ))}
                                </div>

                                {hasBookingAvailability && (
                                    <BookingWizard doctor={doctor} />
                                )}


                                <small>
                                    Select an available mode and schedule to book.
                                </small>

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

                        <div
                            className={
                                styles.contentGrid
                            }
                        >


                            {/* =================================================
                                LEFT
                            ================================================== */}

                            <div
                                className={
                                    styles.mainColumn
                                }
                            >

                                <ProfessionalOverview doctor={doctor} />

                                {false && (
                                <>


                                {/* =============================================
                                    ABOUT
                                ============================================== */}

                                <section
                                    className={
                                        styles.section
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionTitle
                                        }
                                    >

                                        <MedicalServicesOutlinedIcon />

                                        <h2>
                                            About Doctor
                                        </h2>

                                    </div>


                                    <p
                                        className={
                                            styles.about
                                        }
                                    >
                                        {
                                            doctor.about
                                        }
                                    </p>

                                </section>


                                {/* =============================================
                                    DEPARTMENTS / SPECIALITY
                                ============================================== */}

                                <section
                                    className={
                                        styles.section
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionTitle
                                        }
                                    >

                                        <MedicalServicesOutlinedIcon />

                                        <h2>
                                            Specializations
                                        </h2>

                                    </div>


                                    <div
                                        className={
                                            styles.specializations
                                        }
                                    >

                                        <span>
                                            {
                                                doctor.specialty
                                            }
                                        </span>


                                        {doctor.departments
                                            .filter(
                                                Boolean
                                            )
                                            .map(
                                                (
                                                    department,
                                                    index
                                                ) => (

                                                    <span
                                                        key={
                                                            department._id ||
                                                            index
                                                        }
                                                    >
                                                        {
                                                            department.name ||
                                                            department
                                                        }
                                                    </span>

                                                )
                                            )}

                                    </div>

                                </section>


                                {/* =============================================
                                    EDUCATION
                                ============================================== */}

                                <section
                                    className={
                                        styles.section
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionTitle
                                        }
                                    >

                                        <SchoolOutlinedIcon />

                                        <h2>
                                            Education & Qualifications
                                        </h2>

                                    </div>


                                    <div
                                        className={
                                            styles.list
                                        }
                                    >

                                        {doctor.education.length >
                                            0 ? (

                                            doctor.education.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className={
                                                            styles.listItem
                                                        }
                                                    >

                                                        <span
                                                            className={
                                                                styles.listDot
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                item
                                                            }
                                                        </span>

                                                    </div>

                                                )
                                            )

                                        ) : (

                                            <div
                                                className={
                                                    styles.listItem
                                                }
                                            >

                                                <span
                                                    className={
                                                        styles.listDot
                                                    }
                                                />

                                                <span>
                                                    Education
                                                    information
                                                    not available.
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                </section>


                                {/* =============================================
                                    EXPERIENCE
                                ============================================== */}

                                <section
                                    className={
                                        styles.section
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionTitle
                                        }
                                    >

                                        <WorkOutlineOutlinedIcon />

                                        <h2>
                                            Experience
                                        </h2>

                                    </div>


                                    <div
                                        className={
                                            styles.list
                                        }
                                    >

                                        <div
                                            className={
                                                styles.listItem
                                            }
                                        >

                                            <span
                                                className={
                                                    styles.listDot
                                                }
                                            />

                                            <span>
                                                {
                                                    doctor.experience
                                                }
                                            </span>

                                        </div>


                                        {doctor.experienceDetails.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className={
                                                        styles.listItem
                                                    }
                                                >

                                                    <span
                                                        className={
                                                            styles.listDot
                                                        }
                                                    />

                                                    <span>
                                                        {
                                                            item
                                                        }
                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </section>


                                {/* =============================================
                                    BMDC
                                ============================================== */}

                                {doctor.bmdcNumber && (

                                    <section
                                        className={
                                            styles.section
                                        }
                                    >

                                        <div
                                            className={
                                                styles.sectionTitle
                                            }
                                        >

                                            <VerifiedOutlinedIcon />

                                            <h2>
                                                Professional Registration
                                            </h2>

                                        </div>


                                        <div
                                            className={
                                                styles.list
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.listItem
                                                }
                                            >

                                                <span
                                                    className={
                                                        styles.listDot
                                                    }
                                                />

                                                <span>
                                                    BMDC Registration:
                                                    {" "}
                                                    <strong>
                                                        {
                                                            doctor.bmdcNumber
                                                        }
                                                    </strong>
                                                </span>

                                            </div>

                                        </div>

                                    </section>

                                )}

                                </>
                                )}

                            </div>


                            {/* =================================================
                                SIDEBAR
                            ================================================== */}

                            <aside
                                className={
                                    styles.sidebar
                                }
                            >


                                {/* =============================================
                                    CONSULTATION
                                ============================================== */}

                                <div
                                    className={`${styles.sidebarCard} ${styles.legacyConsultationCard}`}
                                >

                                    <div
                                        className={
                                            styles.sidebarHeader
                                        }
                                    >

                                        <div
                                            className={
                                                styles.sidebarIcon
                                            }
                                        >

                                            <CalendarTodayOutlinedIcon />

                                        </div>


                                        <div>

                                            <h3>
                                                Consultation
                                            </h3>

                                            <span>
                                                Doctor information
                                            </span>

                                        </div>

                                    </div>


                                    {/* Working institution */}

                                    {doctor.workingIn && (

                                        <div
                                            className={
                                                styles.chamber
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.detailIcon
                                                }
                                            >

                                                <BusinessOutlinedIcon />

                                            </div>


                                            <div>

                                                <span>
                                                    Working Institution
                                                </span>

                                                <strong>
                                                    {
                                                        doctor.workingIn
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    )}


                                    {/* Location */}

                                    {doctor.location && (

                                        <div
                                            className={
                                                styles.chamber
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.detailIcon
                                                }
                                            >

                                                <LocationOnOutlinedIcon />

                                            </div>


                                            <div>

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

                                    )}


                                </div>


                                {/* =============================================
                                    PROFILE STATUS
                                ============================================== */}

                                <div
                                    className={
                                        styles.consultationCard
                                    }
                                >

                                    <span>
                                        Doctor Status
                                    </span>


                                    <strong>

                                        {
                                            doctor.status ===
                                                "active"
                                                ? "Active"
                                                : doctor.status
                                        }

                                    </strong>


                                    <p>

                                        {isVerified
                                            ? "This doctor profile has been verified by MediLocate."
                                            : "This doctor's professional profile is currently being reviewed."}

                                    </p>


                                </div>


                            </aside>

                        </div>

                    </div>

                </section>

                <ConsultationAvailability doctor={doctor} />

                {doctor.createdAt && (
                    <div className={styles.profileCreated}>
                        <CalendarTodayOutlinedIcon />
                        <span>Profile created {formatDate(doctor.createdAt)}</span>
                    </div>
                )}

            </main>


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

    try {

        const {
            params,
        } = context;


        const identifier =
            params?.id;


        if (!identifier) {

            return {
                notFound: true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | FETCH DOCTOR FROM API
        |--------------------------------------------------------------------------
        */

        const response =
            await axios.get(
                `${BASE_URL}/api/doctors/${identifier}`
            );


        const data =
            response.data;


        /*
        |--------------------------------------------------------------------------
        | API RESPONSE CHECK
        |--------------------------------------------------------------------------
        */

        if (
            !data?.success ||
            !data?.doctor
        ) {

            return {
                notFound: true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | DOCTOR DATA
        |--------------------------------------------------------------------------
        */

        const doctor =
            data.doctor;

        const user =
            doctor.user || {};

        let viewer = null;
        try {
            const cookies = parse(context.req?.headers?.cookie || "");
            viewer = cookies.userInfo ? JSON.parse(cookies.userInfo) : null;
        } catch {
            viewer = null;
        }

        const viewerId = String(viewer?._id || viewer?.id || "");
        const doctorUserId = String(user?._id || "");
        const canEdit = viewer?.role === "admin" || (viewerId && viewerId === doctorUserId);


        /*
        |--------------------------------------------------------------------------
        | NORMALIZED DATA
        |--------------------------------------------------------------------------
        */

        const normalizedDoctor = {

            id:
                doctor._id?.toString() ||
                identifier,


            name:
                user.fullName?.trim() ||
                [
                    user.firstName,
                    user.lastName,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                "Doctor",


            specialty:
                doctor.speciality ||
                "Medical Practitioner",


            qualification:
                doctor.education ||
                "Qualification not specified",


            experience:
                doctor.totalExperience
                    ? `${doctor.totalExperience} ${
                        Number(
                            doctor.totalExperience
                        ) === 1
                            ? "Year"
                            : "Years"
                    } Experience`
                    : "Experience not specified",


            location:
                doctor.workingIn ||
                "Location not specified",


            chamber:
                doctor.workingIn ||
                "Chamber information not available",


            address:
                doctor.workingIn ||
                "Address not available",


            fee:
                doctor.consultationFee !==
                undefined &&
                doctor.consultationFee !==
                null
                    ? `৳${doctor.consultationFee}`
                    : "Contact for fee",


            followUpFee:
                doctor.followUpFee !==
                    undefined &&
                doctor.followUpFee !==
                    null
                    ? `৳${doctor.followUpFee}`
                    : "",


            gender:
                user.gender ||
                "",


            rating:
                doctor.rating ??
                null,


            reviews:
                doctor.reviews ??
                0,


            available:
                doctor.availableForHomeVisit ===
                true,


            image:
                user.image ||
                "",


            phone:
                user.phone ||
                user.phoneNumber ||
                "",


            email:
                user.email ||
                "",


            about:
                doctor.about ||
                "Doctor information has not been added yet.",


            education:
                doctor.education
                    ? [doctor.education]
                    : [],


            experienceDetails:
                doctor.experienceDetails
                    ? [doctor.experienceDetails]
                    : [],


            specializations:
                [],


            visitingDays:
                [],

            designation:
                doctor.designation || "",

            languages:
                Array.isArray(doctor.languages) ? doctor.languages : [],

            chambers:
                Array.isArray(doctor.chambers) ? doctor.chambers : [],

            weeklyAvailability:
                Array.isArray(doctor.weeklyAvailability) ? doctor.weeklyAvailability : [],

            unavailablePeriods:
                Array.isArray(doctor.unavailablePeriods) ? doctor.unavailablePeriods : [],

            bookingSettings:
                doctor.bookingSettings || null,

            consultationModes:
                doctor.consultationModes || {},


            bmdcNumber:
                doctor.bmdcNumber ||
                "",


            departments:
                Array.isArray(
                    doctor.departments
                )
                    ? doctor.departments
                    : [],


            coordinates:
                user.location?.coordinates ||
                [],


            createdAt:
                doctor.createdAt ||
                null,


            verificationStatus:
                doctor.verificationStatus ||
                "pending",


            status:
                doctor.status ||
                "inactive",

        };


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return {

            props: {

                doctor:
                    JSON.parse(
                        JSON.stringify(
                            normalizedDoctor
                        )
                    ),

                canEdit: Boolean(canEdit),

            },

        };

    } catch (error) {

        console.error(
            "Doctor profile SSR error:",
            error.response?.data ||
            error.message
        );


        return {
            notFound: true,
        };

    }

}
