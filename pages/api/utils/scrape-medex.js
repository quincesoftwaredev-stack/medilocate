import fs from "fs";
import path from "path";

import axios from "axios";
import * as cheerio from "cheerio";

import nextConnect from "next-connect";


const handler =
    nextConnect();


const BASE_URL =
    "https://medex.com.bd";


/*
|--------------------------------------------------------------------------
| CONCURRENCY
|--------------------------------------------------------------------------
|
| Each batch is processed using Promise.all().
|
| 20 = 20 MedEx pages simultaneously.
|
| You can try 30 later if it remains stable.
|--------------------------------------------------------------------------
*/

const CONCURRENCY =
    50;


const REQUEST_TIMEOUT =
    20000;


const MAX_RETRIES =
    2;


/*
|--------------------------------------------------------------------------
| CLEAN TEXT
|--------------------------------------------------------------------------
*/

const cleanText = (
    value
) => {

    return String(
        value ??
        ""
    )
        .replace(
            /\u00a0/g,
            " "
        )
        .replace(
            /\r/g,
            "\n"
        )
        .replace(
            /[ \t]+/g,
            " "
        )
        .trim();

};


/*
|--------------------------------------------------------------------------
| NORMALIZE LINE
|--------------------------------------------------------------------------
*/

const normalizeLine = (
    value
) => {

    return cleanText(
        value
    )
        .replace(
            /\s+/g,
            " "
        )
        .replace(
            /:$/,
            ""
        )
        .trim()
        .toLowerCase();

};


/*
|--------------------------------------------------------------------------
| ABSOLUTE URL
|--------------------------------------------------------------------------
*/

const absoluteUrl = (
    value
) => {

    if (
        !value
    ) {

        return "";

    }


    try {

        return new URL(
            value,
            BASE_URL
        ).href;

    } catch (
        error
    ) {

        return "";

    }

};


/*
|--------------------------------------------------------------------------
| VALID IMAGE EXTENSION
|--------------------------------------------------------------------------
*/

const looksLikeImage = (
    value
) => {

    if (
        !value
    ) {

        return false;

    }


    const lower =
        String(
            value
        )
            .toLowerCase()
            .split(
                "?"
            )[0];


    return (
        lower.endsWith(
            ".jpg"
        ) ||
        lower.endsWith(
            ".jpeg"
        ) ||
        lower.endsWith(
            ".png"
        ) ||
        lower.endsWith(
            ".webp"
        ) ||
        lower.endsWith(
            ".gif"
        ) ||
        lower.endsWith(
            ".svg"
        )
    );

};


/*
|--------------------------------------------------------------------------
| BODY LINES
|--------------------------------------------------------------------------
*/

const getBodyLines = (
    $
) => {

    return $("body")
        .text()
        .replace(
            /\r/g,
            "\n"
        )
        .split(
            /\n+/
        )
        .map(
            (
                item
            ) =>
                cleanText(
                    item
                )
        )
        .filter(
            (
                item
            ) =>
                item.length >
                0
        );

};


/*
|--------------------------------------------------------------------------
| SECTION HEADINGS
|--------------------------------------------------------------------------
*/

const SECTION_HEADINGS = [

    "Indications",

    "Composition",

    "Description",

    "Pharmacology",

    "Mechanism of Action",

    "Dosage",

    "Dosage & Administration",

    "Administration",

    "Interaction",

    "Drug Interaction",

    "Contraindications",

    "Side Effects",

    "Pregnancy & Lactation",

    "Pregnancy and Lactation",

    "Precautions & Warnings",

    "Precautions",

    "Warnings",

    "Use in Special Populations",

    "Overdose Effects",

    "Overdose",

    "Therapeutic Class",

    "Storage Conditions",

    "Storage Condition",

    "Storage",

    "Chemical Structure",

    "Common Questions",

    "Frequently Asked Questions",

    "FAQ",

    "Also Available As",

];


const normalizedSectionHeadings =
    SECTION_HEADINGS.map(
        (
            item
        ) =>
            normalizeLine(
                item
            )
    );


/*
|--------------------------------------------------------------------------
| GET SECTION TEXT FROM BODY
|--------------------------------------------------------------------------
|
| This doesn't depend on direct sibling HTML structure.
|--------------------------------------------------------------------------
*/

