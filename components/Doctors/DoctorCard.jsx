import Link from "next/link";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import styles from "./DoctorCard.module.css";


export default function DoctorCard({ doctor }) {

    return (
        <article className={styles.card}>

            {/* =====================================================
                TOP
            ====================================================== */}

            <div className={styles.top}>

                <div className={styles.imageWrapper}>

                    {doctor.image ? (

                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className={styles.image}
                        />

                    ) : (

                        <div className={styles.placeholder}>
                            {doctor.name?.charAt(0)}
                        </div>

                    )}

                    {doctor.available && (

                        <span className={styles.onlineDot} />

                    )}

                </div>


                <div className={styles.info}>

                    <div className={styles.nameRow}>

                        <h3>
                            {doctor.name}
                        </h3>

                        {doctor.available && (

                            <span className={styles.availableBadge}>
                                Available
                            </span>

                        )}

                    </div>


                    <span className={styles.specialty}>
                        {doctor.specialty}
                    </span>


                    <span className={styles.qualification}>
                        {doctor.qualification}
                    </span>

                </div>

            </div>


            {/* =====================================================
                RATING
            ====================================================== */}

            <div className={styles.ratingRow}>

                <div className={styles.rating}>

                    <StarRoundedIcon />

                    <strong>
                        {doctor.rating}
                    </strong>

                    <span>
                        ({doctor.reviews} reviews)
                    </span>

                </div>


                <span className={styles.experience}>
                    {doctor.experience}
                </span>

            </div>


            {/* =====================================================
                LOCATION
            ====================================================== */}

            <div className={styles.details}>

                <div>

                    <LocationOnOutlinedIcon />

                    <span>
                        {doctor.location}
                    </span>

                </div>


                <div>

                    <BusinessOutlinedIcon />

                    <span>
                        {doctor.chamber}
                    </span>

                </div>


                <div>

                    <AccessTimeOutlinedIcon />

                    <span>
                        Onsite consultation
                    </span>

                </div>

            </div>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div className={styles.footer}>

                <div className={styles.fee}>

                    <span>
                        Consultation
                    </span>

                    <strong>
                        {doctor.fee}
                    </strong>

                </div>


                <div className={styles.actions}>

                    <a
                        href={`tel:+880XXXXXXXXXX`}
                        className={styles.callButton}
                        aria-label={`Call ${doctor.name}`}
                    >
                        <PhoneOutlinedIcon />
                    </a>


                    <Link
                        href={`/doctors/${doctor.id}`}
                        className={styles.profileButton}
                    >
                        View Profile

                        <ArrowForwardIcon />

                    </Link>

                </div>

            </div>

        </article>
    );
}