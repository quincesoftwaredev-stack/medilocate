import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
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

import styles from "@/styles/Medicines/Prescription.module.css";


export default function PrescriptionPage() {

    const router = useRouter();


    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [files, setFiles] = useState([]);

    const [patientName, setPatientName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        if (!files.length) {

            alert(
                "Please upload your prescription first."
            );

            return false;

        }


        if (!patientName.trim()) {

            alert(
                "Please enter the patient's name."
            );

            return false;

        }


        if (!phone.trim()) {

            alert(
                "Please enter a phone number."
            );

            return false;

        }


        if (!address.trim()) {

            alert(
                "Please enter the delivery address."
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

            setSubmitting(true);


            const prescriptionData = {

                patientName:
                    patientName.trim(),

                phone:
                    phone.trim(),

                address:
                    address.trim(),

                notes:
                    notes.trim(),

                files: files.map(
                    (file) => ({
                        url: file.url,
                        publicId:
                            file.publicId || "",
                        name:
                            file.name || "",
                        type:
                            file.type || "",
                        size:
                            file.size || 0,
                    })
                ),

            };


            const response = await axios.post(
                "/api/prescriptions",
                {
                    patient: {
                        name: patientName.trim(),
                        phone: phone.trim(),
                        address: address.trim(),
                    },

                    notes: notes.trim(),

                    files,
                }
            );


            const requestCode =
                response?.data?.prescription.requestCode;
            console.log(response.data)


            if (requestCode) {

                router.push(
                    `/medicines/prescription/success?request=${requestCode}`
                );

            } else {

                router.push(
                    "/medicines/prescription/success"
                );

            }


        } catch (error) {

            console.error(
                "Prescription submission failed:",
                error
            );


            alert(
                error?.response?.data?.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            setSubmitting(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head>

                <title>
                    Upload Prescription | MediLocate
                </title>


                <meta
                    name="description"
                    content="Upload your prescription and let MediLocate arrange your medicine order."
                />

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        BREADCRUMB
                    ====================================================== */}

                    <div className={styles.breadcrumb}>

                        <Link href="/medicines">

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            Upload Prescription
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span>
                                PRESCRIPTION ORDER
                            </span>


                            <h1>
                                Upload your prescription
                            </h1>


                            <p>
                                Don't want to search for medicines
                                yourself? Simply upload your prescription
                                and our pharmacy team will handle the rest.
                            </p>

                        </div>

                    </header>


                    {/* =====================================================
                        MAIN LAYOUT
                    ====================================================== */}

                    <div className={styles.layout}>


                        {/* =================================================
                            MAIN COLUMN
                        ================================================== */}

                        <div className={styles.mainColumn}>


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
                                            Upload one or more pages
                                            of your prescription.
                                        </p>

                                    </div>

                                </div>


                                <PrescriptionUpload
                                    value={files}
                                    onChange={setFiles}
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
                                        For a better result
                                    </h3>


                                    <ul>

                                        <li>
                                            Make sure every part
                                            of the prescription is
                                            clearly visible.
                                        </li>


                                        <li>
                                            Use good lighting and
                                            avoid blurry photos.
                                        </li>


                                        <li>
                                            Upload all pages if your
                                            prescription has multiple
                                            pages.
                                        </li>

                                    </ul>

                                </div>

                            </section>


                            {/* =================================================
                                PATIENT INFORMATION
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
                                            Patient information
                                        </h2>


                                        <p>
                                            Tell us who the medicine
                                            is for.
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
                                            Patient name
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <PersonOutlineRoundedIcon />


                                            <input
                                                type="text"
                                                placeholder="Enter patient name"
                                                value={
                                                    patientName
                                                }
                                                onChange={(e) =>
                                                    setPatientName(
                                                        e.target.value
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
                                            Phone number
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <PhoneOutlinedIcon />


                                            <input
                                                type="tel"
                                                placeholder="01XXXXXXXXX"
                                                value={
                                                    phone
                                                }
                                                onChange={(e) =>
                                                    setPhone(
                                                        e.target.value
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
                                            Delivery address
                                        </label>


                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <LocationOnOutlinedIcon />


                                            <input
                                                type="text"
                                                placeholder="House, road, area, city"
                                                value={
                                                    address
                                                }
                                                onChange={(e) =>
                                                    setAddress(
                                                        e.target.value
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

                                            Additional instructions

                                            <span>
                                                Optional
                                            </span>

                                        </label>


                                        <textarea
                                            placeholder="Any note for our pharmacy team or delivery person..."
                                            value={
                                                notes
                                            }
                                            onChange={(e) =>
                                                setNotes(
                                                    e.target.value
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
                                How it works
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
                                            Upload prescription
                                        </strong>


                                        <span>
                                            Send us a clear photo
                                            or PDF.
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
                                            Our team reviews it
                                        </strong>


                                        <span>
                                            Our pharmacy team checks
                                            the prescription.
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
                                            We prepare your order
                                        </strong>


                                        <span>
                                            The required medicines
                                            are added to your order.
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
                                            Get it delivered
                                        </strong>


                                        <span>
                                            We contact you and
                                            arrange delivery.
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

                                    {submitting
                                        ? "Submitting..."
                                        : "Submit prescription"
                                    }


                                    {!submitting && (

                                        <ArrowForwardRoundedIcon />

                                    )}

                                </button>


                                <p>
                                    No payment is required at
                                    this stage. Our team will
                                    contact you after reviewing
                                    your prescription.
                                </p>

                            </div>


                            {/* =============================================
                                SECURITY NOTE
                            ============================================== */}

                            <div
                                className={
                                    styles.securityNote
                                }
                            >

                                <CheckCircleRoundedIcon />


                                <span>
                                    Your prescription will be
                                    reviewed by our pharmacy team.
                                </span>

                            </div>


                            <Link
                                href="/medicines"
                                className={
                                    styles.backCart
                                }
                            >

                                <ArrowBackRoundedIcon />

                                Back to medicines

                            </Link>

                        </aside>

                    </div>

                </div>

            </main>



        </>
    );

}