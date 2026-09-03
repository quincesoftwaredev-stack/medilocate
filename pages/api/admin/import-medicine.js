import fs from "fs";
import path from "path";

import nextConnect from "next-connect";

import db from "@/database/connection";

import Medicine from "@/database/model/Medicine";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const BATCH_SIZE =
    500;


const INPUT_FILE =
    path.join(
        process.cwd(),
        "data",
        "medicines-retail-variants.json"
    );


const OUTPUT_FILE =
    path.join(
        process.cwd(),
        "data",
        "medicine-database-export.json"
    );


/*
|--------------------------------------------------------------------------
| GROUP COUNT
|--------------------------------------------------------------------------
*/

const groupCount = (
    items,
    key
) => {

    const result =
        {};


    for (
        const item of
        items
    ) {

        const value =
            String(
                item?.[key] ||
                "Unknown"
            )
                .trim() ||
            "Unknown";


        result[value] =
            (
                result[value] ||
                0
            ) + 1;

    }


    return Object.fromEntries(

        Object.entries(
            result
        ).sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        )

    );

};


/*
|--------------------------------------------------------------------------
| NORMALIZE PRICE UNIT
|--------------------------------------------------------------------------
*/

const normalizePriceUnit = (
    medicine
) => {

    const existingPriceUnit =
        String(
            medicine.priceUnit ||
            ""
        )
            .trim()
            .toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | EXISTING PRICE UNIT
    |--------------------------------------------------------------------------
    */

    if (
        existingPriceUnit
    ) {

        return existingPriceUnit;

    }


    /*
    |--------------------------------------------------------------------------
    | PACK SIZE
    |--------------------------------------------------------------------------
    */

    const packSize =
        String(
            medicine.packSize ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        packSize.includes(
            "strip"
        )
    ) {

        return "strip";

    }


    if (
        packSize.includes(
            "bottle"
        )
    ) {

        return "bottle";

    }


    if (
        packSize.includes(
            "vial"
        )
    ) {

        return "vial";

    }


    if (
        packSize.includes(
            "ampoule"
        )
    ) {

        return "ampoule";

    }


    if (
        packSize.includes(
            "tube"
        )
    ) {

        return "tube";

    }


    if (
        packSize.includes(
            "sachet"
        )
    ) {

        return "sachet";

    }


    if (
        packSize.includes(
            "syringe"
        )
    ) {

        return "syringe";

    }


    if (
        packSize.includes(
            "spray"
        )
    ) {

        return "spray";

    }


    if (
        packSize.includes(
            "drop"
        )
    ) {

        return "drop";

    }


    if (
        packSize.includes(
            "inhaler"
        )
    ) {

        return "inhaler";

    }


    if (
        packSize.includes(
            "cartridge"
        )
    ) {

        return "cartridge";

    }


    if (
        packSize.includes(
            "jar"
        )
    ) {

        return "jar";

    }


    if (
        packSize.includes(
            "bag"
        )
    ) {

        return "bag";

    }


    if (
        packSize.includes(
            "pouch"
        )
    ) {

        return "pouch";

    }


    if (
        packSize.includes(
            "pack"
        )
    ) {

        return "pack";

    }


    /*
    |--------------------------------------------------------------------------
    | DOSAGE FORM FALLBACK
    |--------------------------------------------------------------------------
    */

    const dosageForm =
        String(
            medicine.dosageForm ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        dosageForm.includes(
            "tablet"
        ) &&
        packSize
    ) {

        return "tablet";

    }


    if (
        dosageForm.includes(
            "capsule"
        ) &&
        packSize
    ) {

        return "capsule";

    }


    if (
        dosageForm.includes(
            "suppository"
        ) &&
        packSize
    ) {

        return "suppository";

    }


    /*
    |--------------------------------------------------------------------------
    | UNKNOWN
    |--------------------------------------------------------------------------
    */

    return "unknown";

};


/*
|--------------------------------------------------------------------------
| NORMALIZE MEDICINE
|--------------------------------------------------------------------------
*/