const getSectionText = (
    $,
    titles
) => {

    const searchTitles =
        (
            Array.isArray(
                titles
            )
                ? titles
                : [
                    titles,
                ]
        )
            .map(
                (
                    item
                ) =>
                    normalizeLine(
                        item
                    )
            );


    const lines =
        getBodyLines(
            $
        );


    let start =
        -1;


    /*
    |--------------------------------------------------------------------------
    | FIND HEADING
    |--------------------------------------------------------------------------
    */

    for (
        let i = 0;
        i <
        lines.length;
        i++
    ) {

        const current =
            normalizeLine(
                lines[i]
            );


        if (
            searchTitles.includes(
                current
            )
        ) {

            start =
                i;

            break;

        }

    }


    if (
        start ===
        -1
    ) {

        return "";

    }


    /*
    |--------------------------------------------------------------------------
    | COLLECT UNTIL NEXT SECTION
    |--------------------------------------------------------------------------
    */

    const result =
        [];


    for (
        let i =
            start +
            1;
        i <
        lines.length;
        i++
    ) {

        const line =
            lines[i];


        const normalized =
            normalizeLine(
                line
            );


        if (
            normalizedSectionHeadings.includes(
                normalized
            )
        ) {

            break;

        }


        /*
         * Avoid grabbing footer/navigation.
         */

        if (
            normalized ===
                "disclaimer" ||
            normalized ===
                "share" ||
            normalized ===
                "related brands"
        ) {

            break;

        }


        result.push(
            line
        );


        /*
         * Safety against accidentally collecting
         * an entire page.
         */

        if (
            result.length >
            100
        ) {

            break;

        }

    }


    return cleanText(
        result.join(
            " "
        )
    );

};


/*
|--------------------------------------------------------------------------
| PACK IMAGES
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| MedEx often provides the actual pack image as:
|
| <a href="/storage/images/packaging/...">
|
| instead of only <img src="">
|--------------------------------------------------------------------------
*/

