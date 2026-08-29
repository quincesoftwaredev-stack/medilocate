import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import SearchSuggestions, {
    flattenSuggestions,
    getSuggestionHref,
} from "./SearchSuggestions";
import styles from "@/styles/Search/GlobalSearch.module.css";

const emptyGroups = { doctors: [], specialties: [], medicines: [] };

export default function GlobalSearch({
    initialValue = "",
    className = "",
    placeholder = "Search doctors, specialties or medicines...",
    autoFocus = false,
}) {
    const router = useRouter();
    const rootRef = useRef(null);
    const [value, setValue] = useState(initialValue);
    const [groups, setGroups] = useState(emptyGroups);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => setValue(initialValue), [initialValue]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        const query = value.trim();
        setActiveIndex(-1);

        if (query.length < 2) {
            setGroups(emptyGroups);
            setLoading(false);
            setError("");
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(
                    `/api/search?mode=suggestions&q=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || "Search is temporarily unavailable.");
                setGroups(data.groups || emptyGroups);
                setOpen(true);
            } catch (requestError) {
                if (requestError.name !== "AbortError") {
                    setGroups(emptyGroups);
                    setError("Search is temporarily unavailable.");
                    setOpen(true);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value]);

    const submit = (event) => {
        event.preventDefault();
        const query = value.trim();
        if (query.length < 2) {
            setOpen(true);
            setError("Type at least 2 characters to search.");
            return;
        }
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const select = (href) => {
        setOpen(false);
        router.push(href);
    };

    const handleKeyDown = (event) => {
        const items = flattenSuggestions(groups);
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }
        if (!open || !items.length) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % items.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            select(getSuggestionHref(items[activeIndex]));
        }
    };

    return (
        <div ref={rootRef} className={`${styles.root} ${className}`}>
            <form className={styles.form} onSubmit={submit} role="search">
                <SearchRoundedIcon className={styles.searchIcon} />
                <input
                    type="search"
                    value={value}
                    placeholder={placeholder}
                    autoComplete="off"
                    autoFocus={autoFocus}
                    aria-label="Search doctors, specialties or medicines"
                    onChange={(event) => setValue(event.target.value)}
                    onFocus={() => value.trim().length >= 2 && setOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                <button type="submit" aria-label="Submit search">
                    <span>Search</span>
                    <ArrowForwardRoundedIcon aria-hidden="true" />
                </button>
            </form>

            {open && (
                <SearchSuggestions
                    groups={groups}
                    query={value.trim()}
                    loading={loading}
                    error={error}
                    activeIndex={activeIndex}
                    onSelect={select}
                />
            )}
        </div>
    );
}