const normalizeMedicine = (
    medicine
) => {

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    let price =
        Number(
            medicine.price ||
            0
        );


    if (
        Number.isNaN(
            price
        ) ||
        price <
            0
    ) {

        price =
            0;

    }


    /*
    |--------------------------------------------------------------------------
    | PACK SIZE
    |--------------------------------------------------------------------------
    */

    const packSize =
        String(
            medicine.packSize ||
            ""
        )
            .trim();


    /*
    |--------------------------------------------------------------------------
    | PRICE UNIT
    |--------------------------------------------------------------------------
    */

    const priceUnit =
        normalizePriceUnit({

            ...medicine,

            packSize,

        });


    /*
    |--------------------------------------------------------------------------
    | GENERIC NAME
    |--------------------------------------------------------------------------
    */

    const genericName =
        String(
            medicine.genericName ||
            ""
        )
            .trim() ||
        "Unknown";


    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    |
    | FORCE EVERY MEDICINE TO STOCK = 1000
    |--------------------------------------------------------------------------
    */

    const stock =
        1000;


    /*
    |--------------------------------------------------------------------------
    | REORDER LEVEL
    |--------------------------------------------------------------------------
    */

    let reorderLevel =
        Number(
            medicine.reorderLevel ??
            20
        );


    if (
        Number.isNaN(
            reorderLevel
        ) ||
        reorderLevel <
            0
    ) {

        reorderLevel =
            20;

    }


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return {

        ...medicine,


        /*
        |--------------------------------------------------------------------------
        | BASIC INFORMATION
        |--------------------------------------------------------------------------
        */

        code:
            String(
                medicine.code ||
                ""
            )
                .trim(),


        name:
            String(
                medicine.name ||
                ""
            )
                .trim(),


        genericName,


        strength:
            String(
                medicine.strength ||
                ""
            )
                .trim(),


        dosageForm:
            String(
                medicine.dosageForm ||
                "Tablet"
            )
                .trim(),


        sourceUrl:
            String(
                medicine.sourceUrl ||
                ""
            )
                .trim(),


        manufacturer:
            String(
                medicine.manufacturer ||
                ""
            )
                .trim(),


        category:
            String(
                medicine.category ||
                "Other"
            )
                .trim(),


        sourceBrandId:
            medicine.sourceBrandId ??
            null,


        sourceSlug:
            String(
                medicine.sourceSlug ||
                ""
            )
                .trim(),


        medicineType:
            String(
                medicine.medicineType ||
                ""
            )
                .trim(),


        /*
        |--------------------------------------------------------------------------
        | PRICING
        |--------------------------------------------------------------------------
        */

        price,

        packSize,

        priceUnit,


        /*
        |--------------------------------------------------------------------------
        | INVENTORY
        |--------------------------------------------------------------------------
        */

        stock,

        reorderLevel,


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescriptionRequired:
            Boolean(
                medicine.prescriptionRequired
            ),


        /*
        |--------------------------------------------------------------------------
        | PRODUCT INFORMATION
        |--------------------------------------------------------------------------
        */

        description:
            String(
                medicine.description ||
                ""
            )
                .trim(),


        usage:
            String(
                medicine.usage ||
                ""
            )
                .trim(),


        warnings:
            String(
                medicine.warnings ||
                ""
            )
                .trim(),


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        image: {

            url:
                String(
                    medicine.image?.url ||
                    ""
                )
                    .trim(),

            publicId:
                String(
                    medicine.image?.publicId ||
                    ""
                )
                    .trim(),

        },


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        status:

            medicine.status ===
            "inactive"

                ? "inactive"

                : "active",


        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        createdBy:
            medicine.createdBy ||
            null,


        updatedBy:
            medicine.updatedBy ||
            null,

    };

};


/*
|--------------------------------------------------------------------------
| VALIDATE MEDICINES
|--------------------------------------------------------------------------
*/

