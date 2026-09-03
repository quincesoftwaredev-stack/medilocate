import fs from "fs";
import path from "path";

import nextConnect from "next-connect";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const hasText = (
    value
) => {

    return (
        typeof value ===
            "string" &&
        value.trim() !==
            ""
    );

};


const hasNumber = (
    value
) => {

    return (
        typeof value ===
            "number" &&
        Number.isFinite(
            value
        ) &&
        value >
            0
    );

};


const hasArray = (
    value
) => {

    return (
        Array.isArray(
            value
        ) &&
        value.length >
            0
    );

};


/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

const getStatistics = (
    results
) => {

    const total =
        results.length;


    const countField = (
        checker
    ) => {

        const found =
            results.filter(
                checker
            )
                .length;


        const missing =
            total -
            found;


        const percentage =
            total
                ? Number(
                    (
                        (
                            found /
                            total
                        ) *
                        100
                    )
                        .toFixed(
                            2
                        )
                )
                : 0;


        return {

            found,

            missing,

            percentage,

        };

    };


    const successful =
        results.filter(
            (
                item
            ) =>
                item.success !==
                false
        )
            .length;


    const failed =
        results.filter(
            (
                item
            ) =>
                item.success ===
                false
        )
            .length;


    return {

        total,

        successful,

        failed,


        /*
        |--------------------------------------------------------------------------
        | BASIC INFORMATION
        |--------------------------------------------------------------------------
        */

        brandName:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.brandName
                    )
            ),


        genericName:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.genericName
                    )
            ),


        strength:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.strength
                    )
            ),


        dosageForm:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.dosageForm
                    )
            ),


        manufacturer:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.manufacturer
                    )
            ),


        type:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.type
                    )
            ),


        slug:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.slug
                    )
            ),


        /*
        |--------------------------------------------------------------------------
        | PRICE
        |--------------------------------------------------------------------------
        */

        price:
            countField(
                (
                    item
                ) =>
                    hasNumber(
                        item.price
                    )
            ),


        unitPrice:
            countField(
                (
                    item
                ) =>
                    hasNumber(
                        item.unitPrice
                    )
            ),


        stripPrice:
            countField(
                (
                    item
                ) =>
                    hasNumber(
                        item.stripPrice
                    )
            ),


        priceType:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.priceType
                    )
            ),


        packages:
            countField(
                (
                    item
                ) =>
                    hasArray(
                        item.packages
                    )
            ),


        packageContainer:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.packageContainer
                    )
            ),


        packageSize:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.packageSize
                    )
            ),


        /*
        |--------------------------------------------------------------------------
        | IMAGES
        |--------------------------------------------------------------------------
        */

        image:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.image
                    )
            ),


        realPackImage:
            countField(
                (
                    item
                ) =>
                    hasArray(
                        item.images
                    )
            ),


        dosageFormImage:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.dosageFormImage
                    )
            ),


        /*
        |--------------------------------------------------------------------------
        | EXTRA INFORMATION
        |--------------------------------------------------------------------------
        */

        composition:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.composition
                    )
            ),


        therapeuticClass:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.therapeuticClass
                    )
            ),


        storageConditions:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.storageConditions
                    )
            ),


        availableAs:
            countField(
                (
                    item
                ) =>
                    hasArray(
                        item.availableAs
                    )
            ),


        /*
        |--------------------------------------------------------------------------
        | CHEMICAL
        |--------------------------------------------------------------------------
        */

        molecularFormula:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item?.chemical
                            ?.molecularFormula
                    )
            ),


        chemicalStructureImage:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item?.chemical
                            ?.structureImage
                    )
            ),


        /*
        |--------------------------------------------------------------------------
        | SOURCE
        |--------------------------------------------------------------------------
        */

        sourceUrl:
            countField(
                (
                    item
                ) =>
                    hasText(
                        item.sourceUrl
                    )
            ),

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

        try {

            const filePath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medex-output2.json"
                );


            if (
                !fs.existsSync(
                    filePath
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
                            "medex-output.json not found",

                    });

            }


            const raw =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );


            const results =
                JSON.parse(
                    raw
                );


            if (
                !Array.isArray(
                    results
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
                            "medex-output.json must contain an array",

                    });

            }


            const statistics =
                getStatistics(
                    results
                );


            /*
            |--------------------------------------------------------------------------
            | CONSOLE
            |--------------------------------------------------------------------------
            */

            console.log(
                ""
            );

            console.log(
                "============================================================"
            );

            console.log(
                "MEDEX OUTPUT STATISTICS"
            );

            console.log(
                "============================================================"
            );

            console.log(
                `Total: ${statistics.total}`
            );

            console.log(
                `Successful: ${statistics.successful}`
            );

            console.log(
                `Failed: ${statistics.failed}`
            );

            console.log(
                ""
            );


            const logStat = (
                label,
                stat
            ) => {

                console.log(
                    `${label.padEnd(
                        26
                    )} ${stat.found}/${statistics.total} (${stat.percentage}%) | Missing: ${stat.missing}`
                );

            };


            logStat(
                "Brand Name",
                statistics.brandName
            );

            logStat(
                "Generic Name",
                statistics.genericName
            );

            logStat(
                "Strength",
                statistics.strength
            );

            logStat(
                "Dosage Form",
                statistics.dosageForm
            );

            logStat(
                "Manufacturer",
                statistics.manufacturer
            );

            console.log(
                ""
            );

            logStat(
                "Price",
                statistics.price
            );

            logStat(
                "Unit Price",
                statistics.unitPrice
            );

            logStat(
                "Strip Price",
                statistics.stripPrice
            );

            logStat(
                "Packages",
                statistics.packages
            );

            console.log(
                ""
            );

            logStat(
                "Main Image",
                statistics.image
            );

            logStat(
                "Real Pack Image",
                statistics.realPackImage
            );

            logStat(
                "Dosage Form Image",
                statistics.dosageFormImage
            );

            console.log(
                ""
            );

            logStat(
                "Composition",
                statistics.composition
            );

            logStat(
                "Therapeutic Class",
                statistics.therapeuticClass
            );

            logStat(
                "Storage Conditions",
                statistics.storageConditions
            );

            logStat(
                "Available As",
                statistics.availableAs
            );

            console.log(
                ""
            );

            logStat(
                "Molecular Formula",
                statistics.molecularFormula
            );

            logStat(
                "Chemical Image",
                statistics.chemicalStructureImage
            );

            logStat(
                "Source URL",
                statistics.sourceUrl
            );


            console.log(
                "============================================================"
            );

            console.log(
                ""
            );


            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    statistics,

                });


        } catch (
            error
        ) {

            console.error(
                "MedEx statistics error:",
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
                        error.message,

                });

        }

    }
);


export default handler;