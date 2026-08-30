import PageSeo from "@/components/SEO/PageSeo";

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
            <PageSeo title="MediLocate | Find Doctors & Order Medicines Online" description="Find trusted doctors, search medicines, upload prescriptions and arrange convenient medicine delivery with MediLocate in Bangladesh." path="/" keywords="find doctors Bangladesh, order medicine online, prescription upload, medicine delivery, MediLocate" schemaType="WebPage" />

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
