import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import styles from "./ProfessionalOverview.module.css";

export default function ProfessionalOverview({ doctor }) {
  const departments = (doctor.departments || []).filter(Boolean);
  const education = doctor.education || [];
  const experienceDetails = doctor.experienceDetails || [];

  return (
    <section className={styles.card}>
      <div className={styles.about}>
        <div className={styles.heading}><MedicalServicesOutlinedIcon /><h2>About doctor</h2></div>
        <p>{doctor.about}</p>
      </div>

      <div className={styles.grid}>
        <article>
          <div className={styles.heading}><MedicalServicesOutlinedIcon /><h3>Specializations</h3></div>
          <div className={styles.tags}>
            <span>{doctor.specialty}</span>
            {departments.map((department, index) => <span key={department._id || index}>{department.name || department}</span>)}
          </div>
        </article>

        <article>
          <div className={styles.heading}><SchoolOutlinedIcon /><h3>Education</h3></div>
          <p>{education.length ? education.join(" · ") : "Not available"}</p>
        </article>

        <article>
          <div className={styles.heading}><WorkOutlineOutlinedIcon /><h3>Experience</h3></div>
          <p>{[doctor.experience, ...experienceDetails].filter(Boolean).join(" · ")}</p>
        </article>

        {doctor.bmdcNumber && (
          <article>
            <div className={styles.heading}><BadgeOutlinedIcon /><h3>Registration</h3></div>
            <p>BMDC <strong>{doctor.bmdcNumber}</strong></p>
          </article>
        )}
      </div>
    </section>
  );
}
