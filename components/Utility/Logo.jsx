import React from "react";
import { useRouter } from "next/router";

import styles from "../../styles/Utility/Logo.module.css";

const Logo = ({
    color,
    dark = false,
}) => {

    const router = useRouter();

    return (
        <div
            className={`${styles.wrapper} ${
                dark ? styles.dark : ""
            }`}
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
            aria-label="MediLocate home"
            onKeyDown={(event) => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    router.push("/");
                }

            }}
        >

            <div
                className={styles.brand}
                style={
                    color
                        ? {
                              "--brand-color":
                                  color,
                          }
                        : undefined
                }
            >

                {/* =================================================
                    MONOGRAM
                ================================================== */}

                <div className={styles.mark}>

                    <div className={styles.pin}>

                        <div
                            className={
                                styles.pinInner
                            }
                        >

                            <span />

                        </div>

                    </div>


                    <div className={styles.mShape}>

                        <span />
                        <span />
                        <span />

                    </div>

                </div>


                {/* =================================================
                    WORDMARK
                ================================================== */}

                <div className={styles.wordmark}>

                    <span className={styles.med}>
                        Medi
                    </span>

                    <span className={styles.locate}>
                        Locate
                    </span>

                </div>

            </div>

        </div>
    );
};

export default Logo;