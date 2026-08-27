import { createSlice } from "@reduxjs/toolkit";


/*
|--------------------------------------------------------------------------
| LOCAL STORAGE KEY
|--------------------------------------------------------------------------
*/

const CART_STORAGE_KEY =
    "medilocate-cart";


/*
|--------------------------------------------------------------------------
| LOAD CART FROM LOCAL STORAGE
|--------------------------------------------------------------------------
*/

const getInitialCart = () => {

    if (
        typeof window ===
        "undefined"
    ) {

        return {

            items: [],

            prescription: null,

        };

    }


    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (savedCart) {

            return JSON.parse(
                savedCart
            );

        }

    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

    }


    return {

        items: [],

        prescription: null,

    };

};


/*
|--------------------------------------------------------------------------
| SAVE CART
|--------------------------------------------------------------------------
*/

const saveCart = (cart) => {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    try {

        localStorage.setItem(

            CART_STORAGE_KEY,

            JSON.stringify(cart)

        );

    } catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

};


/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState =
    getInitialCart();


/*
|--------------------------------------------------------------------------
| CART SLICE
|--------------------------------------------------------------------------
*/

const cartSlice = createSlice({

    name: "cart",

    initialState,

    reducers: {

        /*
        |--------------------------------------------------------------------------
        | ADD ITEM
        |--------------------------------------------------------------------------
        */

        addToCart: (
            state,
            action
        ) => {

            const medicine =
                action.payload;


            const existingItem =
                state.items.find(
                    (item) =>
                        item.id ===
                        medicine.id
                );


            if (existingItem) {

                existingItem.quantity +=
                    medicine.quantity || 1;

            } else {

                state.items.push({

                    ...medicine,

                    quantity:
                        medicine.quantity || 1,

                });

            }


            saveCart(state);

        },


        /*
        |--------------------------------------------------------------------------
        | REMOVE ITEM
        |--------------------------------------------------------------------------
        */

        removeFromCart: (
            state,
            action
        ) => {

            state.items =
                state.items.filter(
                    (item) =>
                        item.id !==
                        action.payload
                );


            saveCart(state);

        },


        /*
        |--------------------------------------------------------------------------
        | INCREASE QUANTITY
        |--------------------------------------------------------------------------
        */

        increaseQuantity: (
            state,
            action
        ) => {

            const item =
                state.items.find(
                    (item) =>
                        item.id ===
                        action.payload
                );


            if (item) {

                item.quantity += 1;

            }


            saveCart(state);

        },


        /*
        |--------------------------------------------------------------------------
        | DECREASE QUANTITY
        |--------------------------------------------------------------------------
        */

        decreaseQuantity: (
            state,
            action
        ) => {

            const item =
                state.items.find(
                    (item) =>
                        item.id ===
                        action.payload
                );


            if (!item) {

                return;

            }


            if (item.quantity > 1) {

                item.quantity -= 1;

            } else {

                state.items =
                    state.items.filter(
                        (cartItem) =>
                            cartItem.id !==
                            action.payload
                    );

            }


            saveCart(state);

        },


        /*
        |--------------------------------------------------------------------------
        | CLEAR CART
        |--------------------------------------------------------------------------
        */

        clearCart: (
            state
        ) => {

            state.items = [];

            state.prescription = null;


            /*
             * Completely remove
             * cart from localStorage.
             */

            if (
                typeof window !==
                "undefined"
            ) {

                localStorage.removeItem(
                    CART_STORAGE_KEY
                );

            }

        },


        /*
        |--------------------------------------------------------------------------
        | SET PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        setPrescription: (
            state,
            action
        ) => {

            state.prescription =
                action.payload;


            saveCart(state);

        },


        /*
        |--------------------------------------------------------------------------
        | REMOVE PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        removePrescription: (
            state
        ) => {

            state.prescription =
                null;


            saveCart(state);

        },

    },

});


export const {

    addToCart,

    removeFromCart,

    increaseQuantity,

    decreaseQuantity,

    clearCart,

    setPrescription,

    removePrescription,

} = cartSlice.actions;


export default cartSlice.reducer;