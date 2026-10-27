import AndroidIcon from "@mui/icons-material/Android";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import { mobileAppRelease } from "@/config/mobile-app-release";
import styles from "./AppDownload.module.css";

export default function AppDownload() {
    return (
        <section className={styles.section} aria-labelledby="app-download-title">
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.appIcon} aria-hidden="true">
                        <AndroidIcon />
                    </div>

                    <div className={styles.content}>
                        <span className={styles.label}>MEDILOCATE FOR ANDROID</span>
                        <h2 id="app-download-title">Your healthcare, ready on mobile.</h2>
                        <p>
                            Download the MediLocate app to find doctors and order medicines
                            wherever you are.
                        </p>
                        <span className={styles.release}>
                            Latest version {mobileAppRelease.version} · Updated {mobileAppRelease.updatedAt}
                        </span>
                    </div>

                    <a
                        className={styles.downloadButton}
                        href={mobileAppRelease.downloadUrl}
                        download
                    >
                        <DownloadOutlinedIcon />
                        Download Android app
                    </a>
                </div>
            </div>
        </section>
    );
}
