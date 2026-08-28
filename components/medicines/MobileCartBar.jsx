import Link from "next/link";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import styles from "./MobileCartBar.module.css";


export default function MobileCartBar({
    cartCount = 0,
}) {

    if (
        !cartCount ||
        cartCount <= 0
    ) {
        return null;
    }


    return (

        <div
            className={
                styles.bar
            }
        >

            <div
                className={
                    styles.info
                }
            >

                <span>
                    {cartCount}
                    {" "}
                    {cartCount === 1
                        ? "item"
                        : "items"}
                </span>


                <strong>
                    Ready in your cart
                </strong>

            </div>


            <Link
                href="/cart"
                className={
                    styles.viewCart
                }
            >

                <ShoppingCartOutlinedIcon />

                <span>
                    View Cart
                </span>

                <ArrowForwardRoundedIcon />

            </Link>

        </div>

    );
}