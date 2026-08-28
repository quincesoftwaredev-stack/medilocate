import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import styles from "./HowItWorks.module.css";

const steps = [
    {
        id: 1,
        number: "01",
        title: "Find",
        description:
            "Search for a doctor, medicine, or pharmacy based on what you need.",
        icon: SearchOutlinedIcon,
    },
    {
        id: 2,
        number: "02",
        title: "Connect",
        description:
            "View doctor information and contact the right healthcare professional for an onsite visit.",
        icon: PhoneOutlinedIcon,
    },
    {
        id: 3,
        number: "03",
        title: "Order",
        description:
            "Add medicines to your cart or upload your complete prescription for easy ordering.",
        icon: ShoppingCartOutlinedIcon,
    },
    {
        id: 4,
        number: "04",
        title: "Receive",
        description:
            "Get your medicines delivered quickly from a nearby pharmacy to your doorstep.",
        icon: LocalShippingOutlinedIcon,
    },
];

export default function HowItWorks() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                {/* Section Heading */}

                <div className={styles.heading}>

                    <span className={styles.label}>
                        HOW MEDILOCATE WORKS
                    </span>

                    <h2>
                        Healthcare,
                        <span> made simple.</span>
                    </h2>

                    <p>
                        From finding the right doctor to getting your
                        medicines delivered, Medilocate keeps your
                        healthcare journey simple.
                    </p>

                </div>


                {/* Steps */}

                <div className={styles.steps}>

                    {steps.map((step, index) => {

                        const Icon = step.icon;

                        return (
                            <div
                                className={styles.stepWrapper}
                                key={step.id}
                            >

                                <div className={styles.step}>

                                    {/* Number */}

                                    <div className={styles.number}>
                                        {step.number}
                                    </div>


                                    {/* Icon */}

                                    <div className={styles.icon}>
                                        <Icon />
                                    </div>


                                    {/* Content */}

                                    <h3>
                                        {step.title}
                                    </h3>

                                    <p>
                                        {step.description}
                                    </p>

                                </div>


                                {/* Connector */}

                                {index < steps.length - 1 && (
                                    <div className={styles.connector}>
                                        <ArrowForwardIcon />
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}