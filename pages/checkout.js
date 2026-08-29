import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";



import styles from "@/styles/Checkout.module.css";

import axios from "axios";

import {
    clearCart,
} from "@/redux/cartSlice";


/*
|--------------------------------------------------------------------------
| LOCAL STORAGE KEY
|--------------------------------------------------------------------------
*/

const SAVED_ADDRESS_KEY =
    "medilocate_saved_address";


/*
|--------------------------------------------------------------------------
| PAYMENT METHODS
|--------------------------------------------------------------------------
*/

const paymentMethods = [

    {
        id: "cod",

        title: "Cash on Delivery",

        description:
            "Pay when your medicine is delivered.",

        icon: PaymentsOutlinedIcon,
    },

    {
        id: "online",

        title: "Online Payment",

        description:
            "Pay securely using supported online payment methods.",

        icon: CreditCardOutlinedIcon,
    },

];


export default function CheckoutPage() {

    const router =
        useRouter();


    const dispatch =
        useDispatch();


    /*
    |--------------------------------------------------------------------------
    | CART
    |--------------------------------------------------------------------------
    */

    const cartItems =
        useSelector(
            (state) =>
                state.cart?.items || []
        );


    /*
    |--------------------------------------------------------------------------
    | PRESCRIPTION
    |--------------------------------------------------------------------------
    */

    const prescription =
        useSelector(
            (state) =>
                state.cart?.prescription
        );

    const userInfo = useSelector(
        (state) => state.user?.userInfo
    );

    const accountId = userInfo?.id || userInfo?._id;


    /*
    |--------------------------------------------------------------------------
    | LOCAL STORAGE / ADDRESS STATE
    |--------------------------------------------------------------------------
    */

    const [savedAddress, setSavedAddress] =
        useState(null);


    const [addressLoaded, setAddressLoaded] =
        useState(false);


    const [selectedAddress, setSelectedAddress] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | FORM STATE
    |--------------------------------------------------------------------------
    */

    const [patientName, setPatientName] =
        useState("");


    const [phone, setPhone] =
        useState("");


    const [address, setAddress] =
        useState("");


    const [city, setCity] =
        useState("Rangpur");


    const [paymentMethod, setPaymentMethod] =
        useState("cod");


    const [notes, setNotes] =
        useState("");


    const [placingOrder, setPlacingOrder] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOAD SAVED ADDRESS
    |--------------------------------------------------------------------------
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

                    setSavedAddress(
                        parsedAddress
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | Automatically select saved address
                    |--------------------------------------------------------------------------
                    */

                    setSelectedAddress(
                        "saved"
                    );


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
    | CALCULATIONS
    |--------------------------------------------------------------------------
    */

    const subtotal =
        cartItems.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                ),
            0
        );


    const deliveryFee =
        subtotal >= 500
            ? 0
            : 50;


    const total =
        subtotal +
        deliveryFee;


    const totalItems =
        cartItems.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const hasPrescriptionRequiredItem =
        cartItems.some(
            (item) =>
                item.prescriptionRequired
        );


    /*
    |--------------------------------------------------------------------------
    | SELECT SAVED ADDRESS
    |--------------------------------------------------------------------------
    */

    const handleSavedAddressSelect = () => {

        if (!savedAddress) {
            return;
        }


        setSelectedAddress(
            "saved"
        );


        setPatientName(
            savedAddress.name ||
            ""
        );


        setPhone(
            savedAddress.phone ||
            ""
        );


        setAddress(
            savedAddress.address ||
            ""
        );


        setCity(
            savedAddress.city ||
            "Rangpur"
        );

    };


    /*
    |--------------------------------------------------------------------------
    | USE DIFFERENT ADDRESS
    |--------------------------------------------------------------------------
    */

    const handleUseDifferentAddress = () => {

        setSelectedAddress(
            ""
        );


        setPatientName(
            ""
        );


        setPhone(
            ""
        );


        setAddress(
            ""
        );


        setCity(
            "Rangpur"
        );

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE ADDRESS
    |--------------------------------------------------------------------------
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
                city.trim(),

        };


        try {

            localStorage.setItem(

                SAVED_ADDRESS_KEY,

                JSON.stringify(
                    newAddress
                )

            );


            setSavedAddress(
                newAddress
            );


            setSelectedAddress(
                "saved"
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

    const validateCheckout = () => {

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


        if (!city.trim()) {

            alert(
                "Please enter the city."
            );

            return false;

        }


        if (!cartItems.length) {

            alert(
                "Your cart is empty."
            );

            return false;

        }


        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | PLACE ORDER
    |--------------------------------------------------------------------------
    */

    const handlePlaceOrder = async () => {

        if (
            !validateCheckout()
        ) {

            return;

        }


        try {

            setPlacingOrder(
                true
            );


            /*
            |--------------------------------------------------------------------------
            | SAVE ADDRESS
            |--------------------------------------------------------------------------
            |
            | Any manually entered address becomes the
            | saved address for the next checkout.
            |
            */

            saveAddressToLocalStorage();


            /*
            |--------------------------------------------------------------------------
            | ORDER DATA
            |--------------------------------------------------------------------------
            */

            const orderData = {

                items:
                    cartItems.map(
                        (item) => ({

                            medicine:
                                item.id,

                            quantity:
                                item.quantity,

                        })
                    ),


                delivery: {

                    name:
                        patientName.trim(),

                    phone:
                        phone.trim(),

                    address:
                        address.trim(),

                    city:
                        city.trim(),

                },


                paymentMethod,


                notes:
                    notes.trim() || "",


                prescription:
                    prescription?._id ||
                    prescription?.id ||
                    null,

            };


            /*
            |--------------------------------------------------------------------------
            | CREATE ORDER
            |--------------------------------------------------------------------------
            */

            const response =
                await axios.post(
                    "/api/orders",
                    orderData
                );


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            const order =
                response.data?.order;


            if (!order) {

                throw new Error(
                    "Invalid order response."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | CLEAR CART
            |--------------------------------------------------------------------------
            */

            dispatch(
                clearCart()
            );


            /*
            |--------------------------------------------------------------------------
            | GO TO ORDER TRACKING
            |--------------------------------------------------------------------------
            |
            | Prefer tracking number when available.
            |
            */

            router.push(

                `/orders/${
                    order.trackingNumber ||
                    order.id
                }`

            );

        } catch (error) {

            console.error(
                "Order creation failed:",
                error
            );


            const message =
                error.response?.data?.message ||
                "Unable to place your order. Please try again.";


            alert(
                message
            );

        } finally {

            setPlacingOrder(
                false
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | WAIT FOR LOCAL STORAGE
    |--------------------------------------------------------------------------
    */

    if (!addressLoaded) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | EMPTY CART
    |--------------------------------------------------------------------------
    */

    if (!cartItems.length) {

        return (

            <>

                <Head>

                    <title>
                        Checkout | MediLocate
                    </title>

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

                        <div
                            className={
                                styles.emptyCheckout
                            }
                        >

                            <ShoppingBagOutlinedIcon />

                            <h1>
                                Your cart is empty
                            </h1>

                            <p>
                                Add some medicines before
                                continuing to checkout.
                            </p>


                            <Link
                                href="/medicines"
                                className={
                                    styles.primaryButton
                                }
                            >

                                Browse Medicines

                                <ArrowForwardRoundedIcon />

                            </Link>

                        </div>

                    </div>

                </main>



            </>

        );

    }


    return (

        <>

            <Head>

                <title>
                    Checkout | MediLocate
                </title>


                <meta
                    name="description"
                    content="Complete your MediLocate medicine order."
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

                        <Link href="/cart">

                            <ArrowBackRoundedIcon />

                            Cart

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            Checkout
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
                                SECURE CHECKOUT
                            </span>

                            <h1>
                                Complete your order
                            </h1>

                            <p>
                                Confirm your delivery information
                                and payment method before placing
                                your medicine order.
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
                            LEFT
                        ================================================== */}

                        <div
                            className={
                                styles.mainColumn
                            }
                        >


                            {/* =============================================
                                DELIVERY ADDRESS
                            ============================================== */}

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

                                        <LocationOnOutlinedIcon />

                                        <div>

                                            <h2>
                                                Delivery information
                                            </h2>

                                            <span>
                                                Where should we
                                                deliver your medicines?
                                            </span>

                                        </div>

                                    </div>


                                    <Link
                                        href={accountId ? `/user/${accountId}/address` : "/login?redirectTo=/checkout"}
                                        className={
                                            styles.manageLink
                                        }
                                    >

                                        Manage addresses

                                    </Link>

                                </div>


                                {/* =========================================
                                    SAVED ADDRESS
                                ========================================== */}

                                {savedAddress && (

                                    <div
                                        className={
                                            styles.addressList
                                        }
                                    >

                                        <button
                                            type="button"
                                            onClick={
                                                handleSavedAddressSelect
                                            }
                                            className={
                                                selectedAddress ===
                                                    "saved"
                                                    ? styles.addressCardActive
                                                    : styles.addressCard
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.addressRadio
                                                }
                                            >

                                                {selectedAddress ===
                                                    "saved" && (

                                                    <span />

                                                )}

                                            </div>


                                            <div
                                                className={
                                                    styles.addressCardContent
                                                }
                                            >

                                                <strong>
                                                    {savedAddress.label ||
                                                        "Saved address"}
                                                </strong>

                                                <span>

                                                    {
                                                        savedAddress.name
                                                    }

                                                    {" • "}

                                                    {
                                                        savedAddress.phone
                                                    }

                                                </span>


                                                <p>

                                                    {
                                                        savedAddress.address
                                                    }

                                                    {", "}

                                                    {
                                                        savedAddress.city
                                                    }

                                                </p>

                                            </div>

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                styles.addAddressButton
                                            }
                                            onClick={
                                                handleUseDifferentAddress
                                            }
                                        >

                                            <AddRoundedIcon />

                                            Use a different address

                                        </button>

                                    </div>

                                )}


                                {/* =========================================
                                    ADDRESS FORM
                                ========================================== */}

                                {!savedAddress ||
                                    !selectedAddress ? (

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
                                                    value={
                                                        patientName
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setPatientName(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Enter patient name"
                                                />

                                            </div>

                                        </div>


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
                                                    value={
                                                        phone
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setPhone(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="01XXXXXXXXX"
                                                />

                                            </div>

                                        </div>


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
                                                    value={
                                                        address
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setAddress(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="House, road, area"
                                                />

                                            </div>

                                        </div>


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
                                                    value={
                                                        city
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setCity(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="City"
                                                />

                                            </div>

                                        </div>

                                    </div>

                                ) : null}

                            </section>


                            {/* =============================================
                                PRESCRIPTION
                            ============================================== */}

                            {hasPrescriptionRequiredItem && (

                                <section
                                    className={
                                        styles.prescriptionRequired
                                    }
                                >

                                    <div
                                        className={
                                            styles.prescriptionIcon
                                        }
                                    >

                                        <DescriptionOutlinedIcon />

                                    </div>


                                    <div
                                        className={
                                            styles.prescriptionContent
                                        }
                                    >

                                        <span>
                                            PRESCRIPTION REQUIRED
                                        </span>


                                        <h2>
                                            One or more items require
                                            a prescription
                                        </h2>


                                        <p>
                                            Please upload a valid
                                            prescription before placing
                                            this order.
                                        </p>


                                        {prescription ? (

                                            <div
                                                className={
                                                    styles.prescriptionUploaded
                                                }
                                            >

                                                <CheckCircleRoundedIcon />

                                                <div>

                                                    <strong>
                                                        Prescription
                                                        attached
                                                    </strong>

                                                    <span>

                                                        {
                                                            prescription
                                                                .files
                                                                ?.length ||
                                                            1
                                                        }

                                                        {" "}
                                                        file(s)
                                                        uploaded

                                                    </span>

                                                </div>


                                                <Link
                                                    href="/prescription"
                                                >

                                                    Change

                                                </Link>

                                            </div>

                                        ) : (

                                            <Link
                                                href="/prescription"
                                                className={
                                                    styles.uploadPrescription
                                                }
                                            >

                                                <CloudUploadOutlinedIcon />

                                                Upload Prescription

                                                <ArrowForwardRoundedIcon />

                                            </Link>

                                        )}

                                    </div>

                                </section>

                            )}


                            {/* =============================================
                                PAYMENT
                            ============================================== */}

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

                                        <PaymentsOutlinedIcon />

                                        <div>

                                            <h2>
                                                Payment method
                                            </h2>

                                            <span>
                                                Choose how you&apos;d like
                                                to pay.
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.paymentList
                                    }
                                >

                                    {paymentMethods.map(
                                        (method) => {

                                            const Icon =
                                                method.icon;


                                            return (

                                                <button
                                                    type="button"
                                                    key={
                                                        method.id
                                                    }
                                                    onClick={() =>
                                                        setPaymentMethod(
                                                            method.id
                                                        )
                                                    }
                                                    className={
                                                        paymentMethod ===
                                                            method.id
                                                            ? styles.paymentCardActive
                                                            : styles.paymentCard
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.paymentIcon
                                                        }
                                                    >

                                                        <Icon />

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.paymentContent
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                method.title
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                method.description
                                                            }
                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.paymentRadio
                                                        }
                                                    >

                                                        {paymentMethod ===
                                                            method.id && (

                                                            <span />

                                                        )}

                                                    </div>

                                                </button>

                                            );

                                        }
                                    )}

                                </div>


                                {paymentMethod ===
                                    "cod" && (

                                    <div
                                        className={
                                            styles.paymentNote
                                        }
                                    >

                                        <InfoOutlinedIcon />

                                        <span>
                                            Please keep the exact
                                            amount ready when your
                                            medicine arrives.
                                        </span>

                                    </div>

                                )}

                            </section>


                            {/* =============================================
                                NOTES
                            ============================================== */}

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

                                        <EditOutlinedIcon />

                                        <div>

                                            <h2>
                                                Additional instructions
                                            </h2>

                                            <span>
                                                Optional
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <textarea
                                    className={
                                        styles.notes
                                    }
                                    rows={4}
                                    value={
                                        notes
                                    }
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Any note for the pharmacy or delivery person..."
                                />

                            </section>

                        </div>


                        {/* =================================================
                            RIGHT — SUMMARY
                        ================================================== */}

                        <aside
                            className={
                                styles.summaryCard
                            }
                        >

                            <div
                                className={
                                    styles.summaryHeader
                                }
                            >

                                <div>

                                    <span>
                                        YOUR ORDER
                                    </span>

                                    <h2>
                                        Order summary
                                    </h2>

                                </div>


                                <strong>

                                    {totalItems}

                                    {" "}

                                    {
                                        totalItems === 1
                                            ? "item"
                                            : "items"
                                    }

                                </strong>

                            </div>


                            {/* =========================================
                                ITEMS
                            ========================================== */}

                            <div
                                className={
                                    styles.itemList
                                }
                            >

                                {cartItems.map(
                                    (item) => (

                                        <div
                                            key={
                                                item.id
                                            }
                                            className={
                                                styles.item
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.itemImage
                                                }
                                            >

                                                {item.image ? (

                                                    <img
                                                        src={
                                                            item.image
                                                        }
                                                        alt=""
                                                    />

                                                ) : (

                                                    <DescriptionOutlinedIcon />

                                                )}

                                            </div>


                                            <div
                                                className={
                                                    styles.itemInfo
                                                }
                                            >

                                                <strong>
                                                    {
                                                        item.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        item.genericName
                                                    }
                                                </span>

                                                <small>
                                                    ×
                                                    {
                                                        item.quantity
                                                    }
                                                </small>

                                            </div>


                                            <strong
                                                className={
                                                    styles.itemPrice
                                                }
                                            >

                                                ৳
                                                {
                                                    Number(
                                                        item.price || 0
                                                    ) *
                                                    Number(
                                                        item.quantity || 0
                                                    )
                                                }

                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* =========================================
                                TOTALS
                            ========================================== */}

                            <div
                                className={
                                    styles.totalRows
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

                                        {
                                            deliveryFee ===
                                                0
                                                ? "FREE"
                                                : `৳${deliveryFee}`
                                        }

                                    </strong>

                                </div>

                            </div>


                            {deliveryFee > 0 &&
                                subtotal < 500 && (

                                    <div
                                        className={
                                            styles.freeDelivery
                                        }
                                    >

                                        Add ৳
                                        {500 - subtotal}
                                        {" "}
                                        more to get free delivery.

                                    </div>

                                )}


                            <div
                                className={
                                    styles.grandTotal
                                }
                            >

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ৳{total}
                                </strong>

                            </div>


                            {/* =========================================
                                DELIVERY
                            ========================================== */}

                            <div
                                className={
                                    styles.deliverySummary
                                }
                            >

                                <div
                                    className={
                                        styles.deliverySummaryIcon
                                    }
                                >

                                    <LocalShippingOutlinedIcon />

                                </div>


                                <div>

                                    <strong>
                                        Fast local delivery
                                    </strong>

                                    <span>
                                        Available in selected
                                        service areas.
                                    </span>

                                </div>

                            </div>


                            {/* =========================================
                                PLACE ORDER
                            ========================================== */}

                            <button
                                type="button"
                                className={
                                    styles.placeOrderButton
                                }
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    placingOrder
                                }
                            >

                                <CheckCircleRoundedIcon />

                                {
                                    placingOrder
                                        ? "Placing order..."
                                        : "Place Order"
                                }


                                {!placingOrder && (

                                    <ArrowForwardRoundedIcon />

                                )}

                            </button>


                            <p
                                className={
                                    styles.secureText
                                }
                            >

                                By placing this order, you agree
                                to MediLocate&apos;s order and delivery
                                terms.

                            </p>


                            <Link
                                href="/cart"
                                className={
                                    styles.backCart
                                }
                            >

                                <ArrowBackRoundedIcon />

                                Back to cart

                            </Link>

                        </aside>

                    </div>

                </div>

            </main>


        </>

    );

}
