import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Loading from "@/components/Utility/Loading";
import GoogleMapsProvider from "@/components/Utility/GoogleMapsProvider";
import WhatsAppButton from "@/components/Utility/WhatsAppButton";
import AdminBottomNav from "@/components/Admin/AdminBottomNav";

import { containsAdmin } from "@/utility/helper";
import { setCategories } from "@/redux/categorySlice";
import { setPixel, handleContact } from "@/redux/pixelSlice";
import { activatePixel, pausePixel } from "@/utility/pixel";
import { PIXEL_ID } from "@/config";

const Layout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const loading = useSelector(state => state.state.loading);
  const notistack = useSelector(state => state.notistack.notistack);
  const fetchAgain = useSelector(state => state.category.fetchAgain);
  const userInfo = useSelector(state => state.user.userInfo);



  useEffect(() => {
    let active = true;
    let navigation = 0;
    const handleStart = () => {
      navigation += 1;
      pausePixel();
      dispatch(setPixel(null));
    };
    const handleComplete = async (url) => {
      const current = ++navigation;
      const ready = await activatePixel(url, PIXEL_ID);
      if (active && current === navigation) dispatch(setPixel(ready));
    };
    const handleError = () => handleComplete(window.location.href);
    handleComplete(window.location.href);
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);
    return () => {
      active = false;
      pausePixel();
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
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
    <GoogleMapsProvider>/
      <div onClickCapture={(event) => {
        const link = event.target.closest?.("a[href]");
        if (!link) return;
        const url = new URL(link.href, window.location.origin);
        if (["tel:", "mailto:", "whatsapp:"].includes(url.protocol) ||
            ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) {
          dispatch(handleContact());
        }
      }}>
        {loading && <Loading />}

        <Navbar />

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