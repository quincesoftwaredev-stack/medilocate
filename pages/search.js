import Head from "next/head";
import Link from "next/link";

import axios from "axios";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import GlobalSearch from "@/components/Search/GlobalSearch";
import Pagination from "@/components/Utility/Pagination";
import styles from "@/styles/Search/SearchResults.module.css";

const emptyData = {
    groups: { doctors: [], specialties: [], medicines: [] },
    counts: { doctors: 0, medicines: 0, total: 0 },
    pagination: { page: 1, totalPages: 0, totalResults: 0 },
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const tabItems = [
    { value: "all", label: "All" },
    { value: "doctors", label: "Doctors" },
    { value: "medicines", label: "Medicines" },
];

function DoctorResult({ doctor }) {
    return (
        <article className={styles.doctorCard}>
            <div className={styles.doctorTop}>
                <div className={styles.doctorImage}>
                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : doctor.name?.charAt(0)}
                </div>
                <div className={styles.doctorInfo}>
                    <div className={styles.verifiedRow}>
                        <h3>{doctor.name}</h3>
                        <VerifiedOutlinedIcon />
                    </div>
                    <strong>{doctor.specialty}</strong>
                    {doctor.qualification && <span>{doctor.qualification}</span>}
                </div>
            </div>
            <div className={styles.resultMeta}>
                <span>{doctor.workplace || "Healthcare professional"}</span>
                <span>{doctor.available ? "Available for home visits" : "View availability"}</span>
            </div>
            <div className={styles.resultFooter}>
                <div><span>Consultation</span><strong>{formatCurrency(doctor.fee)}</strong></div>
                <Link href={`/doctors/${doctor.id}`}>
                    View profile <ArrowForwardRoundedIcon />
                </Link>
            </div>
        </article>
    );
}

