import Head from "next/head";
import Link from "next/link";
import {
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import axios from "axios";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import PrescriptionUpload from "@/components/common/PrescriptionUpload";

import {
    showSnackBar,
} from "@/redux/notistackSlice";

import styles from "@/styles/Medicines/Prescription.module.css";


/*
|--------------------------------------------------------------------------
| LOCAL STORAGE KEY
|--------------------------------------------------------------------------
|
| Same key used by Checkout.
|
| This means:
|
| Checkout → Prescription
| Prescription → Checkout
|
| Both pages share the same saved delivery information.
|
*/

const SAVED_ADDRESS_KEY =
    "medilocate_saved_address";


export default function PrescriptionPage() {

    const router =
        useRouter();

    const dispatch =
        useDispatch();


    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [files, setFiles] =
        useState([]);


    const [patientName, setPatientName] =
        useState("");


    const [phone, setPhone] =
        useState("");


    const [address, setAddress] =
        useState("");


    const [city, setCity] =
        useState("Rangpur");


    const [notes, setNotes] =
        useState("");


    const [submitting, setSubmitting] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | ADDRESS LOADING STATE
    |--------------------------------------------------------------------------
    */

    const [addressLoaded, setAddressLoaded] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOAD SAVED ADDRESS
    |--------------------------------------------------------------------------
    |
    | If the customer previously entered delivery information
    | in Checkout or this Prescription page, automatically
    | pre-fill the fields.
    |
    */

    useEffect(() => {

        try {

            const storedAddress =
                localStorage.getItem(
                    SAVED_ADDRESS_KEY
                );


            if (storedAddress) {

                const parsedAddress =
                    JSON.parse(
                        storedAddress
                    );


                if (
                    parsedAddress &&
                    typeof parsedAddress === "object"
                ) {

                    setPatientName(
                        parsedAddress.name ||
                        ""
                    );


                    setPhone(
                        parsedAddress.phone ||
                        ""
                    );


                    setAddress(
                        parsedAddress.address ||
                        ""
                    );


                    setCity(
                        parsedAddress.city ||
                        "Rangpur"
                    );

                }

            }


        } catch (error) {

            console.error(
                "Failed to load saved address:",
                error
            );


        } finally {

            setAddressLoaded(
                true
            );

        }

    }, []);


    /*
    |--------------------------------------------------------------------------
    | SAVE ADDRESS TO LOCAL STORAGE
    |--------------------------------------------------------------------------
    |
    | Whenever the user submits a prescription,
    | the latest delivery information becomes
    | their saved address.
    |
    */

    const saveAddressToLocalStorage = () => {

        const newAddress = {

            label:
                "Saved address",

            name:
                patientName.trim(),

            phone:
                phone.trim(),

            address:
                address.trim(),

            city:
                city.trim() ||
                "Rangpur",

        };


        try {

            localStorage.setItem(

                SAVED_ADDRESS_KEY,

                JSON.stringify(
                    newAddress
                )

            );


        } catch (error) {

            console.error(
                "Failed to save address:",
                error
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        if (!files.length) {

            dispatch(
                showSnackBar({

                    message:
                        "প্রথমে আপনার Prescription Upload করুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


            return false;

        }


        if (!patientName.trim()) {

            dispatch(
                showSnackBar({

                    message:
                        "রোগীর নাম লিখুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


            return false;

        }


        if (!phone.trim()) {

            dispatch(
                showSnackBar({

                    message:
                        "মোবাইল নম্বর লিখুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


            return false;

        }


        if (!address.trim()) {

            dispatch(
                showSnackBar({

                    message:
                        "Delivery Address লিখুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


            return false;

        }


        if (!city.trim()) {

            dispatch(
                showSnackBar({

                    message:
                        "City লিখুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


            return false;

        }


        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT PRESCRIPTION
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async () => {

        if (!validateForm()) {

            return;

        }


        try {

            setSubmitting(
                true
            );


            /*
            |--------------------------------------------------------------------------
            | SAVE LATEST ADDRESS
            |--------------------------------------------------------------------------
            |
            | If the customer changed any saved information,
            | this replaces the previous saved address.
            |
            */

            saveAddressToLocalStorage();


            /*
            |--------------------------------------------------------------------------
            | CREATE PRESCRIPTION REQUEST
            |--------------------------------------------------------------------------
            */

            const response =
                await axios.post(

                    "/api/prescriptions",

                    {

                        patient: {

                            name:
                                patientName.trim(),

                            phone:
                                phone.trim(),

                            address:
                                address.trim(),

                            city:
                                city.trim(),

                        },


                        notes:
                            notes.trim(),


                        files,

                    }

                );


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            const requestCode =
                response?.data
                    ?.prescription
                    ?.requestCode;


            console.log(
                response.data
            );


            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            if (requestCode) {

                router.push(
                    `/prescription/success?request=${requestCode}`
                );

            } else {

                router.push(
                    "/prescription/success"
                );

            }


        } catch (error) {

            console.error(
                "Prescription submission failed:",
                error
            );


            dispatch(
                showSnackBar({

                    message:
                        error?.response?.data?.message ||
                        "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",

                    option: {
                        variant:
                            "error",
                    },

                })
            );


        } finally {

            setSubmitting(
                false
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | WAIT FOR SAVED ADDRESS
    |--------------------------------------------------------------------------
    |
    | Prevents the form from briefly showing empty fields
    | before localStorage is loaded.
    |
    */

    if (!addressLoaded) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>

            <Head>

                <title>
                    Prescription Upload করুন | MediLocate
                </title>


                <meta
                    name="description"
                    content="MediLocate-এ Prescription Upload করুন। Medicine availability, price এবং available discount জানার পর Order Confirm করুন এবং Rangpur-এ দ্রুত Medicine Delivery পান।"
                />

            </Head>


            <main
                className={
                    styles.page
                }
            >

                <div
                    className={
                        styles.container
                    }
                >


                    {/* =====================================================
                        BREADCRUMB
                    ====================================================== */}

                    <div
                        className={
                            styles.breadcrumb
                        }
                    >

                        <Link
                            href="/medicines"
                        >

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            Prescription Upload
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header
                        className={
                            styles.header
                        }
                    >

                        <div>

                            <span>
                                PRESCRIPTION ORDER
                            </span>


                            <h1>
                                Prescription Upload করুন
                            </h1>


                            <p>
                                Prescription Upload করুন।
                                আমরা প্রয়োজনীয় Medicine-এর
                                availability, price এবং available
                                discount যাচাই করে আপনাকে জানাবো।
                                আপনি Confirm করার পরই Order
                                process করা হবে।
                            </p>

                        </div>

                    </header>


                    {/* =====================================================
                        MAIN LAYOUT
                    ====================================================== */}

                    <div
                        className={
                            styles.layout
                        }
                    >


                        {/* =================================================
                            MAIN COLUMN
                        ================================================== */}

                        <div
                            className={
                                styles.mainColumn
                            }
                        >


                            {/* =============================================
                                UPLOAD CARD
                            ============================================== */}

                            <section
                                className={
                                    styles.uploadCard
                                }
                            >

                                <div
                                    className={
                                        styles.sectionHeader
                                    }
                                >

                                    <div>

                                        <h2>
                                            Prescription
                                        </h2>


                                        <p>
                                            Prescription-এর পরিষ্কার
                                            ছবি বা PDF Upload করুন।
                                            একাধিক page থাকলে সবগুলো
                                            Upload করতে পারবেন।
                                        </p>

                                    </div>

                                </div>


                                <PrescriptionUpload
                                    value={
                                        files
                                    }
                                    onChange={
                                        setFiles
                                    }
                                />

                            </section>


                            {/* =================================================
                                INFORMATION / TIPS
                            ================================================== */}

                            <section
                                className={
                                    styles.tipsCard
                                }
                            >

                                <div
                                    className={
                                        styles.tipIcon
                                    }
                                >

                                    <InfoOutlinedIcon />

                                </div>


                                <div>

                                    <h3>
                                        Upload করার আগে
                                    </h3>


                                    <ul>

                                        <li>
                                            Prescription-এর সব লেখা
                                            যেন পরিষ্কারভাবে দেখা যায়।
                                        </li>


                                        <li>
                                            ভালো আলোতে ছবি তুলুন এবং
                                            blurry ছবি Upload করা
                                            এড়িয়ে চলুন।
                                        </li>


                                        <li>
                                            Prescription-এ একাধিক
                                            page থাকলে সব page Upload
                                            করুন।
                                        </li>


                                        <li>
                                            Medicine availability,
                                            price এবং available
                                            discount জানার পর আপনি
                                            Order Confirm করবেন।
                                        </li>

                                    </ul>

                                </div>

                            </section>


                            {/* =================================================
                                ORDER INFORMATION
                            ================================================== */}

                            <section
                                className={
                                    styles.formCard
                                }
                            >

                                <div
                                    className={
                                        styles.sectionHeader
                                    }
                                >

                                    <div>

                                        <h2>
                                            Order Information
                                        </h2>


                                        <p>
                                            Medicine-এর price,
                                            availability এবং Delivery
                                            সম্পর্কে যোগাযোগ করার জন্য
                                            নিচের তথ্যগুলো দিন।
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >


                                    {/* =====================================
                                        PATIENT NAME
                                    ====================================== */}

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            রোগীর নাম
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <PersonOutlineRoundedIcon />


                                            <input

                                                type="text"

                                                placeholder="রোগীর নাম লিখুন"

                                                value={
                                                    patientName
                                                }

                                                onChange={
                                                    (event) =>
                                                        setPatientName(
                                                            event.target.value
                                                        )
                                                }

                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        PHONE
                                    ====================================== */}

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            মোবাইল নম্বর
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <PhoneOutlinedIcon />


                                            <input

                                                type="tel"

                                                inputMode="numeric"

                                                placeholder="01XXXXXXXXX"

                                                value={
                                                    phone
                                                }

                                                onChange={
                                                    (event) =>
                                                        setPhone(
                                                            event.target.value
                                                        )
                                                }

                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        DELIVERY ADDRESS
                                    ====================================== */}

                                    <div
                                        className={`${styles.formGroup} ${styles.fullWidth}`}
                                    >

                                        <label>
                                            Delivery Address
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocationOnOutlinedIcon />


                                            <input

                                                type="text"

                                                placeholder="বাড়ি, রোড, এলাকা"

                                                value={
                                                    address
                                                }

                                                onChange={
                                                    (event) =>
                                                        setAddress(
                                                            event.target.value
                                                        )
                                                }

                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        CITY
                                    ====================================== */}

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            City
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocationOnOutlinedIcon />


                                            <input

                                                type="text"

                                                placeholder="Rangpur"

                                                value={
                                                    city
                                                }

                                                onChange={
                                                    (event) =>
                                                        setCity(
                                                            event.target.value
                                                        )
                                                }

                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        NOTES
                                    ====================================== */}

                                    <div
                                        className={`${styles.formGroup} ${styles.fullWidth}`}
                                    >

                                        <label>

                                            Additional Note

                                            <span>
                                                Optional
                                            </span>

                                        </label>


                                        <textarea

                                            placeholder="Medicine, Prescription বা Delivery সম্পর্কে কোনো অতিরিক্ত তথ্য থাকলে লিখুন..."

                                            value={
                                                notes
                                            }

                                            onChange={
                                                (event) =>
                                                    setNotes(
                                                        event.target.value
                                                    )
                                            }

                                            rows={4}

                                        />

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            REQUEST SUMMARY
                        ================================================== */}

                        <aside
                            className={
                                styles.summaryCard
                            }
                        >

                            <div
                                className={
                                    styles.summaryIcon
                                }
                            >

                                <DescriptionOutlinedIcon />

                            </div>


                            <h2>
                                যেভাবে Order করবেন
                            </h2>


                            <div
                                className={
                                    styles.steps
                                }
                            >


                                {/* STEP 1 */}

                                <div
                                    className={
                                        styles.step
                                    }
                                >

                                    <div
                                        className={
                                            styles.stepNumber
                                        }
                                    >
                                        1
                                    </div>


                                    <div>

                                        <strong>
                                            Prescription Upload করুন
                                        </strong>


                                        <span>
                                            Prescription-এর পরিষ্কার
                                            ছবি বা PDF Upload করুন।
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 2 */}

                                <div
                                    className={
                                        styles.step
                                    }
                                >

                                    <div
                                        className={
                                            styles.stepNumber
                                        }
                                    >
                                        2
                                    </div>


                                    <div>

                                        <strong>
                                            Price & Discount জানুন
                                        </strong>


                                        <span>
                                            আমরা Medicine availability,
                                            price এবং available discount
                                            যাচাই করে আপনাকে জানাবো।
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 3 */}

                                <div
                                    className={
                                        styles.step
                                    }
                                >

                                    <div
                                        className={
                                            styles.stepNumber
                                        }
                                    >
                                        3
                                    </div>


                                    <div>

                                        <strong>
                                            Order Confirm করুন
                                        </strong>


                                        <span>
                                            Price এবং Order details
                                            দেখে আপনি Confirm করবেন।
                                            আপনার Confirmation ছাড়া
                                            Order proceed করা হবে না।
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 4 */}

                                <div
                                    className={
                                        styles.step
                                    }
                                >

                                    <div
                                        className={
                                            styles.stepNumber
                                        }
                                    >
                                        4
                                    </div>


                                    <div>

                                        <strong>
                                            দ্রুত Delivery পান
                                        </strong>


                                        <span>
                                            Order Confirm করার পর
                                            আপনার ঠিকানায় Medicine
                                            Delivery-এর ব্যবস্থা
                                            করা হবে।
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* =============================================
                                SUBMIT
                            ============================================== */}

                            <div
                                className={
                                    styles.submitArea
                                }
                            >

                                <button

                                    type="button"

                                    className={
                                        styles.continueButton
                                    }

                                    onClick={
                                        handleSubmit
                                    }

                                    disabled={
                                        submitting
                                    }

                                >

                                    {
                                        submitting
                                            ? "Submit হচ্ছে..."
                                            : "Prescription Submit করুন"
                                    }


                                    {
                                        !submitting && (

                                            <ArrowForwardRoundedIcon />

                                        )
                                    }

                                </button>


                                <p>
                                    এখন কোনো Payment করতে হবে না।
                                    আমরা Medicine availability,
                                    price এবং available discount
                                    জানাবো। আপনি Confirm করার পরই
                                    Order process করা হবে।
                                </p>

                            </div>


                            {/* =============================================
                                CONFIRMATION NOTE
                            ============================================== */}

                            <div
                                className={
                                    styles.securityNote
                                }
                            >

                                <CheckCircleRoundedIcon />


                                <span>
                                    আপনার Confirmation ছাড়া কোনো
                                    Medicine Delivery করা হবে না।
                                </span>

                            </div>


                            <Link
                                href="/medicines"
                                className={
                                    styles.backCart
                                }
                            >

                                <ArrowBackRoundedIcon />

                                Medicine Search করে Order করুন

                            </Link>

                        </aside>

                    </div>

                </div>

            </main>

        </>
    );

}