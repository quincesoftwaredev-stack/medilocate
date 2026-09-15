import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import Navbar from "@/components/home/Navbar";
import TopNavbar from "@/components/home/TopNavbar";
import Footer from "@/components/home/Footer";
import Loading from "@/components/Utility/Loading";
import GoogleMapsProvider from "@/components/Utility/GoogleMapsProvider";
import WhatsAppButton from "@/components/Utility/WhatsAppButton";
import AdminBottomNav from "@/components/Admin/AdminBottomNav";
import DoctorBottomNav from "@/components/Doctors/DoctorBottomNav";
import UserBottomNav from "@/components/User/UserBottomNav";

import { containsAdmin } from "@/utility/helper";
import { setCategories } from "@/redux/categorySlice";
import { setPixel, handleContact } from "@/redux/pixelSlice";
import { activatePixel, pausePixel } from "@/utility/pixel";
import { PIXEL_ID } from "@/config";
import { login } from "@/redux/userSlice";
import Cookies from "js-cookie";

const Layout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const loading = useSelector(state => state.state.loading);
  const notistack = useSelector(state => state.notistack.notistack);
  const fetchAgain = useSelector(state => state.category.fetchAgain);
  const storedUserInfo = useSelector(state => state.user.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;

  useEffect(() => {
    if (!storedUserInfo) {
      const saved = Cookies.get("userInfo");
      if (saved) {
        try {
          dispatch(login(JSON.parse(saved)));
        } catch {
          Cookies.remove("userInfo", { path: "/" });
        }
      }
    }
    setHydrated(true);
  }, [dispatch, storedUserInfo]);

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
  const isCarePage = /^\/(consultation|doctor)(\/|$)/.test(router.pathname);

  const content = (
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

        {!isAdminPage && <TopNavbar />}
        <Navbar />

        {children}

        {!isAdminPage && <Footer />}

        {!isAdminPage && !isCarePage && (
          <WhatsAppButton includeLocation={true} />
        )}

        {userInfo?.role === "admin" ? (
          <AdminBottomNav />
        ) : userInfo?.role === "doctor" ? (
          <DoctorBottomNav userInfo={userInfo} />
        ) : userInfo ? (
          <UserBottomNav userInfo={userInfo} />
        ) : null}
      </div>
  );
  const skipMaps = isCarePage || /^\/admin\/booking(\/|$)/.test(router.pathname) || /^\/user\/\[id\]\/dashboard$/.test(router.pathname);
  return skipMaps ? content : <GoogleMapsProvider>{content}</GoogleMapsProvider>;
};

export default Layout;
