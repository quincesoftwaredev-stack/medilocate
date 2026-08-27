import Head from "next/head";
import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import Navbar from "../../../components/home/Navbar";
import Footer from "../../../components/home/Footer";

import styles from "@/styles/Doctor/Profile.module.css";


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

    return `${years} ${
        years === 1
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

                <Navbar />

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

                <Footer />
            </>
        );

    }


    const hasRating =
        doctor.rating !== null &&
        doctor.rating !== undefined;


    const isVerified =
        doctor.verificationStatus ===
        "verified";


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


            <Navbar />


            <main className={styles.page}>


                {/* =====================================================
                    BACK
                ====================================================== */}

                <div
                    className={
                        styles.container
                    }
                >

                    <Link
                        href="/doctors"
                        className={
                            styles.backLink
                        }
                    >

                        <ArrowBackIcon />

                        Back to Doctors

                    </Link>

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


                                {doctor.available && (

                                    <span
                                        className={
                                            styles.availableIndicator
                                        }
                                    >
                                        Available
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
                                    {
                                        doctor.specialty
                                    }
                                </div>


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

                                <span>
                                    Consultation Fee
                                </span>


                                <strong>
                                    {
                                        doctor.fee
                                    }
                                </strong>


                                {doctor.phone && (

                                    <a
                                        href={`tel:${doctor.phone}`}
                                        className={
                                            styles.callButton
                                        }
                                    >

                                        <PhoneOutlinedIcon />

                                        Call Doctor

                                    </a>

                                )}


                                <small>
                                    Contact the doctor directly
                                    for consultation information.
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
                                    className={
                                        styles.sidebarCard
                                    }
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


                                    {/* Fee */}

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

                                            <MedicalServicesOutlinedIcon />

                                        </div>


                                        <div>

                                            <span>
                                                Consultation Fee
                                            </span>

                                            <strong>
                                                {
                                                    doctor.fee
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* Follow up */}

                                    {doctor.followUpFee && (

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

                                                <AccessTimeOutlinedIcon />

                                            </div>


                                            <div>

                                                <span>
                                                    Follow-up Fee
                                                </span>

                                                <strong>
                                                    {
                                                        doctor.followUpFee
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    )}


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


                                    {doctor.phone && (

                                        <a
                                            href={`tel:${doctor.phone}`}
                                            className={
                                                styles.sidebarCall
                                            }
                                        >

                                            <PhoneOutlinedIcon />

                                            Call Doctor

                                        </a>

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


                                    {doctor.phone && (

                                        <a
                                            href={`tel:${doctor.phone}`}
                                        >

                                            <PhoneOutlinedIcon />

                                            Contact Doctor

                                        </a>

                                    )}

                                </div>


                                {/* =============================================
                                    MEMBER SINCE
                                ============================================== */}

                                {doctor.createdAt && (

                                    <div
                                        style={{
                                            marginTop: "12px",
                                            padding: "12px 14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            color:
                                                "var(--ml-gray-500)",
                                            fontSize:
                                                "var(--ml-font-sm)",
                                        }}
                                    >

                                        <CalendarTodayOutlinedIcon
                                            style={{
                                                fontSize: "18px",
                                                color:
                                                    "var(--ml-teal)",
                                            }}
                                        />

                                        <span>
                                            Profile created
                                            {" "}
                                            {
                                                formatDate(
                                                    doctor.createdAt
                                                )
                                            }
                                        </span>

                                    </div>

                                )}

                            </aside>

                        </div>

                    </div>

                </section>

            </main>


            {/* =====================================================
                MOBILE CALL BAR
            ====================================================== */}

            {doctor.phone && (

                <div
                    className={
                        styles.mobileCallBar
                    }
                >

                    <div>

                        <span>
                            Consultation
                        </span>

                        <strong>
                            {
                                doctor.fee
                            }
                        </strong>

                    </div>


                    <a
                        href={`tel:${doctor.phone}`}
                    >

                        <PhoneOutlinedIcon />

                        Call Doctor

                    </a>

                </div>

            )}


            <Footer />

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
        | DATABASE
        |--------------------------------------------------------------------------
        */

        const db =
            (
                await import(
                    "@/database/connection"
                )
            ).default;


        const Doctor =
            (
                await import(
                    "@/database/model/Doctor"
                )
            ).default;


        await db.connect();


        /*
        |--------------------------------------------------------------------------
        | FIND DOCTOR
        |--------------------------------------------------------------------------
        |
        | Supports either:
        |
        | /doctors/<doctor _id>
        |
        | /doctors/<user _id>
        |
        */

        let doctor;


        const isMongoId =
            /^[0-9a-fA-F]{24}$/.test(
                identifier
            );


        if (isMongoId) {

            doctor =
                await Doctor
                    .findById(
                        identifier
                    )
                    .populate(
                        "user",
                        "fullName firstName lastName email phone phoneNumber image gender location"
                    )
                    .populate(
                        "departments",
                        "name"
                    )
                    .lean();

        }


        /*
        |--------------------------------------------------------------------------
        | FIND BY USER ID
        |--------------------------------------------------------------------------
        */

        if (!doctor && isMongoId) {

            doctor =
                await Doctor
                    .findOne({
                        user:
                            identifier,
                    })
                    .populate(
                        "user",
                        "fullName firstName lastName email phone phoneNumber image gender location"
                    )
                    .populate(
                        "departments",
                        "name"
                    )
                    .lean();

        }


        if (!doctor) {

            return {
                notFound: true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE
        |--------------------------------------------------------------------------
        */

        const normalizedDoctor =
            normalizeDoctor(
                doctor
            );


        /*
        |--------------------------------------------------------------------------
        | SERIALIZE
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

            },

        };

    } catch (error) {

        console.error(
            "Doctor profile SSR error:",
            error
        );


        return {
            notFound: true,
        };

    }

}