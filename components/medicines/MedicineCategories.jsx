import styles from "./MedicineCategories.module.css";


export default function MedicineCategories({
    categories = [],
    selectedCategory,
    onCategoryChange,
}) {

    if (!categories.length) {
        return null;
    }


    return (

        <div
            className={
                styles.wrapper
            }
        >

            <div
                className={
                    styles.categories
                }
            >

                {categories.map(
                    (category) => (

                        <button
                            key={
                                category
                            }
                            type="button"
                            onClick={() =>
                                onCategoryChange(
                                    category
                                )
                            }
                            className={

                                selectedCategory ===
                                    category

                                    ? styles.active

                                    : styles.category

                            }
                        >

                            {category}

                        </button>

                    )
                )}

            </div>

        </div>

    );
}