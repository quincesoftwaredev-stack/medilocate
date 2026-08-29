import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import Medicine from "@/database/model/Medicine";
import User from "@/database/model/User";
import nextConnect from "next-connect";

const handler = nextConnect();

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (value) => String(value || "").trim().toLowerCase();

const getScore = (query, values) => {
    const normalizedQuery = normalize(query);
    const normalizedValues = values.map(normalize).filter(Boolean);

    if (normalizedValues.some((value) => value === normalizedQuery)) return 0;
    if (normalizedValues.some((value) => value.startsWith(normalizedQuery))) return 1;
    if (normalizedValues.some((value) => value.includes(normalizedQuery))) return 2;
    return 3;
};

const getDoctorName = (user = {}) =>
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Doctor";

const mapDoctor = (doctor, query) => ({
    id: String(doctor._id),
    type: "doctor",
    name: getDoctorName(doctor.user),
    specialty: doctor.speciality || "General Physician",
    qualification: doctor.education || "",
    workplace: doctor.workingIn || "",
    image: doctor.user?.image || "",
    fee: Number(doctor.consultationFee || 0),
    available: Boolean(doctor.availableForHomeVisit),
    score: getScore(query, [
        getDoctorName(doctor.user),
        doctor.speciality,
        doctor.education,
        doctor.workingIn,
        doctor.bmdcNumber,
    ]),
});

const mapMedicine = (medicine, query) => ({
    _id: String(medicine._id),
    type: "medicine",
    name: medicine.name,
    genericName: medicine.genericName || "",
    strength: medicine.strength || "",
    dosageForm: medicine.dosageForm || "",
    manufacturer: medicine.manufacturer || "",
    price: Number(medicine.price || 0),
    stock: Number(medicine.stock || 0),
    prescriptionRequired: Boolean(medicine.prescriptionRequired),
    image: medicine.image || {},
    score: getScore(query, [
        medicine.name,
        medicine.genericName,
        medicine.manufacturer,
        medicine.code,
        medicine.category,
    ]),
});

const sortResults = (items) =>
    items.sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        if (a.type === "medicine" && b.type === "medicine" && a.stock !== b.stock) {
            return b.stock - a.stock;
        }
        return a.name.localeCompare(b.name);
    });

handler.get(async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();
        const type = ["all", "doctors", "medicines"].includes(req.query.type)
            ? req.query.type
            : "all";
        const mode = req.query.mode === "suggestions" ? "suggestions" : "results";
        const page = Math.max(Number(req.query.page) || 1, 1);
        const perGroup = mode === "suggestions" ? 3 : type === "all" ? 6 : 12;

        if (query.length < 2) {
            return res.status(200).json({
                success: true,
                query,
                groups: { doctors: [], specialties: [], medicines: [] },
                pagination: { page: 1, totalPages: 0, totalResults: 0 },
            });
        }

        await db.connect();

        const regex = new RegExp(escapeRegex(query), "i");
        const matchingUsers = await User.find({
            role: "doctor",
            $or: [
                { fullName: regex },
                { firstName: regex },
                { lastName: regex },
            ],
        }).select("_id").lean();

        const [doctorDocs, medicineDocs] = await Promise.all([
            type === "medicines"
                ? []
                : Doctor.find({
                      status: "active",
                      verificationStatus: "verified",
                      $or: [
                          { user: { $in: matchingUsers.map((user) => user._id) } },
                          { speciality: regex },
                          { education: regex },
                          { workingIn: regex },
                          { bmdcNumber: regex },
                      ],
                  })
                      .populate("user", "fullName firstName lastName image")
                      .select("user speciality education workingIn bmdcNumber consultationFee availableForHomeVisit")
                      .limit(200)
                      .lean(),
            type === "doctors"
                ? []
                : Medicine.find({
                      status: "active",
                      $or: [
                          { name: regex },
                          { genericName: regex },
                          { manufacturer: regex },
                          { code: regex },
                          { category: regex },
                      ],
                  })
                      .select("name genericName strength dosageForm manufacturer code category price stock prescriptionRequired image")
                      .limit(300)
                      .lean(),
        ]);

        const doctors = sortResults(doctorDocs.map((doctor) => mapDoctor(doctor, query)));
        const medicines = sortResults(medicineDocs.map((medicine) => mapMedicine(medicine, query)));
        const specialties = [
            ...new Set(
                doctorDocs
                    .map((doctor) => doctor.speciality)
                    .filter((specialty) => specialty && normalize(specialty).includes(normalize(query)))
            ),
        ]
            .sort((a, b) => getScore(query, [a]) - getScore(query, [b]) || a.localeCompare(b))
            .slice(0, mode === "suggestions" ? 3 : 12)
            .map((name) => ({ type: "specialty", name }));

        if (mode === "suggestions") {
            return res.status(200).json({
                success: true,
                query,
                groups: {
                    doctors: doctors.slice(0, 3),
                    specialties,
                    medicines: medicines.slice(0, 3),
                },
                counts: { doctors: doctors.length, medicines: medicines.length },
            });
        }

        const doctorPages = Math.ceil(doctors.length / perGroup);
        const medicinePages = Math.ceil(medicines.length / perGroup);
        const totalPages = type === "doctors"
            ? doctorPages
            : type === "medicines"
              ? medicinePages
              : Math.max(doctorPages, medicinePages);
        const safePage = Math.min(page, Math.max(totalPages, 1));
        const offset = (safePage - 1) * perGroup;

        return res.status(200).json({
            success: true,
            query,
            type,
            groups: {
                doctors: doctors.slice(offset, offset + perGroup),
                specialties,
                medicines: medicines.slice(offset, offset + perGroup),
            },
            counts: {
                doctors: doctors.length,
                medicines: medicines.length,
                total: doctors.length + medicines.length,
            },
            pagination: {
                page: safePage,
                perGroup,
                totalPages,
                totalResults: doctors.length + medicines.length,
            },
        });
    } catch (error) {
        console.error("Global search error:", error);
        return res.status(500).json({
            success: false,
            message: "Search is temporarily unavailable.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});

export default handler;

