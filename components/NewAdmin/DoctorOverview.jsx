import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import styles from "@/styles/Admin/NewAdmin.module.css";

export default function DoctorOverview({ doctors = {}, appointments = {} }) {
    const statuses = appointments.statuses || {};

    return (
        <section className={`${styles.panel} ${styles.doctorPanel}`}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>DOCTOR SERVICES</span>
                    <h2>Appointments and doctors</h2>
                </div>
                <Link href="/admin/doctors" className={styles.textLink}>Manage doctors <ArrowForwardRoundedIcon /></Link>
            </div>

            <div className={styles.doctorGrid}>
                <div className={styles.doctorMetric}>
                    <span className={`${styles.statIcon} ${styles.tealIcon}`}><MedicalServicesOutlinedIcon /></span>
                    <div><strong>{doctors.active || 0}</strong><span>Active verified doctors</span></div>
                </div>
                <div className={styles.doctorMetric}>
                    <span className={`${styles.statIcon} ${styles.amberIcon}`}><PendingActionsOutlinedIcon /></span>
                    <div><strong>{doctors.pendingVerification || 0}</strong><span>Pending verification</span></div>
                </div>
                <div className={styles.doctorMetric}>
                    <span className={`${styles.statIcon} ${styles.blueIcon}`}><CalendarMonthOutlinedIcon /></span>
                    <div><strong>{appointments.today || 0}</strong><span>Today’s appointments</span></div>
                </div>
            </div>

            <div className={styles.appointmentBreakdown}>
                <div><span>Pending</span><strong>{statuses.pending || 0}</strong></div>
                <div><span>Confirmed</span><strong>{statuses.confirmed || 0}</strong></div>
                <div><span>Completed</span><strong>{statuses.completed || 0}</strong></div>
                <div><span>Cancelled</span><strong>{statuses.cancelled || 0}</strong></div>
                <div><span>No show</span><strong>{statuses["no-show"] || 0}</strong></div>
            </div>
        </section>
    );
}

