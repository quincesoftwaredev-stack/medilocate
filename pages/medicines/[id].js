import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import ArrowBackRoundedIcon
    from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddRoundedIcon
    from "@mui/icons-material/AddRounded";

import RemoveRoundedIcon
    from "@mui/icons-material/RemoveRounded";

import ShoppingCartOutlinedIcon
    from "@mui/icons-material/ShoppingCartOutlined";

import CloudUploadOutlinedIcon
    from "@mui/icons-material/CloudUploadOutlined";

import LocalShippingOutlinedIcon
    from "@mui/icons-material/LocalShippingOutlined";

import VerifiedOutlinedIcon
    from "@mui/icons-material/VerifiedOutlined";

import DescriptionOutlinedIcon
    from "@mui/icons-material/DescriptionOutlined";

import InfoOutlinedIcon
    from "@mui/icons-material/InfoOutlined";


import styles
    from "@/styles/Medicines/MedicineDetails.module.css";

import { useDispatch } from "react-redux";

import {
    addToCart as addToCartAction,
} from "@/redux/cartSlice";

import axios from "axios";
import BASE_URL from "@/config";


/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| MEDICINE DETAILS PAGE
|--------------------------------------------------------------------------
*/

export default function MedicineDetailsPage({
    medicine
}) {

    const dispatch =
        useDispatch();

    const router =
        useRouter();


    /*
    |--------------------------------------------------------------------------
    | QUANTITY
    |--------------------------------------------------------------------------
    */

    const [
        quantity,
        setQuantity
    ] = useState(1);


    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!medicine) {

        return (
            <>

                <Head>

                    <title>
                        Medicine Not Found | MediLocate
                    </title>

                </Head>


                <main
                    className={
                        styles.notFound
                    }
                >

                    <InfoOutlinedIcon />

                    <h1>
                        Medicine not found
                    </h1>

                    <p>
                        The medicine you're looking for
                        could not be found.
                    </p>

                    <Link
                        href="/medicines"
                    >
                        Browse Medicines
                    </Link>

                </main>


            </>
        );

    }


    /*
    |--------------------------------------------------------------------------
    | QUANTITY
    |--------------------------------------------------------------------------
    */

    const increaseQuantity = () => {

        setQuantity(
            previous =>
                previous + 1
        );

    };


    const decreaseQuantity = () => {

        setQuantity(
            previous =>
                Math.max(
                    1,
                    previous - 1
                )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CART
    |--------------------------------------------------------------------------
    */

    const addToCart = () => {

        dispatch(

            addToCartAction({

                id:
                    medicine._id,

                name:
                    medicine.name,

                genericName:
                    medicine.genericName,

                strength:
                    medicine.strength,

                dosageForm:
                    medicine.dosageForm,

                manufacturer:
                    medicine.manufacturer,

                price:
                    medicine.price,

                packSize:
                    medicine.packSize,

                image:
                    medicine.image?.url || "",

                prescriptionRequired:
                    medicine.prescriptionRequired,

            })

        );


        router.push(
            "/cart"
        );

    };


    /*
    |--------------------------------------------------------------------------
    | TOTAL PRICE
    |--------------------------------------------------------------------------
    */

    const totalPrice =
        Number(medicine.price || 0) *
        quantity;


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    const medicineImage =
        medicine.image?.url || "";


    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    const description =
        medicine.description ||
        `${medicine.name} ${medicine.strength || ""} - ${medicine.genericName}.`;


    /*
    |--------------------------------------------------------------------------
    | USES
    |--------------------------------------------------------------------------
    */

    const uses =
        Array.isArray(
            medicine.usage
        )
            ? medicine.usage
            : medicine.usage
                ? [
                    medicine.usage
                ]
                : [];


    /*
    |--------------------------------------------------------------------------
    | PACK SIZE
    |--------------------------------------------------------------------------
    */

    const packSize =
        medicine.packSize ||
        "Available pack";


    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    const inStock =
        Number(
            medicine.stock || 0
        ) > 0;


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>

            <Head>

                <title>
                    {medicine.name}
                    {" "}
                    {medicine.strength}
                    {" | MediLocate"}
                </title>


                <meta
                    name="description"
                    content={
                        `${medicine.name} ${medicine.strength || ""} - ${medicine.genericName}. Order medicine online with MediLocate.`
                    }
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


                    {/* =================================================
                        BREADCRUMB
                    ================================================== */}

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


                        <span>
                            {medicine.name}
                        </span>

                    </div>


                    {/* =================================================
                        MAIN PRODUCT
                    ================================================== */}

                    <section
                        className={
                            styles.productSection
                        }
                    >


                        {/* =================================================
                            IMAGE
                        ================================================== */}

                        <div
                            className={
                                styles.productVisual
                            }
                        >

                            <div
                                className={
                                    styles.imageBox
                                }
                            >

                                {medicineImage ? (

                                    <img
                                        src={
                                            medicineImage
                                        }
                                        alt={
                                            medicine.name
                                        }
                                    />

                                ) : (

                                    <div
                                        className={
                                            styles.imagePlaceholder
                                        }
                                    >
                                        {
                                            medicine.name
                                                ?.charAt(0)
                                                ?.toUpperCase()
                                        }
                                    </div>

                                )}

                            </div>


                            {medicine.category && (

                                <span
                                    className={
                                        styles.categoryTag
                                    }
                                >
                                    {
                                        medicine.category
                                    }
                                </span>

                            )}

                        </div>


                        {/* =================================================
                            INFORMATION
                        ================================================== */}

                        <div
                            className={
                                styles.productInfo
                            }
                        >

                            <div
                                className={
                                    styles.productHeader
                                }
                            >

                                <div>

                                    <span
                                        className={
                                            styles.genericName
                                        }
                                    >
                                        {
                                            medicine.genericName
                                        }
                                    </span>


                                    <h1>
                                        {
                                            medicine.name
                                        }
                                    </h1>


                                    <p
                                        className={
                                            styles.strength
                                        }
                                    >

                                        {
                                            medicine.strength
                                        }

                                        {" • "}

                                        {
                                            medicine.dosageForm
                                        }

                                    </p>

                                </div>


                                {inStock ? (

                                    <span
                                        className={
                                            styles.inStock
                                        }
                                    >
                                        In stock
                                    </span>

                                ) : (

                                    <span
                                        className={
                                            styles.outOfStock
                                        }
                                    >
                                        Out of stock
                                    </span>

                                )}

                            </div>


                            {/* =================================================
                                MANUFACTURER
                            ================================================== */}

                            <div
                                className={
                                    styles.manufacturer
                                }
                            >

                                <span>
                                    Manufacturer
                                </span>


                                <strong>
                                    {
                                        medicine.manufacturer ||
                                        "Not specified"
                                    }
                                </strong>

                            </div>


                            {/* =================================================
                                PRICE
                            ================================================== */}

                            <div
                                className={
                                    styles.priceSection
                                }
                            >

                                <div
                                    className={
                                        styles.price
                                    }
                                >

                                    <strong>
                                        ৳
                                        {
                                            Number(
                                                medicine.price || 0
                                            ).toFixed(2)
                                        }
                                    </strong>

                                </div>


                                <span>
                                    per {packSize}
                                </span>

                            </div>


                            {/* =================================================
                                PRESCRIPTION NOTICE
                            ================================================== */}

                            {medicine.prescriptionRequired && (

                                <div
                                    className={
                                        styles.prescriptionNotice
                                    }
                                >

                                    <div>

                                        <DescriptionOutlinedIcon />

                                    </div>


                                    <section>

                                        <strong>
                                            Prescription required
                                        </strong>

                                        <p>
                                            A valid prescription may
                                            be required before this
                                            medicine can be delivered.
                                        </p>

                                    </section>

                                </div>

                            )}


                            {/* =================================================
                                DESCRIPTION
                            ================================================== */}

                            {medicine.description && (

                                <div
                                    className={
                                        styles.description
                                    }
                                >

                                    <h2>
                                        About this medicine
                                    </h2>

                                    <p>
                                        {
                                            medicine.description
                                        }
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                QUANTITY + CART
                            ================================================== */}

                            <div
                                className={
                                    styles.orderArea
                                }
                            >

                                <div
                                    className={
                                        styles.quantity
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <= 1
                                        }
                                        aria-label="Decrease quantity"
                                    >

                                        <RemoveRoundedIcon />

                                    </button>


                                    <strong>
                                        {quantity}
                                    </strong>


                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        aria-label="Increase quantity"
                                    >

                                        <AddRoundedIcon />

                                    </button>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        addToCart
                                    }
                                    disabled={
                                        !inStock
                                    }
                                    className={
                                        styles.addToCart
                                    }
                                >

                                    <ShoppingCartOutlinedIcon />

                                    Add to Cart

                                    <span>
                                        ৳
                                        {
                                            totalPrice.toFixed(2)
                                        }
                                    </span>

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        DELIVERY / TRUST
                    ================================================== */}

                    <section
                        className={
                            styles.serviceGrid
                        }
                    >

                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >
                                <LocalShippingOutlinedIcon />
                            </div>


                            <div>

                                <strong>
                                    Fast local delivery
                                </strong>

                                <p>
                                    Get your medicines delivered
                                    quickly within our service area.
                                </p>

                            </div>

                        </div>


                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >
                                <VerifiedOutlinedIcon />
                            </div>


                            <div>

                                <strong>
                                    Genuine medicines
                                </strong>

                                <p>
                                    Medicines are sourced through
                                    verified pharmacy partners.
                                </p>

                            </div>

                        </div>


                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >
                                <CloudUploadOutlinedIcon />
                            </div>


                            <div>

                                <strong>
                                    Have a prescription?
                                </strong>

                                <p>
                                    Upload your prescription and
                                    we'll help prepare your order.
                                </p>


                                <Link
                                    href="/prescription"
                                >

                                    Upload prescription

                                    <ArrowForwardRoundedIcon />

                                </Link>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        DETAILS
                    ================================================== */}

                    <section
                        className={
                            styles.detailsSection
                        }
                    >

                        <div
                            className={
                                styles.detailsHeader
                            }
                        >

                            <span>
                                MEDICINE INFORMATION
                            </span>

                            <h2>
                                Product details
                            </h2>

                        </div>


                        <div
                            className={
                                styles.detailsGrid
                            }
                        >

                            <div>

                                <span>
                                    Generic name
                                </span>

                                <strong>
                                    {
                                        medicine.genericName
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Strength
                                </span>

                                <strong>
                                    {
                                        medicine.strength ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Dosage form
                                </span>

                                <strong>
                                    {
                                        medicine.dosageForm ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Pack size
                                </span>

                                <strong>
                                    {
                                        packSize
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Manufacturer
                                </span>

                                <strong>
                                    {
                                        medicine.manufacturer ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {
                                        medicine.category ||
                                        "Other"
                                    }
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        USES
                    ================================================== */}

                    {uses.length > 0 && (

                        <section
                            className={
                                styles.usesSection
                            }
                        >

                            <div>

                                <span>
                                    COMMON USES
                                </span>

                                <h2>
                                    What is it used for?
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.usesList
                                }
                            >

                                {uses.map(
                                    (
                                        use,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                index
                                            }
                                            className={
                                                styles.useItem
                                            }
                                        >

                                            <VerifiedOutlinedIcon />

                                            <span>
                                                {
                                                    use
                                                }
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        WARNINGS
                    ================================================== */}

                    {medicine.warnings && (

                        <section
                            className={
                                styles.description
                            }
                        >

                            <h2>
                                Warnings
                            </h2>

                            <p>
                                {
                                    medicine.warnings
                                }
                            </p>

                        </section>

                    )}


                    {/* =================================================
                        MEDICAL DISCLAIMER
                    ================================================== */}

                    <div
                        className={
                            styles.disclaimer
                        }
                    >

                        <InfoOutlinedIcon />

                        <p>
                            Medicine information is provided for
                            general reference only. Always follow
                            the instructions of your doctor or
                            pharmacist and check the medicine
                            packaging before use.
                        </p>

                    </div>

                </div>

            </main>



        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA FETCHING
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    const {
        params,
        req
    } = context;


    const id =
        params?.id;


    /*
    |--------------------------------------------------------------------------
    | INVALID ID
    |--------------------------------------------------------------------------
    */

    if (!id) {

        return {

            notFound:
                true

        };

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | FORWARD COOKIES
        |--------------------------------------------------------------------------
        |
        | Useful if your API later requires authentication.
        |
        */

        const cookies =
            req.headers.cookie || "";


        /*
        |--------------------------------------------------------------------------
        | FETCH MEDICINE
        |--------------------------------------------------------------------------
        */

        const response =
            await axios.get(

                `${BASE_URL}/api/medicines/${id}`,

                {

                    headers: {

                        Cookie:
                            cookies

                    }

                }

            );


        const medicine =
            response.data?.medicine ||
            response.data;


        /*
        |--------------------------------------------------------------------------
        | MEDICINE NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (!medicine) {

            return {

                notFound:
                    true

            };

        }


        /*
        |--------------------------------------------------------------------------
        | RETURN PROPS
        |--------------------------------------------------------------------------
        */

        return {

            props: {

                medicine:
                    JSON.parse(
                        JSON.stringify(
                            medicine
                        )
                    )

            }

        };


    } catch (error) {

        console.log(
            "Medicine details SSR error:",
            error?.response?.data ||
            error.message
        );


        /*
        |--------------------------------------------------------------------------
        | 404
        |--------------------------------------------------------------------------
        */

        if (
            error?.response?.status === 404
        ) {

            return {

                notFound:
                    true

            };

        }


        /*
        |--------------------------------------------------------------------------
        | OTHER SERVER ERROR
        |--------------------------------------------------------------------------
        */

        return {

            notFound:
                true

        };

    }

}
