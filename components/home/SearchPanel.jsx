import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, increaseQuantity, decreaseQuantity, removeFromCart } from "@/redux/cartSlice";
import CloseIcon from "@mui/icons-material/Close";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import LocalDrinkRoundedIcon from "@mui/icons-material/LocalDrinkRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import styles from "./SearchPanel.module.css";

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


export default function SearchPanel({ isOpen, onClose }) {
    const [searchText, setSearchText] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [quantities, setQuantities] = useState({});
    const dispatch = useDispatch();
    const addMedicineToCart = (medicine) => dispatch(addToCart({ id: medicine._id, name: medicine.name, genericName: medicine.genericName, strength: medicine.strength, dosageForm: medicine.dosageForm, price: medicine.price, image: medicine.image, quantity: quantities[medicine._id] || 1 }));

    useEffect(() => {
        if (!isOpen || medicines.length) return;
        fetch("/data/medicines-catalog.json").then((response) => response.json()).then(setMedicines).catch(() => { });
    }, [isOpen, medicines.length]);

    if (!isOpen) return null;

    return (
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
                        onClose();
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

                        const packSize =
                            String(
                                medicine.packSize || ""
                            ).toLowerCase();

                        return (
                            name.includes(search) ||
                            generic.includes(search) ||
                            dosageForm.includes(search) ||
                            strength.includes(search) ||
                            packSize.includes(search)
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
                                        onClose()
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
    );
}
