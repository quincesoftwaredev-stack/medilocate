import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import DoctorProfileImageUpload from "@/components/Doctors/DoctorProfileImageUpload";

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

            followUpFee:
                doctorData.followUpFee ??
                "",

            about:
                doctorData.about ||
                "",

        });


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


    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


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

                    followUpFee:
                        Number(
                            doctor.followUpFee ||
                            0
                        ),

                    about:
                        doctor.about.trim(),

                },

            };


            const response =
                await axios.patch(
                    `${BASE_URL}/api/doctors/${encodeURIComponent(
                        router.query.id
                    )}`,
                    payload
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


            <Navbar />


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
                            onClick={() =>
                                document
                                    .getElementById(
                                        "doctor-profile-form"
                                    )
                                    ?.requestSubmit()
                            }
                            disabled={saving}
                        >

                            <SaveOutlinedIcon />

                            {saving
                                ? "Saving..."
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
                            FEES
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

                                    <AttachMoneyOutlinedIcon />

                                </div>


                                <div>

                                    <h2>
                                        Consultation
                                    </h2>

                                    <p>
                                        Manage your consultation
                                        pricing.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <InputField
                                    label="Consultation fee"
                                    value={
                                        doctor.consultationFee
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                consultationFee:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="৳"
                                    icon={
                                        <AttachMoneyOutlinedIcon />
                                    }
                                    type="number"
                                />


                                <InputField
                                    label="Follow-up fee"
                                    value={
                                        doctor.followUpFee
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setDoctor(
                                            (previous) => ({
                                                ...previous,
                                                followUpFee:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="৳"
                                    icon={
                                        <AttachMoneyOutlinedIcon />
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

                            <Link
                                href={`/doctors/${doctorData._id}`}
                                className={
                                    styles.cancelButton
                                }
                            >

                                Cancel

                            </Link>


                            <button
                                type="submit"
                                className={
                                    styles.saveButton
                                }
                                disabled={saving}
                            >

                                <SaveOutlinedIcon />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>

                    </form>

                </div>

            </main>


            <Footer />

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