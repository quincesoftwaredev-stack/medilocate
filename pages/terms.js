import Head from "next/head";
import Link from "next/link";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Legal/Terms.module.css";


export default function TermsAndConditionsPage() {

    return (
        <>
            <Head>

                <title>
                    Terms & Conditions | MediLocate
                </title>

                <meta
                    name="description"
                    content="Read the terms and conditions for using MediLocate doctor, medicine and prescription services."
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        BACK
                    ====================================================== */}

                    <div className={styles.breadcrumb}>

                        <Link href="/">

                            <ArrowBackRoundedIcon />

                            Home

                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Terms & Conditions
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div className={styles.headerIcon}>

                            <GavelOutlinedIcon />

                        </div>


                        <div>

                            <span>
                                MEDILOCATE
                            </span>

                            <h1>
                                Terms & Conditions
                            </h1>

                            <p>
                                Please read these terms carefully before
                                using MediLocate's services.
                            </p>

                        </div>

                    </header>


                    <div className={styles.updated}>

                        Last updated:
                        {" "}
                        August 26, 2026

                    </div>


                    {/* =====================================================
                        INTRO
                    ====================================================== */}

                    <section className={styles.card}>

                        <p>

                            These Terms & Conditions govern your access
                            to and use of MediLocate, including our
                            doctor discovery and onsite consultation
                            connection services, medicine ordering,
                            prescription upload and delivery services.

                            By using MediLocate, you acknowledge that
                            you have read, understood and agreed to
                            these terms.

                        </p>

                    </section>


                    {/* =====================================================
                        1. ABOUT MEDILOCATE
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <MedicalServicesOutlinedIcon />

                            <div>

                                <span>
                                    01
                                </span>

                                <h2>
                                    About MediLocate
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate is a technology platform that
                            helps users discover doctors and connect
                            with healthcare professionals for onsite
                            visits. MediLocate also provides a platform
                            for users to browse medicines, submit
                            prescriptions and request medicine delivery.

                        </p>


                        <p>

                            MediLocate is not a substitute for professional
                            medical advice, diagnosis or treatment.

                        </p>

                    </section>


                    {/* =====================================================
                        2. DOCTOR SERVICES
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <MedicalServicesOutlinedIcon />

                            <div>

                                <span>
                                    02
                                </span>

                                <h2>
                                    Doctor & Healthcare Services
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate may display information about
                            doctors, including their name, specialty,
                            qualifications, institution, location,
                            availability and consultation fees.

                        </p>


                        <p>

                            MediLocate primarily acts as a platform
                            connecting patients with doctors. The
                            actual medical consultation, diagnosis,
                            treatment, prescription and professional
                            decisions are the responsibility of the
                            respective healthcare professional.

                        </p>


                        <ul>

                            <li>
                                Doctor availability may change without
                                prior notice.
                            </li>

                            <li>
                                Consultation fees may vary by doctor.
                            </li>

                            <li>
                                Patients are responsible for deciding
                                whether a doctor's services are suitable
                                for their needs.
                            </li>

                            <li>
                                MediLocate does not guarantee a specific
                                medical outcome.
                            </li>

                        </ul>

                    </section>


                    {/* =====================================================
                        3. MEDICINE SERVICES
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <LocalPharmacyOutlinedIcon />

                            <div>

                                <span>
                                    03
                                </span>

                                <h2>
                                    Medicine Ordering
                                </h2>

                            </div>

                        </div>


                        <p>

                            Users may browse available medicines and
                            place orders through MediLocate.

                        </p>


                        <p>

                            Medicine availability, price, packaging,
                            manufacturer and other product information
                            may change from time to time.

                        </p>


                        <ul>

                            <li>
                                An item in your cart does not guarantee
                                that it will remain available until
                                checkout.
                            </li>

                            <li>
                                Orders may be cancelled or modified if
                                a medicine becomes unavailable.
                            </li>

                            <li>
                                Medicine should be used only according
                                to appropriate professional advice and
                                applicable instructions.
                            </li>

                        </ul>

                    </section>


                    {/* =====================================================
                        4. PRESCRIPTION
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <DescriptionOutlinedIcon />

                            <div>

                                <span>
                                    04
                                </span>

                                <h2>
                                    Prescription Upload
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate allows users to upload a
                            prescription so that the pharmacy team
                            can review it and prepare an appropriate
                            medicine order.

                        </p>


                        <p>

                            Users are responsible for providing clear,
                            genuine and complete prescription documents.

                        </p>


                        <ul>

                            <li>
                                Do not upload a prescription belonging
                                to another person without appropriate
                                authorization.
                            </li>

                            <li>
                                Do not alter, falsify or manipulate
                                prescription documents.
                            </li>

                            <li>
                                A prescription request does not
                                automatically guarantee that every
                                requested medicine will be supplied.
                            </li>

                            <li>
                                The pharmacy may contact the user for
                                clarification before preparing an order.
                            </li>

                        </ul>


                        <div className={styles.notice}>

                            <WarningAmberRoundedIcon />

                            <span>

                                Prescription review and medicine
                                dispensing are subject to applicable
                                professional and regulatory requirements.

                            </span>

                        </div>

                    </section>


                    {/* =====================================================
                        5. DELIVERY
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <LocalShippingOutlinedIcon />

                            <div>

                                <span>
                                    05
                                </span>

                                <h2>
                                    Delivery
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate may provide medicine delivery
                            within selected service areas.

                        </p>


                        <ul>

                            <li>
                                Delivery availability depends on the
                                delivery location and operational area.
                            </li>

                            <li>
                                Estimated delivery times are estimates
                                and are not guaranteed.
                            </li>

                            <li>
                                Delays may occur because of traffic,
                                weather, medicine availability or other
                                operational circumstances.
                            </li>

                            <li>
                                Customers should provide an accurate
                                delivery address and reachable phone
                                number.
                            </li>

                            <li>
                                Additional delivery charges may apply
                                depending on the order and location.
                            </li>

                        </ul>

                    </section>


                    {/* =====================================================
                        6. PAYMENTS
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <PaymentOutlinedIcon />

                            <div>

                                <span>
                                    06
                                </span>

                                <h2>
                                    Payments
                                </h2>

                            </div>

                        </div>


                        <p>

                            Orders may be paid using the payment methods
                            made available through MediLocate.

                        </p>


                        <p>

                            For Cash on Delivery orders, the customer is
                            responsible for paying the amount due when
                            the order is delivered.

                        </p>


                        <p>

                            For online payments, the transaction may be
                            processed by a third-party payment service
                            provider. Their applicable terms may also
                            apply.

                        </p>

                    </section>


                    {/* =====================================================
                        7. CANCELLATION
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <GavelOutlinedIcon />

                            <div>

                                <span>
                                    07
                                </span>

                                <h2>
                                    Order Cancellation
                                </h2>

                            </div>

                        </div>


                        <p>

                            Customers may request cancellation of an
                            order before it reaches a stage where
                            cancellation is no longer operationally
                            possible.

                        </p>


                        <p>

                            MediLocate or the pharmacy may cancel an
                            order when, for example, a requested medicine
                            is unavailable, a prescription cannot be
                            validated, payment cannot be completed, or
                            delivery cannot reasonably be completed.

                        </p>


                        <p>

                            A cancelled order and a failed order are
                            different statuses. A cancelled order is
                            intentionally stopped, while a failed order
                            indicates that the order could not be
                            successfully completed.

                        </p>

                    </section>


                    {/* =====================================================
                        8. RETURNS
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <LocalPharmacyOutlinedIcon />

                            <div>

                                <span>
                                    08
                                </span>

                                <h2>
                                    Returns & Refunds
                                </h2>

                            </div>

                        </div>


                        <p>

                            Medicine returns and refunds are subject to
                            applicable law, medicine safety requirements,
                            product condition and MediLocate's applicable
                            refund policy.

                        </p>


                        <p>

                            Customers should not return or reuse medicines
                            that have been improperly stored or whose
                            packaging, seal or safety condition has been
                            compromised.

                        </p>


                        <p>

                            Where a refund is approved, the method and
                            timing of the refund may depend on the
                            original payment method.

                        </p>

                    </section>


                    {/* =====================================================
                        9. USER ACCOUNT
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <AccountCircleOutlinedIcon />

                            <div>

                                <span>
                                    09
                                </span>

                                <h2>
                                    User Accounts
                                </h2>

                            </div>

                        </div>


                        <p>

                            You are responsible for providing accurate
                            information when creating and using your
                            MediLocate account.

                        </p>


                        <ul>

                            <li>
                                You must provide truthful and current
                                information.
                            </li>

                            <li>
                                You must keep your login credentials
                                secure.
                            </li>

                            <li>
                                You should notify MediLocate if you
                                believe your account has been accessed
                                without authorization.
                            </li>

                            <li>
                                You must not use another person's account
                                without permission.
                            </li>

                        </ul>

                    </section>


                    {/* =====================================================
                        10. PROHIBITED USE
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <WarningAmberRoundedIcon />

                            <div>

                                <span>
                                    10
                                </span>

                                <h2>
                                    Prohibited Activities
                                </h2>

                            </div>

                        </div>


                        <p>
                            You must not use MediLocate to:
                        </p>


                        <ul>

                            <li>
                                Submit false, fraudulent or altered
                                information.
                            </li>

                            <li>
                                Upload fraudulent prescriptions or
                                documents.
                            </li>

                            <li>
                                Attempt to obtain medicines through
                                unauthorized or deceptive means.
                            </li>

                            <li>
                                Interfere with the security or operation
                                of the platform.
                            </li>

                            <li>
                                Abuse, harass or threaten doctors,
                                pharmacy staff, delivery personnel or
                                other users.
                            </li>

                        </ul>

                    </section>


                    {/* =====================================================
                        11. CONTENT
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <DescriptionOutlinedIcon />

                            <div>

                                <span>
                                    11
                                </span>

                                <h2>
                                    Platform Content
                                </h2>

                            </div>

                        </div>


                        <p>

                            Information, branding, software, graphics,
                            text and other material provided through
                            MediLocate may be protected by applicable
                            intellectual property laws.

                        </p>


                        <p>

                            You may use the platform for its intended
                            personal and lawful purposes. You may not
                            reproduce, copy, modify, distribute or
                            commercially exploit platform content without
                            appropriate authorization.

                        </p>

                    </section>


                    {/* =====================================================
                        12. AVAILABILITY
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <MedicalServicesOutlinedIcon />

                            <div>

                                <span>
                                    12
                                </span>

                                <h2>
                                    Service Availability
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate aims to keep its services available
                            and reliable, but uninterrupted access cannot
                            be guaranteed.

                        </p>


                        <p>

                            Services may occasionally be unavailable due
                            to maintenance, technical issues, network
                            problems, third-party services or circumstances
                            outside our reasonable control.

                        </p>

                    </section>


                    {/* =====================================================
                        13. LIABILITY
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <GavelOutlinedIcon />

                            <div>

                                <span>
                                    13
                                </span>

                                <h2>
                                    Limitation of Liability
                                </h2>

                            </div>

                        </div>


                        <p>

                            To the extent permitted by applicable law,
                            MediLocate will not be responsible for losses
                            arising from circumstances outside its
                            reasonable control, including third-party
                            healthcare decisions, delivery delays,
                            temporary service interruptions or incorrect
                            information provided by users.

                        </p>


                        <p>

                            Nothing in these Terms is intended to exclude
                            or limit liability where such exclusion or
                            limitation is prohibited by applicable law.

                        </p>

                    </section>


                    {/* =====================================================
                        14. CHANGES
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <GavelOutlinedIcon />

                            <div>

                                <span>
                                    14
                                </span>

                                <h2>
                                    Changes to These Terms
                                </h2>

                            </div>

                        </div>


                        <p>

                            MediLocate may update these Terms & Conditions
                            from time to time. Updated terms will be
                            published on this page with a revised
                            "Last updated" date.

                        </p>


                        <p>

                            Continued use of MediLocate after an update
                            means you acknowledge the updated terms.

                        </p>

                    </section>


                    {/* =====================================================
                        15. GOVERNING LAW
                    ====================================================== */}

                    <section className={styles.card}>

                        <div className={styles.sectionHeader}>

                            <GavelOutlinedIcon />

                            <div>

                                <span>
                                    15
                                </span>

                                <h2>
                                    Governing Law
                                </h2>

                            </div>

                        </div>


                        <p>

                            These Terms & Conditions shall be interpreted
                            in accordance with the laws applicable to
                            MediLocate and its operations.

                        </p>


                        <p>

                            Any dispute should first be addressed through
                            good-faith communication with MediLocate
                            before pursuing other available remedies.

                        </p>

                    </section>


                    {/* =====================================================
                        CONTACT
                    ====================================================== */}

                    <section className={styles.contactCard}>

                        <div>

                            <h2>
                                Questions about these terms?
                            </h2>

                            <p>
                                Contact the MediLocate team for questions
                                regarding these Terms & Conditions.
                            </p>

                        </div>


                        <Link
                            href="/contact"
                            className={
                                styles.contactButton
                            }
                        >

                            Contact Us

                        </Link>

                    </section>


                    {/* =====================================================
                        FOOTNOTE
                    ====================================================== */}

                    <p className={styles.legalNote}>

                        These Terms & Conditions are a general platform
                        document and are not legal advice. MediLocate
                        should have these terms reviewed and adapted by
                        a qualified lawyer before they are treated as
                        the final contractual terms for the service.

                    </p>

                </div>

            </main>


            <Footer />

        </>
    );
}