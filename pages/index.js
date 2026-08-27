import Head from "next/head";

import Hero from "../components/home/Hero";
import Services from "../components/home/Services";
import HowItWorks from "../components/home/HowItWorks";
import FeaturedDoctors from "../components/home/FeaturedDoctors";
import MedicineSection from "../components/home/MedicineSection";
import PrescriptionSection from "../components/home/PrescriptionSection";
import WhyMedilocate from "../components/home/WhyMedilocate";
import FinalCTA from "../components/home/FinalCTA";

export default function Home() {
    return (
        <>
            <Head>
                <title>
                    Medilocate | Find Doctors & Get Medicines Delivered
                </title>

                <meta
                    name="description"
                    content="Find trusted doctors near you and get medicines delivered to your doorstep with Medilocate."
                />
            </Head>

            <main>

                <Hero />

                <Services />

                <HowItWorks />

                <FeaturedDoctors />

                <MedicineSection />

                <PrescriptionSection />

                <WhyMedilocate />

                <FinalCTA />

            </main>
        </>
    );
}