import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addToCart, increaseQuantity, decreaseQuantity, removeFromCart } from "@/redux/cartSlice";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import LocalDrinkRoundedIcon from "@mui/icons-material/LocalDrinkRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import Logo from "@/components/Utility/Logo";

import styles from "./Navbar.module.css";


const getDosageFormMeta = (dosageForm = "") => {
    const value = String(dosageForm || "")
        .trim()
        .toLowerCase();

    if (
        value.includes("syrup") ||
        value.includes("suspension") ||
        value.includes("solution") ||
        value.includes("liquid") ||
        value.includes("elixir")
    ) {
        return {
            type: "liquid",
            icon: <LocalDrinkRoundedIcon />,
        };
    }

    if (value.includes("suppository")) {
        return {
            type: "suppository",
            icon: <SpaRoundedIcon />,
        };
    }

    if (value.includes("capsule")) {
        return {
            type: "capsule",
            icon: <MedicationRoundedIcon />,
        };
    }

    if (
        value.includes("tablet") ||
        value.includes("caplet")
    ) {
        return {
            type: "tablet",
            icon: <MedicationRoundedIcon />,
        };
    }

    if (
        value.includes("injection") ||
        value.includes("injectable")
    ) {
        return {
            type: "injection",
            icon: <VaccinesRoundedIcon />,
        };
    }

    if (value.includes("drop")) {
        return {
            type: "drops",
            icon: <OpacityRoundedIcon />,
        };
    }

    if (
        value.includes("inhaler") ||
        value.includes("inhalation") ||
        value.includes("respirator")
    ) {
        return {
            type: "inhaler",
            icon: <AirRoundedIcon />,
        };
    }

    if (
        value.includes("cream") ||
        value.includes("ointment") ||
        value.includes("gel") ||
        value.includes("lotion")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }

    if (
        value.includes("powder") ||
        value.includes("granule")
    ) {
        return {
            type: "powder",
            icon: <ScienceRoundedIcon />,
        };
    }

    return {
        type: "other",
        icon: <MedicationRoundedIcon />,
    };
};


