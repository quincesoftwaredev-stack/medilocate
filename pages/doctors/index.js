import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

import DoctorSearch from "../../components/Doctors/DoctorSearch";
import DoctorCard from "../../components/Doctors/DoctorCard";
import PaginationComponent from "@/components/common/Pagination";

import styles from "@/styles/Doctors.module.css";
import BASE_URL from "@/config";


/*
|--------------------------------------------------------------------------
| NORMALIZE DOCTOR
|--------------------------------------------------------------------------
*/

const normalizeDoctor = (doctor) => {

    const user =
        doctor.user || {};

    return {

        id:
            doctor._id?.toString(),

        name:
            user.fullName ||
            [
                user.firstName,
                user.lastName,
            ]
                .filter(Boolean)
                .join(" ") ||
            "Doctor",

        specialty:
            doctor.speciality ||
            "General Physician",

        qualification:
            doctor.education ||
            "",

        experience:
            doctor.totalExperience
                ? `${doctor.totalExperience} ${
                      doctor.totalExperience === 1
                          ? "Year"
                          : "Years"
                  } Experience`
                : "Experience not specified",

        location:
            doctor.workingIn ||
            "",

        chamber:
            doctor.workingIn ||
            "",

        fee:
            doctor.consultationFee
                ? `৳${doctor.consultationFee}`
                : "Fee not specified",

        gender:
            user.gender ||
            "",

        rating:
            doctor.rating ||
            "0",

        reviews:
            doctor.reviews ||
            0,

        available:
            Boolean(
                doctor.availableForHomeVisit
            ),

        image:
            user.image ||
            "",

        bmdcNumber:
            doctor.bmdcNumber ||
            "",

    };

};


