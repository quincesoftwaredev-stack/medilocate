import Link from "next/link";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";

import styles from "./MedicineSection.module.css";

const medicines = [
    {
        id: 1,
        name: "Paracetamol",
        type: "Tablet",
        strength: "500 mg",
    },
    {
        id: 2,
        name: "Omeprazole",
        type: "Capsule",
        strength: "20 mg",
    },
    {
        id: 3,
        name: "Vitamin D3",
        type: "Tablet",
        strength: "1000 IU",
    },
];

export default function MedicineSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className={styles.header}>

                    <div>

                        <span className={styles.label}>
                            MEDICINE DELIVERY
                        </span>

                        <h2>
                            Get your medicines,
                            <span> delivered.</span>
                        </h2>

                        <p>
                            Find the medicines you need from nearby
                            pharmacies or simply upload your prescription
                            and let us help you with the rest.
                        </p>

                    </div>


                    <Link
                        href="/medicines"
                        className={styles.viewAll}
                    >
                        Browse medicines

                        <ArrowForwardIcon />
                    </Link>

                </div>


                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <div className={styles.searchBox}>

                    <div className={styles.searchInput}>

                        <SearchOutlinedIcon />

                        <input
                            type="text"
                            placeholder="Search medicine by name..."
                        />

                    </div>


                    <button
                        type="button"
                        className={styles.searchButton}
                    >
                        Search
                    </button>

                </div>


                {/* =====================================================
                    MAIN CONTENT
                ====================================================== */}

                <div className={styles.contentGrid}>

                    {/* =================================================
                        MEDICINE LIST
                    ================================================== */}

                    <div className={styles.medicineArea}>

                        <div className={styles.areaHeader}>

                            <div>

                                <span>
                                    POPULAR MEDICINES
                                </span>

                                <h3>
                                    What are you looking for?
                                </h3>

                            </div>

                            <Link href="/medicines">
                                View all
                            </Link>

                        </div>


                        <div className={styles.medicineGrid}>

                            {medicines.map((medicine) => (

                                <div
                                    className={styles.medicineCard}
                                    key={medicine.id}
                                >

                                    <div className={styles.medicineIcon}>
                                        <MedicationOutlinedIcon />
                                    </div>


                                    <div className={styles.medicineInfo}>

                                        <h4>
                                            {medicine.name}
                                        </h4>

                                        <span>
                                            {medicine.type} •{" "}
                                            {medicine.strength}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        className={styles.cartButton}
                                        aria-label={`Add ${medicine.name} to cart`}
                                    >
                                        <ShoppingCartOutlinedIcon />
                                    </button>

                                </div>

                            ))}

                        </div>

                    </div>


                    {/* =================================================
                        PRESCRIPTION
                    ================================================== */}

                    <div className={styles.prescriptionCard}>

                        <div className={styles.prescriptionIcon}>
                            <UploadFileOutlinedIcon />
                        </div>


                        <span className={styles.prescriptionLabel}>
                            HAVE A PRESCRIPTION?
                        </span>


                        <h3>
                            Upload your prescription
                        </h3>


                        <p>
                            Don't want to search for every medicine?
                            Upload your complete prescription and we'll
                            help you order the medicines.
                        </p>


                        <Link
                            href="/prescription"
                            className={styles.uploadButton}
                        >
                            Upload Prescription

                            <ArrowForwardIcon />
                        </Link>


                        <div className={styles.deliveryInfo}>

                            <LocalShippingOutlinedIcon />

                            <span>
                                Fast delivery from nearby pharmacies
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}