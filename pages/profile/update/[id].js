import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { startLoading, finishLoading } from "@/redux/stateSlice";
import { showSnackBar } from "@/redux/notistackSlice";
import styles from "@/styles/User/Consultations.module.css";

export default function UpdateProfile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const storedUserInfo = useSelector((state) => state.user?.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", gender: "", image: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ownId = String(userInfo?._id || userInfo?.id || "");

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!router.isReady || !ownId || String(router.query.id) !== ownId || !userInfo?.token) return;
    axios.get(`/api/user/${ownId}`, { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setForm({
        fullName: data.fullName || "", phone: data.phone || "",
        email: data.email || "", gender: data.gender || "", image: data.image || "",
      }))
      .catch((requestError) => setError(requestError.response?.data?.error || "Profile could not be loaded."));
  }, [router.isReady, router.query.id, ownId, userInfo?.token]);

  const save = async (event) => {
    event.preventDefault();
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    setSaving(true);
    dispatch(startLoading());
    try {
      await axios.put(`/api/user/${ownId}`, form, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      dispatch(showSnackBar({ message: "Profile updated.", option: { variant: "success" } }));
      router.push(`/profile/${ownId}`);
    } catch (requestError) {
      const message = requestError.response?.data?.error || "Profile could not be updated.";
      setError(message);
      dispatch(showSnackBar({ message, option: { variant: "error" } }));
    } finally {
      setSaving(false);
      dispatch(finishLoading());
    }
  };

  if (!hydrated || !userInfo?.token || (router.isReady && String(router.query.id) !== ownId)) {
    return <main className={styles.gate}>Sign in to edit your profile. <Link href="/login">Sign in</Link></main>;
  }

  return <>
    <Head><title>Edit profile | MediLocate</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className={styles.main}>
      <h1>Edit profile</h1>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <form className={styles.profileForm} onSubmit={save}>
        <label>Full name<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
        <label>Phone<input value={form.phone} readOnly aria-describedby="phone-help" /><small id="phone-help">Your login phone number cannot be changed here.</small></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></label>
        <label>Photo URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
        <div className={styles.actions}><Link href={`/profile/${ownId}`}>Cancel</Link><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button></div>
      </form>
    </main>
  </>;
}