export default function DoctorsPage({
    doctors = [],
    pagination = {},
    filters = {},
}) {

    const router =
        useRouter();


    const [search, setSearch] =
        useState(
            filters.search || ""
        );

    const [specialty, setSpecialty] =
        useState(
            filters.specialty || ""
        );

    const [gender, setGender] =
        useState(
            filters.gender || ""
        );

    const [available, setAvailable] =
        useState(
            filters.available || false
        );


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const handleSearch = (
        searchFilters
    ) => {

        const nextQuery = {};

        if (
            searchFilters.search?.trim()
        ) {

            nextQuery.search =
                searchFilters.search.trim();

        }

        if (
            searchFilters.specialty
        ) {

            nextQuery.specialty =
                searchFilters.specialty;

        }

        if (
            searchFilters.gender
        ) {

            nextQuery.gender =
                searchFilters.gender;

        }

        if (
            searchFilters.available
        ) {

            nextQuery.available =
                "true";

        }


        router.push({

            pathname:
                "/doctors",

            query:
                nextQuery,

        });

    };


    /*
    |--------------------------------------------------------------------------
    | PAGE CHANGE
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (
        page
    ) => {

        const query = {
            ...router.query,
            page,
        };


        router.push({

            pathname:
                "/doctors",

            query,

        });

    };


    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {

        setSearch("");
        setSpecialty("");
        setGender("");
        setAvailable(false);

        router.push(
            "/doctors"
        );

    };


    const normalizedDoctors =
        doctors.map(
            normalizeDoctor
        );


    return (
        <>
            <Head>

                <title>
                    Find a Doctor | MediLocate
                </title>

                <meta
                    name="description"
                    content="Find trusted doctors near you with MediLocate."
                />

            </Head>




            <main className={styles.page}>


                {/* =================================================
                    PAGE HEADER
                ================================================== */}

                <section
                    className={
                        styles.header
                    }
                >

                    <div
                        className={
                            styles.container
                        }
                    >

                        <span
                            className={
                                styles.label
                            }
                        >
                            FIND A DOCTOR
                        </span>


                        <h1>
                            Find the right doctor
                            <span>
                                {" "}near you.
                            </span>
                        </h1>


                        <p>
                            Search doctors by specialty,
                            location and availability for
                            an onsite visit.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    SEARCH
                ================================================== */}

                <section
                    className={
                        styles.searchSection
                    }
                >

                    <div
                        className={
                            styles.container
                        }
                    >

                        <DoctorSearch
                            onSearch={
                                handleSearch
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    RESULTS
                ================================================== */}

                <section
                    className={
                        styles.results
                    }
                >

                    <div
                        className={
                            styles.container
                        }
                    >

                        <div
                            className={
                                styles.resultsHeader
                            }
                        >

                            <div>

                                <span>
                                    DOCTORS
                                </span>

                                <h2>
                                    Available doctors
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.resultCount
                                }
                            >

                                {pagination.total || 0}

                                {" "}

                                {
                                    pagination.total === 1
                                        ? "doctor found"
                                        : "doctors found"
                                }

                            </div>

                        </div>


                        {normalizedDoctors.length >
                        0 ? (

                            <>

                                <div
                                    className={
                                        styles.doctorGrid
                                    }
                                >

                                    {normalizedDoctors.map(
                                        (doctor) => (

                                            <DoctorCard
                                                key={
                                                    doctor.id
                                                }
                                                doctor={
                                                    doctor
                                                }
                                            />

                                        )
                                    )}

                                </div>


                                {/* =================================
                                    PAGINATION
                                ================================== */}

                                {pagination.pages >
                                    1 && (

                                    <div
                                        style={{
                                            marginTop:
                                                "32px",

                                            display:
                                                "flex",

                                            justifyContent:
                                                "center",
                                        }}
                                    >

                                        <PaginationComponent
                                            page={
                                                pagination.page
                                            }

                                            pages={
                                                pagination.pages
                                            }

                                            onChange={
                                                handlePageChange
                                            }

                                        />

                                    </div>

                                )}

                            </>

                        ) : (

                            <div
                                className={
                                    styles.empty
                                }
                            >

                                <h3>
                                    No doctors found
                                </h3>

                                <p>
                                    Try changing your
                                    search or filter options.
                                </p>


                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Reset filters
                                </button>

                            </div>

                        )}

                    </div>

                </section>

            </main>



        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    try {

        const {
            query,
            req,
        } = context;


        const {
            search = "",
            specialty = "",
            gender = "",
            available = "",
            page = "1",
        } = query;


        const params =
            new URLSearchParams();


        if (search) {

            params.set(
                "search",
                search
            );

        }


        if (specialty) {

            params.set(
                "specialty",
                specialty
            );

        }


        if (gender) {

            params.set(
                "gender",
                gender
            );

        }


        if (available) {

            params.set(
                "available",
                available
            );

        }


        params.set(
            "page",
            page
        );


        params.set(
            "limit",
            "12"
        );


        /*
        |--------------------------------------------------------------------------
        | CURRENT HOST
        |--------------------------------------------------------------------------
        */

       


        const apiUrl =
            `${BASE_URL}/api/doctors?${params.toString()}`;


        /*
        |--------------------------------------------------------------------------
        | API
        |--------------------------------------------------------------------------
        */

        const response =
            await axios.get(
                apiUrl,
                {
                    headers: {
                        cookie:
                            req.headers.cookie ||
                            "",
                    },
                }
            );


        const data =
            response.data;


        return {

            props: {

                doctors:
                    data.doctors || [],

                pagination:
                    data.pagination || {
                        page: 1,
                        limit: 12,
                        total: 0,
                        pages: 0,
                    },

                filters: {

                    search:
                        search || "",

                    specialty:
                        specialty || "",

                    gender:
                        gender || "",

                    available:
                        available ===
                        "true",

                },

            },

        };

    } catch (error) {

        console.error(
            "Doctors SSR error:",
            error?.response?.data ||
            error.message
        );


        return {

            props: {

                doctors: [],

                pagination: {

                    page: 1,

                    limit: 12,

                    total: 0,

                    pages: 0,

                },

                filters: {

                    search: "",

                    specialty: "",

                    gender: "",

                    available: false,

                },

            },

        };

    }

}