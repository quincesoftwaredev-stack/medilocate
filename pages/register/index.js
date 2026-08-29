import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import DirectionsBikeOutlinedIcon from "@mui/icons-material/DirectionsBikeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import Logo from "@/components/Utility/Logo";

import { showSnackBar } from "@/redux/notistackSlice";
import {
    finishLoading,
    startLoading,
} from "@/redux/stateSlice";

import { login } from "@/redux/userSlice";

import styles from "@/styles/Register.module.css";


const roleOptions = [
    {
        value: "patient",
        title: "Patient",
        description:
            "Find doctors and manage your healthcare.",
        icon: PersonOutlineRoundedIcon,
    },
    {
        value: "doctor",
        title: "Doctor",
        description:
            "Provide professional healthcare services.",
        icon: MedicalServicesOutlinedIcon,
    },
    {
        value: "nurse",
        title: "Nurse",
        description:
            "Provide nursing and home care services.",
        icon: HealingOutlinedIcon,
    },
    {
        value: "rider",
        title: "Rider",
        description:
            "Deliver medicines and healthcare orders.",
        icon: DirectionsBikeOutlinedIcon,
    },
];


const Register = () => {

    const router = useRouter();
    const dispatch = useDispatch();


    /*
    |--------------------------------------------------------------------------
    | STEP
    |--------------------------------------------------------------------------
    */

    const [step, setStep] =
        useState(1);


    /*
    |--------------------------------------------------------------------------
    | ACCOUNT
    |--------------------------------------------------------------------------
    */

    const [account, setAccount] =
        useState({
            fullName: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: "",
        });


    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    const [role, setRole] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | DOCTOR PROFILE
    |--------------------------------------------------------------------------
    */

    const [doctor, setDoctor] =
        useState({
            gender: "",
            bmdcNumber: "",
            speciality: "",
            department: "",
            education: "",
            workingIn: "",
            totalExperience: "",
            consultationFee: "",
            followUpFee: "",
            about: "",
        });


    /*
    |--------------------------------------------------------------------------
    | NURSE PROFILE
    |--------------------------------------------------------------------------
    */

    const [nurse, setNurse] =
        useState({
            registrationNumber: "",
            qualification: "",
            specialization: "",
            institution: "",
            experience: "",
            about: "",
            homeVisitFee: "",
        });


    /*
    |--------------------------------------------------------------------------
    | RIDER PROFILE
    |--------------------------------------------------------------------------
    */

    const [rider, setRider] =
        useState({
            vehicleType: "motorcycle",
            vehicleNumber: "",
            serviceArea: "",
        });


    /*
    |--------------------------------------------------------------------------
    | PATIENT
    |--------------------------------------------------------------------------
    */

    const [patient, setPatient] =
        useState({
            address: "",
            city: "",
        });


    /*
    |--------------------------------------------------------------------------
    | PASSWORD VISIBILITY
    |--------------------------------------------------------------------------
    */

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | SUBMITTING
    |--------------------------------------------------------------------------
    */

    const [submitting, setSubmitting] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | STEP 1 VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateAccount = () => {

        if (!account.fullName.trim()) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter your full name.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }


        if (!account.phone.trim()) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter your phone number.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }


        if (
            account.email &&
            !/^\S+@\S+\.\S+$/.test(
                account.email
            )
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter a valid email address.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }


        if (
            !account.password ||
            account.password.length < 6
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Password must be at least 6 characters.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }


        if (
            account.password !==
            account.confirmPassword
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Passwords do not match.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }


        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | STEP 2 VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateRole = () => {

        if (!role) {

            dispatch(
                showSnackBar({
                    message:
                        "Please select how you will use MediLocate.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return false;
        }

        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | STEP 3 VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateProfile = () => {

        if (role === "doctor") {

            if (!doctor.gender) {

                dispatch(
                    showSnackBar({
                        message:
                            "Gender is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }

            if (!doctor.bmdcNumber.trim()) {

                dispatch(
                    showSnackBar({
                        message:
                            "BMDC number is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }


            if (!doctor.speciality.trim()) {

                dispatch(
                    showSnackBar({
                        message:
                            "Speciality is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }

        }


        if (role === "nurse") {

            if (
                !nurse.registrationNumber.trim()
            ) {

                dispatch(
                    showSnackBar({
                        message:
                            "Registration number is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }


            if (
                !nurse.qualification.trim()
            ) {

                dispatch(
                    showSnackBar({
                        message:
                            "Qualification is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }

        }


        if (role === "rider") {

            if (
                !rider.vehicleNumber.trim()
            ) {

                dispatch(
                    showSnackBar({
                        message:
                            "Vehicle number is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }


            if (
                !rider.serviceArea.trim()
            ) {

                dispatch(
                    showSnackBar({
                        message:
                            "Service area is required.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }

        }


        if (role === "patient") {

            if (!patient.address.trim()) {

                dispatch(
                    showSnackBar({
                        message:
                            "Please enter your address.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }


            if (!patient.city.trim()) {

                dispatch(
                    showSnackBar({
                        message:
                            "Please enter your city.",
                        option: {
                            variant: "error",
                        },
                    })
                );

                return false;
            }

        }


        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | NEXT
    |--------------------------------------------------------------------------
    */

    const handleNext = () => {

        if (step === 1) {

            if (!validateAccount()) {
                return;
            }

            setStep(2);
            return;
        }


        if (step === 2) {

            if (!validateRole()) {
                return;
            }

            setStep(3);
            return;
        }


        if (step === 3) {

            if (!validateProfile()) {
                return;
            }

            setStep(4);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | BACK
    |--------------------------------------------------------------------------
    */

    const handleBack = () => {

        if (step > 1) {
            setStep(
                (previous) =>
                    previous - 1
            );
        }

    };


    /*
    |--------------------------------------------------------------------------
    | CREATE ACCOUNT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async () => {

        if (!validateProfile()) {
            return;
        }


        try {

            setSubmitting(true);

            dispatch(
                startLoading()
            );


            const payload = {

                fullName:
                    account.fullName.trim(),

                phone:
                    account.phone.trim(),

                email:
                    account.email.trim(),

                password:
                    account.password,

                role,

            };


            if (role === "patient") {

                payload.profile = {
                    ...patient,
                };

            }


            if (role === "doctor") {

                payload.profile = {
                    ...doctor,
                };

            }


            if (role === "nurse") {

                payload.profile = {
                    ...nurse,
                };

            }


            if (role === "rider") {

                payload.profile = {
                    ...rider,
                };

            }


            const { data } =
                await axios.post(
                    "/api/user/register",
                    payload
                );


            if (data?.error) {

                dispatch(
                    showSnackBar({
                        message:
                            data.error,
                        option: {
                            variant:
                                "error",
                        },
                    })
                );

                setStep(3);

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | LOGIN IF API RETURNS USER
            |--------------------------------------------------------------------------
            */

            if (
                data?.id ||
                data?.user ||
                data?.token
            ) {

                dispatch(
                    login(data)
                );

            }


            dispatch(
                showSnackBar({
                    message:
                        role === "patient"
                            ? "Account created successfully."
                            : "Application submitted successfully.",
                    option: {
                        variant:
                            "success",
                    },
                })
            );


            setStep(4);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            dispatch(
                showSnackBar({
                    message:
                        error?.response?.data?.error ||
                        "Something went wrong. Please try again.",
                    option: {
                        variant:
                            "error",
                    },
                })
            );

        } finally {

            setSubmitting(false);

            dispatch(
                finishLoading()
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | STEP TITLES
    |--------------------------------------------------------------------------
    */

    const stepItems = [
        {
            number: 1,
            title: "Account",
        },
        {
            number: 2,
            title: "Type",
        },
        {
            number: 3,
            title: "Profile",
        },
        {
            number: 4,
            title: "Complete",
        },
    ];


    return (
        <>
            <Head>

                <title>
                    Create Account | MediLocate
                </title>

                <meta
                    name="description"
                    content="Create your MediLocate account."
                />

            </Head>


            <main className={styles.page}>

                <div
                    className={
                        styles.backgroundShape
                    }
                />

                <div
                    className={
                        styles.backgroundShapeTwo
                    }
                />


                <div
                    className={
                        styles.registerCard
                    }
                >


                    {/* =================================================
                        TOP
                    ================================================== */}

                    <div
                        className={
                            styles.topHeader
                        }
                    >

                        <Logo />


                        <Link
                            href="/login"
                            className={
                                styles.loginLink
                            }
                        >
                            Already have an account?
                            <strong>
                                Sign in
                            </strong>
                        </Link>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <div
                        className={
                            styles.header
                        }
                    >

                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            JOIN MEDILOCATE
                        </span>


                        <h1>
                            Create your account
                        </h1>


                        <p>
                            Set up your MediLocate account
                            in a few simple steps.
                        </p>

                    </div>


                    {/* =================================================
                        STEPPER
                    ================================================== */}

                    <div
                        className={
                            styles.stepper
                        }
                    >

                        {stepItems.map(
                            (item, index) => (

                                <React.Fragment
                                    key={
                                        item.number
                                    }
                                >

                                    <div
                                        className={`${styles.stepItem} ${
                                            step >=
                                            item.number
                                                ? styles.stepActive
                                                : ""
                                        }`}
                                    >

                                        <div
                                            className={
                                                styles.stepNumber
                                            }
                                        >

                                            {step >
                                            item.number ? (
                                                <CheckCircleRoundedIcon />
                                            ) : (
                                                item.number
                                            )}

                                        </div>


                                        <span>
                                            {
                                                item.title
                                            }
                                        </span>

                                    </div>


                                    {index <
                                        stepItems.length -
                                            1 && (

                                        <div
                                            className={`${styles.stepLine} ${
                                                step >
                                                item.number
                                                    ? styles.lineActive
                                                    : ""
                                            }`}
                                        />

                                    )}

                                </React.Fragment>

                            )
                        )}

                    </div>


                    {/* =================================================
                        STEP 1
                    ================================================== */}

                    {step === 1 && (

                        <section
                            className={
                                styles.stepContent
                            }
                        >

                            <div
                                className={
                                    styles.stepHeader
                                }
                            >

                                <div
                                    className={
                                        styles.sectionIcon
                                    }
                                >

                                    <AccountCircleOutlinedIcon />

                                </div>


                                <div>

                                    <h2>
                                        Your account
                                    </h2>

                                    <p>
                                        Start with your basic
                                        account information.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Full name
                                    </label>


                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <PersonOutlineRoundedIcon />

                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={
                                                account.fullName
                                            }
                                            onChange={(event) =>
                                                setAccount({
                                                    ...account,
                                                    fullName:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Phone number
                                    </label>


                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <PhoneOutlinedIcon />

                                        <input
                                            type="tel"
                                            placeholder="01XXXXXXXXX"
                                            value={
                                                account.phone
                                            }
                                            onChange={(event) =>
                                                setAccount({
                                                    ...account,
                                                    phone:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={`${styles.formGroup} ${styles.fullWidth}`}
                                >

                                    <label>
                                        Email
                                        <span>
                                            Optional
                                        </span>
                                    </label>


                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <EmailOutlinedIcon />

                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={
                                                account.email
                                            }
                                            onChange={(event) =>
                                                setAccount({
                                                    ...account,
                                                    email:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Password
                                    </label>


                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <LockOutlinedIcon />

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Create a password"
                                            value={
                                                account.password
                                            }
                                            onChange={(event) =>
                                                setAccount({
                                                    ...account,
                                                    password:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />


                                        <button
                                            type="button"
                                            className={
                                                styles.passwordToggle
                                            }
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                        >

                                            {showPassword ? (
                                                <VisibilityOffOutlinedIcon />
                                            ) : (
                                                <VisibilityOutlinedIcon />
                                            )}

                                        </button>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Confirm password
                                    </label>


                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <LockOutlinedIcon />

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm your password"
                                            value={
                                                account.confirmPassword
                                            }
                                            onChange={(event) =>
                                                setAccount({
                                                    ...account,
                                                    confirmPassword:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />


                                        <button
                                            type="button"
                                            className={
                                                styles.passwordToggle
                                            }
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                        >

                                            {showConfirmPassword ? (
                                                <VisibilityOffOutlinedIcon />
                                            ) : (
                                                <VisibilityOutlinedIcon />
                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        STEP 2
                    ================================================== */}

                    {step === 2 && (

                        <section
                            className={
                                styles.stepContent
                            }
                        >

                            <div
                                className={
                                    styles.stepHeader
                                }
                            >

                                <div
                                    className={
                                        styles.sectionIcon
                                    }
                                >

                                    <BadgeOutlinedIcon />

                                </div>


                                <div>

                                    <h2>
                                        How will you use MediLocate?
                                    </h2>

                                    <p>
                                        Choose the account type
                                        that best describes you.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.roleGrid
                                }
                            >

                                {roleOptions.map(
                                    (option) => {

                                        const Icon =
                                            option.icon;

                                        const active =
                                            role ===
                                            option.value;


                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    option.value
                                                }
                                                className={`${styles.roleCard} ${
                                                    active
                                                        ? styles.roleActive
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setRole(
                                                        option.value
                                                    )
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.roleIcon
                                                    }
                                                >

                                                    <Icon />

                                                </div>


                                                <div
                                                    className={
                                                        styles.roleContent
                                                    }
                                                >

                                                    <strong>
                                                        {
                                                            option.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            option.description
                                                        }
                                                    </span>

                                                </div>


                                                <span
                                                    className={
                                                        styles.roleRadio
                                                    }
                                                >

                                                    {active && (
                                                        <span />
                                                    )}

                                                </span>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        STEP 3 PATIENT
                    ================================================== */}

                    {step === 3 &&
                        role === "patient" && (

                            <section
                                className={
                                    styles.stepContent
                                }
                            >

                                <div
                                    className={
                                        styles.stepHeader
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
                                            Patient profile
                                        </h2>

                                        <p>
                                            Add your basic delivery
                                            information.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >

                                    <div
                                        className={`${styles.formGroup} ${styles.fullWidth}`}
                                    >

                                        <label>
                                            Address
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocationOnOutlinedIcon />

                                            <input
                                                type="text"
                                                placeholder="House, road, area"
                                                value={
                                                    patient.address
                                                }
                                                onChange={(event) =>
                                                    setPatient({
                                                        ...patient,
                                                        address:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            City
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocationOnOutlinedIcon />

                                            <input
                                                type="text"
                                                placeholder="Rangpur"
                                                value={
                                                    patient.city
                                                }
                                                onChange={(event) =>
                                                    setPatient({
                                                        ...patient,
                                                        city:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </section>

                        )}


                    {/* =================================================
                        STEP 3 DOCTOR
                    ================================================== */}

                    {step === 3 &&
                        role === "doctor" && (

                            <section
                                className={
                                    styles.stepContent
                                }
                            >

                                <div
                                    className={
                                        styles.stepHeader
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
                                            Doctor profile
                                        </h2>

                                        <p>
                                            Provide your professional
                                            information for verification.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            Gender
                                            <span
                                                className={
                                                    styles.required
                                                }
                                            >
                                                *
                                            </span>
                                        </label>

                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <PersonOutlineRoundedIcon />

                                            <select
                                                value={
                                                    doctor.gender
                                                }
                                                onChange={(event) =>
                                                    setDoctor({
                                                        ...doctor,
                                                        gender:
                                                            event.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Select gender
                                                </option>
                                                <option value="Male">
                                                    Male
                                                </option>
                                                <option value="Female">
                                                    Female
                                                </option>
                                            </select>

                                        </div>

                                    </div>

                                    <FormInput
                                        label="BMDC number"
                                        icon={
                                            <BadgeOutlinedIcon />
                                        }
                                        required
                                        value={
                                            doctor.bmdcNumber
                                        }
                                        placeholder="Enter BMDC number"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                bmdcNumber:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Speciality"
                                        icon={
                                            <MedicalServicesOutlinedIcon />
                                        }
                                        required
                                        value={
                                            doctor.speciality
                                        }
                                        placeholder="e.g. Medicine"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                speciality:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Department"
                                        icon={
                                            <MedicalServicesOutlinedIcon />
                                        }
                                        value={
                                            doctor.department
                                        }
                                        placeholder="Department"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                department:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Education"
                                        icon={
                                            <SchoolOutlinedIcon />
                                        }
                                        value={
                                            doctor.education
                                        }
                                        placeholder="MBBS, FCPS, etc."
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                education:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Working institution"
                                        icon={
                                            <BusinessOutlinedIcon />
                                        }
                                        value={
                                            doctor.workingIn
                                        }
                                        placeholder="Hospital / clinic"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                workingIn:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Years of experience"
                                        icon={
                                            <BadgeOutlinedIcon />
                                        }
                                        type="number"
                                        value={
                                            doctor.totalExperience
                                        }
                                        placeholder="0"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                totalExperience:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Consultation fee"
                                        icon={
                                            <AttachMoneyOutlinedIcon />
                                        }
                                        type="number"
                                        value={
                                            doctor.consultationFee
                                        }
                                        placeholder="৳"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                consultationFee:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Follow-up fee"
                                        icon={
                                            <AttachMoneyOutlinedIcon />
                                        }
                                        type="number"
                                        value={
                                            doctor.followUpFee
                                        }
                                        placeholder="৳"
                                        onChange={(value) =>
                                            setDoctor({
                                                ...doctor,
                                                followUpFee:
                                                    value,
                                            })
                                        }
                                    />


                                    <div
                                        className={`${styles.formGroup} ${styles.fullWidth}`}
                                    >

                                        <label>
                                            About you
                                        </label>


                                        <textarea
                                            rows={4}
                                            placeholder="Tell patients briefly about your experience and practice."
                                            value={
                                                doctor.about
                                            }
                                            onChange={(event) =>
                                                setDoctor({
                                                    ...doctor,
                                                    about:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                            </section>

                        )}


                    {/* =================================================
                        STEP 3 NURSE
                    ================================================== */}

                    {step === 3 &&
                        role === "nurse" && (

                            <section
                                className={
                                    styles.stepContent
                                }
                            >

                                <div
                                    className={
                                        styles.stepHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionIcon
                                        }
                                    >

                                        <HealingOutlinedIcon />

                                    </div>


                                    <div>

                                        <h2>
                                            Nurse profile
                                        </h2>

                                        <p>
                                            Provide your professional
                                            information for verification.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >

                                    <FormInput
                                        label="Registration number"
                                        icon={
                                            <BadgeOutlinedIcon />
                                        }
                                        required
                                        value={
                                            nurse.registrationNumber
                                        }
                                        placeholder="Nursing registration number"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                registrationNumber:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Qualification"
                                        icon={
                                            <SchoolOutlinedIcon />
                                        }
                                        required
                                        value={
                                            nurse.qualification
                                        }
                                        placeholder="Diploma / BSc Nursing"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                qualification:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Specialization"
                                        icon={
                                            <HealingOutlinedIcon />
                                        }
                                        value={
                                            nurse.specialization
                                        }
                                        placeholder="e.g. Critical Care"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                specialization:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Institution"
                                        icon={
                                            <BusinessOutlinedIcon />
                                        }
                                        value={
                                            nurse.institution
                                        }
                                        placeholder="Hospital / institution"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                institution:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Years of experience"
                                        icon={
                                            <BadgeOutlinedIcon />
                                        }
                                        type="number"
                                        value={
                                            nurse.experience
                                        }
                                        placeholder="0"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                experience:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Home visit fee"
                                        icon={
                                            <AttachMoneyOutlinedIcon />
                                        }
                                        type="number"
                                        value={
                                            nurse.homeVisitFee
                                        }
                                        placeholder="৳"
                                        onChange={(value) =>
                                            setNurse({
                                                ...nurse,
                                                homeVisitFee:
                                                    value,
                                            })
                                        }
                                    />


                                    <div
                                        className={`${styles.formGroup} ${styles.fullWidth}`}
                                    >

                                        <label>
                                            About you
                                        </label>


                                        <textarea
                                            rows={4}
                                            placeholder="Tell patients briefly about your experience and services."
                                            value={
                                                nurse.about
                                            }
                                            onChange={(event) =>
                                                setNurse({
                                                    ...nurse,
                                                    about:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                            </section>

                        )}


                    {/* =================================================
                        STEP 3 RIDER
                    ================================================== */}

                    {step === 3 &&
                        role === "rider" && (

                            <section
                                className={
                                    styles.stepContent
                                }
                            >

                                <div
                                    className={
                                        styles.stepHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.sectionIcon
                                        }
                                    >

                                        <LocalShippingOutlinedIcon />

                                    </div>


                                    <div>

                                        <h2>
                                            Rider profile
                                        </h2>

                                        <p>
                                            Provide the information
                                            needed for delivery work.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            Vehicle type
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocalShippingOutlinedIcon />

                                            <select
                                                value={
                                                    rider.vehicleType
                                                }
                                                onChange={(event) =>
                                                    setRider({
                                                        ...rider,
                                                        vehicleType:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                }
                                            >

                                                <option value="motorcycle">
                                                    Motorcycle
                                                </option>

                                                <option value="bicycle">
                                                    Bicycle
                                                </option>

                                                <option value="scooter">
                                                    Scooter
                                                </option>

                                                <option value="car">
                                                    Car
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>

                                            </select>

                                        </div>

                                    </div>


                                    <FormInput
                                        label="Vehicle number"
                                        icon={
                                            <LocalShippingOutlinedIcon />
                                        }
                                        required
                                        value={
                                            rider.vehicleNumber
                                        }
                                        placeholder="Vehicle registration number"
                                        onChange={(value) =>
                                            setRider({
                                                ...rider,
                                                vehicleNumber:
                                                    value,
                                            })
                                        }
                                    />


                                    <FormInput
                                        label="Service area"
                                        icon={
                                            <LocationOnOutlinedIcon />
                                        }
                                        required
                                        value={
                                            rider.serviceArea
                                        }
                                        placeholder="e.g. Rangpur City"
                                        onChange={(value) =>
                                            setRider({
                                                ...rider,
                                                serviceArea:
                                                    value,
                                            })
                                        }
                                    />

                                </div>

                            </section>

                        )}


                    {/* =================================================
                        STEP 4
                    ================================================== */}

                    {step === 4 && (

                        <section
                            className={
                                styles.completeStep
                            }
                        >

                            <div
                                className={
                                    styles.completeIcon
                                }
                            >

                                <CheckCircleRoundedIcon />

                            </div>


                            <span
                                className={
                                    styles.completeLabel
                                }
                            >
                                {role === "patient"
                                    ? "ACCOUNT READY"
                                    : "APPLICATION SUBMITTED"}
                            </span>


                            <h2>
                                {role === "patient"
                                    ? "Welcome to MediLocate"
                                    : "Your profile is under review"}
                            </h2>


                            <p>

                                {role === "patient"
                                    ? "Your account has been created successfully. You can now use MediLocate to access healthcare services."
                                    : "We've received your professional profile. Our team will review your information before activating your MediLocate account."}

                            </p>


                            {role !== "patient" && (

                                <div
                                    className={
                                        styles.pendingBox
                                    }
                                >

                                    <div
                                        className={
                                            styles.pendingDot
                                        }
                                    />


                                    <div>

                                        <strong>
                                            Verification pending
                                        </strong>

                                        <span>
                                            We'll verify your
                                            professional information
                                            before activation.
                                        </span>

                                    </div>

                                </div>

                            )}


                            <div
                                className={
                                    styles.completeActions
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.primaryButton
                                    }
                                    onClick={() =>
                                        router.push(
                                            role ===
                                                "patient"
                                                ? "/"
                                                : "/login"
                                        )
                                    }
                                >

                                    Continue

                                    <ArrowForwardRoundedIcon />

                                </button>


                                <Link
                                    href="/"
                                    className={
                                        styles.secondaryButton
                                    }
                                >
                                    Back to Home
                                </Link>

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        NAVIGATION
                    ================================================== */}

                    {step < 4 && (

                        <div
                            className={
                                styles.navigation
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.backButton
                                }
                                onClick={
                                    handleBack
                                }
                                disabled={
                                    step === 1
                                }
                            >

                                <ArrowBackRoundedIcon />

                                Back

                            </button>


                            {step === 3 ? (

                                <button
                                    type="button"
                                    className={
                                        styles.nextButton
                                    }
                                    onClick={
                                        handleSubmit
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting
                                        ? "Creating..."
                                        : role ===
                                          "patient"
                                        ? "Create Account"
                                        : "Submit Application"}


                                    {!submitting && (
                                        <ArrowForwardRoundedIcon />
                                    )}

                                </button>

                            ) : (

                                <button
                                    type="button"
                                    className={
                                        styles.nextButton
                                    }
                                    onClick={
                                        handleNext
                                    }
                                >

                                    Continue

                                    <ArrowForwardRoundedIcon />

                                </button>

                            )}

                        </div>

                    )}

                </div>

            </main>
        </>
    );
};


/*
|--------------------------------------------------------------------------
| REUSABLE FORM INPUT
|--------------------------------------------------------------------------
*/

function FormInput({
    label,
    icon,
    value,
    placeholder,
    onChange,
    type = "text",
    required = false,
}) {

    return (
        <div
            className={
                styles.formGroup
            }
        >

            <label>

                {label}

                {required && (
                    <span
                        className={
                            styles.required
                        }
                    >
                        *
                    </span>
                )}

            </label>


            <div
                className={
                    styles.inputWrapper
                }
            >

                {icon}


                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                />

            </div>

        </div>
    );
}


export default Register;