function MedicineResult({ medicine }) {
    return (
        <article className={styles.medicineCard}>
            <Link href={`/medicines/${medicine._id}`} className={styles.medicineImage}>
                {medicine.image?.url ? <img src={medicine.image.url} alt={medicine.name} /> : medicine.name?.charAt(0)}
            </Link>
            <div className={styles.medicineInfo}>
                <div className={styles.medicineBadges}>
                    {medicine.prescriptionRequired && <span>Prescription required</span>}
                    <em className={medicine.stock > 0 ? styles.inStock : styles.outOfStock}>
                        {medicine.stock > 0 ? "In stock" : "Out of stock"}
                    </em>
                </div>
                <Link href={`/medicines/${medicine._id}`} className={styles.medicineName}>{medicine.name}</Link>
                <strong className={styles.genericName}>{medicine.genericName || "Medicine"}</strong>
                <span>{[medicine.strength, medicine.dosageForm, medicine.manufacturer].filter(Boolean).join(" · ")}</span>
                <div className={styles.resultFooter}>
                    <strong className={styles.price}>{formatCurrency(medicine.price)}</strong>
                    <Link href={`/medicines/${medicine._id}`}>
                        View medicine <ArrowForwardRoundedIcon />
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function SearchResultsPage({ query, type, data = emptyData }) {
    const doctors = data.groups?.doctors || [];
    const medicines = data.groups?.medicines || [];
    const specialties = data.groups?.specialties || [];
    const counts = data.counts || emptyData.counts;
    const pagination = data.pagination || emptyData.pagination;
    const hasResults = doctors.length > 0 || medicines.length > 0;

    return (
        <>
            <Head>
                <title>{query ? `Search results for ${query}` : "Search healthcare"} | MediLocate</title>
                <meta name="description" content="Search verified doctors, specialties and active medicines on MediLocate." />
            </Head>

            <main className={styles.page}>
                <section className={styles.searchHero}>
                    <div className={styles.container}>
                        <span className={styles.eyebrow}>MEDILOCATE SEARCH</span>
                        <h1>Find the healthcare you need</h1>
                        <p>Search verified doctors, medical specialties, generic names and active medicines.</p>
                        <div className={styles.searchWrap}>
                            <GlobalSearch initialValue={query} autoFocus={!query} />
                        </div>
                    </div>
                </section>

                <section className={styles.resultsSection}>
                    <div className={styles.container}>
                        {query.length >= 2 && (
                            <div className={styles.resultsHeader}>
                                <div>
                                    <span>Search results</span>
                                    <h2>“{query}”</h2>
                                </div>
                                <strong>{counts.total || 0} matches</strong>
                            </div>
                        )}

                        <nav className={styles.tabs} aria-label="Search result types">
                            {tabItems.map((tab) => {
                                const count = tab.value === "all" ? counts.total : counts[tab.value];
                                return (
                                    <Link
                                        key={tab.value}
                                        href={{ pathname: "/search", query: { q: query, type: tab.value, page: 1 } }}
                                        className={type === tab.value ? styles.activeTab : ""}
                                    >
                                        {tab.label} <span>{count || 0}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {specialties.length > 0 && type !== "medicines" && (
                            <div className={styles.specialties}>
                                <span>Matching specialties</span>
                                <div>
                                    {specialties.map((specialty) => (
                                        <Link key={specialty.name} href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}>
                                            {specialty.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!query || query.length < 2 ? (
                            <div className={styles.emptyState}>
                                <SearchOffRoundedIcon />
                                <h2>Start with at least two characters</h2>
                                <p>Try a doctor name, specialty, medicine, generic name or manufacturer.</p>
                            </div>
                        ) : !hasResults ? (
                            <div className={styles.emptyState}>
                                <SearchOffRoundedIcon />
                                <h2>No matching results</h2>
                                <p>Check the spelling, try a generic term, or browse all available services.</p>
                                <div>
                                    <Link href="/doctors"><MedicalServicesOutlinedIcon /> Browse doctors</Link>
                                    <Link href="/medicines"><LocalPharmacyOutlinedIcon /> Browse medicines</Link>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.resultGroups}>
                                {doctors.length > 0 && (
                                    <section>
                                        <div className={styles.groupHeader}>
                                            <div><MedicalServicesOutlinedIcon /><h2>Doctors</h2></div>
                                            {type === "all" && <Link href={{ pathname: "/search", query: { q: query, type: "doctors", page: 1 } }}>See all {counts.doctors}</Link>}
                                        </div>
                                        <div className={styles.doctorGrid}>{doctors.map((doctor) => <DoctorResult key={doctor.id} doctor={doctor} />)}</div>
                                    </section>
                                )}

                                {medicines.length > 0 && (
                                    <section>
                                        <div className={styles.groupHeader}>
                                            <div><LocalPharmacyOutlinedIcon /><h2>Medicines</h2></div>
                                            {type === "all" && <Link href={{ pathname: "/search", query: { q: query, type: "medicines", page: 1 } }}>See all {counts.medicines}</Link>}
                                        </div>
                                        <div className={styles.medicineGrid}>{medicines.map((medicine) => <MedicineResult key={medicine._id} medicine={medicine} />)}</div>
                                    </section>
                                )}
                            </div>
                        )}

                        {pagination.totalPages > 1 && (
                            <div className={styles.pagination}>
                                <Pagination totalPages={pagination.totalPages} currentPage={pagination.page} />
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

export async function getServerSideProps(context) {
    const query = String(context.query.q || "").trim();
    const type = ["all", "doctors", "medicines"].includes(context.query.type)
        ? context.query.type
        : "all";
    const page = Math.max(Number(context.query.page) || 1, 1);

    if (query.length < 2) {
        return { props: { query, type, data: emptyData } };
    }

    try {
        const protocol = context.req.headers["x-forwarded-proto"]?.split(",")[0] || "http";
        const host = context.req.headers["x-forwarded-host"] || context.req.headers.host;
        const response = await axios.get(`${protocol}://${host}/api/search`, {
            params: { q: query, type, page },
        });

        return {
            props: {
                query,
                type,
                data: response.data?.success ? response.data : emptyData,
            },
        };
    } catch (error) {
        console.error("Search results SSR error:", error.response?.data || error.message);
        return { props: { query, type, data: emptyData } };
    }
}

