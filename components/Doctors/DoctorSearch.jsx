import { useState } from "react";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import styles from "./DoctorSearch.module.css";


const specialties = [
    "Medicine Specialist",
    "Cardiology",
    "Dermatology",
    "Child Specialist",
    "Gynecology",
    "Orthopedics",
];


export default function DoctorSearch({ onSearch }) {

    const [search, setSearch] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [gender, setGender] = useState("");
    const [available, setAvailable] = useState(false);


    const submitSearch = (event) => {

        event.preventDefault();

        onSearch({
            search,
            specialty,
            gender,
            available,
        });
    };


    const clearFilters = () => {

        setSearch("");
        setSpecialty("");
        setGender("");
        setAvailable(false);

        onSearch({
            search: "",
            specialty: "",
            gender: "",
            available: false,
        });
    };


    return (
        <div className={styles.wrapper}>

            <form
                className={styles.form}
                onSubmit={submitSearch}
            >

                {/* ============================================
                    SEARCH
                ============================================ */}

                <div className={styles.searchBox}>

                    <SearchOutlinedIcon />

                    <input
                        type="text"
                        placeholder="Search doctor or specialty..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                {/* ============================================
                    LOCATION
                ============================================ */}

                <div className={styles.locationBox}>

                    <LocationOnOutlinedIcon />

                    <span>
                        Rangpur
                    </span>

                </div>


                {/* ============================================
                    SPECIALTY
                ============================================ */}

                <select
                    value={specialty}
                    onChange={(event) =>
                        setSpecialty(event.target.value)
                    }
                >

                    <option value="">
                        All Specialties
                    </option>

                    {specialties.map((item) => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

                </select>


                {/* ============================================
                    GENDER
                ============================================ */}

                <select
                    value={gender}
                    onChange={(event) =>
                        setGender(event.target.value)
                    }
                >

                    <option value="">
                        Any Gender
                    </option>

                    <option value="Male">
                        Male
                    </option>

                    <option value="Female">
                        Female
                    </option>

                </select>


                {/* ============================================
                    AVAILABLE
                ============================================ */}

                <label className={styles.available}>

                    <input
                        type="checkbox"
                        checked={available}
                        onChange={(event) =>
                            setAvailable(event.target.checked)
                        }
                    />

                    <span>
                        Available
                    </span>

                </label>


                {/* ============================================
                    BUTTON
                ============================================ */}

                <button
                    type="submit"
                    className={styles.searchButton}
                >

                    <SearchOutlinedIcon />

                    Search

                </button>

            </form>


            {/* ================================================
                FILTER FOOTER
            ================================================= */}

            {(search || specialty || gender || available) && (

                <div className={styles.filterFooter}>

                    <div>

                        <TuneOutlinedIcon />

                        <span>
                            Filters applied
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={clearFilters}
                    >

                        <CloseOutlinedIcon />

                        Clear filters

                    </button>

                </div>

            )}

        </div>
    );
}