import PageSeo from "@/components/SEO/PageSeo";

import Hero from "@/components/home/Hero";

import Services from "@/components/home/Services";

import HowItWorks from "@/components/home/HowItWorks";

import MedicineSection from "@/components/home/MedicineSection";

import PrescriptionSection from "@/components/home/PrescriptionSection";

import WhyMedilocate from "@/components/home/WhyMedilocate";

import AppDownload from "@/components/home/AppDownload";

import FinalCTA from "@/components/home/FinalCTA";

const featuredMedicines = [
  {
    _id: "medicine-1",

    name: "Napa",

    genericName: "Paracetamol",

    strength: "500 mg",

    dosageForm: "Tablet",

    price: 15,

    image: "",
  },

  {
    _id: "medicine-2",

    name: "Seclo",

    genericName: "Omeprazole",

    strength: "20 mg",

    dosageForm: "Capsule",

    price: 70,

    image: "",
  },

  {
    _id: "medicine-3",

    name: "Fexo",

    genericName: "Fexofenadine Hydrochloride",

    strength: "120 mg",

    dosageForm: "Tablet",

    price: 100,

    image: "",
  },
];


export default function Home() {
  return (
    <>
      <PageSeo
        title="MediLocate | Find Doctors & Order Medicines Online"
        description="Find trusted doctors, search medicines, upload prescriptions and arrange convenient medicine delivery with MediLocate in Bangladesh."
        path="/"
        keywords="find doctors Bangladesh, order medicine online, prescription upload, medicine delivery, MediLocate"
        schemaType="WebPage"
      />

      <main>
        <Hero />

        <Services />

        <HowItWorks />

        <MedicineSection medicines={featuredMedicines} />

        <PrescriptionSection />

        <WhyMedilocate />

        <AppDownload />

        <FinalCTA />
      </main>
    </>
  );
}
