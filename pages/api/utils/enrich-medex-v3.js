import fs from "fs";
import path from "path";

import axios from "axios";
import * as cheerio from "cheerio";

import nextConnect from "next-connect";


const handler =
    nextConnect();


const BASE_URL =
    "https://medex.com.bd";


const CONCURRENCY =
    150;


const REQUEST_TIMEOUT =
    25000;


const MAX_RETRIES =
    2;


/*
|--------------------------------------------------------------------------
| CONSOLE COLORS
|--------------------------------------------------------------------------
*/

const COLOR = {

    reset:
        "\x1b[0m",

    bold:
        "\x1b[1m",

    green:
        "\x1b[32m",

    red:
        "\x1b[31m",

    yellow:
        "\x1b[33m",

    cyan:
        "\x1b[36m",

    magenta:
        "\x1b[35m",

    gray:
        "\x1b[90m",

};


const green = (
    text
) =>
    `${COLOR.green}${text}${COLOR.reset}`;


const red = (
    text
) =>
    `${COLOR.red}${text}${COLOR.reset}`;


const yellow = (
    text
) =>
    `${COLOR.yellow}${text}${COLOR.reset}`;


const cyan = (
    text
) =>
    `${COLOR.cyan}${text}${COLOR.reset}`;


const magenta = (
    text
) =>
    `${COLOR.magenta}${text}${COLOR.reset}`;


const bold = (
    text
) =>
    `${COLOR.bold}${text}${COLOR.reset}`;


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
            /\s+/g,
            " "
        )
        .trim();

};


/*
|--------------------------------------------------------------------------
| NORMALIZE HEADING
|--------------------------------------------------------------------------
*/

