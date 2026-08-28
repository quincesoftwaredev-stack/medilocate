import Link from "next/link";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import styles from "./FeaturedDoctors.module.css";

const doctors = [
    {
        id: 1,
        name: "Dr. Ahmed Rahman",
        specialty: "Medicine Specialist",
        location: "Rangpur",
        experience: "12+ Years",
        patients: "500+ Patients",
    },
    {
        id: 2,
        name: "Dr. Nusrat Jahan",
        specialty: "Gynecology Specialist",
        location: "Rangpur",
        experience: "8+ Years",
        patients: "350+ Patients",
    },
    {
        id: 3,
        name: "Dr. Mahmud Hasan",
        specialty: "Child Specialist",
        location: "Rangpur",
        experience: "10+ Years",
        patients: "420+ Patients",
    },
];

export default function FeaturedDoctors() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className={styles.header}>

                    <div>

                        <span className={styles.label}>
                            FIND YOUR DOCTOR
                        </span>

                        <h2>
                            Connect with trusted
                            <span> doctors.</span>
                        </h2>

                        <p>
                            Explore healthcare professionals near you
                            and contact them directly for an onsite visit.
                        </p>

                    </div>


                    <Link
                        href="/doctors"
                        className={styles.viewAll}
                    >
                        View all doctors

                        <ArrowForwardIcon />
                    </Link>

                </div>


                {/* =====================================================
                    DOCTOR GRID
                ====================================================== */}

                <div className={styles.doctorGrid}>

                    {doctors.map((doctor) => (

                        <div
                            className={styles.doctorCard}
                            key={doctor.id}
                        >

                            {/* Doctor Image / Avatar */}

                            <div className={styles.doctorImage}>

                                <PersonOutlineOutlinedIcon />

                                <span className={styles.verified}>
                                    <VerifiedIcon />
                                </span>

                            </div>


                            {/* Doctor Information */}

                            <div className={styles.doctorInfo}>

                                <h3>
                                    {doctor.name}
                                </h3>

                                <div className={styles.specialty}>
                                    <MedicalServicesOutlinedIcon />

                                    {doctor.specialty}
                                </div>


                                <div className={styles.location}>
                                    <LocationOnOutlinedIcon />

                                    {doctor.location}
                                </div>


                                {/* Stats */}

                                <div className={styles.stats}>

                                    <div>
                                        <strong>
                                            {doctor.experience}
                                        </strong>

                                        <span>
                                            Experience
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            {doctor.patients}
                                        </strong>

                                        <span>
                                            Patients
                                        </span>
                                    </div>

                                </div>


                                {/* Action */}

                                <Link
                                    href={`/doctors/${doctor.id}`}
                                    className={styles.profileButton}
                                >
                                    View Profile

                                    <ArrowForwardIcon />
                                </Link>

                            </div>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
}