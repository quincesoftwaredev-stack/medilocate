
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import axios from "axios";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Admin/Medicines/MedicineForm.module.css";

import { useSelector } from "react-redux";


const categories = [
    "Pain Relief",
    "Gastrointestinal",
    "Cardiovascular",
    "Antibiotic",
    "Antihistamine",
    "Vitamins",
    "Diabetes",
    "Respiratory",
    "Dermatology",
    "Other",
];


const dosageForms = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Suspension",
    "Injection",
    "Cream",
    "Ointment",
    "Drops",
    "Inhaler",
    "Powder",
    "Other",
];


export default function CreateMedicinePage() {

    const router = useRouter();


    const userInfo =
        useSelector(
            (state) =>
                state.user.userInfo
        );


    const [form, setForm] = useState({

        name: "",

        genericName: "",

        strength: "",

        dosageForm: "Tablet",

        packSize: "",

        manufacturer: "",

        category: "",

        price: "",

        stock: "",

        reorderLevel: "20",

        prescriptionRequired: false,

        description: "",

        usage: "",

        warnings: "",

        status: "active",

    });


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    |
    | file = local File object for preview
    |
    | url/publicId = actual uploaded image information
    |
    */

    const [image, setImage] =
        useState(null);


    const [saving, setSaving] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | HANDLE FORM CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setForm(
            (previous) => ({

                ...previous,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,

            })
        );

    };


    /*
    |--------------------------------------------------------------------------
    | HANDLE IMAGE
    |--------------------------------------------------------------------------
    */

    const handleImage = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        /*
         * For now this is only a local preview.
         *
         * The actual file should later be uploaded to
         * your image-upload API / Cloudinary first.
         */

        setImage({

            file,

            url:
                URL.createObjectURL(
                    file
                ),

            publicId:
                "",

        });

    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            !form.name.trim()
        ) {

            alert(
                "Medicine name is required."
            );

            return;

        }


        if (
            !form.genericName.trim()
        ) {

            alert(
                "Generic name is required."
            );

            return;

        }


        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {

            alert(
                "Please enter a valid price."
            );

            return;

        }


        try {

            setSaving(true);


            /*
            |--------------------------------------------------------------------------
            | PAYLOAD
            |--------------------------------------------------------------------------
            |
            | The API you provided expects:
            |
            | req.body
            |
            | Therefore send JSON instead of FormData.
            |
            */

            const payload = {

                ...form,

                price:
                    Number(
                        form.price
                    ),

                stock:
                    Math.max(
                        Number(
                            form.stock
                        ) || 0,
                        0
                    ),

                reorderLevel:
                    Math.max(
                        Number(
                            form.reorderLevel
                        ) || 20,
                        0
                    ),

                prescriptionRequired:
                    Boolean(
                        form.prescriptionRequired
                    ),

                /*
                 * API expects:
                 *
                 * image: {
                 *     url,
                 *     publicId
                 * }
                 */

                image: {

                    url:
                        image?.url || "",

                    publicId:
                        image?.publicId || "",

                },

            };


            /*
            |--------------------------------------------------------------------------
            | API CALL
            |--------------------------------------------------------------------------
            */

            const {
                data
            } = await axios.post(

                "/api/admin/medicines",

                payload,

                {
                    headers: {

                        Authorization:
                            `Bearer ${userInfo?.token}`,

                    },

                }

            );

            console.log({ data })
            alert(
                data?.message ||
                "Medicine created successfully."
            );


            // router.push(
            //     "/admin/medicines"
            // );


        } catch (
        error
        ) {

            console.error(
                "Create medicine error:",
                error
            );


            alert(
                error
                    ?.response
                    ?.data
                    ?.message ||
                "Failed to create medicine."
            );


        } finally {

            setSaving(false);

        }

    };


    return (
        <>

            <Head>

                <title>
                    Add Medicine | MediLocate Admin
                </title>

            </Head>


            <Navbar />


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
                        TOP
                    ====================================================== */}

                    <div
                        className={
                            styles.topBar
                        }
                    >

                        <Link
                            href="/admin/medicines"
                            className={
                                styles.backLink
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            Add Medicine
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

                        <div
                            className={
                                styles.titleIcon
                            }
                        >

                            <AddRoundedIcon />

                        </div>


                        <div>

                            <span>
                                PHARMACY CATALOG
                            </span>

                            <h1>
                                Add a new medicine
                            </h1>

                            <p>
                                Add medicine information,
                                pricing and inventory details.
                            </p>

                        </div>

                    </header>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className={
                            styles.form
                        }
                    >


                        {/* =================================================
                            BASIC INFORMATION
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardHeader
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <MedicalServicesOutlinedIcon />

                                    <div>

                                        <h2>
                                            Basic information
                                        </h2>

                                        <span>
                                            Core medicine details
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Medicine name
                                        <b>*</b>
                                    </label>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Napa"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Generic name
                                        <b>*</b>
                                    </label>

                                    <input
                                        name="genericName"
                                        value={
                                            form.genericName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Paracetamol"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Strength
                                    </label>

                                    <input
                                        name="strength"
                                        value={
                                            form.strength
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 500 mg"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Dosage form
                                    </label>

                                    <select
                                        name="dosageForm"
                                        value={
                                            form.dosageForm
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        {dosageForms.map(
                                            (
                                                item
                                            ) => (

                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Pack size
                                    </label>

                                    <input
                                        name="packSize"
                                        value={
                                            form.packSize
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 10 tablets"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Manufacturer
                                    </label>

                                    <input
                                        name="manufacturer"
                                        value={
                                            form.manufacturer
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Square Pharmaceuticals"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select category
                                        </option>


                                        {categories.map(
                                            (
                                                item
                                            ) => (

                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            IMAGE
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardTitle
                                }
                            >

                                <ImageOutlinedIcon />

                                <div>

                                    <h2>
                                        Medicine image
                                    </h2>

                                    <span>
                                        Product image shown to patients
                                    </span>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.imageUpload
                                }
                            >

                                <label
                                    className={
                                        styles.uploadBox
                                    }
                                >

                                    {image ? (

                                        <img
                                            src={
                                                image.url
                                            }
                                            alt="Preview"
                                        />

                                    ) : (

                                        <>

                                            <ImageOutlinedIcon />

                                            <strong>
                                                Choose medicine image
                                            </strong>

                                            <span>
                                                JPG, PNG or WEBP
                                            </span>

                                        </>

                                    )}


                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImage
                                        }
                                        hidden
                                    />

                                </label>

                            </div>

                        </section>


                        {/* =================================================
                            PRICING & INVENTORY
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardTitle
                                }
                            >

                                <Inventory2OutlinedIcon />

                                <div>

                                    <h2>
                                        Pricing & inventory
                                    </h2>

                                    <span>
                                        Stock and selling information
                                    </span>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.formGrid
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Selling price
                                        <b>*</b>
                                    </label>

                                    <div
                                        className={
                                            styles.moneyInput
                                        }
                                    >

                                        <span>
                                            ৳
                                        </span>

                                        <input
                                            name="price"
                                            type="number"
                                            min="0"
                                            value={
                                                form.price
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Initial stock
                                    </label>

                                    <input
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={
                                            form.stock
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Reorder level
                                    </label>

                                    <input
                                        name="reorderLevel"
                                        type="number"
                                        min="0"
                                        value={
                                            form.reorderLevel
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="20"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            PRESCRIPTION
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardTitle
                                }
                            >

                                <DescriptionOutlinedIcon />

                                <div>

                                    <h2>
                                        Prescription requirement
                                    </h2>

                                    <span>
                                        Control whether a prescription
                                        is required for this medicine
                                    </span>

                                </div>

                            </div>


                            <label
                                className={
                                    styles.checkboxRow
                                }
                            >

                                <input
                                    type="checkbox"
                                    name="prescriptionRequired"
                                    checked={
                                        form.prescriptionRequired
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <div>

                                    <strong>
                                        Prescription required
                                    </strong>

                                    <span>
                                        Customers must upload a valid
                                        prescription before ordering
                                        this medicine.
                                    </span>

                                </div>

                            </label>

                        </section>


                        {/* =================================================
                            DESCRIPTION
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardTitle
                                }
                            >

                                <LocalPharmacyOutlinedIcon />

                                <div>

                                    <h2>
                                        Additional information
                                    </h2>

                                    <span>
                                        Information shown on the medicine
                                        details page
                                    </span>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.textareaGrid
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        placeholder="Describe this medicine..."
                                    />

                                </div>


                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Usage / directions
                                    </label>

                                    <textarea
                                        name="usage"
                                        value={
                                            form.usage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        placeholder="General usage information..."
                                    />

                                </div>


                                <div
                                    className={`${styles.formGroup} ${styles.fullWidth}`}
                                >

                                    <label>
                                        Warnings
                                    </label>

                                    <textarea
                                        name="warnings"
                                        value={
                                            form.warnings
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={3}
                                        placeholder="Important warnings or precautions..."
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            STATUS
                        ================================================== */}

                        <section
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.cardTitle
                                }
                            >

                                <CheckCircleRoundedIcon />

                                <div>

                                    <h2>
                                        Catalog status
                                    </h2>

                                    <span>
                                        Control visibility to customers
                                    </span>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.statusOptions
                                }
                            >

                                <label
                                    className={
                                        form.status ===
                                            "active"
                                            ? styles.statusOptionActive
                                            : styles.statusOption
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={
                                            form.status ===
                                            "active"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <div>

                                        <strong>
                                            Active
                                        </strong>

                                        <span>
                                            Visible and orderable
                                        </span>

                                    </div>

                                </label>


                                <label
                                    className={
                                        form.status ===
                                            "inactive"
                                            ? styles.statusOptionInactive
                                            : styles.statusOption
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={
                                            form.status ===
                                            "inactive"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <div>

                                        <strong>
                                            Inactive
                                        </strong>

                                        <span>
                                            Hidden from customers
                                        </span>

                                    </div>

                                </label>

                            </div>

                        </section>


                        {/* =================================================
                            ACTIONS
                        ================================================== */}

                        <div
                            className={
                                styles.formActions
                            }
                        >

                            <Link
                                href="/admin/medicines"
                                className={
                                    styles.cancelButton
                                }
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                className={
                                    styles.saveButton
                                }
                                disabled={
                                    saving
                                }
                            >

                                <SaveOutlinedIcon />

                                {saving
                                    ? "Creating..."
                                    : "Create Medicine"}

                            </button>

                        </div>

                    </form>

                </div>

            </main>


            <Footer />

        </>
    );
}

