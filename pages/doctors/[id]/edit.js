import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { parse } from "cookie";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";



import DoctorProfileImageUpload from "@/components/Doctors/DoctorProfileImageUpload";
import DoctorAvailabilityEditor, { createAvailabilityForm } from "@/components/Doctors/DoctorAvailabilityEditor";

import {
    showSnackBar,
} from "@/redux/notistackSlice";

import {
    startLoading,
    finishLoading,
} from "@/redux/stateSlice";

import styles from "@/styles/Doctor/ProfileEdit.module.css";

import BASE_URL from "@/config";


function InputField({
    label,
    value,
    onChange,
    placeholder,
    icon,
    type = "text",
    disabled = false,
    required = false,
}) {

    return (
        <div className={styles.formGroup}>

            <label>
                {label}

                {required && (
                    <span>
                        {" "}*
                    </span>
                )}
            </label>

            <div
                className={`${styles.inputWrapper} ${
                    disabled
                        ? styles.disabledInput
                        : ""
                }`}
            >

                {icon}

                <input
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    placeholder={placeholder}
                    disabled={disabled}
                />

            </div>

        </div>
    );

}


export default function DoctorProfileEditPage({
    initialData,
}) {

    const router =
        useRouter();

    const dispatch =
        useDispatch();

    const doctorData =
        initialData?.doctor || {};

    const userData =
        doctorData?.user || {};


    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    const [user, setUser] =
        useState({

            fullName:
                userData.fullName ||
                [
                    userData.firstName,
                    userData.lastName,
                ]
                    .filter(Boolean)
                    .join(" ") ||
                "",

            phone:
                userData.phone ||
                userData.phoneNumber ||
                "",

            email:
                userData.email ||
                "",

            image:
                userData.image ||
                "",

        });


    /*
    |--------------------------------------------------------------------------
    | DOCTOR
    |--------------------------------------------------------------------------
    */

    const [doctor, setDoctor] =
        useState({

            bmdcNumber:
                doctorData.bmdcNumber ||
                "",

            speciality:
                doctorData.speciality ||
                "",

            education:
                doctorData.education ||
                "",

            workingIn:
                doctorData.workingIn ||
                "",

            totalExperience:
                doctorData.totalExperience ??
                "",

            consultationFee:
                doctorData.consultationFee ??
                "",

            about:
                doctorData.about ||
                "",

        });

    const [availability, setAvailability] =
        useState(() => createAvailabilityForm(doctorData));


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    const [imageData, setImageData] =
        useState({

            url:
                userData.image ||
                "",

            publicId:
                "",

        });


    const [saving, setSaving] =
        useState(false);

    const [step, setStep] =
        useState(1);


    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        // Step navigation must never persist draft changes. Browsers can
        // submit a form from nested controls or the Enter key, so only the
        // final review step is allowed to reach the update request.
        if (step !== 3) {
            setStep((current) => Math.min(current + 1, 3));
            return;
        }


        if (
            !user.fullName.trim()
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Full name is required.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

            return;

        }


        if (
            !user.phone.trim()
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Phone number is required.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

            return;

        }


        if (
            !doctor.bmdcNumber.trim()
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "BMDC number is required.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

            return;

        }


        if (
            !doctor.speciality.trim()
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Speciality is required.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

            return;

        }


        try {

            setSaving(
                true
            );

            dispatch(
                startLoading()
            );


            const payload = {

                user: {

                    fullName:
                        user.fullName.trim(),

                    email:
                        user.email.trim(),

                    phone:
                        user.phone.trim(),

                    image:
                        imageData.url || "",

                },

                doctor: {

                    bmdcNumber:
                        doctor.bmdcNumber.trim(),

                    speciality:
                        doctor.speciality.trim(),

                    education:
                        doctor.education.trim(),

                    workingIn:
                        doctor.workingIn.trim(),

                    totalExperience:
                        Number(
                            doctor.totalExperience ||
                            0
                        ),

                    consultationFee:
                        Number(
                            doctor.consultationFee ||
                            0
                        ),

                    about:
                        doctor.about.trim(),

                    chambers:
                        availability.chambers,

                    weeklyAvailability:
                        availability.weeklyAvailability,

                    unavailablePeriods:
                        availability.unavailablePeriods.filter(
                            (period) => period.startDate && period.endDate
                        ),

                    consultationModes:
                        availability.consultationModes,

                    bookingSettings:
                        availability.bookingSettings,

                },

            };


            const browserCookies = parse(document.cookie || "");
            const authenticatedUser = browserCookies.userInfo
                ? JSON.parse(browserCookies.userInfo)
                : {};

            const response =
                await axios.patch(
                    `${BASE_URL}/api/doctors/${encodeURIComponent(
                        router.query.id
                    )}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${authenticatedUser.token || ""}`,
                        },
                    }
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    response.data?.error ||
                    "Failed to update profile."
                );

            }


            dispatch(
                showSnackBar({
                    message:
                        "Doctor profile updated successfully.",
                    option: {
                        variant:
                            "success",
                    },
                })
            );


            const updatedDoctor =
                response.data.doctor;


            router.push(
                `/doctors/${updatedDoctor._id}`
            );

        } catch (error) {

            console.error(
                "Doctor profile update error:",
                error
            );


            dispatch(
                showSnackBar({
                    message:
                        error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        error.message ||
                        "Unable to update profile.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

        } finally {

            setSaving(
                false
            );

            dispatch(
                finishLoading()
            );

        }

    };


    return (
        <>
            <Head>

                <title>
                    Edit Doctor Profile | MediLocate
                </title>

                <meta
                    name="description"
                    content="Update your MediLocate doctor profile and professional information."
                />

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =================================================
                        TOP
                    ================================================== */}

                    <div className={styles.topBar}>

                        <Link
                            href={`/doctors/${doctorData._id}`}
                            className={
                                styles.backLink
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Doctor Profile

                        </Link>


                        <div
                            className={
                                styles.status
                            }
                        >

                            {doctorData.isVerified && (

                                <>
                                    <VerifiedOutlinedIcon />

                                    Verified Doctor
                                </>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span
                                className={
                                    styles.eyebrow
                                }
                            >
                                DOCTOR PROFILE
                            </span>


                            <h1>
                                Manage your profile
                            </h1>


                            <p>
                                Keep your professional
                                information accurate and up to date.
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.saveTopButton
                            }
                            onClick={() => step < 3
                                ? setStep((current) => current + 1)
                                : document.getElementById("doctor-profile-form")?.requestSubmit()
                            }
                            disabled={saving}
                        >

                            <SaveOutlinedIcon />

                            {saving
                                ? "Saving..."
                                : step < 3
                                    ? "Continue"
                                    : "Save Changes"}

                        </button>

                    </header>


                    <form
                        id="doctor-profile-form"
                        onSubmit={
                            handleSubmit
                        }
                        className={styles.form}
                    >

                        <nav className={styles.stepper} aria-label="Profile update progress">
                            {["Profile", "Availability", "Review"].map((label, index) => {
                                const number = index + 1;
                                const active = step >= number;
                                return (
                                    <div className={styles.stepGroup} key={label}>
                                        <button type="button" className={`${styles.stepItem} ${active ? styles.stepActive : ""}`} onClick={() => number < step && setStep(number)}>
                                            <span className={styles.stepNumber}>{step > number ? <CheckCircleRoundedIcon /> : number}</span>
                                            <span>{label}</span>
                                        </button>
                                        {number < 3 && <span className={`${styles.stepLine} ${step > number ? styles.lineActive : ""}`} />}
                                    </div>
                                );
                            })}
                        </nav>

                        {step === 1 && (
                        <>


                        {/* =================================================
                            PROFILE
                        ================================================== */}

                        <section
                            className={styles.card}
                        >

                            <div
                                className={
                                    styles.cardHeader
                                }
                            >

                                <div
                                    className={
                                        styles.sectionIcon
                                    }
                                >

                                    <PersonOutlineRoundedIcon />

                                </div>


                                <div>

                                    <h2>
                                        Profile
                                    </h2>

                                    <p>
                                        Your basic account
                                        information.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.profileArea
                                }
                            >

                                <DoctorProfileImageUpload
                                    value={
                                        user.image
                                    }
                                    onChange={(
                                        data
                                    ) => {

                                        setImageData(
                                            data || {
                                                url: "",
                                                publicId: "",
                                            }
                                        );

                                        setUser(
                                            (previous) => ({
                                                ...previous,
                                                image:
                                                    data?.url ||
                                                    "",
                                            })
                                        );

                                    }}
                                />

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <InputField
                                    label="Full name"
                                    value={
                                        user.fullName
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setUser(
                                            (previous) => ({
                                                ...previous,
                                                fullName:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="Doctor's full name"
                                    icon={
                                        <PersonOutlineRoundedIcon />
                                    }
                                    required
                                />


                                <InputField
                                    label="Phone number"
                                    value={
                                        user.phone
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setUser(
                                            (previous) => ({
                                                ...previous,
                                                phone:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="01XXXXXXXXX"
                                    icon={
                                        <PhoneOutlinedIcon />
                                    }
                                    required
                                />


                                <InputField
                                    label="Email"
                                    value={
                                        user.email
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setUser(
                                            (previous) => ({
                                                ...previous,
                                                email:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="doctor@example.com"
                                    icon={
                                        <EmailOutlinedIcon />
                                    }
                                    type="email"
                                />

                            </div>

                        </section>


                        {/* =================================================
                            PROFESSIONAL
                        ================================================== */}

                        <section
                            className={styles.card}
                        >

                            <div
                                className={
                                    styles.cardHeader
                                }
                            >

                                <div
                                    className={
                                        styles.sectionIcon
                                    }
                                >

                                    <MedicalServicesOutlinedIcon />

                                </div>


                                <div>

                                    <h2>
                                        Professional information
                                    </h2>

                                    <p>
                                        Information shown on
                                        your doctor profile.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <InputField
                                    label="BMDC number"
                                    value={
                                        doctor.bmdcNumber
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                bmdcNumber:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="Enter BMDC number"
                                    icon={
                                        <BadgeOutlinedIcon />
                                    }
                                    required
                                />


                                <InputField
                                    label="Speciality"
                                    value={
                                        doctor.speciality
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                speciality:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="e.g. Medicine"
                                    icon={
                                        <MedicalServicesOutlinedIcon />
                                    }
                                    required
                                />


                                <InputField
                                    label="Education"
                                    value={
                                        doctor.education
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                education:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="MBBS, FCPS, etc."
                                    icon={
                                        <SchoolOutlinedIcon />
                                    }
                                />


                                <InputField
                                    label="Working institution"
                                    value={
                                        doctor.workingIn
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                workingIn:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="Hospital / clinic"
                                    icon={
                                        <BusinessOutlinedIcon />
                                    }
                                />


                                <InputField
                                    label="Years of experience"
                                    value={
                                        doctor.totalExperience
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                totalExperience:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="0"
                                    icon={
                                        <WorkOutlineOutlinedIcon />
                                    }
                                    type="number"
                                />

                            </div>

                        </section>


                        {/* =================================================
                            ABOUT
                        ================================================== */}

                        <section
                            className={styles.card}
                        >

                            <div
                                className={
                                    styles.cardHeader
                                }
                            >

                                <div
                                    className={
                                        styles.sectionIcon
                                    }
                                >

                                    <InfoOutlinedIcon />

                                </div>


                                <div>

                                    <h2>
                                        About you
                                    </h2>

                                    <p>
                                        Tell patients about
                                        your experience and practice.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.textareaGroup
                                }
                            >

                                <textarea
                                    value={
                                        doctor.about
                                    }
                                    onChange={(event) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                about:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    placeholder="Write a short professional introduction..."
                                    rows={6}
                                />

                            </div>

                        </section>


                        </>
                        )}

                        {step === 2 && (
                        <DoctorAvailabilityEditor
                            value={availability}
                            onChange={setAvailability}
                        />
                        )}

                        {step === 3 && (
                        <section className={styles.reviewCard}>
                            <div className={styles.reviewIntro}>
                                <div className={styles.sectionIcon}><CheckCircleRoundedIcon /></div>
                                <div>
                                    <span>FINAL REVIEW</span>
                                    <h2>Ready to update your profile?</h2>
                                    <p>Check this summary, then use Save Changes to publish everything together.</p>
                                </div>
                            </div>
                            <div className={styles.reviewIdentity}>
                                <strong>{user.fullName}</strong>
                                <span>{doctor.speciality || "Speciality not added"}</span>
                            </div>
                            <div className={styles.reviewGrid}>
                                <div><strong>{availability.chambers.length}</strong><span>Chambers</span></div>
                                <div><strong>{Object.values(availability.consultationModes).filter((mode) => mode?.enabled).length}</strong><span>Consultation modes</span></div>
                                <div><strong>{availability.weeklyAvailability.reduce((count, day) => count + (day.slots?.length || 0), 0)}</strong><span>Weekly slots</span></div>
                                <div><strong>{availability.unavailablePeriods.length}</strong><span>Leave periods</span></div>
                            </div>
                        </section>
                        )}

                        {/* =================================================
                            VERIFICATION NOTICE
                        ================================================== */}

                        {doctorData.verificationStatus ===
                            "pending" && (

                            <div
                                className={
                                    styles.notice
                                }
                            >

                                <VerifiedOutlinedIcon />

                                <div>

                                    <strong>
                                        Profile verification is pending
                                    </strong>

                                    <span>
                                        Your professional profile
                                        is currently being reviewed
                                        by MediLocate.
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            BOTTOM ACTIONS
                        ================================================== */}

                        <div
                            className={
                                styles.bottomActions
                            }
                        >

                            {step === 1 ? (
                                <Link href={`/doctors/${doctorData._id}`} className={styles.cancelButton}>Cancel</Link>
                            ) : (
                                <button type="button" className={styles.cancelButton} onClick={() => setStep((current) => current - 1)}>
                                    <ArrowBackRoundedIcon /> Back
                                </button>
                            )}


                            {step < 3 ? (
                                <button
                                    key="continue-step"
                                    type="button"
                                    className={styles.saveButton}
                                    onClick={() => setStep((current) => current + 1)}
                                >
                                    <ArrowForwardRoundedIcon />
                                    Continue
                                </button>
                            ) : (
                                <button
                                    key="save-profile"
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={saving}
                                >
                                    <SaveOutlinedIcon />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            )}

                        </div>

                    </form>

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
            params,
            req,
        } = context;


        const id =
            params?.id;

        let viewer = null;
        try {
            const cookies = parse(req.headers.cookie || "");
            viewer = cookies.userInfo ? JSON.parse(cookies.userInfo) : null;
        } catch {
            viewer = null;
        }

        if (!viewer) {
            return {
                redirect: {
                    destination: `/login?redirectTo=/doctors/${encodeURIComponent(id)}/edit`,
                    permanent: false,
                },
            };
        }


        if (!id) {

            return {
                notFound: true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | API
        |--------------------------------------------------------------------------
        */

        const apiUrl =
            `${BASE_URL}/api/doctors/${encodeURIComponent(
                id
            )}`;


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


        if (
            !response.data?.success ||
            !response.data?.doctor
        ) {

            return {
                notFound: true,
            };

        }

        const profileUserId = String(response.data.doctor.user?._id || response.data.doctor.user || "");
        const viewerId = String(viewer._id || viewer.id || "");
        if (viewer.role !== "admin" && viewerId !== profileUserId) {
            return { notFound: true };
        }


        return {

            props: {

                initialData:
                    JSON.parse(
                        JSON.stringify(
                            response.data
                        )
                    ),

            },

        };

    } catch (error) {

        console.error(
            "Doctor profile SSR error:",
            error?.response?.data ||
            error.message
        );


        return {
            notFound: true,
        };

    }

}
