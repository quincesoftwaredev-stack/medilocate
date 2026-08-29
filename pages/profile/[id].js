import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Profile/Profile.module.css";


/*
|--------------------------------------------------------------------------
| TEMPORARY USER DATA
|--------------------------------------------------------------------------
| Later this will come from the logged-in user's API/session.
*/

const user = {
    name: "Sohan Ahmed",
    phone: "01712345678",
    email: "sohan@example.com",
    gender: "Male",
    dateOfBirth: "12 March 2001",
    address: "Dhap, Rangpur",

    avatar: null,
};


/*
|--------------------------------------------------------------------------
| TEMPORARY ACCOUNT STATS
|--------------------------------------------------------------------------
*/

const accountStats = {
    totalOrders: 12,
    activeOrders: 1,
    prescriptionRequests: 4,
    savedAddresses: 2,
};


/*
|--------------------------------------------------------------------------
| RECENT ORDERS
|--------------------------------------------------------------------------
*/

const recentOrders = [
    {
        id: "1",
        code: "ML-O-20451",
        date: "26 Aug 2026",
        items: 3,
        total: 189,
        status: "out_for_delivery",
    },

    {
        id: "2",
        code: "ML-O-20442",
        date: "23 Aug 2026",
        items: 2,
        total: 310,
        status: "delivered",
    },

    {
        id: "3",
        code: "ML-O-20431",
        date: "20 Aug 2026",
        items: 4,
        total: 465,
        status: "delivered",
    },
];


/*
|--------------------------------------------------------------------------
| STATUS META
|--------------------------------------------------------------------------
*/

