import Head from "next/head";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
} from "@/redux/cartSlice";

import styles from "@/styles/cart/Cart.module.css";


export default function CartPage() {

    const dispatch = useDispatch();


    const items =
        useSelector(
            (state) =>
                state.cart?.items || []
        );


    const prescription =
        useSelector(
            (state) =>
                state.cart?.prescription
        );


    /*
    |--------------------------------------------------------------------------
    | CALCULATIONS
    |--------------------------------------------------------------------------
    */

    const totalItems =
        items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    const subtotal =
        items.reduce(
            (total, item) =>
                total +
                item.price *
                item.quantity,
            0
        );


    /*
     * Delivery charge will eventually
     * come from your backend based on:
     *
     * - patient location
     * - delivery radius
     * - pharmacy
     * - order value
     *
     */

    const deliveryCharge =
        subtotal > 500
            ? 0
            : 50;


    const total =
        subtotal +
        deliveryCharge;


    /*
    |--------------------------------------------------------------------------
    | EMPTY CART
    |--------------------------------------------------------------------------
    */

    if (items.length === 0) {

        return (
            <>
                <Head>

                    <title>
                        Your Cart | MediLocate
                    </title>

                </Head>


                <Navbar />


                <main className={styles.page}>

                    <div className={styles.container}>

                        <div className={styles.emptyCart}>

                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >

                                <ShoppingCartOutlinedIcon />

                            </div>


                            <h1>
                                Your cart is empty
                            </h1>


                            <p>
                                Add medicines to your cart
                                and they'll appear here.
                            </p>


                            <Link
                                href="/medicines"
                                className={
                                    styles.browseButton
                                }
                            >

                                Browse Medicines

                                <ArrowForwardRoundedIcon />

                            </Link>

                        </div>

                    </div>

                </main>


                <Footer />

            </>
        );

    }


    return (
        <>
            <Head>

                <title>
                    Your Cart | MediLocate
                </title>

                <meta
                    name="description"
                    content="Review your medicines, upload a prescription and continue to checkout with MediLocate."
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =================================================
                        BREADCRUMB
                    ================================================== */}

                    <div className={styles.breadcrumb}>

                        <Link href="/medicines">

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Cart
                        </strong>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span>
                                YOUR ORDER
                            </span>

                            <h1>
                                Your medicine cart
                            </h1>

                            <p>
                                {totalItems}{" "}
                                {totalItems === 1
                                    ? "item"
                                    : "items"}{" "}
                                ready for checkout.
                            </p>

                        </div>


                        <Link
                            href="/medicines"
                            className={
                                styles.continueShopping
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Continue shopping

                        </Link>

                    </header>


                    {/* =================================================
                        MAIN GRID
                    ================================================== */}

                    <div className={styles.cartLayout}>


                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className={styles.cartMain}>


                            {/* =============================================
                                ITEMS
                            ============================================== */}

                            <section
                                className={
                                    styles.itemsCard
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div>

                                        <h2>
                                            Medicines
                                        </h2>

                                        <span>
                                            {totalItems}{" "}
                                            items
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.items
                                    }
                                >

                                    {items.map(
                                        (item) => (

                                            <article
                                                key={
                                                    item.id
                                                }
                                                className={
                                                    styles.cartItem
                                                }
                                            >

                                                {/* IMAGE */}

                                                <Link
                                                    href={`/medicines/${item.id}`}
                                                    className={
                                                        styles.itemImage
                                                    }
                                                >

                                                    {item.image ? (

                                                        <img
                                                            src={
                                                                item.image
                                                            }
                                                            alt={
                                                                item.name
                                                            }
                                                        />

                                                    ) : (

                                                        <span>
                                                            {
                                                                item.name?.charAt(
                                                                    0
                                                                )
                                                            }
                                                        </span>

                                                    )}

                                                </Link>


                                                {/* INFO */}

                                                <div
                                                    className={
                                                        styles.itemInfo
                                                    }
                                                >

                                                    <Link
                                                        href={`/medicines/${item.id}`}
                                                        className={
                                                            styles.itemName
                                                        }
                                                    >

                                                        {
                                                            item.name
                                                        }

                                                    </Link>


                                                    <span
                                                        className={
                                                            styles.itemGeneric
                                                        }
                                                    >
                                                        {
                                                            item.genericName
                                                        }
                                                    </span>


                                                    <span
                                                        className={
                                                            styles.itemStrength
                                                        }
                                                    >
                                                        {
                                                            item.strength
                                                        }
                                                    </span>


                                                    {item.prescriptionRequired && (

                                                        <span
                                                            className={
                                                                styles.rxBadge
                                                            }
                                                        >
                                                            Prescription
                                                            required
                                                        </span>

                                                    )}

                                                </div>


                                                {/* QUANTITY */}

                                                <div
                                                    className={
                                                        styles.quantity
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            dispatch(
                                                                decreaseQuantity(
                                                                    item.id
                                                                )
                                                            )
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >

                                                        <RemoveRoundedIcon />

                                                    </button>


                                                    <strong>
                                                        {
                                                            item.quantity
                                                        }
                                                    </strong>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            dispatch(
                                                                increaseQuantity(
                                                                    item.id
                                                                )
                                                            )
                                                        }
                                                        aria-label="Increase quantity"
                                                    >

                                                        <AddRoundedIcon />

                                                    </button>

                                                </div>


                                                {/* PRICE */}

                                                <div
                                                    className={
                                                        styles.itemPrice
                                                    }
                                                >

                                                    <strong>
                                                        ৳
                                                        {
                                                            (
                                                                item.price *
                                                                item.quantity
                                                            ).toFixed(
                                                                0
                                                            )
                                                        }
                                                    </strong>


                                                    <span>
                                                        ৳
                                                        {
                                                            item.price
                                                        }{" "}
                                                        each
                                                    </span>

                                                </div>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.deleteButton
                                                    }
                                                    onClick={() =>
                                                        dispatch(
                                                            removeFromCart(
                                                                item.id
                                                            )
                                                        )
                                                    }
                                                    aria-label={`Remove ${item.name}`}
                                                >

                                                    <DeleteOutlineRoundedIcon />

                                                </button>

                                            </article>

                                        )
                                    )}

                                </div>

                            </section>


                            {/* =================================================
                                PRESCRIPTION
                            ================================================== */}

                            <section
                                className={
                                    styles.prescriptionCard
                                }
                            >

                                <div
                                    className={
                                        styles.prescriptionIcon
                                    }
                                >

                                    <CloudUploadOutlinedIcon />

                                </div>


                                <div
                                    className={
                                        styles.prescriptionContent
                                    }
                                >

                                    <div>

                                        <span>
                                            PRESCRIPTION
                                        </span>

                                        <h2>
                                            Do you have a prescription?
                                        </h2>

                                        <p>
                                            Upload your complete
                                            prescription and we'll
                                            help match it with your
                                            medicine order.
                                        </p>

                                    </div>


                                    {prescription ? (

                                        <Link
                                            href="/medicines/prescription"
                                            className={
                                                styles.uploadedPrescription
                                            }
                                        >

                                            <VerifiedOutlinedIcon />

                                            Prescription uploaded

                                            <ArrowForwardRoundedIcon />

                                        </Link>

                                    ) : (

                                        <Link
                                            href="/medicines/prescription"
                                            className={
                                                styles.uploadPrescription
                                            }
                                        >

                                            <CloudUploadOutlinedIcon />

                                            Upload prescription

                                            <ArrowForwardRoundedIcon />

                                        </Link>

                                    )}

                                </div>

                            </section>


                            {/* =================================================
                                DELIVERY INFO
                            ================================================== */}

                            <div
                                className={
                                    styles.deliveryInfo
                                }
                            >

                                <div>

                                    <LocalShippingOutlinedIcon />

                                    <span>
                                        Fast local delivery
                                    </span>

                                </div>


                                <div>

                                    <VerifiedOutlinedIcon />

                                    <span>
                                        Genuine medicines
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================== */}

                        <aside
                            className={
                                styles.summaryCard
                            }
                        >

                            <h2>
                                Order summary
                            </h2>


                            <div
                                className={
                                    styles.summaryRows
                                }
                            >

                                <div>

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        ৳{subtotal}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Delivery
                                    </span>

                                    <strong>

                                        {deliveryCharge === 0
                                            ? "FREE"
                                            : `৳${deliveryCharge}`}

                                    </strong>

                                </div>

                            </div>


                            {deliveryCharge > 0 && (

                                <div
                                    className={
                                        styles.freeDeliveryHint
                                    }
                                >

                                    Add ৳
                                    {500 - subtotal}
                                    {" "}
                                    more to get free
                                    delivery.

                                </div>

                            )}


                            <div
                                className={
                                    styles.totalRow
                                }
                            >

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ৳{total}
                                </strong>

                            </div>


                            <Link
                                href="/checkout"
                                className={
                                    styles.checkoutButton
                                }
                            >

                                Proceed to Checkout

                                <ArrowForwardRoundedIcon />

                            </Link>


                            <div
                                className={
                                    styles.secureNote
                                }
                            >

                                <VerifiedOutlinedIcon />

                                <span>
                                    Secure checkout
                                </span>

                            </div>

                        </aside>

                    </div>

                </div>

            </main>


            <Footer />

        </>
    );
}