const getPackImages = (
    $
) => {

    const images =
        [];


    const addImage = (
        value
    ) => {

        if (
            !value
        ) {

            return;

        }


        const url =
            absoluteUrl(
                value
            );


        if (
            !url
        ) {

            return;

        }


        const lower =
            url.toLowerCase();


        const isPackImage =

            lower.includes(
                "/storage/images/packaging/"
            ) ||

            lower.includes(
                "/images/packaging/"
            ) ||

            lower.includes(
                "/packaging/"
            );


        if (
            !isPackImage
        ) {

            return;

        }


        if (
            !looksLikeImage(
                url
            )
        ) {

            return;

        }


        if (
            !images.includes(
                url
            )
        ) {

            images.push(
                url
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | ANCHOR HREF
    |--------------------------------------------------------------------------
    */

    $("a[href]")
        .each(
            (
                index,
                element
            ) => {

                addImage(
                    $(element)
                        .attr(
                            "href"
                        )
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | IMAGE ATTRIBUTES
    |--------------------------------------------------------------------------
    */

    $("img")
        .each(
            (
                index,
                element
            ) => {

                const attributes = [

                    "src",

                    "data-src",

                    "data-original",

                    "data-lazy-src",

                    "data-image",

                ];


                for (
                    const attribute of
                    attributes
                ) {

                    addImage(
                        $(element)
                            .attr(
                                attribute
                            )
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | SRCSET
    |--------------------------------------------------------------------------
    */

    $("[srcset]")
        .each(
            (
                index,
                element
            ) => {

                const srcset =
                    $(element)
                        .attr(
                            "srcset"
                        );


                if (
                    !srcset
                ) {

                    return;

                }


                const urls =
                    srcset
                        .split(
                            ","
                        )
                        .map(
                            (
                                value
                            ) =>
                                value
                                    .trim()
                                    .split(
                                        /\s+/
                                    )[0]
                        );


                for (
                    const url of
                    urls
                ) {

                    addImage(
                        url
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | INLINE STYLE
    |--------------------------------------------------------------------------
    */

    $("[style]")
        .each(
            (
                index,
                element
            ) => {

                const style =
                    $(element)
                        .attr(
                            "style"
                        );


                if (
                    !style
                ) {

                    return;

                }


                const regex =
                    /url\(["']?([^"')]+)["']?\)/gi;


                let match;


                while (
                    (
                        match =
                            regex.exec(
                                style
                            )
                    ) !==
                    null
                ) {

                    addImage(
                        match[1]
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | RAW HTML
    |--------------------------------------------------------------------------
    |
    | Most robust fallback if Cheerio doesn't expose
    | the value through an expected attribute.
    |--------------------------------------------------------------------------
    */

    const html =
        $.html();


    const regex =
        /(?:https?:\/\/(?:www\.)?medex\.com\.bd)?\/storage\/images\/packaging\/[^"'<>\\\s]+?\.(?:jpg|jpeg|png|webp|gif)/gi;


    let match;


    while (
        (
            match =
                regex.exec(
                    html
                )
        ) !==
        null
    ) {

        addImage(
            match[0]
        );

    }


    return images;

};


/*
|--------------------------------------------------------------------------
| DOSAGE FORM IMAGE
|--------------------------------------------------------------------------
*/

const getDosageFormImage = (
    $
) => {

    const candidates =
        [];


    const addCandidate = (
        value
    ) => {

        if (
            !value
        ) {

            return;

        }


        const url =
            absoluteUrl(
                value
            );


        if (
            !url
        ) {

            return;

        }


        const lower =
            url.toLowerCase();


        if (
            lower.includes(
                "/img/dosage-forms/"
            ) ||
            lower.includes(
                "/images/dosage-forms/"
            ) ||
            lower.includes(
                "dosage-form"
            )
        ) {

            if (
                !candidates.includes(
                    url
                )
            ) {

                candidates.push(
                    url
                );

            }

        }

    };


    /*
    |--------------------------------------------------------------------------
    | LINKS
    |--------------------------------------------------------------------------
    */

    $("a[href]")
        .each(
            (
                index,
                element
            ) => {

                addCandidate(
                    $(element)
                        .attr(
                            "href"
                        )
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | IMG
    |--------------------------------------------------------------------------
    */

    $("img")
        .each(
            (
                index,
                element
            ) => {

                addCandidate(
                    $(element)
                        .attr(
                            "src"
                        )
                );


                addCandidate(
                    $(element)
                        .attr(
                            "data-src"
                        )
                );


                addCandidate(
                    $(element)
                        .attr(
                            "data-original"
                        )
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | RAW HTML
    |--------------------------------------------------------------------------
    */

    const html =
        $.html();


    const regex =
        /(?:https?:\/\/(?:www\.)?medex\.com\.bd)?\/img\/dosage-forms\/[^"'<>\\\s]+?\.(?:jpg|jpeg|png|webp|svg)/gi;


    let match;


    while (
        (
            match =
                regex.exec(
                    html
                )
        ) !==
        null
    ) {

        addCandidate(
            match[0]
        );

    }


    return candidates[0] ||
        "";

};


/*
|--------------------------------------------------------------------------
| AVAILABLE AS
|--------------------------------------------------------------------------
*/

const getAvailableAs = (
    $,
    currentUrl
) => {

    const result =
        [];


    const cleanCurrentUrl =
        String(
            currentUrl ||
            ""
        )
            .split(
                "?"
            )[0];


    /*
    |--------------------------------------------------------------------------
    | FIND LINKS NEAR "ALSO AVAILABLE AS"
    |--------------------------------------------------------------------------
    */

    $("a[href*='/brands/']")
        .each(
            (
                index,
                element
            ) => {

                const href =
                    absoluteUrl(
                        $(element)
                            .attr(
                                "href"
                            )
                    );


                const name =
                    cleanText(
                        $(element)
                            .text()
                    );


                if (
                    !href ||
                    !name
                ) {

                    return;

                }


                const cleanHref =
                    href
                        .split(
                            "?"
                        )[0];


                if (
                    cleanHref ===
                    cleanCurrentUrl
                ) {

                    return;

                }


                /*
                 * Variant link generally contains
                 * strength/form information.
                 */

                const looksLikeVariant =

                    /\d/.test(
                        name
                    ) &&

                    (
                        /\bmg\b/i.test(
                            name
                        ) ||

                        /\bmcg\b/i.test(
                            name
                        ) ||

                        /\bml\b/i.test(
                            name
                        ) ||

                        /\bgm\b/i.test(
                            name
                        ) ||

                        /\btablet\b/i.test(
                            name
                        ) ||

                        /\bcapsule\b/i.test(
                            name
                        ) ||

                        /\bsyrup\b/i.test(
                            name
                        ) ||

                        /\binjection\b/i.test(
                            name
                        )
                    );


                if (
                    !looksLikeVariant
                ) {

                    return;

                }


                if (
                    !result.some(
                        (
                            item
                        ) =>
                            item.url ===
                            href
                    )
                ) {

                    result.push({

                        name,

                        url:
                            href,

                    });

                }

            }
        );


    return result.slice(
        0,
        30
    );

};


/*
|--------------------------------------------------------------------------
| MOLECULAR FORMULA
|--------------------------------------------------------------------------
*/

const getMolecularFormula = (
    $
) => {

    const body =
        cleanText(
            $("body")
                .text()
        );


    /*
     * Possible:
     *
     * Molecular Formula : C8H9NO2
     *
     * Molecular Formula : | C_{8}H_{9}NO_{2}
     */

    const match =
        body.match(
            /Molecular\s*Formula\s*:?\s*(?:\|\s*)?([A-Za-z0-9_{}\[\]()+\-]+)/i
        );


    if (
        !match
    ) {

        return "";

    }


    return cleanText(
        match[1]
    );

};


/*
|--------------------------------------------------------------------------
| CHEMICAL STRUCTURE IMAGE
|--------------------------------------------------------------------------
*/

const getChemicalImage = (
    $
) => {

    const candidates =
        [];


    const addCandidate = (
        value,
        context =
            ""
    ) => {

        if (
            !value
        ) {

            return;

        }


        const url =
            absoluteUrl(
                value
            );


        if (
            !url
        ) {

            return;

        }


        const lowerUrl =
            url.toLowerCase();


        const lowerContext =
            String(
                context
            )
                .toLowerCase();


        const chemical =

            lowerUrl.includes(
                "chemical"
            ) ||

            lowerUrl.includes(
                "structure"
            ) ||

            lowerContext.includes(
                "chemical structure"
            ) ||

            (
                lowerUrl.includes(
                    "/storage/res/"
                ) &&
                lowerUrl.endsWith(
                    ".svg"
                )
            );


        if (
            chemical &&
            !candidates.includes(
                url
            )
        ) {

            candidates.push(
                url
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | LINKS
    |--------------------------------------------------------------------------
    */

    $("a[href]")
        .each(
            (
                index,
                element
            ) => {

                const text =
                    cleanText(
                        $(element)
                            .text()
                    );


                const context =
                    cleanText(
                        $(element)
                            .parent()
                            .text()
                    );


                addCandidate(
                    $(element)
                        .attr(
                            "href"
                        ),
                    `${text} ${context}`
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | IMAGES
    |--------------------------------------------------------------------------
    */

    $("img")
        .each(
            (
                index,
                element
            ) => {

                const alt =
                    cleanText(
                        $(element)
                            .attr(
                                "alt"
                            )
                    );


                const title =
                    cleanText(
                        $(element)
                            .attr(
                                "title"
                            )
                    );


                const parent =
                    cleanText(
                        $(element)
                            .parent()
                            .text()
                    );


                const context =
                    `${alt} ${title} ${parent}`;


                addCandidate(
                    $(element)
                        .attr(
                            "src"
                        ),
                    context
                );


                addCandidate(
                    $(element)
                        .attr(
                            "data-src"
                        ),
                    context
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | RAW HTML FALLBACK
    |--------------------------------------------------------------------------
    */

    const html =
        $.html();


    const chemicalRegex =
        /(?:https?:\/\/(?:www\.)?medex\.com\.bd)?\/[^"'<>\\\s]*(?:chemical|structure)[^"'<>\\\s]*\.(?:svg|png|jpg|jpeg|webp)/gi;


    let match;


    while (
        (
            match =
                chemicalRegex.exec(
                    html
                )
        ) !==
        null
    ) {

        addCandidate(
            match[0],
            "chemical structure"
        );

    }


    return candidates[0] ||
        "";

};


/*
|--------------------------------------------------------------------------
| FETCH PAGE
|--------------------------------------------------------------------------
*/

const fetchPage = async (
    url,
    retry =
        0
) => {

    try {

        return await axios.get(
            url,
            {

                timeout:
                    REQUEST_TIMEOUT,

                headers: {

                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",

                    Accept:
                        "text/html,application/xhtml+xml",

                    "Accept-Language":
                        "en-US,en;q=0.9",

                },

            }
        );


    } catch (
        error
    ) {

        const status =
            error.response
                ?.status;


        const shouldRetry =

            !status ||

            status ===
                408 ||

            status ===
                429 ||

            status >=
                500;


        if (
            shouldRetry &&
            retry <
            MAX_RETRIES
        ) {

            console.log(
                `   ↻ retry ${retry + 1}/${MAX_RETRIES}: ${url}`
            );


            return fetchPage(
                url,
                retry +
                1
            );

        }


        throw error;

    }

};


/*
|--------------------------------------------------------------------------
| ENRICH ONE MEDICINE
|--------------------------------------------------------------------------
*/

const enrichMedicine = async (
    medicine,
    index,
    total
) => {

    const startedAt =
        Date.now();


    /*
    |--------------------------------------------------------------------------
    | ALREADY GENERATED SOURCE URL
    |--------------------------------------------------------------------------
    */

    const sourceUrl =

        medicine.sourceUrl ||

        (
            medicine.brandId &&
            medicine.slug

                ? `${BASE_URL}/brands/${medicine.brandId}/${medicine.slug}`

                : ""
        );


    console.log(
        `[${index + 1}/${total}] → ${medicine.brandName || medicine.slug}`
    );


    if (
        !sourceUrl
    ) {

        console.log(
            `   ⚠ Missing sourceUrl`
        );


        return {

            ...medicine,

            enrichmentSuccess:
                false,

            enrichmentError:
                "Missing sourceUrl",

        };

    }


    try {

        const response =
            await fetchPage(
                sourceUrl
            );


        const $ =
            cheerio.load(
                response.data
            );


        /*
        |--------------------------------------------------------------------------
        | IMAGES
        |--------------------------------------------------------------------------
        */

        const images =
            getPackImages(
                $
            );


        const dosageFormImage =
            getDosageFormImage(
                $
            );


        /*
        |--------------------------------------------------------------------------
        | SECTIONS
        |--------------------------------------------------------------------------
        */

        const composition =
            getSectionText(
                $,
                "Composition"
            );


        const therapeuticClass =
            getSectionText(
                $,
                "Therapeutic Class"
            );


        const storageConditions =
            getSectionText(
                $,
                [
                    "Storage Conditions",
                    "Storage Condition",
                    "Storage",
                ]
            );


        /*
        |--------------------------------------------------------------------------
        | OTHER DATA
        |--------------------------------------------------------------------------
        */

        const availableAs =
            getAvailableAs(
                $,
                sourceUrl
            );


        const molecularFormula =
            getMolecularFormula(
                $
            );


        const chemicalImage =
            getChemicalImage(
                $
            );


        const duration =
            (
                (
                    Date.now() -
                    startedAt
                ) /
                1000
            )
                .toFixed(
                    2
                );


        /*
        |--------------------------------------------------------------------------
        | LOG RESULTS
        |--------------------------------------------------------------------------
        */

        console.log(
            `   ✓ ${medicine.brandName}`
        );


        console.log(
            `   Pack images: ${images.length}`
        );


        console.log(
            `   Dosage image: ${dosageFormImage ? "YES" : "NO"}`
        );


        console.log(
            `   Composition: ${composition ? "YES" : "NO"}`
        );


        console.log(
            `   Therapeutic class: ${therapeuticClass ? "YES" : "NO"}`
        );


        console.log(
            `   Storage: ${storageConditions ? "YES" : "NO"}`
        );


        console.log(
            `   Available as: ${availableAs.length}`
        );


        console.log(
            `   Molecular formula: ${molecularFormula ? "YES" : "NO"}`
        );


        console.log(
            `   Chemical image: ${chemicalImage ? "YES" : "NO"}`
        );


        console.log(
            `   ${duration}s`
        );


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Spread the old medicine first.
        |
        | Your existing price/package information remains untouched.
        |--------------------------------------------------------------------------
        */

        return {

            ...medicine,


            /*
            |--------------------------------------------------------------------------
            | IMAGES
            |--------------------------------------------------------------------------
            */

            image:

                images[0] ||

                medicine.image ||

                "",


            images:

                images.length

                    ? images

                    : (
                        Array.isArray(
                            medicine.images
                        )

                            ? medicine.images

                            : []
                    ),


            dosageFormImage:

                dosageFormImage ||

                medicine.dosageFormImage ||

                "",


            /*
            |--------------------------------------------------------------------------
            | RELATED
            |--------------------------------------------------------------------------
            */

            availableAs:

                availableAs.length

                    ? availableAs

                    : (
                        Array.isArray(
                            medicine.availableAs
                        )

                            ? medicine.availableAs

                            : []
                    ),


            /*
            |--------------------------------------------------------------------------
            | REFERENCE
            |--------------------------------------------------------------------------
            */

            composition:

                composition ||

                medicine.composition ||

                "",


            therapeuticClass:

                therapeuticClass ||

                medicine.therapeuticClass ||

                "",


            storageConditions:

                storageConditions ||

                medicine.storageConditions ||

                "",


            /*
            |--------------------------------------------------------------------------
            | CHEMICAL
            |--------------------------------------------------------------------------
            */

            chemical: {

                molecularFormula:

                    molecularFormula ||

                    medicine?.chemical
                        ?.molecularFormula ||

                    "",


                structureImage:

                    chemicalImage ||

                    medicine?.chemical
                        ?.structureImage ||

                    "",

            },


            /*
            |--------------------------------------------------------------------------
            | META
            |--------------------------------------------------------------------------
            */

            sourceUrl,

            enrichedAt:
                new Date()
                    .toISOString(),

            enrichmentSuccess:
                true,

        };


    } catch (
        error
    ) {

        console.error(
            `   ✗ ${medicine.brandName}`
        );


        console.error(
            `   ${
                error.response?.status ||
                error.message
            }`
        );


        /*
         * Keep the existing record even when
         * enrichment fails.
         */

        return {

            ...medicine,

            sourceUrl,

            enrichedAt:
                new Date()
                    .toISOString(),

            enrichmentSuccess:
                false,

            enrichmentError:

                error.response?.status

                    ? `HTTP ${error.response.status}`

                    : error.message,

        };

    }

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
            | FILES
            |--------------------------------------------------------------------------
            */

            const inputPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medex-output.json"
                );


            const outputPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medex-output2.json"
                );


            const failedPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medex-enrichment-failed.json"
                );


            /*
            |--------------------------------------------------------------------------
            | LOAD EXISTING GOOD DATA
            |--------------------------------------------------------------------------
            */

            if (
                !fs.existsSync(
                    inputPath
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


            const medicines =
                JSON.parse(
                    fs.readFileSync(
                        inputPath,
                        "utf8"
                    )
                );


            if (
                !Array.isArray(
                    medicines
                )
            ) {

                throw new Error(
                    "medex-output.json must contain an array"
                );

            }


            /*
            |--------------------------------------------------------------------------
            | RESULTS
            |--------------------------------------------------------------------------
            */

            const results =
                [];


            const failures =
                [];


            let completed =
                0;


            let successful =
                0;


            let failed =
                0;


            let packImagesFound =
                0;


            let dosageImagesFound =
                0;


            let compositionFound =
                0;


            let therapeuticFound =
                0;


            let storageFound =
                0;


            let molecularFound =
                0;


            let chemicalImagesFound =
                0;


            /*
            |--------------------------------------------------------------------------
            | START
            |--------------------------------------------------------------------------
            */

            console.log(
                ""
            );


            console.log(
                "============================================================"
            );


            console.log(
                "MEDEX ENRICHMENT STARTED"
            );


            console.log(
                "============================================================"
            );


            console.log(
                `Input: medex-output.json`
            );


            console.log(
                `Output: medex-output2.json`
            );


            console.log(
                `Total: ${medicines.length}`
            );


            console.log(
                `Promise.all concurrency: ${CONCURRENCY}`
            );


            console.log(
                "============================================================"
            );


            /*
            |--------------------------------------------------------------------------
            | PROMISE.ALL
            |--------------------------------------------------------------------------
            |
            | Every batch uses Promise.all.
            |
            | All medicines are eventually processed.
            |--------------------------------------------------------------------------
            */

            for (
                let start = 0;
                start <
                medicines.length;
                start +=
                CONCURRENCY
            ) {

                const batch =
                    medicines.slice(
                        start,
                        start +
                        CONCURRENCY
                    );


                console.log(
                    ""
                );


                console.log(
                    "------------------------------------------------------------"
                );


                console.log(
                    `BATCH ${start + 1} - ${Math.min(
                        start +
                        batch.length,
                        medicines.length
                    )}`
                );


                console.log(
                    "------------------------------------------------------------"
                );


                /*
                |--------------------------------------------------------------------------
                | REAL PROMISE.ALL
                |--------------------------------------------------------------------------
                */

                const batchResults =
                    await Promise.all(

                        batch.map(
                            (
                                medicine,
                                batchIndex
                            ) =>

                                enrichMedicine(

                                    medicine,

                                    start +
                                    batchIndex,

                                    medicines.length

                                )
                        )

                    );


                /*
                |--------------------------------------------------------------------------
                | PROCESS RESULTS
                |--------------------------------------------------------------------------
                */

                for (
                    const item of
                    batchResults
                ) {

                    results.push(
                        item
                    );


                    completed++;


                    if (
                        item.enrichmentSuccess
                    ) {

                        successful++;

                    } else {

                        failed++;


                        failures.push(
                            item
                        );

                    }


                    if (
                        Array.isArray(
                            item.images
                        ) &&
                        item.images.length
                    ) {

                        packImagesFound++;

                    }


                    if (
                        item.dosageFormImage
                    ) {

                        dosageImagesFound++;

                    }


                    if (
                        item.composition
                    ) {

                        compositionFound++;

                    }


                    if (
                        item.therapeuticClass
                    ) {

                        therapeuticFound++;

                    }


                    if (
                        item.storageConditions
                    ) {

                        storageFound++;

                    }


                    if (
                        item?.chemical
                            ?.molecularFormula
                    ) {

                        molecularFound++;

                    }


                    if (
                        item?.chemical
                            ?.structureImage
                    ) {

                        chemicalImagesFound++;

                    }

                }


                /*
                |--------------------------------------------------------------------------
                | SAVE AFTER EACH PROMISE.ALL BATCH
                |--------------------------------------------------------------------------
                */

                fs.writeFileSync(
                    outputPath,
                    JSON.stringify(
                        results,
                        null,
                        2
                    ),
                    "utf8"
                );


                fs.writeFileSync(
                    failedPath,
                    JSON.stringify(
                        failures,
                        null,
                        2
                    ),
                    "utf8"
                );


                /*
                |--------------------------------------------------------------------------
                | PROGRESS
                |--------------------------------------------------------------------------
                */

                const percentage =
                    (
                        (
                            completed /
                            medicines.length
                        ) *
                        100
                    )
                        .toFixed(
                            2
                        );


                const elapsedSeconds =
                    (
                        Date.now() -
                        startedAt
                    ) /
                    1000;


                const average =
                    completed
                        ? elapsedSeconds /
                            completed
                        : 0;


                const remaining =
                    medicines.length -
                    completed;


                const etaMinutes =
                    (
                        (
                            remaining *
                            average
                        ) /
                        60
                    )
                        .toFixed(
                            1
                        );


                console.log(
                    ""
                );


                console.log(
                    "============================================================"
                );


                console.log(
                    `PROGRESS ${completed}/${medicines.length} (${percentage}%)`
                );


                console.log(
                    `✓ Successful requests: ${successful}`
                );


                console.log(
                    `✗ Failed requests: ${failed}`
                );


                console.log(
                    ""
                );


                console.log(
                    `Pack images: ${packImagesFound}`
                );


                console.log(
                    `Dosage images: ${dosageImagesFound}`
                );


                console.log(
                    `Composition: ${compositionFound}`
                );


                console.log(
                    `Therapeutic class: ${therapeuticFound}`
                );


                console.log(
                    `Storage: ${storageFound}`
                );


                console.log(
                    `Molecular formula: ${molecularFound}`
                );


                console.log(
                    `Chemical image: ${chemicalImagesFound}`
                );


                console.log(
                    ""
                );


                console.log(
                    `ETA: ~${etaMinutes} minutes`
                );


                console.log(
                    `Saved: medex-output2.json`
                );


                console.log(
                    "============================================================"
                );

            }


            /*
            |--------------------------------------------------------------------------
            | FINAL SAVE
            |--------------------------------------------------------------------------
            */

            fs.writeFileSync(
                outputPath,
                JSON.stringify(
                    results,
                    null,
                    2
                ),
                "utf8"
            );


            /*
            |--------------------------------------------------------------------------
            | COMPLETE
            |--------------------------------------------------------------------------
            */

            const totalSeconds =
                (
                    (
                        Date.now() -
                        startedAt
                    ) /
                    1000
                )
                    .toFixed(
                        2
                    );


            console.log(
                ""
            );


            console.log(
                "############################################################"
            );


            console.log(
                "MEDEX ENRICHMENT COMPLETE"
            );


            console.log(
                "############################################################"
            );


            console.log(
                `Total: ${results.length}`
            );


            console.log(
                `Successful: ${successful}`
            );


            console.log(
                `Failed: ${failed}`
            );


            console.log(
                `Pack images: ${packImagesFound}`
            );


            console.log(
                `Dosage images: ${dosageImagesFound}`
            );


            console.log(
                `Composition: ${compositionFound}`
            );


            console.log(
                `Therapeutic class: ${therapeuticFound}`
            );


            console.log(
                `Storage: ${storageFound}`
            );


            console.log(
                `Molecular formula: ${molecularFound}`
            );


            console.log(
                `Chemical images: ${chemicalImagesFound}`
            );


            console.log(
                `Duration: ${totalSeconds}s`
            );


            console.log(
                `Output: medex-output2.json`
            );


            console.log(
                "############################################################"
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

                    total:
                        results.length,

                    successful,

                    failed,

                    statistics: {

                        image: {

                            found:
                                packImagesFound,

                            missing:
                                results.length -
                                packImagesFound,

                            percentage:
                                Number(
                                    (
                                        (
                                            packImagesFound /
                                            results.length
                                        ) *
                                        100
                                    )
                                        .toFixed(
                                            2
                                        )
                                ),

                        },


                        dosageFormImage: {

                            found:
                                dosageImagesFound,

                            missing:
                                results.length -
                                dosageImagesFound,

                        },


                        composition: {

                            found:
                                compositionFound,

                            missing:
                                results.length -
                                compositionFound,

                        },


                        therapeuticClass: {

                            found:
                                therapeuticFound,

                            missing:
                                results.length -
                                therapeuticFound,

                        },


                        storageConditions: {

                            found:
                                storageFound,

                            missing:
                                results.length -
                                storageFound,

                        },


                        molecularFormula: {

                            found:
                                molecularFound,

                            missing:
                                results.length -
                                molecularFound,

                        },


                        chemicalStructureImage: {

                            found:
                                chemicalImagesFound,

                            missing:
                                results.length -
                                chemicalImagesFound,

                        },

                    },

                    concurrency:
                        CONCURRENCY,

                    duration:
                        `${totalSeconds}s`,

                    input:
                        "medex-output.json",

                    output:
                        "medex-output2.json",

                    failedOutput:
                        "medex-enrichment-failed.json",

                });


        } catch (
            error
        ) {

            console.error(
                ""
            );


            console.error(
                "============================================================"
            );


            console.error(
                "MEDEX ENRICHMENT FATAL ERROR"
            );


            console.error(
                "============================================================"
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
                        error.message,

                });

        }

    }
);


export default handler;