const normalizeHeading = (
    value
) => {

    return cleanText(
        value
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
|
| Reject:
|
| data:image...
| blob:...
| javascript:...
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


    const stringValue =
        String(
            value
        )
            .trim();


    const lower =
        stringValue
            .toLowerCase();


    if (
        lower.startsWith(
            "data:"
        ) ||
        lower.startsWith(
            "blob:"
        ) ||
        lower.startsWith(
            "javascript:"
        ) ||
        lower.startsWith(
            "#"
        )
    ) {

        return "";

    }


    try {

        const url =
            new URL(
                stringValue,
                BASE_URL
            );


        if (
            url.protocol !==
                "http:" &&
            url.protocol !==
                "https:"
        ) {

            return "";

        }


        return url.href;


    } catch (
        error
    ) {

        return "";

    }

};


/*
|--------------------------------------------------------------------------
| IS REAL IMAGE URL
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| No folder/path requirement.
|
| It only needs to be:
|
| http/https
|
| and pathname ends with:
|
| .png
| .jpg
| .jpeg
| .webp
| .gif
|
| SVG is allowed only when allowSvg = true.
|--------------------------------------------------------------------------
*/

const isImageUrl = (
    value,
    allowSvg =
        false
) => {

    if (
        !value
    ) {

        return false;

    }


    try {

        const url =
            new URL(
                value,
                BASE_URL
            );


        if (
            url.protocol !==
                "http:" &&
            url.protocol !==
                "https:"
        ) {

            return false;

        }


        const pathname =
            url.pathname
                .toLowerCase();


        const extensions = [

            ".png",

            ".jpg",

            ".jpeg",

            ".webp",

            ".gif",

        ];


        if (
            allowSvg
        ) {

            extensions.push(
                ".svg"
            );

        }


        return extensions.some(
            (
                extension
            ) =>
                pathname.endsWith(
                    extension
                )
        );


    } catch (
        error
    ) {

        return false;

    }

};


/*
|--------------------------------------------------------------------------
| NORMALIZE IMAGE URL
|--------------------------------------------------------------------------
*/

const normalizeImageUrl = (
    value,
    allowSvg =
        false
) => {

    const url =
        absoluteUrl(
            value
        );


    if (
        !url
    ) {

        return "";

    }


    if (
        !isImageUrl(
            url,
            allowSvg
        )
    ) {

        return "";

    }


    return url;

};


/*
|--------------------------------------------------------------------------
| GET ELEMENT URLS
|--------------------------------------------------------------------------
|
| Lazy-loaded attributes are checked before src.
|--------------------------------------------------------------------------
*/

const getElementUrls = (
    $,
    element,
    allowSvg =
        false
) => {

    const result =
        [];


    const attributes = [

        "href",

        "data-src",

        "data-original",

        "data-lazy-src",

        "data-image",

        "data-url",

        "src",

    ];


    for (
        const attribute of
        attributes
    ) {

        const value =
            $(element)
                .attr(
                    attribute
                );


        const url =
            normalizeImageUrl(
                value,
                allowSvg
            );


        if (
            url &&
            !result.includes(
                url
            )
        ) {

            result.push(
                url
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | SRCSET
    |--------------------------------------------------------------------------
    */

    const srcset =
        $(element)
            .attr(
                "srcset"
            );


    if (
        srcset
    ) {

        const values =
            srcset.split(
                ","
            );


        for (
            const value of
            values
        ) {

            const candidate =
                value
                    .trim()
                    .split(
                        /\s+/
                    )[0];


            const url =
                normalizeImageUrl(
                    candidate,
                    allowSvg
                );


            if (
                url &&
                !result.includes(
                    url
                )
            ) {

                result.push(
                    url
                );

            }

        }

    }


    return result;

};


/*
|--------------------------------------------------------------------------
| GET ALL IMAGE URLS
|--------------------------------------------------------------------------
|
| Finds every URL on the page that actually ends
| with an image extension.
|--------------------------------------------------------------------------
*/

const getAllImageUrls = (
    $,
    allowSvg =
        false
) => {

    const images =
        [];


    const add = (
        value
    ) => {

        const url =
            normalizeImageUrl(
                value,
                allowSvg
            );


        if (
            !url
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
    | HTML ELEMENTS
    |--------------------------------------------------------------------------
    */

    $(
        "a, img, source, link"
    )
        .each(
            (
                index,
                element
            ) => {

                const urls =
                    getElementUrls(
                        $,
                        element,
                        allowSvg
                    );


                for (
                    const url of
                    urls
                ) {

                    add(
                        url
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | RAW HTML URL FALLBACK
    |--------------------------------------------------------------------------
    |
    | Finds absolute URLs ending in image extensions.
    |--------------------------------------------------------------------------
    */

    const html =
        $.html();


    const extensionPart =
        allowSvg
            ? "png|jpg|jpeg|webp|gif|svg"
            : "png|jpg|jpeg|webp|gif";


    const regex =
        new RegExp(
            `https?:\\\\/\\\\/[^"'<>\\\\s]+?\\\\.(?:${extensionPart})(?:\\\\?[^"'<>\\\\s]*)?`,
            "gi"
        );


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

        add(
            match[0]
        );

    }


    /*
    |--------------------------------------------------------------------------
    | RELATIVE URL FALLBACK
    |--------------------------------------------------------------------------
    */

    const relativeRegex =
        new RegExp(
            `(?:href|src|data-src|data-original|data-lazy-src)=["']([^"']+?\\\\.(?:${extensionPart})(?:\\\\?[^"']*)?)["']`,
            "gi"
        );


    while (
        (
            match =
                relativeRegex.exec(
                    html
                )
        ) !==
        null
    ) {

        add(
            match[1]
        );

    }


    return images;

};


/*
|--------------------------------------------------------------------------
| PACK IMAGE
|--------------------------------------------------------------------------
|
| Priority:
|
| 1. Link whose text says Pack Image / Pack Images
| 2. Image URL around a Pack Image element
| 3. URL containing packaging
|
| The URL itself only has to end with an image extension.
|--------------------------------------------------------------------------
*/

const getPackImages = (
    $
) => {

    const result =
        [];


    const add = (
        value
    ) => {

        const url =
            normalizeImageUrl(
                value
            );


        if (
            !url
        ) {

            return;

        }


        if (
            !result.includes(
                url
            )
        ) {

            result.push(
                url
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | PRIORITY 1
    |
    | <a href="....webp">Pack Image</a>
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
                    )
                        .toLowerCase();


                if (
                    text.includes(
                        "pack image"
                    )
                ) {

                    add(
                        $(element)
                            .attr(
                                "href"
                            )
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | PRIORITY 2
    |
    | Look around elements containing:
    |
    | Pack Image
    | Pack Images
    |--------------------------------------------------------------------------
    */

    $("*")
        .each(
            (
                index,
                element
            ) => {

                const ownText =
                    cleanText(
                        $(element)
                            .clone()
                            .children()
                            .remove()
                            .end()
                            .text()
                    )
                        .toLowerCase();


                if (
                    !ownText.includes(
                        "pack image"
                    )
                ) {

                    return;

                }


                const containers = [

                    $(element),

                    $(element)
                        .parent(),

                    $(element)
                        .next(),

                    $(element)
                        .parent()
                        .next(),

                ];


                for (
                    const container of
                    containers
                ) {

                    container
                        .find(
                            "a, img, source"
                        )
                        .each(
                            (
                                innerIndex,
                                child
                            ) => {

                                const urls =
                                    getElementUrls(
                                        $,
                                        child
                                    );


                                for (
                                    const url of
                                    urls
                                ) {

                                    add(
                                        url
                                    );

                                }

                            }
                        );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | PRIORITY 3
    |
    | Packaging URL
    |--------------------------------------------------------------------------
    */

    const allImages =
        getAllImageUrls(
            $
        );


    for (
        const image of
        allImages
    ) {

        if (
            image
                .toLowerCase()
                .includes(
                    "packaging"
                )
        ) {

            add(
                image
            );

        }

    }


    return result;

};


/*
|--------------------------------------------------------------------------
| DOSAGE FORM IMAGE
|--------------------------------------------------------------------------
*/

const getDosageFormImage = (
    $
) => {

    const images =
        getAllImageUrls(
            $,
            true
        );


    const image =
        images.find(
            (
                url
            ) => {

                const lower =
                    url.toLowerCase();


                return (
                    lower.includes(
                        "dosage-form"
                    ) ||
                    lower.includes(
                        "dosage_forms"
                    ) ||
                    lower.includes(
                        "dosage-forms"
                    )
                );

            }
        );


    return image ||
        "";

};


/*
|--------------------------------------------------------------------------
| CHEMICAL STRUCTURE IMAGE
|--------------------------------------------------------------------------
|
| SVG allowed.
|--------------------------------------------------------------------------
*/

const getChemicalStructureImage = (
    $
) => {

    const result =
        [];


    const add = (
        value
    ) => {

        const url =
            normalizeImageUrl(
                value,
                true
            );


        if (
            !url
        ) {

            return;

        }


        if (
            !result.includes(
                url
            )
        ) {

            result.push(
                url
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CONTEXT MATCH
    |--------------------------------------------------------------------------
    */

    $("a[href], img, source")
        .each(
            (
                index,
                element
            ) => {

                const text =
                    cleanText(
                        $(element)
                            .text()
                    )
                        .toLowerCase();


                const alt =
                    cleanText(
                        $(element)
                            .attr(
                                "alt"
                            )
                    )
                        .toLowerCase();


                const title =
                    cleanText(
                        $(element)
                            .attr(
                                "title"
                            )
                    )
                        .toLowerCase();


                const parentText =
                    cleanText(
                        $(element)
                            .parent()
                            .text()
                    )
                        .toLowerCase();


                const context =
                    `${text} ${alt} ${title} ${parentText}`;


                if (
                    context.includes(
                        "chemical structure"
                    )
                ) {

                    const urls =
                        getElementUrls(
                            $,
                            element,
                            true
                        );


                    for (
                        const url of
                        urls
                    ) {

                        add(
                            url
                        );

                    }

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | URL NAME FALLBACK
    |--------------------------------------------------------------------------
    */

    const allImages =
        getAllImageUrls(
            $,
            true
        );


    for (
        const url of
        allImages
    ) {

        const lower =
            url.toLowerCase();


        if (
            lower.includes(
                "chemical"
            ) ||
            lower.includes(
                "structure"
            )
        ) {

            add(
                url
            );

        }

    }


    return result[0] ||
        "";

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
            Boolean
        );

};


/*
|--------------------------------------------------------------------------
| KNOWN SECTIONS
|--------------------------------------------------------------------------
*/

const KNOWN_SECTIONS = [

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

    "Precautions & Warnings",

    "Use in Special Populations",

    "Overdose Effects",

    "Therapeutic Class",

    "Storage Conditions",

    "Storage Condition",

    "Storage",

    "Chemical Structure",

    "Common Questions",

    "Also Available As",

]
    .map(
        normalizeHeading
    );


/*
|--------------------------------------------------------------------------
| SECTION TEXT
|--------------------------------------------------------------------------
*/

const getSectionText = (
    $,
    possibleTitles
) => {

    const titles =
        (
            Array.isArray(
                possibleTitles
            )
                ? possibleTitles
                : [
                    possibleTitles,
                ]
        )
            .map(
                normalizeHeading
            );


    /*
    |--------------------------------------------------------------------------
    | TRY HEADINGS FIRST
    |--------------------------------------------------------------------------
    */

    let result =
        "";


    $(
        "h1, h2, h3, h4, h5, h6"
    )
        .each(
            (
                index,
                element
            ) => {

                if (
                    result
                ) {

                    return false;

                }


                const heading =
                    normalizeHeading(
                        $(element)
                            .text()
                    );


                if (
                    !titles.includes(
                        heading
                    )
                ) {

                    return;

                }


                const pieces =
                    [];


                let current =
                    $(element)
                        .next();


                let guard =
                    0;


                while (
                    current.length &&
                    guard <
                    80
                ) {

                    if (
                        current.is(
                            "h1, h2, h3, h4, h5, h6"
                        )
                    ) {

                        break;

                    }


                    const text =
                        cleanText(
                            current.text()
                        );


                    if (
                        text &&
                        !pieces.includes(
                            text
                        )
                    ) {

                        pieces.push(
                            text
                        );

                    }


                    current =
                        current.next();


                    guard++;

                }


                result =
                    cleanText(
                        pieces.join(
                            " "
                        )
                    );

            }
        );


    if (
        result
    ) {

        return result;

    }


    /*
    |--------------------------------------------------------------------------
    | BODY LINE FALLBACK
    |--------------------------------------------------------------------------
    */

    const lines =
        getBodyLines(
            $
        );


    let start =
        -1;


    for (
        let i = 0;
        i <
        lines.length;
        i++
    ) {

        const line =
            normalizeHeading(
                lines[i]
            );


        if (
            titles.includes(
                line
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


    const pieces =
        [];


    for (
        let i =
            start +
            1;
        i <
        lines.length;
        i++
    ) {

        const normalized =
            normalizeHeading(
                lines[i]
            );


        if (
            KNOWN_SECTIONS.includes(
                normalized
            )
        ) {

            break;

        }


        if (
            normalized.startsWith(
                "common questions about"
            )
        ) {

            break;

        }


        if (
            !pieces.includes(
                lines[i]
            )
        ) {

            pieces.push(
                lines[i]
            );

        }


        if (
            pieces.length >=
            80
        ) {

            break;

        }

    }


    return cleanText(
        pieces.join(
            " "
        )
    );

};


/*
|--------------------------------------------------------------------------
| AVAILABLE AS
|--------------------------------------------------------------------------
*/

const getAvailableAs = (
    $,
    sourceUrl
) => {

    const result =
        [];


    const currentUrl =
        String(
            sourceUrl ||
            ""
        )
            .split(
                "?"
            )[0];


    $("a[href*='/brands/']")
        .each(
            (
                index,
                element
            ) => {

                const name =
                    cleanText(
                        $(element)
                            .text()
                    );


                const url =
                    absoluteUrl(
                        $(element)
                            .attr(
                                "href"
                            )
                    );


                if (
                    !name ||
                    !url
                ) {

                    return;

                }


                if (
                    url
                        .split(
                            "?"
                        )[0] ===
                    currentUrl
                ) {

                    return;

                }


                const looksLikeVariant =
                    (
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
                            url
                    )
                ) {

                    result.push({

                        name,

                        url,

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

    const text =
        cleanText(
            $("body")
                .text()
        );


    const match =
        text.match(
            /Molecular\s*Formula\s*:?\s*(?:\|\s*)?([A-Za-z0-9_{}\[\]()+\-]+)/i
        );


    return cleanText(
        match?.[1] ||
        ""
    );

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

                    "Cache-Control":
                        "no-cache",

                },

            }
        );


    } catch (
        error
    ) {

        const status =
            error.response
                ?.status;


        const retryable =
            (
                !status ||
                status ===
                    408 ||
                status ===
                    429 ||
                status >=
                    500
            );


        if (
            retryable &&
            retry <
            MAX_RETRIES
        ) {

            console.log(
                yellow(
                    `↻ Retry ${retry + 1}/${MAX_RETRIES}`
                )
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
| CLEAN EXISTING PACK IMAGE
|--------------------------------------------------------------------------
|
| Only preserve an old value if it is genuinely
| an HTTP image URL with an extension.
|--------------------------------------------------------------------------
*/

const getOldImageUrl = (
    medicine
) => {

    const values = [

        medicine.imageUrl,

        medicine.image,

    ];


    for (
        const value of
        values
    ) {

        const url =
            normalizeImageUrl(
                value
            );


        if (
            url
        ) {

            return url;

        }

    }


    return "";

};


/*
|--------------------------------------------------------------------------
| CLEAN OLD IMAGE ARRAY
|--------------------------------------------------------------------------
*/

const getOldImageUrls = (
    medicine
) => {

    const values = [

        ...(
            Array.isArray(
                medicine.imageUrls
            )
                ? medicine.imageUrls
                : []
        ),

        ...(
            Array.isArray(
                medicine.images
            )
                ? medicine.images
                : []
        ),

    ];


    const result =
        [];


    for (
        const value of
        values
    ) {

        const url =
            normalizeImageUrl(
                value
            );


        if (
            url &&
            !result.includes(
                url
            )
        ) {

            result.push(
                url
            );

        }

    }


    return result;

};


/*
|--------------------------------------------------------------------------
| CLEAN OLD DOSAGE IMAGE
|--------------------------------------------------------------------------
*/

const getOldDosageImage = (
    medicine
) => {

    const values = [

        medicine.dosageFormImageUrl,

        medicine.dosageFormImage,

    ];


    for (
        const value of
        values
    ) {

        const url =
            normalizeImageUrl(
                value,
                true
            );


        if (
            url
        ) {

            return url;

        }

    }


    return "";

};


/*
|--------------------------------------------------------------------------
| CLEAN OLD CHEMICAL IMAGE
|--------------------------------------------------------------------------
*/

const getOldChemicalImage = (
    medicine
) => {

    const values = [

        medicine?.chemical
            ?.structureImageUrl,

        medicine?.chemical
            ?.structureImage,

    ];


    for (
        const value of
        values
    ) {

        const url =
            normalizeImageUrl(
                value,
                true
            );


        if (
            url
        ) {

            return url;

        }

    }


    return "";

};


/*
|--------------------------------------------------------------------------
| ENRICH MEDICINE
|--------------------------------------------------------------------------
*/

const enrichMedicine = async (
    medicine,
    index,
    total
) => {

    const startedAt =
        Date.now();


    const sourceUrl =
        medicine.sourceUrl ||
        (
            medicine.brandId &&
            medicine.slug

                ? `${BASE_URL}/brands/${medicine.brandId}/${medicine.slug}`

                : ""
        );


    if (
        !sourceUrl
    ) {

        console.log(
            red(
                `[${index + 1}/${total}] ✗ Missing URL`
            )
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

        /*
        |--------------------------------------------------------------------------
        | FETCH
        |--------------------------------------------------------------------------
        */

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

        const newPackImages =
            getPackImages(
                $
            );


        const oldImages =
            getOldImageUrls(
                medicine
            );


        const allPackImages =
            [
                ...new Set(
                    [
                        ...newPackImages,
                        ...oldImages,
                    ]
                ),
            ]
                .filter(
                    (
                        value
                    ) =>
                        isImageUrl(
                            value
                        )
                );


        const imageUrl =
            allPackImages[0] ||
            getOldImageUrl(
                medicine
            ) ||
            "";


        const dosageFormImageUrl =

            getDosageFormImage(
                $
            ) ||

            getOldDosageImage(
                medicine
            ) ||

            "";


        const chemicalStructureImageUrl =

            getChemicalStructureImage(
                $
            ) ||

            getOldChemicalImage(
                medicine
            ) ||

            "";


        /*
        |--------------------------------------------------------------------------
        | TEXT INFORMATION
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


        const availableAs =
            getAvailableAs(
                $,
                sourceUrl
            );


        const molecularFormula =
            getMolecularFormula(
                $
            );


        /*
        |--------------------------------------------------------------------------
        | TIME
        |--------------------------------------------------------------------------
        */

        const seconds =
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
        | LIVE CONSOLE
        |--------------------------------------------------------------------------
        */

        console.log(
            `${green("✓")} ${cyan(
                `[${index + 1}/${total}]`
            )} ${bold(
                medicine.brandName ||
                medicine.slug
            )} ${COLOR.gray}${seconds}s${COLOR.reset}`
        );


        console.log(
            `   ${magenta("IMAGE")} ${
                imageUrl
                    ? green(
                        "FOUND"
                    )
                    : red(
                        "MISSING"
                    )
            } | ${magenta("DOSAGE")} ${
                dosageFormImageUrl
                    ? green(
                        "FOUND"
                    )
                    : yellow(
                        "MISSING"
                    )
            } | ${magenta("CHEMICAL")} ${
                chemicalStructureImageUrl
                    ? green(
                        "FOUND"
                    )
                    : yellow(
                        "MISSING"
                    )
            }`
        );


        /*
        |--------------------------------------------------------------------------
        | OPTIONAL IMAGE URL LOG
        |--------------------------------------------------------------------------
        */

        if (
            imageUrl
        ) {

            console.log(
                `${COLOR.gray}   ${imageUrl}${COLOR.reset}`
            );

        }


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        |
        | Existing price / packages / manufacturer etc.
        | stay untouched.
        |--------------------------------------------------------------------------
        */

        return {

            ...medicine,


            /*
            |--------------------------------------------------------------------------
            | IMAGE
            |--------------------------------------------------------------------------
            */

            imageUrl,

            imageUrls:
                allPackImages,


            /*
             * Keep old names too.
             */

            image:
                imageUrl,

            images:
                allPackImages,


            /*
            |--------------------------------------------------------------------------
            | DOSAGE IMAGE
            |--------------------------------------------------------------------------
            */

            dosageFormImageUrl,

            dosageFormImage:
                dosageFormImageUrl,


            /*
            |--------------------------------------------------------------------------
            | TEXT
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
            | CHEMICAL
            |--------------------------------------------------------------------------
            */

            chemical: {

                ...(
                    medicine.chemical ||
                    {}
                ),


                molecularFormula:

                    molecularFormula ||

                    medicine?.chemical
                        ?.molecularFormula ||

                    "",


                structureImageUrl:
                    chemicalStructureImageUrl,


                structureImage:
                    chemicalStructureImageUrl,

            },


            sourceUrl,


            enrichmentSuccess:
                true,


            enrichedAt:
                new Date()
                    .toISOString(),

        };


    } catch (
        error
    ) {

        const status =
            error.response
                ?.status;


        console.error(
            `${red("✗")} ${cyan(
                `[${index + 1}/${total}]`
            )} ${
                medicine.brandName ||
                medicine.slug
            } ${red(
                status
                    ? `HTTP ${status}`
                    : error.message
            )}`
        );


        /*
        |--------------------------------------------------------------------------
        | SANITIZE EVEN ON FAILURE
        |--------------------------------------------------------------------------
        */

        const imageUrl =
            getOldImageUrl(
                medicine
            );


        const imageUrls =
            getOldImageUrls(
                medicine
            );


        const dosageFormImageUrl =
            getOldDosageImage(
                medicine
            );


        const chemicalImage =
            getOldChemicalImage(
                medicine
            );


        return {

            ...medicine,


            imageUrl,

            image:
                imageUrl,


            imageUrls,

            images:
                imageUrls,


            dosageFormImageUrl,

            dosageFormImage:
                dosageFormImageUrl,


            chemical: {

                ...(
                    medicine.chemical ||
                    {}
                ),

                structureImageUrl:
                    chemicalImage,

                structureImage:
                    chemicalImage,

            },


            sourceUrl,


            enrichmentSuccess:
                false,


            enrichmentError:

                status
                    ? `HTTP ${status}`
                    : error.message,


            enrichedAt:
                new Date()
                    .toISOString(),

        };

    }

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


    const count = (
        checker
    ) => {

        const found =
            results.filter(
                checker
            )
                .length;


        return {

            found,

            missing:
                total -
                found,

            percentage:

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

                    : 0,

        };

    };


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


    return {

        total,


        image:
            count(
                (
                    item
                ) =>
                    isImageUrl(
                        item.imageUrl
                    )
            ),


        realPackImage:
            count(
                (
                    item
                ) =>
                    Array.isArray(
                        item.imageUrls
                    ) &&
                    item.imageUrls.some(
                        (
                            image
                        ) =>
                            isImageUrl(
                                image
                            )
                    )
            ),


        dosageFormImage:
            count(
                (
                    item
                ) =>
                    isImageUrl(
                        item.dosageFormImageUrl,
                        true
                    )
            ),


        composition:
            count(
                (
                    item
                ) =>
                    hasText(
                        item.composition
                    )
            ),


        therapeuticClass:
            count(
                (
                    item
                ) =>
                    hasText(
                        item.therapeuticClass
                    )
            ),


        storageConditions:
            count(
                (
                    item
                ) =>
                    hasText(
                        item.storageConditions
                    )
            ),


        availableAs:
            count(
                (
                    item
                ) =>
                    Array.isArray(
                        item.availableAs
                    ) &&
                    item.availableAs.length >
                        0
            ),


        molecularFormula:
            count(
                (
                    item
                ) =>
                    hasText(
                        item?.chemical
                            ?.molecularFormula
                    )
            ),


        chemicalStructureImage:
            count(
                (
                    item
                ) =>
                    isImageUrl(
                        item?.chemical
                            ?.structureImageUrl,
                        true
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

        const startedAt =
            Date.now();


        try {

            /*
            |--------------------------------------------------------------------------
            | FILE PATHS
            |--------------------------------------------------------------------------
            */

            const inputPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "medex-output2.json"
                );


            const outputPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "output3.json"
                );


            const failedPath =
                path.join(
                    process.cwd(),
                    "pages",
                    "api",
                    "utils",
                    "output3-failed.json"
                );


            /*
            |--------------------------------------------------------------------------
            | INPUT
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
                            "medex-output2.json not found",

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
                    "medex-output2.json must contain an array"
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


            const totalBatches =
                Math.ceil(
                    medicines.length /
                    CONCURRENCY
                );


            /*
            |--------------------------------------------------------------------------
            | START
            |--------------------------------------------------------------------------
            */

            console.log(
                ""
            );


            console.log(
                cyan(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                magenta(
                    bold(
                        "            MEDEX OUTPUT 3 SCRAPER"
                    )
                )
            );


            console.log(
                cyan(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                `${cyan("Total Medicines:")} ${bold(
                    medicines.length
                )}`
            );


            console.log(
                `${cyan("Concurrency:")} ${green(
                    CONCURRENCY
                )}`
            );


            console.log(
                `${cyan("Total Batches:")} ${bold(
                    totalBatches
                )}`
            );


            console.log(
                `${cyan("Input:")} medex-output2.json`
            );


            console.log(
                `${cyan("Output:")} ${green(
                    "output3.json"
                )}`
            );


            console.log(
                cyan(
                    "════════════════════════════════════════════════════════════"
                )
            );


            /*
            |--------------------------------------------------------------------------
            | BATCH LOOP
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


                const batchNumber =
                    Math.floor(
                        start /
                        CONCURRENCY
                    ) +
                    1;


                console.log(
                    ""
                );


                console.log(
                    `${magenta("▶ BATCH")} ${bold(
                        `${batchNumber}/${totalBatches}`
                    )} ${COLOR.gray}${
                        start +
                        1
                    }-${Math.min(
                        start +
                        batch.length,
                        medicines.length
                    )}${COLOR.reset}`
                );


                /*
                |--------------------------------------------------------------------------
                | PROMISE.ALL
                |--------------------------------------------------------------------------
                |
                | 50 simultaneous requests.
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
                | COLLECT
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

                }


                /*
                |--------------------------------------------------------------------------
                | SAVE AFTER EACH BATCH
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
                | STATISTICS
                |--------------------------------------------------------------------------
                */

                const statistics =
                    getStatistics(
                        results
                    );


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


                const elapsed =
                    (
                        Date.now() -
                        startedAt
                    ) /
                    1000;


                const average =
                    completed
                        ? elapsed /
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


                /*
                |--------------------------------------------------------------------------
                | COLORFUL PROGRESS
                |--------------------------------------------------------------------------
                */

                console.log(
                    ""
                );


                console.log(
                    cyan(
                        "────────────────────────────────────────────────────────────"
                    )
                );


                console.log(
                    `${bold("PROGRESS")} ${green(
                        `${completed}/${medicines.length}`
                    )} ${cyan(
                        `(${percentage}%)`
                    )}`
                );


                console.log(
                    `${green("✓ Success")} ${successful}   ${red(
                        "✗ Failed"
                    )} ${failed}`
                );


                console.log(
                    `${magenta("🖼 Images")} ${green(
                        statistics.image.found
                    )}/${completed} (${statistics.image.percentage}%)`
                );


                console.log(
                    `${magenta("◉ Dosage Images")} ${statistics.dosageFormImage.found}/${completed}`
                );


                console.log(
                    `${cyan("Composition")} ${statistics.composition.found}/${completed}`
                );


                console.log(
                    `${cyan("Therapeutic Class")} ${statistics.therapeuticClass.found}/${completed}`
                );


                console.log(
                    `${cyan("Storage")} ${statistics.storageConditions.found}/${completed}`
                );


                console.log(
                    `${cyan("Available As")} ${statistics.availableAs.found}/${completed}`
                );


                console.log(
                    `${yellow("Molecular Formula")} ${statistics.molecularFormula.found}/${completed}`
                );


                console.log(
                    `${yellow("Chemical Image")} ${statistics.chemicalStructureImage.found}/${completed}`
                );


                console.log(
                    `${cyan("ETA")} ~${etaMinutes} minutes`
                );


                console.log(
                    `${green("Saved")} output3.json`
                );


                console.log(
                    cyan(
                        "────────────────────────────────────────────────────────────"
                    )
                );

            }


            /*
            |--------------------------------------------------------------------------
            | FINAL
            |--------------------------------------------------------------------------
            */

            const statistics =
                getStatistics(
                    results
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


            fs.writeFileSync(
                outputPath,
                JSON.stringify(
                    results,
                    null,
                    2
                ),
                "utf8"
            );


            console.log(
                ""
            );


            console.log(
                green(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                green(
                    bold(
                        "                 OUTPUT 3 COMPLETE"
                    )
                )
            );


            console.log(
                green(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                `Total: ${results.length}`
            );


            console.log(
                green(
                    `Successful: ${successful}`
                )
            );


            console.log(
                red(
                    `Failed: ${failed}`
                )
            );


            console.log(
                ""
            );


            console.log(
                `${magenta("Images:")} ${statistics.image.found}/${results.length} (${statistics.image.percentage}%)`
            );


            console.log(
                `${magenta("Dosage Images:")} ${statistics.dosageFormImage.found}/${results.length} (${statistics.dosageFormImage.percentage}%)`
            );


            console.log(
                `${cyan("Composition:")} ${statistics.composition.found}/${results.length} (${statistics.composition.percentage}%)`
            );


            console.log(
                `${cyan("Therapeutic Class:")} ${statistics.therapeuticClass.found}/${results.length} (${statistics.therapeuticClass.percentage}%)`
            );


            console.log(
                `${cyan("Storage:")} ${statistics.storageConditions.found}/${results.length} (${statistics.storageConditions.percentage}%)`
            );


            console.log(
                `${yellow("Molecular Formula:")} ${statistics.molecularFormula.found}/${results.length} (${statistics.molecularFormula.percentage}%)`
            );


            console.log(
                `${yellow("Chemical Image:")} ${statistics.chemicalStructureImage.found}/${results.length} (${statistics.chemicalStructureImage.percentage}%)`
            );


            console.log(
                ""
            );


            console.log(
                `${green("Duration:")} ${duration}s`
            );


            console.log(
                `${green("Output:")} output3.json`
            );


            console.log(
                green(
                    "════════════════════════════════════════════════════════════"
                )
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

                    concurrency:
                        CONCURRENCY,

                    totalBatches,

                    statistics,

                    duration:
                        `${duration}s`,

                    input:
                        "medex-output2.json",

                    output:
                        "output3.json",

                    failedOutput:
                        "output3-failed.json",

                });


        } catch (
            error
        ) {

            console.error(
                red(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.error(
                red(
                    bold(
                        "OUTPUT 3 FATAL ERROR"
                    )
                )
            );


            console.error(
                error
            );


            console.error(
                red(
                    "════════════════════════════════════════════════════════════"
                )
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