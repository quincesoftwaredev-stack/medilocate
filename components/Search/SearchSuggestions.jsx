import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";

import styles from "@/styles/Search/GlobalSearch.module.css";

const sections = [
    { key: "doctors", label: "Doctors", icon: MedicalServicesOutlinedIcon },
    { key: "specialties", label: "Specialties", icon: MonitorHeartOutlinedIcon },
    { key: "medicines", label: "Medicines", icon: LocalPharmacyOutlinedIcon },
];

export const filterSuggestionGroups = (groups = {}, type = "medicines") => type === "medicines"
    ? { doctors: [], specialties: [], medicines: groups.medicines || [] }
    : { doctors: groups.doctors || [], specialties: groups.specialties || [], medicines: [] };

export const getSuggestionHref = (item) => {
    if (item.type === "doctor") return `/doctors/${item.id}`;
    if (item.type === "medicine") return `/medicines/${item._id}`;
    return `/doctors?specialty=${encodeURIComponent(item.name)}`;
};

export const flattenSuggestions = (groups = {}) =>
    sections.flatMap((section) => groups[section.key] || []);

export default function SearchSuggestions({
    groups = {},
    query,
    loading,
    error,
    activeIndex,
    onSelect,
    activeType,
    onTypeChange,
}) {
    const hasResults = flattenSuggestions(groups).length > 0;
    let itemIndex = -1;

    return (
        <div className={styles.suggestions} role="listbox">
            <div className={styles.resultTabs} role="tablist" aria-label="Search result type">
                <button type="button" role="tab" aria-selected={activeType === "medicines"} className={activeType === "medicines" ? styles.activeTab : ""} onClick={() => onTypeChange("medicines")}>
                    <LocalPharmacyOutlinedIcon /> Medicines
                </button>
                <button type="button" role="tab" aria-selected={activeType === "doctors"} className={activeType === "doctors" ? styles.activeTab : ""} onClick={() => onTypeChange("doctors")}>
                    <MedicalServicesOutlinedIcon /> Doctors
                </button>
            </div>
            {loading && <div className={styles.message}>Searching doctors and medicines…</div>}
            {!loading && error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
            {!loading && !error && !hasResults && (
                <div className={styles.message}>No doctors, specialties or medicines found.</div>
            )}

            {!loading && !error && hasResults && sections.map((section) => {
                const items = groups[section.key] || [];
                if (!items.length) return null;
                const Icon = section.icon;

                return (
                    <div key={section.key} className={styles.suggestionGroup}>
                        <div className={styles.groupLabel}>{section.label}</div>
                        {items.map((item) => {
                            itemIndex += 1;
                            const currentIndex = itemIndex;
                            return (
                                <a
                                    key={`${item.type}-${item.id || item._id || item.name}`}
                                    href={getSuggestionHref(item)}
                                    role="option"
                                    aria-selected={activeIndex === currentIndex}
                                    className={`${styles.suggestionItem} ${activeIndex === currentIndex ? styles.activeSuggestion : ""}`}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onSelect(getSuggestionHref(item));
                                    }}
                                >
                                    <span className={styles.resultIcon}><Icon /></span>
                                    <span className={styles.resultCopy}>
                                        <strong>{item.name}</strong>
                                        <small>
                                            {item.type === "doctor" && `${item.specialty}${item.workplace ? ` · ${item.workplace}` : ""}`}
                                            {item.type === "medicine" && `${item.genericName || "Medicine"}${item.strength ? ` · ${item.strength}` : ""}`}
                                            {item.type === "specialty" && "View matching doctors"}
                                        </small>
                                    </span>
                                    <ArrowForwardRoundedIcon className={styles.resultArrow} />
                                </a>
                            );
                        })}
                    </div>
                );
            })}

            {!loading && !error && hasResults && (
                <a
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={styles.viewAll}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                        event.preventDefault();
                        onSelect(`/search?q=${encodeURIComponent(query)}`);
                    }}
                >
                    View all results for “{query}” <ArrowForwardRoundedIcon />
                </a>
            )}
        </div>
    );
}
