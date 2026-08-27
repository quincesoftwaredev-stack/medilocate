import React, { useState } from "react";
import styles from "../../styles/Login.module.css";

import Logo from "@/components/Utility/Logo";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import { showSnackBar } from "@/redux/notistackSlice";
import {
    finishLoading,
    startLoading,
} from "@/redux/stateSlice";

import { NextSeo } from "next-seo";
import { loginSeoData } from "@/utility/const";


const Reset = () => {

    const [code, setCode] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const router =
        useRouter();

    const dispatch =
        useDispatch();


    const resetPassword = async (event) => {

        event.preventDefault();


        const cleanCode =
            code.trim();


        if (
            !cleanCode ||
            !newPassword
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter the verification code and new password.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return;
        }


        if (
            cleanCode.length !== 6
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Verification code must be 6 characters.",
                    option: {
                        variant: "error",
                    },
                })
            );

            return;
        }


        try {

            dispatch(
                startLoading()
            );


            const { data } =
                await axios.post(
                    "/api/user/verify/reset",
                    {
                        code:
                            cleanCode,

                        newPassword,
                    }
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

                return;

            }


            dispatch(
                showSnackBar({
                    message:
                        "Password reset successfully.",
                    option: {
                        variant:
                            "success",
                    },
                })
            );


            router.push(
                "/login"
            );


        } catch (error) {

            console.error(
                "Password reset error:",
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

            dispatch(
                finishLoading()
            );

        }

    };


    return (
        <>
            <NextSeo
                {...loginSeoData}
            />


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
                        styles.authLayout
                    }
                >


                    {/* =================================================
                        BRAND PANEL
                    ================================================== */}

                    <section
                        className={
                            styles.brandPanel
                        }
                    >

                        <div
                            className={
                                styles.brandLogo
                            }
                        >

                            <Logo />

                        </div>


                        <div
                            className={
                                styles.brandContent
                            }
                        >

                            <span
                                className={
                                    styles.brandEyebrow
                                }
                            >
                                MediLocate
                            </span>


                            <h1>
                                Your account,
                                <br />
                                safely restored.
                            </h1>


                            <p>
                                Set a new password and securely
                                regain access to your MediLocate
                                account.
                            </p>

                        </div>


                        <div
                            className={
                                styles.brandFeature
                            }
                        >

                            <MedicalServicesOutlinedIcon />

                            <div>

                                <strong>
                                    Secure recovery
                                </strong>

                                <span>
                                    Your account security
                                    comes first.
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        FORM PANEL
                    ================================================== */}

                    <section
                        className={
                            styles.formPanel
                        }
                    >

                        <div
                            className={
                                styles.formHeader
                            }
                        >

                            <div
                                className={
                                    styles.formIcon
                                }
                            >

                                <LockResetOutlinedIcon />

                            </div>


                            <div>

                                <span
                                    className={
                                        styles.formEyebrow
                                    }
                                >
                                    PASSWORD RECOVERY
                                </span>


                                <h2>
                                    Set a new password
                                </h2>


                                <p>
                                    Enter the verification code sent
                                    to you and choose a new password.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                resetPassword
                            }
                            className={
                                styles.form
                            }
                        >


                            {/* =====================================
                                VERIFICATION CODE
                            ====================================== */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label htmlFor="verification-code">
                                    Verification code
                                </label>


                                <div
                                    className={
                                        styles.inputWrapper
                                    }
                                >

                                    <ShieldOutlinedIcon />


                                    <input
                                        id="verification-code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        placeholder="Enter 6-digit code"
                                        value={
                                            code
                                        }
                                        onChange={(event) =>
                                            setCode(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* =====================================
                                NEW PASSWORD
                            ====================================== */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label htmlFor="new-password">
                                    New password
                                </label>


                                <div
                                    className={
                                        styles.inputWrapper
                                    }
                                >

                                    <LockOutlinedIcon />


                                    <input
                                        id="new-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Enter your new password"
                                        value={
                                            newPassword
                                        }
                                        onChange={(event) =>
                                            setNewPassword(
                                                event.target.value
                                            )
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
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
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


                            {/* =====================================
                                SUBMIT
                            ====================================== */}

                            <button
                                type="submit"
                                className={
                                    styles.submitButton
                                }
                            >

                                <span>
                                    Reset Password
                                </span>

                                <ArrowForwardRoundedIcon />

                            </button>

                        </form>


                        {/* =================================================
                            BACK TO LOGIN
                        ================================================== */}

                        <Link
                            href="/login"
                            className={
                                styles.registerBox
                            }
                        >

                            <div
                                className={
                                    styles.registerIcon
                                }
                            >

                                <ArrowBackRoundedIcon />

                            </div>


                            <div>

                                <span>
                                    Remember your password?
                                </span>


                                <span
                                    style={{
                                        display: "block",
                                        marginTop: "2px",
                                        color:
                                            "var(--ml-navy)",
                                        fontSize:
                                            "var(--ml-font-sm)",
                                        fontWeight:
                                            "var(--ml-weight-semibold)",
                                    }}
                                >
                                    Back to Sign In
                                </span>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </Link>


                        {/* =================================================
                            REGISTER
                        ================================================== */}

                        <div
                            className={
                                styles.registerBox
                            }
                            style={{
                                marginTop: "10px",
                            }}
                        >

                            <div
                                className={
                                    styles.registerIcon
                                }
                            >

                                <PersonAddOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Don't have an account?
                                </span>


                                <Link
                                    href="/register"
                                >
                                    Create a new account
                                </Link>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </div>


                        <p
                            className={
                                styles.securityText
                            }
                        >

                            Never share your verification code
                            or password with anyone.

                        </p>

                    </section>

                </div>

            </main>
        </>
    );
};


export default Reset;