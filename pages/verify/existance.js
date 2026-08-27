import React, { useState } from "react";
import styles from "../../styles/Login.module.css";

import Logo from "@/components/Utility/Logo";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
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


const ResetPassword = () => {

    const [email, setEmail] =
        useState("");

    const router =
        useRouter();

    const dispatch =
        useDispatch();


    const SendCode = async (event) => {

        event.preventDefault();


        if (!email.trim()) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter your email or phone number.",
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
                    "/api/user/verify/existance",
                    {
                        email:
                            email.trim(),
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
                        "A verification code has been sent to your email.",
                    option: {
                        variant:
                            "success",
                    },
                })
            );


            router.push(
                "/verify/reset"
            );


        } catch (error) {

            console.error(
                "Password reset request error:",
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
                                Stay secure,
                                <br />
                                stay connected.
                            </h1>


                            <p>
                                Reset your account password securely
                                and get back to managing your
                                healthcare with MediLocate.
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
                                    Secure account recovery
                                </strong>

                                <span>
                                    We'll help you regain access
                                    to your account.
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
                                    ACCOUNT RECOVERY
                                </span>


                                <h2>
                                    Reset your password
                                </h2>


                                <p>
                                    Enter your email or phone number
                                    and we'll send you a verification code.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                SendCode
                            }
                            className={
                                styles.form
                            }
                        >

                            {/* =====================================
                                EMAIL
                            ====================================== */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label htmlFor="reset-email">
                                    Email or phone
                                </label>


                                <div
                                    className={
                                        styles.inputWrapper
                                    }
                                >

                                    <EmailOutlinedIcon />


                                    <input
                                        id="reset-email"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Enter your email or phone number"
                                        value={
                                            email
                                        }
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                    />

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
                                    Send Verification Code
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
                                        color: "var(--ml-navy)",
                                        fontSize: "var(--ml-font-sm)",
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

                            For your security, verification
                            is required before changing your password.

                        </p>

                    </section>

                </div>

            </main>
        </>
    );
};


export default ResetPassword;