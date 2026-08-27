import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import Loading from "@/components/Utility/Loading";
import GoogleMapsProvider from "@/components/Utility/GoogleMapsProvider";
import WhatsAppButton from "@/components/Utility/WhatsAppButton";
import AdminBottomNav from "@/components/Admin/AdminBottomNav";

import { containsAdmin } from "@/utility/helper";
import { setCategories } from "@/redux/categorySlice";
import { setPixel } from "@/redux/pixelSlice";
import { PIXEL_ID } from "@/config";

const Layout = ({ children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const loading = useSelector(state => state.state.loading);
    const notistack = useSelector(state => state.notistack.notistack);
    const fetchAgain = useSelector(state => state.category.fetchAgain);
    const userInfo = useSelector(state => state.user.userInfo);

    const fetchCategory = async () => {
        try {
            const { data } = await axios.get("/api/department/view");
            dispatch(setCategories(data));
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, [fetchAgain]);

    useEffect(() => {
        let ReactPixel;

        const initializePixel = async () => {
            try {
                if (!PIXEL_ID) {
                    console.warn("Facebook Pixel ID is missing.");
                    return;
                }

                const pixelModule = await import("react-facebook-pixel");
                ReactPixel = pixelModule.default;

                ReactPixel.init(
                    PIXEL_ID,
                    {},
                    {
                        autoConfig: false,
                        debug: false,
                    }
                );

                dispatch(setPixel(ReactPixel));
                ReactPixel.pageView();

            } catch (error) {
                console.error(
                    "Facebook Pixel initialization failed:",
                    error
                );
            }
        };

        initializePixel();

        const handleRouteChange = () => {
            ReactPixel?.pageView();
        };

        router.events.on(
            "routeChangeComplete",
            handleRouteChange
        );

        return () => {
            router.events.off(
                "routeChangeComplete",
                handleRouteChange
            );
        };

    }, [router.events, dispatch]);

    useEffect(() => {
        if (!notistack?.message) return;

        enqueueSnackbar(
            notistack.message,
            notistack.option || {}
        );
    }, [notistack, enqueueSnackbar]);

    const isAdminPage = containsAdmin(router.asPath);

    return (
        <GoogleMapsProvider>
            <div>
                {loading && <Loading />}

                {!isAdminPage && <Navbar />}

                {children}

                {!isAdminPage && <Footer />}

                {!isAdminPage && (
                    <WhatsAppButton includeLocation={true} />
                )}

                {userInfo?.role === "admin" && (
                    <AdminBottomNav />
                )}
            </div>
        </GoogleMapsProvider>
    );
};

export default Layout;