const getOrderStatus = (status) => {

    switch (status) {

        case "out_for_delivery":
            return {
                label: "Out for delivery",
                className: "outForDelivery",
                icon: LocalShippingOutlinedIcon,
            };

        case "delivered":
            return {
                label: "Delivered",
                className: "delivered",
                icon: CheckCircleRoundedIcon,
            };

        case "pending":
            return {
                label: "Pending",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

        default:
            return {
                label: status,
                className: "pending",
                icon: PendingOutlinedIcon,
            };

    }

};


export default function ProfilePage() {

    const router = useRouter();
    const profileId = router.query.id;

    return (
        <>
            <Head>

                <title>
                    My Profile | MediLocate
                </title>

                <meta
                    name="description"
                    content="Manage your MediLocate profile, medicine orders and prescription requests."
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.pageHeader}>

                        <div>

                            <span className={styles.eyebrow}>
                                MY ACCOUNT
                            </span>

                            <h1>
                                Welcome back,
                                <span>
                                    {" "}
                                    {user.name.split(" ")[0]}.
                                </span>
                            </h1>

                            <p>
                                Manage your profile, orders,
                                prescriptions and delivery information.
                            </p>

                        </div>

                    </header>


                    {/* =====================================================
                        PROFILE HERO
                    ====================================================== */}

                    <section className={styles.profileCard}>

                        <div className={styles.profileMain}>


                            {/* AVATAR */}

                            <div className={styles.avatar}>

                                {user.avatar ? (

                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                    />

                                ) : (

                                    <span>
                                        {user.name.charAt(0)}
                                    </span>

                                )}

                            </div>


                            {/* INFORMATION */}

                            <div className={styles.profileInfo}>

                                <div
                                    className={
                                        styles.profileNameRow
                                    }
                                >

                                    <div>

                                        <h2>
                                            {user.name}
                                        </h2>

                                        <span>
                                            MediLocate Patient
                                        </span>

                                    </div>


                                    <Link
                                        href={`/profile/update/${profileId}`}
                                        className={
                                            styles.editButton
                                        }
                                    >

                                        <EditOutlinedIcon />

                                        Edit Profile

                                    </Link>

                                </div>


                                <div
                                    className={
                                        styles.profileMeta
                                    }
                                >

                                    <div>

                                        <PhoneOutlinedIcon />

                                        <span>
                                            {user.phone}
                                        </span>

                                    </div>


                                    <div>

                                        <EmailOutlinedIcon />

                                        <span>
                                            {user.email}
                                        </span>

                                    </div>


                                    <div>

                                        <LocationOnOutlinedIcon />

                                        <span>
                                            {user.address}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        STATS
                    ====================================================== */}

                    <section className={styles.statsGrid}>

                        <Link
                            href="/orders"
                            className={styles.statCard}
                        >

                            <div
                                className={
                                    styles.statIcon
                                }
                            >

                                <ShoppingBagOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Total Orders
                                </span>

                                <strong>
                                    {
                                        accountStats.totalOrders
                                    }
                                </strong>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </Link>


                        <Link
                            href="/orders?status=active"
                            className={styles.statCard}
                        >

                            <div
                                className={`${styles.statIcon} ${styles.activeIcon}`}
                            >

                                <LocalShippingOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Active Orders
                                </span>

                                <strong>
                                    {
                                        accountStats.activeOrders
                                    }
                                </strong>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </Link>


                        <Link
                            href="/prescription"
                            className={styles.statCard}
                        >

                            <div
                                className={`${styles.statIcon} ${styles.prescriptionIcon}`}
                            >

                                <DescriptionOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Prescription Requests
                                </span>

                                <strong>
                                    {
                                        accountStats.prescriptionRequests
                                    }
                                </strong>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </Link>


                        <Link
                            href={`/user/${profileId}/address`}
                            className={styles.statCard}
                        >

                            <div
                                className={`${styles.statIcon} ${styles.addressIcon}`}
                            >

                                <LocationOnOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Saved Addresses
                                </span>

                                <strong>
                                    {
                                        accountStats.savedAddresses
                                    }
                                </strong>

                            </div>


                            <ArrowForwardRoundedIcon />

                        </Link>

                    </section>


                    {/* =====================================================
                        ACCOUNT CONTENT
                    ====================================================== */}

                    <div className={styles.contentGrid}>


                        {/* =================================================
                            LEFT COLUMN
                        ================================================== */}

                        <div className={styles.mainColumn}>


                            {/* =============================================
                                MY ORDERS
                            ============================================== */}

                            <section className={styles.card}>

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div>

                                        <span>
                                            MEDICINE DELIVERY
                                        </span>

                                        <h2>
                                            Recent orders
                                        </h2>

                                    </div>


                                    <Link
                                        href="/orders"
                                        className={
                                            styles.viewAll
                                        }
                                    >

                                        View all

                                        <ArrowForwardRoundedIcon />

                                    </Link>

                                </div>


                                <div
                                    className={
                                        styles.orderList
                                    }
                                >

                                    {recentOrders.map(
                                        (order) => {

                                            const meta =
                                                getOrderStatus(
                                                    order.status
                                                );

                                            const StatusIcon =
                                                meta.icon;


                                            return (

                                                <Link
                                                    key={
                                                        order.id
                                                    }
                                                    href={`/orders/${order.id}`}
                                                    className={
                                                        styles.orderItem
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.orderIcon
                                                        }
                                                    >

                                                        <ShoppingBagOutlinedIcon />

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.orderInfo
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                order.code
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                order.date
                                                            }
                                                            {" • "}
                                                            {
                                                                order.items
                                                            }
                                                            {" "}
                                                            medicines
                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.orderAmount
                                                        }
                                                    >

                                                        <strong>
                                                            ৳
                                                            {
                                                                order.total
                                                            }
                                                        </strong>

                                                        <span
                                                            className={`${styles.orderStatus} ${styles[meta.className]}`}
                                                        >

                                                            <StatusIcon />

                                                            {
                                                                meta.label
                                                            }

                                                        </span>

                                                    </div>


                                                    <ArrowForwardRoundedIcon
                                                        className={
                                                            styles.orderArrow
                                                        }
                                                    />

                                                </Link>

                                            );

                                        }
                                    )}

                                </div>

                            </section>


                            {/* =============================================
                                PRESCRIPTION CTA
                            ============================================== */}

                            <section
                                className={
                                    styles.prescriptionCard
                                }
                            >

                                <div
                                    className={
                                        styles.prescriptionVisual
                                    }
                                >

                                    <MedicalServicesOutlinedIcon />

                                </div>


                                <div
                                    className={
                                        styles.prescriptionContent
                                    }
                                >

                                    <span>
                                        NEED MEDICINES?
                                    </span>

                                    <h2>
                                        Have a prescription?
                                    </h2>

                                    <p>
                                        Upload your prescription
                                        and let our pharmacy team
                                        prepare your medicine order.
                                    </p>


                                    <Link
                                        href="/prescription"
                                        className={
                                            styles.prescriptionButton
                                        }
                                    >

                                        Upload Prescription

                                        <ArrowForwardRoundedIcon />

                                    </Link>

                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            RIGHT COLUMN
                        ================================================== */}

                        <aside className={styles.sidebar}>


                            {/* =============================================
                                PERSONAL INFORMATION
                            ============================================== */}

                            <section className={styles.card}>

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div>

                                        <span>
                                            ACCOUNT
                                        </span>

                                        <h2>
                                            Personal information
                                        </h2>

                                    </div>


                                    <Link
                                        href={`/profile/update/${profileId}`}
                                        className={
                                            styles.iconEdit
                                        }
                                        aria-label="Edit profile"
                                    >

                                        <EditOutlinedIcon />

                                    </Link>

                                </div>


                                <div
                                    className={
                                        styles.personalInfo
                                    }
                                >

                                    <div>

                                        <span>
                                            Full name
                                        </span>

                                        <strong>
                                            {user.name}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone number
                                        </span>

                                        <strong>
                                            {user.phone}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {user.email}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Gender
                                        </span>

                                        <strong>
                                            {user.gender}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Date of birth
                                        </span>

                                        <strong>
                                            {user.dateOfBirth}
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                ACCOUNT MENU
                            ============================================== */}

                            <section className={styles.card}>

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div>

                                        <span>
                                            MANAGE
                                        </span>

                                        <h2>
                                            Account
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.accountMenu
                                    }
                                >

                                    <Link
                                        href="/orders"
                                    >

                                        <div
                                            className={
                                                styles.menuIcon
                                            }
                                        >

                                            <ShoppingBagOutlinedIcon />

                                        </div>


                                        <div>

                                            <strong>
                                                My Orders
                                            </strong>

                                            <span>
                                                Track and view all orders
                                            </span>

                                        </div>


                                        <ArrowForwardRoundedIcon />

                                    </Link>


                                    <Link
                                        href="/prescription"
                                    >

                                        <div
                                            className={
                                                styles.menuIcon
                                            }
                                        >

                                            <DescriptionOutlinedIcon />

                                        </div>


                                        <div>

                                            <strong>
                                                Prescription Requests
                                            </strong>

                                            <span>
                                                View submitted prescriptions
                                            </span>

                                        </div>


                                        <ArrowForwardRoundedIcon />

                                    </Link>


                                    <Link
                                        href={`/user/${profileId}/address`}
                                    >

                                        <div
                                            className={
                                                styles.menuIcon
                                            }
                                        >

                                            <LocationOnOutlinedIcon />

                                        </div>


                                        <div>

                                            <strong>
                                                Delivery Addresses
                                            </strong>

                                            <span>
                                                Manage saved addresses
                                            </span>

                                        </div>


                                        <ArrowForwardRoundedIcon />

                                    </Link>


                                    <Link
                                        href={`/profile/update/${profileId}`}
                                    >

                                        <div
                                            className={
                                                styles.menuIcon
                                            }
                                        >

                                            <SettingsOutlinedIcon />

                                        </div>


                                        <div>

                                            <strong>
                                                Account Settings
                                            </strong>

                                            <span>
                                                Password and preferences
                                            </span>

                                        </div>


                                        <ArrowForwardRoundedIcon />

                                    </Link>

                                </div>

                            </section>


                            {/* =============================================
                                LOGOUT
                            ============================================== */}

                            <button
                                type="button"
                                className={
                                    styles.logoutButton
                                }
                            >

                                <LogoutOutlinedIcon />

                                Sign out

                            </button>

                        </aside>

                    </div>

                </div>

            </main>


            <Footer />

        </>
    );
}
