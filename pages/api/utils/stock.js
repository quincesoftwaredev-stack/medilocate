import fs from "fs";
import path from "path";
import nextConnect from "next-connect";

import db from "@/database/connection";
import Medicine from "@/database/model/Medicine";

import medexMedicines from "./medex-output2.json";


const handler = nextConnect();


/*
|--------------------------------------------------------------------------
| GET IMAGE URL
|--------------------------------------------------------------------------
*/

const getImageUrl = (item) => {
    if (
        typeof item?.image === "string" &&
        item.image.trim()
    ) {
        return item.image.trim();
    }

    if (
        Array.isArray(item?.images) &&
        item.images.length > 0
    ) {
        const firstImage = item.images[0];

        if (typeof firstImage === "string") {
            return firstImage.trim();
        }

        if (
            firstImage &&
            typeof firstImage === "object"
        ) {
            return (
                firstImage.url ||
                firstImage.src ||
                ""
            );
        }
    }

    return "";
};


/*
|--------------------------------------------------------------------------
| TRANSFORM MEDICINE
|--------------------------------------------------------------------------
*/

const transformMedicine = (item) => {
    if (!item) {
        return [];
    }

    if (item.success === false) {
        return [];
    }


    /*
    |--------------------------------------------------------------------------
    | BRAND ID
    |--------------------------------------------------------------------------
    */

    const brandId = Number(
        item.brandId
    );


    if (!brandId) {
        console.warn(
            "⚠️ Skipping medicine without brandId:",
            item.brandName
        );

        return [];
    }


    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    const name = String(
        item.brandName || ""
    ).trim();


    const genericName = String(
        item.genericName || ""
    ).trim();


    if (!name) {
        console.warn(
            `⚠️ Skipping brand ${brandId}: brandName missing`
        );

        return [];
    }


    if (!genericName) {
        console.warn(
            `⚠️ Skipping ${name}: genericName missing`
        );

        return [];
    }


    /*
    |--------------------------------------------------------------------------
    | BASE MEDICINE
    |--------------------------------------------------------------------------
    */

    const baseMedicine = {
        name,

        genericName,

        strength: String(
            item.strength || ""
        ).trim(),

        /*
        |--------------------------------------------------------------------------
        | KEEP DOSAGE FORM EXACTLY AS SOURCE
        |--------------------------------------------------------------------------
        */

        dosageForm: String(
            item.dosageForm || ""
        ).trim(),

        manufacturer: String(
            item.manufacturer || ""
        ).trim(),

        category:
            String(
                item.therapeuticClass ||
                "Other"
            ).trim() || "Other",

        sourceBrandId:
            brandId,

        sourceSlug: String(
            item.slug || ""
        ).trim(),

        /*
        |--------------------------------------------------------------------------
        | SOURCE URL
        |--------------------------------------------------------------------------
        */

        sourceUrl: String(
            item.sourceUrl || ""
        ).trim(),

        medicineType: String(
            item.type || ""
        ).trim(),

        /*
        |--------------------------------------------------------------------------
        | STOCK
        |--------------------------------------------------------------------------
        */

        stock: 10000,

        reorderLevel: 20,

        prescriptionRequired: false,

        description: "",

        usage: "",

        warnings: "",

        image: {
            url:
                getImageUrl(item),

            publicId: "",
        },

        status: "active",

        createdBy: null,

        updatedBy: null,
    };


    /*
    |--------------------------------------------------------------------------
    | MULTIPLE PACKAGES
    |--------------------------------------------------------------------------
    |
    | Every package becomes a separate Medicine document.
    |
    |--------------------------------------------------------------------------
    */

    if (
        Array.isArray(item.packages) &&
        item.packages.length > 0
    ) {
        const validPackages =
            item.packages.filter(
                (pkg) => {
                    if (!pkg) {
                        return false;
                    }

                    const price =
                        Number(pkg.price);

                    return (
                        Number.isFinite(price) &&
                        price >= 0
                    );
                }
            );


        if (
            validPackages.length > 0
        ) {
            return validPackages.map(
                (pkg, index) => ({
                    ...baseMedicine,

                    code:
                        `MED-${brandId}-${index + 1}`,

                    packSize: String(
                        pkg.label || ""
                    ).trim(),

                    price:
                        Number(pkg.price),
                })
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | NO PACKAGE / FALLBACK
    |--------------------------------------------------------------------------
    */

    const unitPrice =
        Number(item.unitPrice);

    const normalPrice =
        Number(item.price);


    let price = 0;


    if (
        Number.isFinite(unitPrice) &&
        unitPrice >= 0
    ) {
        price = unitPrice;
    }

    else if (
        Number.isFinite(normalPrice) &&
        normalPrice >= 0
    ) {
        price = normalPrice;
    }


    return [
        {
            ...baseMedicine,

            code:
                `MED-${brandId}-1`,

            packSize: String(
                item.packageSize || ""
            ).trim(),

            price,
        },
    ];
};


/*
|--------------------------------------------------------------------------
| GET /api/utils/stock
|--------------------------------------------------------------------------
*/

handler.get(
    async (req, res) => {
        try {

            /*
            |--------------------------------------------------------------------------
            | 1. CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            await db.connect();

            console.log(
                "✅ Database connected"
            );


            /*
            |--------------------------------------------------------------------------
            | 2. VALIDATE SOURCE JSON
            |--------------------------------------------------------------------------
            */

            if (
                !Array.isArray(
                    medexMedicines
                )
            ) {
                return res
                    .status(500)
                    .json({
                        success: false,

                        message:
                            "medex-output2.json must contain an array.",
                    });
            }


            console.log(
                `📦 Source brands: ${medexMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | 3. TRANSFORM SOURCE DATA
            |--------------------------------------------------------------------------
            |
            | Do this BEFORE deleting the existing database.
            |
            |--------------------------------------------------------------------------
            */

            const medicines =
                medexMedicines.flatMap(
                    transformMedicine
                );


            console.log(
                `🔄 Generated medicines: ${medicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | 4. SAFETY CHECK
            |--------------------------------------------------------------------------
            */

            if (
                medicines.length === 0
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "No valid medicines found. Existing medicines were NOT deleted.",
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | 5. CHECK DUPLICATE CODES
            |--------------------------------------------------------------------------
            */

            const codes =
                medicines.map(
                    (medicine) =>
                        medicine.code
                );


            const uniqueCodes =
                new Set(codes);


            if (
                uniqueCodes.size !==
                codes.length
            ) {
                const seen =
                    new Set();

                const duplicates = [];


                for (
                    const code of codes
                ) {
                    if (
                        seen.has(code)
                    ) {
                        duplicates.push(
                            code
                        );
                    }

                    seen.add(code);
                }


                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Duplicate medicine codes found. Existing medicines were NOT deleted.",

                        duplicates: [
                            ...new Set(
                                duplicates
                            ),
                        ],
                    });
            }


            /*
            |--------------------------------------------------------------------------
            | 6. DELETE ALL EXISTING MEDICINES
            |--------------------------------------------------------------------------
            */

            console.log(
                "🗑️ Deleting ALL existing medicines..."
            );


            const deleteResult =
                await Medicine.deleteMany(
                    {}
                );


            console.log(
                `✅ Deleted medicines: ${deleteResult.deletedCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | 7. CONFIRM COLLECTION IS COMPLETELY EMPTY
            |--------------------------------------------------------------------------
            */

            const remainingAfterDelete =
                await Medicine.countDocuments(
                    {}
                );


            if (
                remainingAfterDelete !== 0
            ) {
                throw new Error(
                    `Failed to completely delete medicines. ${remainingAfterDelete} medicines still remain.`
                );
            }


            console.log(
                "✅ Medicine collection is completely empty"
            );


            /*
            |--------------------------------------------------------------------------
            | 8. INSERT NEW MEDICINES
            |--------------------------------------------------------------------------
            */

            console.log(
                "💊 Creating new medicines..."
            );


            const insertedMedicines =
                await Medicine.insertMany(
                    medicines,
                    {
                        ordered: true,
                    }
                );


            console.log(
                `✅ Inserted medicines: ${insertedMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | 9. FETCH NEWLY CREATED MEDICINES FROM DATABASE
            |--------------------------------------------------------------------------
            */

            console.log(
                "📥 Fetching newly created medicines..."
            );


            const databaseMedicines =
                await Medicine
                    .find({})
                    .lean();


            console.log(
                `✅ Fetched medicines: ${databaseMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | 10. SAVE FETCHED DATABASE DATA TO JSON
            |--------------------------------------------------------------------------
            */

            const outputPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medicine-database-output.json"
                );


            fs.writeFileSync(
                outputPath,
                JSON.stringify(
                    databaseMedicines,
                    null,
                    2
                ),
                "utf8"
            );


            console.log(
                "💾 medicine-database-output.json created successfully"
            );


            /*
            |--------------------------------------------------------------------------
            | 11. RESPONSE
            |--------------------------------------------------------------------------
            */

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "All old medicines deleted, new medicines created, and database exported to JSON successfully.",

                    data: {
                        sourceBrands:
                            medexMedicines.length,

                        generatedMedicines:
                            medicines.length,

                        deletedMedicines:
                            deleteResult.deletedCount,

                        remainingAfterDelete,

                        insertedMedicines:
                            insertedMedicines.length,

                        fetchedMedicines:
                            databaseMedicines.length,

                        stockPerMedicine:
                            10000,

                        outputFile:
                            "pages/api/utils/medicine-database-output.json",
                    },
                });

        } catch (error) {

            console.error(
                "❌ Medicine rebuild error:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,

                    message:
                        error?.message ||
                        "Failed to rebuild medicines.",
                });
        }
    }
);


export default handler;