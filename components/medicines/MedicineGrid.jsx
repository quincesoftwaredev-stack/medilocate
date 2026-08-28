import SearchIcon from "@mui/icons-material/Search";

import MedicineCard from "./MedicineCard";

import styles from "./MedicineGrid.module.css";


export default function MedicineGrid({
    medicines = [],
    getCartQuantity,
    onAdd,
    onIncrease,
    onDecrease,
    onClearFilters,
}) {

    if (!medicines.length) {

        return (

            <div
                className={
                    styles.empty
                }
            >

                <div
                    className={
                        styles.emptyIcon
                    }
                >
                    <SearchIcon />
                </div>


                <h3>
                    No medicines found
                </h3>


                <p>
                    Try searching with another
                    medicine or generic name.
                </p>


                <button
                    type="button"
                    onClick={
                        onClearFilters
                    }
                >
                    Clear filters
                </button>

            </div>

        );
    }


    return (

        <div
            className={
                styles.grid
            }
        >

            {medicines.map(
                (medicine) => (

                    <MedicineCard
                        key={
                            medicine._id
                        }
                        medicine={
                            medicine
                        }
                        quantity={
                            getCartQuantity(
                                medicine._id
                            )
                        }
                        onAdd={
                            onAdd
                        }
                        onIncrease={
                            onIncrease
                        }
                        onDecrease={
                            onDecrease
                        }
                    />

                )
            )}

        </div>

    );
}