export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [quantities, setQuantities] = useState({});
    const cartItems = useSelector((state) => state.cart?.items || []);
    const userInfo = useSelector((state) => state.user?.userInfo);
    const dispatch = useDispatch();
    const addMedicineToCart = (medicine) => dispatch(addToCart({ id: medicine._id, name: medicine.name, genericName: medicine.genericName, strength: medicine.strength, dosageForm: medicine.dosageForm, price: medicine.price, image: medicine.image, quantity: quantities[medicine._id] || 1 }));

    const closeMenu = () => {
        setMenuOpen(false);
    };

    useEffect(() => {
        if (!searchOpen || medicines.length) return;
        fetch("/data/medicines-catalog.json").then((response) => response.json()).then(setMedicines).catch(() => { });
    }, [searchOpen, medicines.length]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <>
            <header className={styles.navbar}>

                <div className={styles.container}>

                    <div className={styles.navbarInner}>

                        {/* Logo */}

                        <Link
                            href="/"
                            className={styles.logo}
                            onClick={closeMenu}
                            aria-label="MediLocate home"
                        >
                            <Logo />
                        </Link>


                        {/* Desktop / Tablet Navigation */}

                        <nav className={styles.navLinks}>

                            <Link
                                href="/doctors"
                                className={styles.doctorLink}
                            >
                                <MedicalServicesOutlinedIcon />
                                <span>Find a Doctor</span>
                            </Link>


                            <Link
                                href="/medicines"
                                className={styles.medicineLink}
                            >
                                <LocalPharmacyOutlinedIcon />
                                <span>Medicines</span>
                            </Link>


                            <Link
                                href="/prescription"
                                className={styles.prescriptionLink}
                            >
                                <ReceiptLongOutlinedIcon />
                                <span>Prescription</span>
                            </Link>


                            <Link
                                href="/track-order"
                                className={styles.trackLink}
                            >
                                <LocalShippingOutlinedIcon />
                                <span>Track Order</span>
                            </Link>


                            <Link
                                href="/how-it-works"
                                className={styles.howItWorksLink}
                            >
                                <span>How It Works</span>
                            </Link>

                        </nav>


                        {/* Desktop Actions */}

                        <div className={styles.navActions}>

                            <Link
                                href="/login"
                                className={styles.loginButton}
                            >
                                Login
                            </Link>


                            <Link
                                href="/register"
                                className={styles.ctaButton}
                            >
                                <span>
                                    Get Started
                                </span>

                                <ArrowForwardRoundedIcon />
                            </Link>

                        </div>


                        {/* Menu Button */}

                        <div className={styles.mobileActions}>
                            <button type="button" className={styles.mobileIconButton} aria-label="Search medicines" onClick={() => setSearchOpen(true)}>
                                <SearchOutlinedIcon />
                            </button>
                            <Link href="/cart" className={styles.mobileIconButton} aria-label="Open cart">
                                <ShoppingCartOutlinedIcon />
                                {cartItems.length > 0 && <span className={styles.cartBadge}>{cartItems.length}</span>}
                            </Link>
                        </div>

                        <button
                            type="button"
                            className={styles.menuButton}
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <MenuIcon />
                        </button>

                    </div>

                </div>

                {searchOpen && (
                    <div className={styles.searchPanel}>

                        <div className={styles.searchPanelHeader}>

                            <div className={styles.searchInputWrap}>

                                <SearchOutlinedIcon />

                                <input
                                    autoFocus
                                    value={searchText}
                                    onChange={(event) =>
                                        setSearchText(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search medicines by name or generic"
                                />

                            </div>


                            <button
                                type="button"
                                aria-label="Close medicine search"
                                onClick={() => {
                                    setSearchOpen(false);
                                    setSearchText("");
                                }}
                            >
                                <CloseIcon />
                            </button>

                        </div>


                        <div className={styles.searchResults}>

                            {medicines

                                .filter((medicine) => {

                                    const search =
                                        searchText
                                            .trim()
                                            .toLowerCase();

                                    if (!search) {
                                        return true;
                                    }

                                    const name =
                                        String(
                                            medicine.name || ""
                                        ).toLowerCase();

                                    const generic =
                                        String(
                                            medicine.genericName || ""
                                        ).toLowerCase();

                                    const dosageForm =
                                        String(
                                            medicine.dosageForm || ""
                                        ).toLowerCase();

                                    const strength =
                                        String(
                                            medicine.strength || ""
                                        ).toLowerCase();

                                    return (
                                        name.includes(search) ||
                                        generic.includes(search) ||
                                        dosageForm.includes(search) ||
                                        strength.includes(search)
                                    );

                                })

                                .sort((a, b) => {

                                    const search =
                                        searchText
                                            .trim()
                                            .toLowerCase();

                                    const getScore = (medicine) => {

                                        const name =
                                            String(
                                                medicine.name || ""
                                            ).toLowerCase();

                                        const generic =
                                            String(
                                                medicine.genericName || ""
                                            ).toLowerCase();

                                        if (name === search) {
                                            return 100;
                                        }

                                        if (
                                            name.startsWith(search)
                                        ) {
                                            return 80;
                                        }

                                        if (
                                            name.includes(search)
                                        ) {
                                            return 60;
                                        }

                                        if (
                                            generic.startsWith(search)
                                        ) {
                                            return 40;
                                        }

                                        if (
                                            generic.includes(search)
                                        ) {
                                            return 20;
                                        }

                                        return 0;
                                    };

                                    return (
                                        getScore(b) -
                                        getScore(a)
                                    );

                                })

                                .slice(0, 24)

                                .map((medicine) => {

                                    const dosageForm =
                                        String(
                                            medicine.dosageForm || ""
                                        );

                                    const dosageMeta =
                                        getDosageFormMeta(
                                            dosageForm
                                        );

                                    const dosageType =
                                        dosageMeta.type;

                                    /*
                                     * Keep image disabled for now,
                                     * as in your current code.
                                     * Restore these lines when ready:
                                     *
                                     * const image =
                                     *     medicine.image?.url ||
                                     *     medicine.image ||
                                     *     "";
                                     */
                                    const image = "";

                                    const quantity =
                                        quantities[
                                            medicine._id
                                        ] || 0;


                                    const handleAdd = () => {

                                        setQuantities(
                                            (current) => ({
                                                ...current,
                                                [medicine._id]: 1,
                                            })
                                        );

                                        addMedicineToCart(
                                            medicine
                                        );

                                    };


                                    const handleIncrease = () => {

                                        const next =
                                            quantity + 1;

                                        setQuantities(
                                            (current) => ({
                                                ...current,
                                                [medicine._id]: next,
                                            })
                                        );

                                        dispatch(
                                            increaseQuantity(
                                                medicine._id
                                            )
                                        );

                                    };


                                    const handleDecrease = () => {

                                        const next =
                                            Math.max(
                                                0,
                                                quantity - 1
                                            );

                                        setQuantities(
                                            (current) => ({
                                                ...current,
                                                [medicine._id]: next,
                                            })
                                        );

                                        if (next === 0) {

                                            dispatch(
                                                removeFromCart(
                                                    medicine._id
                                                )
                                            );

                                            return;
                                        }

                                        dispatch(
                                            decreaseQuantity(
                                                medicine._id
                                            )
                                        );

                                    };


                                    return (

                                        <div
                                            className={
                                                styles.searchResult
                                            }
                                            key={
                                                medicine._id
                                            }
                                        >


                                            {/* =============================================
                                                MEDICINE LINK
                                            ============================================== */}

                                            <Link
                                                href={
                                                    `/medicines/${medicine._id}`
                                                }
                                                onClick={() =>
                                                    setSearchOpen(false)
                                                }
                                                className={
                                                    styles.searchResultLink
                                                }
                                            >


                                                {/* =========================================
                                                    IMAGE / DOSAGE PLACEHOLDER
                                                ========================================== */}

                                                <span
                                                    className={
                                                        `${styles.searchResultImage} ${
                                                            styles[
                                                                `searchResultImage_${dosageType}`
                                                            ]
                                                        }`
                                                    }
                                                >

                                                    {image ? (

                                                        <img
                                                            src={image}
                                                            alt={
                                                                medicine.name ||
                                                                "Medicine"
                                                            }
                                                        />

                                                    ) : (

                                                        <span
                                                            className={
                                                                styles.searchResultPlaceholder
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    styles.searchResultPlaceholderIcon
                                                                }
                                                            >
                                                                {
                                                                    dosageMeta.icon
                                                                }
                                                            </span>

                                                            <small
                                                                className={
                                                                    styles.searchResultPlaceholderText
                                                                }
                                                            >
                                                                {
                                                                    dosageForm ||
                                                                    "Medicine"
                                                                }
                                                            </small>

                                                        </span>

                                                    )}

                                                </span>


                                                {/* =========================================
                                                    INFORMATION
                                                ========================================== */}

                                                <span
                                                    className={
                                                        styles.searchResultInfo
                                                    }
                                                >

                                                    <strong
                                                        className={
                                                            styles.searchResultName
                                                        }
                                                    >
                                                        {
                                                            medicine.name
                                                        }
                                                    </strong>


                                                    {/* DOSAGE + STRENGTH */}

                                                    <span
                                                        className={
                                                            styles.searchResultVariant
                                                        }
                                                    >

                                                        {dosageForm && (

                                                            <span
                                                                className={
                                                                    `${styles.searchDosageBadge} ${
                                                                        styles[
                                                                            `searchDosage_${dosageType}`
                                                                        ]
                                                                    }`
                                                                }
                                                            >

                                                                <span
                                                                    className={
                                                                        styles.searchDosageIcon
                                                                    }
                                                                >
                                                                    {
                                                                        dosageMeta.icon
                                                                    }
                                                                </span>

                                                                <span>
                                                                    {
                                                                        dosageForm
                                                                    }
                                                                </span>

                                                            </span>

                                                        )}


                                                        {medicine.strength && (

                                                            <strong
                                                                className={
                                                                    styles.searchStrength
                                                                }
                                                            >
                                                                {
                                                                    medicine.strength
                                                                }
                                                            </strong>

                                                        )}

                                                    </span>


                                                    {/* GENERIC */}

                                                    <small
                                                        className={
                                                            styles.searchResultGeneric
                                                        }
                                                    >
                                                        {
                                                            medicine.genericName ||
                                                            "Medicine"
                                                        }
                                                    </small>


                                                    {/* PACK */}

                                                    {medicine.packSize && (

                                                        <span
                                                            className={
                                                                styles.searchResultPack
                                                            }
                                                        >
                                                            {
                                                                medicine.packSize
                                                            }
                                                        </span>

                                                    )}


                                                    {/* PRICE */}

                                                    <b
                                                        className={
                                                            styles.searchResultPrice
                                                        }
                                                    >
                                                        ৳
                                                        {
                                                            Number(
                                                                medicine.price || 0
                                                            ).toFixed(2)
                                                        }
                                                    </b>

                                                </span>

                                            </Link>


                                            {/* =============================================
                                                ADD FIRST → THEN QUANTITY COUNTER
                                            ============================================== */}

                                            {quantity === 0 ? (

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.searchAddButton
                                                    }
                                                    aria-label={
                                                        `Add ${medicine.name} to cart`
                                                    }
                                                    onClick={
                                                        handleAdd
                                                    }
                                                >

                                                    <ShoppingCartOutlinedIcon />

                                                    <span>
                                                        Add
                                                    </span>

                                                </button>

                                            ) : (

                                                <div
                                                    className={
                                                        styles.quantityControls
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            `Decrease ${medicine.name}`
                                                        }
                                                        onClick={
                                                            handleDecrease
                                                        }
                                                    >
                                                        −
                                                    </button>


                                                    <b>
                                                        {
                                                            quantity
                                                        }
                                                    </b>


                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            `Increase ${medicine.name}`
                                                        }
                                                        onClick={
                                                            handleIncrease
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    );

                                })}

                        </div>

                    </div>
                )}

            </header>


            {/* =========================================================
                MENU OVERLAY
            ========================================================== */}

            <div
                className={`${styles.menuOverlay} ${menuOpen
                    ? styles.menuOverlayOpen
                    : ""
                    }`}
                onClick={closeMenu}
            >

                <aside
                    className={`${styles.menuPanel} ${menuOpen
                        ? styles.menuPanelOpen
                        : ""
                        }`}
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    <div className={styles.menuHeader}>
                        <Link href="/" className={styles.menuLogo} onClick={closeMenu} aria-label="MediLocate home"><Logo /></Link>

                        <button
                            type="button"
                            onClick={closeMenu}
                            aria-label="Close navigation menu"
                        >
                            <CloseIcon />
                        </button>

                    </div>

                    {userInfo && (
                        <Link href={`/profile/${userInfo.id}`} className={styles.menuUser} onClick={closeMenu}>
                            <AccountCircleOutlinedIcon />
                            <span><strong>{userInfo.name || userInfo.fullName || "Your account"}</strong><small>{userInfo.email || userInfo.phone || userInfo.role || "View profile"}</small></span>
                        </Link>
                    )}


                    <nav className={styles.mobileLinks}>

                        <Link
                            href="/doctors"
                            onClick={closeMenu}
                        >
                            <MedicalServicesOutlinedIcon />

                            <span>
                                Find a Doctor
                            </span>
                        </Link>


                        <Link
                            href="/medicines"
                            onClick={closeMenu}
                        >
                            <LocalPharmacyOutlinedIcon />

                            <span>
                                Medicines
                            </span>
                        </Link>


                        <Link
                            href="/prescription"
                            onClick={closeMenu}
                        >
                            <ReceiptLongOutlinedIcon />

                            <span>
                                Upload Prescription
                            </span>
                        </Link>


                        <Link
                            href="/track-order"
                            onClick={closeMenu}
                        >
                            <LocalShippingOutlinedIcon />

                            <span>
                                Track Order
                            </span>
                        </Link>


                        <Link
                            href="/how-it-works"
                            onClick={closeMenu}
                        >
                            <HelpOutlineOutlinedIcon />

                            <span>
                                How It Works
                            </span>
                        </Link>

                    </nav>


                    <div className={styles.menuBottom}>

                        {userInfo ? (
                            <Link href={`/profile/${userInfo.id}`} className={styles.menuCta} onClick={closeMenu}>View Profile</Link>
                        ) : (<>
                            <Link href="/login" className={styles.menuLogin} onClick={closeMenu}><LoginOutlinedIcon /><span>Login</span></Link>
                            <Link href="/register" className={styles.menuCta} onClick={closeMenu}>Get Started</Link>
                        </>)}

                    </div>

                </aside>

            </div>
        </>
    );
}
