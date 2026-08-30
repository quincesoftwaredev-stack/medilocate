import db from '@/database/connection';
import Medicine from '@/database/model/Medicine';

/* Read-only public catalog for browsing and search. Orders still use the database. */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');

    try {
        await db.connect();
        const medicines = await Medicine.find({ status: 'active' })
            .select('name genericName strength dosageForm packSize manufacturer category price prescriptionRequired image description usage warnings stock')
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            medicines: medicines.map((medicine) => ({
                _id: String(medicine._id),
                name: medicine.name,
                genericName: medicine.genericName,
                strength: medicine.strength || '',
                dosageForm: medicine.dosageForm || 'Other',
                packSize: medicine.packSize || '',
                manufacturer: medicine.manufacturer || '',
                category: medicine.category || 'Other',
                price: medicine.price,
                prescriptionRequired: Boolean(medicine.prescriptionRequired),
                image: medicine.image?.url || '',
                inStock: Number(medicine.stock || 0) > 0,
                description: medicine.description || '',
                usage: medicine.usage || '',
                warnings: medicine.warnings || '',
            })),
        });
    } catch (error) {
        console.error('Public medicine catalog error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    } finally {
        await db.disconnect();
    }
}