const validateMedicines = (
    medicines
) => {

    const errors =
        [];


    const codeSet =
        new Set();


    const duplicateCodes =
        [];


    const unknownPricing =
        [];


    const zeroPrice =
        [];


    const missingPackSize =
        [];


    const unknownGenericNames =
        [];


    medicines.forEach(
        (
            medicine,
            index
        ) => {

            /*
            |--------------------------------------------------------------------------
            | CODE
            |--------------------------------------------------------------------------
            */

            if (
                !medicine.code
            ) {

                errors.push({

                    index,

                    field:
                        "code",

                    message:
                        "Missing medicine code",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | NAME
            |--------------------------------------------------------------------------
            */

            if (
                !medicine.name
            ) {

                errors.push({

                    index,

                    code:
                        medicine.code,

                    field:
                        "name",

                    message:
                        "Missing medicine name",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | GENERIC NAME
            |--------------------------------------------------------------------------
            */

            if (
                !medicine.genericName
            ) {

                errors.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    field:
                        "genericName",

                    message:
                        "Missing generic name",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | UNKNOWN GENERIC NAME
            |--------------------------------------------------------------------------
            |
            | Allowed.
            |--------------------------------------------------------------------------
            */

            if (
                medicine.genericName ===
                "Unknown"
            ) {

                unknownGenericNames.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    strength:
                        medicine.strength,

                    dosageForm:
                        medicine.dosageForm,

                    sourceUrl:
                        medicine.sourceUrl,

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PRICE
            |--------------------------------------------------------------------------
            */

            if (
                medicine.price ===
                    undefined ||
                medicine.price ===
                    null ||
                Number.isNaN(
                    Number(
                        medicine.price
                    )
                ) ||
                Number(
                    medicine.price
                ) <
                    0
            ) {

                errors.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    field:
                        "price",

                    message:
                        "Invalid medicine price",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | ZERO PRICE
            |--------------------------------------------------------------------------
            |
            | Allowed.
            |--------------------------------------------------------------------------
            */

            if (
                Number(
                    medicine.price
                ) <=
                0
            ) {

                zeroPrice.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    dosageForm:
                        medicine.dosageForm,

                    price:
                        medicine.price,

                    packSize:
                        medicine.packSize,

                    priceUnit:
                        medicine.priceUnit,

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PRICE UNIT
            |--------------------------------------------------------------------------
            */

            if (
                !medicine.priceUnit
            ) {

                errors.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    field:
                        "priceUnit",

                    message:
                        "Missing priceUnit",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | UNKNOWN PRICING
            |--------------------------------------------------------------------------
            |
            | Allowed.
            |--------------------------------------------------------------------------
            */

            if (
                medicine.priceUnit ===
                "unknown"
            ) {

                unknownPricing.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    strength:
                        medicine.strength,

                    dosageForm:
                        medicine.dosageForm,

                    price:
                        medicine.price,

                    packSize:
                        medicine.packSize,

                    sourceUrl:
                        medicine.sourceUrl,

                });

            }


            /*
            |--------------------------------------------------------------------------
            | MISSING PACK SIZE
            |--------------------------------------------------------------------------
            |
            | Allowed.
            |--------------------------------------------------------------------------
            */

            if (
                !medicine.packSize
            ) {

                missingPackSize.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    dosageForm:
                        medicine.dosageForm,

                    price:
                        medicine.price,

                    priceUnit:
                        medicine.priceUnit,

                });

            }


            /*
            |--------------------------------------------------------------------------
            | STOCK CHECK
            |--------------------------------------------------------------------------
            */

            if (
                medicine.stock !==
                1000
            ) {

                errors.push({

                    index,

                    code:
                        medicine.code,

                    name:
                        medicine.name,

                    field:
                        "stock",

                    message:
                        "Stock must be 1000",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | DUPLICATE CODE
            |--------------------------------------------------------------------------
            */

            if (
                medicine.code
            ) {

                if (
                    codeSet.has(
                        medicine.code
                    )
                ) {

                    duplicateCodes.push(
                        medicine.code
                    );

                }


                codeSet.add(
                    medicine.code
                );

            }

        }
    );


    return {

        valid:

            errors.length ===
                0 &&

            duplicateCodes.length ===
                0,


        errors,


        duplicateCodes:

            [
                ...new Set(
                    duplicateCodes
                ),
            ],


        unknownPricing,

        zeroPrice,

        missingPackSize,

        unknownGenericNames,

    };

};


/*
|--------------------------------------------------------------------------
| INSERT MEDICINES IN BATCHES
|--------------------------------------------------------------------------
*/

const insertMedicines =
    async (
        medicines
    ) => {

        let totalInserted =
            0;


        let batchNumber =
            0;


        for (
            let index = 0;
            index <
            medicines.length;
            index +=
                BATCH_SIZE
        ) {

            batchNumber++;


            const batch =
                medicines.slice(
                    index,
                    index +
                        BATCH_SIZE
                );


            const inserted =
                await Medicine
                    .insertMany(
                        batch,
                        {
                            ordered:
                                true,
                        }
                    );


            totalInserted +=
                inserted.length;


            console.log(

                "\x1b[32m%s\x1b[0m",

                `✓ Batch ${batchNumber} | ${inserted.length} inserted | ${totalInserted}/${medicines.length}`

            );

        }


        return {

            totalInserted,

            batches:
                batchNumber,

        };

};


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

handler.get(
    async (
        req,
        res
    ) => {

        const startedAt =
            Date.now();


        try {

            /*
            |--------------------------------------------------------------------------
            | CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            console.log(
                "\n"
            );


            console.log(
                "\x1b[36m%s\x1b[0m",
                "Connecting database..."
            );


            await db.connect();


            console.log(
                "\x1b[32m%s\x1b[0m",
                "Database connected"
            );


            /*
            |--------------------------------------------------------------------------
            | CHECK INPUT FILE
            |--------------------------------------------------------------------------
            */

            if (
                !fs.existsSync(
                    INPUT_FILE
                )
            ) {

                return res
                    .status(
                        404
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Medicine JSON file not found",

                        file:
                            INPUT_FILE,

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | READ JSON FILE
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[36m%s\x1b[0m",
                "Reading medicine JSON..."
            );


            const fileContent =
                fs.readFileSync(
                    INPUT_FILE,
                    "utf8"
                );


            const rawMedicines =
                JSON.parse(
                    fileContent
                );


            /*
            |--------------------------------------------------------------------------
            | ARRAY CHECK
            |--------------------------------------------------------------------------
            */

            if (
                !Array.isArray(
                    rawMedicines
                )
            ) {

                return res
                    .status(
                        400
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Medicine JSON must be an array",

                    });

            }


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Source medicines: ${rawMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE MEDICINES
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[36m%s\x1b[0m",
                "Normalizing medicine data..."
            );


            const medicines =
                rawMedicines.map(
                    (
                        medicine
                    ) =>
                        normalizeMedicine(
                            medicine
                        )
                );


            console.log(
                "\x1b[32m%s\x1b[0m",
                `Normalized medicines: ${medicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MEDICINES
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[36m%s\x1b[0m",
                "Validating medicine data..."
            );


            const validation =
                validateMedicines(
                    medicines
                );


            /*
            |--------------------------------------------------------------------------
            | VALIDATION STATISTICS
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[33m%s\x1b[0m",
                `Validation errors: ${validation.errors.length}`
            );


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Duplicate codes: ${validation.duplicateCodes.length}`
            );


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Unknown pricing: ${validation.unknownPricing.length}`
            );


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Zero price: ${validation.zeroPrice.length}`
            );


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Missing pack size: ${validation.missingPackSize.length}`
            );


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Unknown generic names: ${validation.unknownGenericNames.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | VALIDATION FAILED
            |--------------------------------------------------------------------------
            */

            if (
                !validation.valid
            ) {

                console.log(
                    "\x1b[31m%s\x1b[0m",
                    "Validation failed"
                );


                console.log(
                    validation
                        .errors
                        .slice(
                            0,
                            50
                        )
                );


                return res
                    .status(
                        400
                    )
                    .json({

                        success:
                            false,

                        message:
                            "JSON validation failed. Old medicines were NOT deleted.",


                        statistics: {

                            totalSource:
                                medicines.length,

                            validationErrors:
                                validation
                                    .errors
                                    .length,

                            duplicateCodes:
                                validation
                                    .duplicateCodes
                                    .length,

                            unknownPricing:
                                validation
                                    .unknownPricing
                                    .length,

                            zeroPrice:
                                validation
                                    .zeroPrice
                                    .length,

                            missingPackSize:
                                validation
                                    .missingPackSize
                                    .length,

                            unknownGenericNames:
                                validation
                                    .unknownGenericNames
                                    .length,

                        },


                        errors:

                            validation
                                .errors
                                .slice(
                                    0,
                                    100
                                ),


                        duplicateCodes:

                            validation
                                .duplicateCodes
                                .slice(
                                    0,
                                    100
                                ),


                        unknownPricing:

                            validation
                                .unknownPricing
                                .slice(
                                    0,
                                    100
                                ),


                        unknownGenericNames:

                            validation
                                .unknownGenericNames
                                .slice(
                                    0,
                                    100
                                ),

                    });

            }


            console.log(
                "\x1b[32m%s\x1b[0m",
                "JSON validation passed"
            );


            /*
            |--------------------------------------------------------------------------
            | EXISTING DATABASE COUNT
            |--------------------------------------------------------------------------
            */

            const oldCount =
                await Medicine
                    .countDocuments();


            console.log(
                "\x1b[33m%s\x1b[0m",
                `Old medicines: ${oldCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | DELETE OLD DATABASE
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[31m%s\x1b[0m",
                "Deleting old medicines..."
            );


            const deleteResult =
                await Medicine
                    .deleteMany(
                        {}
                    );


            console.log(
                "\x1b[32m%s\x1b[0m",
                `Deleted medicines: ${deleteResult.deletedCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | INSERT MEDICINES
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[36m%s\x1b[0m",
                "Starting medicine import..."
            );


            const insertResult =
                await insertMedicines(
                    medicines
                );


            /*
            |--------------------------------------------------------------------------
            | FETCH EVERYTHING FROM DATABASE
            |--------------------------------------------------------------------------
            */

            console.log(
                "\x1b[36m%s\x1b[0m",
                "Fetching medicines from database..."
            );


            const databaseMedicines =
                await Medicine
                    .find(
                        {}
                    )
                    .sort({

                        name:
                            1,

                        strength:
                            1,

                        packSize:
                            1,

                    })
                    .lean();


            console.log(
                "\x1b[32m%s\x1b[0m",
                `Database medicines: ${databaseMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | CREATE OUTPUT DIRECTORY
            |--------------------------------------------------------------------------
            */

            const outputDirectory =
                path.dirname(
                    OUTPUT_FILE
                );


            if (
                !fs.existsSync(
                    outputDirectory
                )
            ) {

                fs.mkdirSync(
                    outputDirectory,
                    {
                        recursive:
                            true,
                    }
                );

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE DATABASE EXPORT JSON
            |--------------------------------------------------------------------------
            */

            fs.writeFileSync(

                OUTPUT_FILE,

                JSON.stringify(
                    databaseMedicines,
                    null,
                    2
                ),

                "utf8"

            );


            console.log(
                "\x1b[32m%s\x1b[0m",
                `Database export created: ${OUTPUT_FILE}`
            );


            /*
            |--------------------------------------------------------------------------
            | TOTAL DATABASE RECORDS
            |--------------------------------------------------------------------------
            */

            const total =
                databaseMedicines
                    .length;


            /*
            |--------------------------------------------------------------------------
            | PRICE STATISTICS
            |--------------------------------------------------------------------------
            */

            const withPrice =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            Number(
                                medicine.price
                            ) >
                            0
                    )
                    .length;


            const withoutPrice =
                total -
                withPrice;


            const unknownPriceUnit =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            medicine.priceUnit ===
                            "unknown"
                    )
                    .length;


            /*
            |--------------------------------------------------------------------------
            | PACK SIZE STATISTICS
            |--------------------------------------------------------------------------
            */

            const withPackSize =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            Boolean(
                                medicine.packSize
                            )
                    )
                    .length;


            const withoutPackSize =
                total -
                withPackSize;


            /*
            |--------------------------------------------------------------------------
            | GENERIC NAME STATISTICS
            |--------------------------------------------------------------------------
            */

            const unknownGenericNames =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            medicine.genericName ===
                            "Unknown"
                    )
                    .length;


            /*
            |--------------------------------------------------------------------------
            | IMAGE STATISTICS
            |--------------------------------------------------------------------------
            */

            const withImage =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            Boolean(
                                medicine.image?.url
                            )
                    )
                    .length;


            const withoutImage =
                total -
                withImage;


            /*
            |--------------------------------------------------------------------------
            | INVENTORY STATISTICS
            |--------------------------------------------------------------------------
            */

            const inStock =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            Number(
                                medicine.stock
                            ) >
                            0
                    )
                    .length;


            const outOfStock =
                total -
                inStock;


            /*
            |--------------------------------------------------------------------------
            | STOCK = 1000 CHECK
            |--------------------------------------------------------------------------
            */

            const stock1000 =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            Number(
                                medicine.stock
                            ) ===
                            1000
                    )
                    .length;


            const incorrectStock =
                total -
                stock1000;


            /*
            |--------------------------------------------------------------------------
            | UNIQUE BRAND NAMES
            |--------------------------------------------------------------------------
            */

            const uniqueBrandNames =
                new Set(

                    databaseMedicines
                        .map(
                            (
                                medicine
                            ) =>
                                medicine.name
                        )
                        .filter(
                            Boolean
                        )

                ).size;


            /*
            |--------------------------------------------------------------------------
            | UNIQUE SOURCE BRANDS
            |--------------------------------------------------------------------------
            */

            const uniqueSourceBrands =
                new Set(

                    databaseMedicines
                        .map(
                            (
                                medicine
                            ) =>
                                medicine.sourceBrandId
                        )
                        .filter(
                            (
                                value
                            ) =>
                                value !==
                                    null &&
                                value !==
                                    undefined
                        )

                ).size;


            /*
            |--------------------------------------------------------------------------
            | UNIQUE GENERICS
            |--------------------------------------------------------------------------
            */

            const uniqueGenerics =
                new Set(

                    databaseMedicines
                        .map(
                            (
                                medicine
                            ) =>
                                medicine.genericName
                        )
                        .filter(
                            Boolean
                        )

                ).size;


            /*
            |--------------------------------------------------------------------------
            | UNIQUE MANUFACTURERS
            |--------------------------------------------------------------------------
            */

            const uniqueManufacturers =
                new Set(

                    databaseMedicines
                        .map(
                            (
                                medicine
                            ) =>
                                medicine.manufacturer
                        )
                        .filter(
                            Boolean
                        )

                ).size;


            /*
            |--------------------------------------------------------------------------
            | GROUP BY SOURCE BRAND
            |--------------------------------------------------------------------------
            */

            const sourceBrandMap =
                {};


            for (
                const medicine of
                databaseMedicines
            ) {

                const sourceBrandId =
                    medicine.sourceBrandId;


                if (
                    sourceBrandId ===
                        undefined ||
                    sourceBrandId ===
                        null
                ) {

                    continue;

                }


                if (
                    !sourceBrandMap[
                        sourceBrandId
                    ]
                ) {

                    sourceBrandMap[
                        sourceBrandId
                    ] =
                        [];

                }


                sourceBrandMap[
                    sourceBrandId
                ].push(
                    medicine
                );

            }


            /*
            |--------------------------------------------------------------------------
            | MULTI VARIANT PRODUCTS
            |--------------------------------------------------------------------------
            */

            const multiVariantBrands =
                Object.values(
                    sourceBrandMap
                )
                    .filter(
                        (
                            variants
                        ) =>
                            variants.length >
                            1
                    );


            /*
            |--------------------------------------------------------------------------
            | MULTI VARIANT EXAMPLES
            |--------------------------------------------------------------------------
            */

            const multiVariantExamples =
                multiVariantBrands
                    .slice(
                        0,
                        10
                    )
                    .map(
                        (
                            variants
                        ) => ({

                            name:
                                variants[0]
                                    ?.name,

                            sourceBrandId:
                                variants[0]
                                    ?.sourceBrandId,

                            variants:

                                variants.map(
                                    (
                                        variant
                                    ) => ({

                                        code:
                                            variant.code,

                                        strength:
                                            variant.strength,

                                        dosageForm:
                                            variant.dosageForm,

                                        price:
                                            variant.price,

                                        packSize:
                                            variant.packSize,

                                        priceUnit:
                                            variant.priceUnit,

                                        stock:
                                            variant.stock,

                                    })
                                ),

                        })
                    );


            /*
            |--------------------------------------------------------------------------
            | NAPA CHECK
            |--------------------------------------------------------------------------
            */

            const napaVariants =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            medicine.sourceBrandId ===
                            10452
                    )
                    .map(
                        (
                            medicine
                        ) => ({

                            code:
                                medicine.code,

                            name:
                                medicine.name,

                            genericName:
                                medicine.genericName,

                            strength:
                                medicine.strength,

                            dosageForm:
                                medicine.dosageForm,

                            price:
                                medicine.price,

                            packSize:
                                medicine.packSize,

                            priceUnit:
                                medicine.priceUnit,

                            stock:
                                medicine.stock,

                        })
                    );


            /*
            |--------------------------------------------------------------------------
            | BEXTRAM GOLD CHECK
            |--------------------------------------------------------------------------
            */

            const bextramGoldVariants =
                databaseMedicines
                    .filter(
                        (
                            medicine
                        ) =>
                            medicine.sourceBrandId ===
                            14090
                    )
                    .map(
                        (
                            medicine
                        ) => ({

                            code:
                                medicine.code,

                            name:
                                medicine.name,

                            genericName:
                                medicine.genericName,

                            price:
                                medicine.price,

                            packSize:
                                medicine.packSize,

                            priceUnit:
                                medicine.priceUnit,

                            stock:
                                medicine.stock,

                        })
                    );


            /*
            |--------------------------------------------------------------------------
            | DURATION
            |--------------------------------------------------------------------------
            */

            const durationMs =
                Date.now() -
                startedAt;


            const durationSeconds =
                Number(
                    (
                        durationMs /
                        1000
                    ).toFixed(
                        2
                    )
                );


            /*
            |--------------------------------------------------------------------------
            | CONSOLE SUMMARY
            |--------------------------------------------------------------------------
            */

            console.log(
                "\n"
            );


            console.log(
                "\x1b[32m%s\x1b[0m",
                "=========================================="
            );


            console.log(
                "\x1b[32m%s\x1b[0m",
                "MEDICINE IMPORT COMPLETED"
            );


            console.log(
                "\x1b[32m%s\x1b[0m",
                "=========================================="
            );


            console.log(
                `Source records: ${medicines.length}`
            );


            console.log(
                `Old records: ${oldCount}`
            );


            console.log(
                `Deleted: ${deleteResult.deletedCount}`
            );


            console.log(
                `Inserted: ${insertResult.totalInserted}`
            );


            console.log(
                `Database records: ${databaseMedicines.length}`
            );


            console.log(
                `Stock = 1000: ${stock1000}`
            );


            console.log(
                `Incorrect stock: ${incorrectStock}`
            );


            console.log(
                `Unknown pricing: ${unknownPriceUnit}`
            );


            console.log(
                `Unknown generic names: ${unknownGenericNames}`
            );


            console.log(
                `Duration: ${durationSeconds} seconds`
            );


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    message:
                        "Medicine database imported successfully",


                    /*
                    |--------------------------------------------------------------------------
                    | IMPORT
                    |--------------------------------------------------------------------------
                    */

                    import: {

                        sourceRecords:
                            medicines.length,

                        previousDatabaseRecords:
                            oldCount,

                        deleted:
                            deleteResult
                                .deletedCount,

                        inserted:
                            insertResult
                                .totalInserted,

                        batches:
                            insertResult
                                .batches,

                        batchSize:
                            BATCH_SIZE,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | DATABASE
                    |--------------------------------------------------------------------------
                    */

                    database: {

                        total,

                        uniqueBrandNames,

                        uniqueSourceBrands,

                        uniqueGenerics,

                        uniqueManufacturers,

                        multiVariantBrands:
                            multiVariantBrands
                                .length,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | PRICING
                    |--------------------------------------------------------------------------
                    */

                    pricing: {

                        withPrice,

                        withoutPrice,

                        unknownPriceUnit,

                        withPackSize,

                        withoutPackSize,

                        byPriceUnit:

                            groupCount(
                                databaseMedicines,
                                "priceUnit"
                            ),

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | INVENTORY
                    |--------------------------------------------------------------------------
                    */

                    inventory: {

                        defaultStock:
                            1000,

                        inStock,

                        outOfStock,

                        stock1000,

                        incorrectStock,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | GENERIC
                    |--------------------------------------------------------------------------
                    */

                    generic: {

                        unknown:
                            unknownGenericNames,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | DOSAGE FORMS
                    |--------------------------------------------------------------------------
                    */

                    dosageForms:

                        groupCount(
                            databaseMedicines,
                            "dosageForm"
                        ),


                    /*
                    |--------------------------------------------------------------------------
                    | IMAGES
                    |--------------------------------------------------------------------------
                    */

                    images: {

                        withImage,

                        withoutImage,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | STATUS
                    |--------------------------------------------------------------------------
                    */

                    status:

                        groupCount(
                            databaseMedicines,
                            "status"
                        ),


                    /*
                    |--------------------------------------------------------------------------
                    | SPECIAL CHECKS
                    |--------------------------------------------------------------------------
                    */

                    checks: {

                        napa:
                            napaVariants,

                        bextramGold:
                            bextramGoldVariants,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | MULTI VARIANT EXAMPLES
                    |--------------------------------------------------------------------------
                    */

                    multiVariantExamples,


                    /*
                    |--------------------------------------------------------------------------
                    | EXPORT
                    |--------------------------------------------------------------------------
                    */

                    export: {

                        created:
                            true,

                        file:
                            path.basename(
                                OUTPUT_FILE
                            ),

                        path:
                            OUTPUT_FILE,

                        records:
                            databaseMedicines
                                .length,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | SOURCE WARNINGS
                    |--------------------------------------------------------------------------
                    */

                    validation: {

                        unknownPricing:
                            validation
                                .unknownPricing
                                .length,

                        zeroPrice:
                            validation
                                .zeroPrice
                                .length,

                        missingPackSize:
                            validation
                                .missingPackSize
                                .length,

                        unknownGenericNames:
                            validation
                                .unknownGenericNames
                                .length,

                    },


                    /*
                    |--------------------------------------------------------------------------
                    | PERFORMANCE
                    |--------------------------------------------------------------------------
                    */

                    performance: {

                        durationMs,

                        durationSeconds,

                    },

                });

        }
        catch (
            error
        ) {

            console.log(
                "\x1b[31m%s\x1b[0m",
                "Medicine import failed"
            );


            console.error(
                error
            );


            return res
                .status(
                    500
                )
                .json({

                    success:
                        false,

                    message:
                        error.message ||
                        "Medicine import failed",

                    error:

                        process.env.NODE_ENV ===
                        "development"

                            ? error.stack

                            : undefined,

                });

        }

    }
);


export default handler;