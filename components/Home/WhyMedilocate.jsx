import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import styles from "./WhyMedilocate.module.css";

const features = [
    {
        id: 1,
        title: "Trusted Healthcare",
        description:
            "Discover healthcare professionals and services through one convenient platform.",
        icon: VerifiedUserOutlinedIcon,
    },
    {
        id: 2,
        title: "Near You",
        description:
            "Find doctors and pharmacies based on your location and nearby service availability.",
        icon: LocationOnOutlinedIcon,
    },
    {
        id: 3,
        title: "Fast & Convenient",
        description:
            "Save time by connecting with doctors and ordering medicines from home.",
        icon: SpeedOutlinedIcon,
    },
    {
        id: 4,
        title: "Privacy First",
        description:
            "Your personal healthcare and prescription information should always be handled responsibly.",
        icon: SecurityOutlinedIcon,
    },
];

export default function WhyMedilocate() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className={styles.header}>

                    <span className={styles.label}>
                        WHY MEDILOCATE
                    </span>

                    <h2>
                        One place for your
                        <span> everyday healthcare.</span>
                    </h2>

                    <p>
                        Medilocate brings essential healthcare services
                        closer to you, making it easier to find care and
                        access the medicines you need.
                    </p>

                </div>


                {/* =====================================================
                    FEATURES
                ====================================================== */}

                <div className={styles.featureGrid}>

                    {features.map((feature) => {

                        const Icon = feature.icon;

                        return (
                            <div
                                className={styles.feature}
                                key={feature.id}
                            >

                                <div className={styles.icon}>
                                    <Icon />
                                </div>


                                <div className={styles.featureContent}>

                                    <h3>
                                        {feature.title}
                                    </h3>

                                    <p>
                                        {feature.description}
                                    </p>

                                </div>

                            </div>
                        );
                    })}

                </div>


                {/* =====================================================
                    BOTTOM STATEMENT
                ====================================================== */}

                <div className={styles.bottom}>

                    <div className={styles.bottomIcon}>
                        <VerifiedUserOutlinedIcon />
                    </div>


                    <div className={styles.bottomContent}>

                        <strong>
                            Healthcare should be easier to access.
                        </strong>

                        <span>
                            We're building Medilocate to make that possible.
                        </span>

                    </div>

                </div>

            </div>
        </section>
    );
}