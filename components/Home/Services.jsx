import Link from "next/link";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import styles from "./Services.module.css";

const services = [
    {
        id: "doctors",
        label: "DOCTOR DISCOVERY",
        title: "Find a Doctor",
        description:
            "Discover doctors near you based on specialty, location and expertise.",
        linkText: "Explore Doctors",
        href: "/doctors",
        icon: <MedicalServicesOutlinedIcon />,
    },
    {
        id: "medicine",
        label: "MEDICINE DELIVERY",
        title: "Get Medicines",
        description:
            "Order medicines from nearby pharmacies and get them delivered conveniently to your doorstep.",
        linkText: "Order Medicines",
        href: "/medicines",
        icon: <LocalPharmacyOutlinedIcon />,
    },
];

export default function Services() {
    return (
        <section className={styles.services}>
            <div className={styles.container}>

                {/* Section Heading */}

                <div className={styles.sectionHeading}>

                    <span className={styles.sectionLabel}>
                        OUR SERVICES
                    </span>

                    <h2>
                        Healthcare made
                        <span> simple.</span>
                    </h2>

                    <p>
                        Find healthcare professionals and get the
                        medicines you need, all in one place.
                    </p>

                </div>


                {/* Services */}

                <div className={styles.serviceGrid}>

                    {services.map((service) => (

                        <Link
                            href={service.href}
                            key={service.id}
                            className={styles.serviceCard}
                        >

                            {/* Icon */}

                            <div className={styles.serviceIcon}>
                                {service.icon}
                            </div>


                            {/* Content */}

                            <div className={styles.serviceContent}>

                                <span className={styles.serviceLabel}>
                                    {service.label}
                                </span>

                                <h3>
                                    {service.title}
                                </h3>

                                <p>
                                    {service.description}
                                </p>


                                <span className={styles.serviceLink}>
                                    {service.linkText}

                                    <ArrowForwardIcon />
                                </span>

                            </div>

                        </Link>

                    ))}

                </div>

            </div>
        </section>
    );
}