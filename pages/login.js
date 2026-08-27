import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import Logo from "@/components/Utility/Logo";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import { login } from "@/redux/userSlice";
import { showSnackBar } from "@/redux/notistackSlice";
import { NextSeo } from "next-seo";
import { loginSeoData } from "@/utility/const";
import {
    finishLoading,
    startLoading,
} from "@/redux/stateSlice";

const Login = () => {

    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const router = useRouter();

    const dispatch = useDispatch();


    const handleSubmit = async (event) => {

        event.preventDefault();


        if (
            !user.email.trim() ||
            !user.password
        ) {

            dispatch(
                showSnackBar({
                    message:
                        "Please enter your email/phone and password.",
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
                    "/api/user/login",
                    {
                        ...user,
                    }
                );


            if (!data.error) {

                dispatch(
                    login(data)
                );


                dispatch(
                    showSnackBar({
                        message:
                            "Successfully logged in.",
                        option: {
                            variant:
                                "success",
                        },
                    })
                );


                if (
                    data.role === "admin"
                ) {

                    router.push(
                        "/admin"
                    );

                } else {

                    if (
                        router.query
                            .redirectTo
                    ) {

                        router.push(
                            router.query.redirectTo
                        );

                    } else {

                        router.push(
                            `/profile/${data.id}`
                        );

                    }

                }

            } else {

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

            }

        } catch (error) {

            console.error(
                "Login error:",
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

                <div className={styles.backgroundShape} />
                <div className={styles.backgroundShapeTwo} />


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
                                Healthcare,
                                <br />
                                made simpler.
                            </h1>


                            <p>
                                Connect with trusted doctors,
                                manage your healthcare and access
                                medicine services from one place.
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
                                    Your health,
                                    our priority
                                </strong>

                                <span>
                                    Secure and simple
                                    healthcare access.
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        LOGIN CARD
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

                                <LoginRoundedIcon />

                            </div>


                            <div>

                                <span
                                    className={
                                        styles.formEyebrow
                                    }
                                >
                                    WELCOME BACK
                                </span>


                                <h2>
                                    Sign in to your account
                                </h2>


                                <p>
                                    Enter your details to
                                    continue to MediLocate.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className={
                                styles.form
                            }
                        >


                            {/* =====================================
                                EMAIL / PHONE
                            ====================================== */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label htmlFor="login-email">
                                    Email or phone
                                </label>


                                <div
                                    className={
                                        styles.inputWrapper
                                    }
                                >

                                    <EmailOutlinedIcon />


                                    <input
                                        id="login-email"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Enter your email or phone"
                                        value={
                                            user.email
                                        }
                                        onChange={(event) =>
                                            setUser({
                                                ...user,
                                                email:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>

                            </div>


                            {/* =====================================
                                PASSWORD
                            ====================================== */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <div
                                    className={
                                        styles.labelRow
                                    }
                                >

                                    <label htmlFor="login-password">
                                        Password
                                    </label>


                                    <Link
                                        href="/verify/existance"
                                        className={
                                            styles.forgotLink
                                        }
                                    >

                                        <KeyOutlinedIcon />

                                        Forgot password?

                                    </Link>

                                </div>


                                <div
                                    className={
                                        styles.inputWrapper
                                    }
                                >

                                    <LockOutlinedIcon />


                                    <input
                                        id="login-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={
                                            user.password
                                        }
                                        onChange={(event) =>
                                            setUser({
                                                ...user,
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
                                    Sign In
                                </span>

                                <ArrowForwardRoundedIcon />

                            </button>

                        </form>


                        {/* =================================================
                            DIVIDER
                        ================================================== */}

                        <div
                            className={
                                styles.divider
                            }
                        >

                            <span />

                            <small>
                                OR
                            </small>

                            <span />

                        </div>


                        {/* =================================================
                            REGISTER
                        ================================================== */}

                        <div
                            className={
                                styles.registerBox
                            }
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

                            Your account information is
                            protected and securely handled by
                            MediLocate.

                        </p>

                    </section>

                </div>

            </main>
        </>
    );
};

export default Login;