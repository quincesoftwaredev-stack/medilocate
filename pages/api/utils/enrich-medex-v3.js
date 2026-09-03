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
| CONFIG
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

    blue:
        "\x1b[34m",

    magenta:
        "\x1b[35m",

    cyan:
        "\x1b[36m",

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


const blue = (
    text
) =>
    `${COLOR.blue}${text}${COLOR.reset}`;


const gray = (
    text
) =>
    `${COLOR.gray}${text}${COLOR.reset}`;


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


    const stringValue =
        String(
            value
        )
            .trim();


    const lower =
        stringValue
            .toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | REJECT PLACEHOLDERS
    |--------------------------------------------------------------------------
    */

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
| VALID IMAGE EXTENSION
|--------------------------------------------------------------------------
*/

const looksLikeImage = (
    value,
    allowSvg =
        true
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

            ".jpg",

            ".jpeg",

            ".png",

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
| GET SECTION TEXT
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
| PARSE MONEY
|--------------------------------------------------------------------------
*/

const parseMoney = (
    value
) => {

    if (
        value ===
            null ||
        value ===
            undefined ||
        value ===
            ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(
                value
            )
                .replace(
                    /৳/g,
                    ""
                )
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /BDT/gi,
                    ""
                )
                .replace(
                    /Tk\.?/gi,
                    ""
                )
                .trim()
        );


    if (
        !Number.isFinite(
            number
        ) ||
        number <=
            0
    ) {

        return 0;

    }


    return Number(
        number.toFixed(
            2
        )
    );

};


/*
|--------------------------------------------------------------------------
| STRIP PRICE
|--------------------------------------------------------------------------
|
| Examples:
|
| Strip Price: ৳ 12.00
|
| Strip Price : ৳ 110.00
|
| Strip Price ৳ 1,250.00
|
| Strip Price: Tk. 500.00
|
| Strip Price: BDT 500.00
|--------------------------------------------------------------------------
*/

const getStripPriceInformation = (
    $
) => {

    const stripPrices =
        [];


    const addPrice = (
        value
    ) => {

        const price =
            parseMoney(
                value
            );


        if (
            !price
        ) {

            return;

        }


        if (
            !stripPrices.includes(
                price
            )
        ) {

            stripPrices.push(
                price
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | BODY TEXT
    |--------------------------------------------------------------------------
    */

    const bodyText =
        $("body")
            .text()
            .replace(
                /\u00a0/g,
                " "
            )
            .replace(
                /\r/g,
                " "
            )
            .replace(
                /\n/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    /*
    |--------------------------------------------------------------------------
    | MAIN REGEX
    |--------------------------------------------------------------------------
    */

    const regex =
        /Strip\s*Price\s*:?\s*(?:৳|BDT|Tk\.?)?\s*([\d,]+(?:\.\d+)?)/gi;


    let match;


    while (
        (
            match =
                regex.exec(
                    bodyText
                )
        ) !==
        null
    ) {

        addPrice(
            match[1]
        );

    }


    /*
    |--------------------------------------------------------------------------
    | DOM FALLBACK
    |--------------------------------------------------------------------------
    |
    | Handles markup like:
    |
    | <span>Strip Price:</span>
    | <span>৳ 120.00</span>
    |--------------------------------------------------------------------------
    */

    $("body *")
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
                    );


                if (
                    !ownText
                ) {

                    return;

                }


                if (
                    !/strip\s*price/i.test(
                        ownText
                    )
                ) {

                    return;

                }


                /*
                |--------------------------------------------------------------------------
                | OWN TEXT
                |--------------------------------------------------------------------------
                */

                const ownMatch =
                    ownText.match(
                        /Strip\s*Price\s*:?\s*(?:৳|BDT|Tk\.?)?\s*([\d,]+(?:\.\d+)?)/i
                    );


                if (
                    ownMatch
                ) {

                    addPrice(
                        ownMatch[1]
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | NEXT ELEMENT
                |--------------------------------------------------------------------------
                */

                const nextText =
                    cleanText(
                        $(element)
                            .next()
                            .text()
                    );


                if (
                    nextText
                ) {

                    const nextPrice =
                        nextText.match(
                            /(?:৳|BDT|Tk\.?)?\s*([\d,]+(?:\.\d+)?)/i
                        );


                    if (
                        nextPrice
                    ) {

                        addPrice(
                            nextPrice[1]
                        );

                    }

                }


                /*
                |--------------------------------------------------------------------------
                | PARENT TEXT
                |--------------------------------------------------------------------------
                */

                const parentText =
                    cleanText(
                        $(element)
                            .parent()
                            .text()
                    );


                if (
                    parentText
                ) {

                    const parentRegex =
                        /Strip\s*Price\s*:?\s*(?:৳|BDT|Tk\.?)?\s*([\d,]+(?:\.\d+)?)/gi;


                    let parentMatch;


                    while (
                        (
                            parentMatch =
                                parentRegex.exec(
                                    parentText
                                )
                        ) !==
                        null
                    ) {

                        addPrice(
                            parentMatch[1]
                        );

                    }

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | RAW HTML FALLBACK
    |--------------------------------------------------------------------------
    */

    const html =
        $.html()
            .replace(
                /&nbsp;/gi,
                " "
            )
            .replace(
                /&#2547;/gi,
                "৳"
            )
            .replace(
                /&\#x9F3;/gi,
                "৳"
            );


    const rawRegex =
        /Strip(?:\s|<[^>]+>)*Price(?:\s|<[^>]+>)*:?(?:\s|<[^>]+>)*(?:৳|BDT|Tk\.?)?(?:\s|<[^>]+>)*([\d,]+(?:\.\d+)?)/gi;


    while (
        (
            match =
                rawRegex.exec(
                    html
                )
        ) !==
        null
    ) {

        addPrice(
            match[1]
        );

    }


    return {

        stripPrice:

            stripPrices[0] ||
            0,

        stripPrices,

    };

};


/*
|--------------------------------------------------------------------------
| EXISTING STRIP PRICES
|--------------------------------------------------------------------------
*/

const getExistingStripPrices = (
    medicine
) => {

    const prices =
        [];


    const addPrice = (
        value
    ) => {

        const price =
            parseMoney(
                value
            );


        if (
            !price
        ) {

            return;

        }


        if (
            !prices.includes(
                price
            )
        ) {

            prices.push(
                price
            );

        }

    };


    addPrice(
        medicine.stripPrice
    );


    if (
        Array.isArray(
            medicine.stripPrices
        )
    ) {

        for (
            const price of
            medicine.stripPrices
        ) {

            addPrice(
                price
            );

        }

    }


    return prices;

};


/*
|--------------------------------------------------------------------------
| PACK IMAGES
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


        if (
            !looksLikeImage(
                url,
                false
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
    | IMG
    |--------------------------------------------------------------------------
    */

    $("img")
        .each(
            (
                index,
                element
            ) => {

                /*
                 * Lazy URL first.
                 */

                addImage(
                    $(element)
                        .attr(
                            "data-src"
                        )
                );


                addImage(
                    $(element)
                        .attr(
                            "data-original"
                        )
                );


                addImage(
                    $(element)
                        .attr(
                            "data-lazy-src"
                        )
                );


                addImage(
                    $(element)
                        .attr(
                            "src"
                        )
                );

            }
        );


    /*
    |--------------------------------------------------------------------------
    | PACK IMAGE ANCHOR
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


                const href =
                    $(element)
                        .attr(
                            "href"
                        );


                if (
                    text.includes(
                        "pack image"
                    )
                ) {

                    addImage(
                        href
                    );

                }

            }
        );


    /*
    |--------------------------------------------------------------------------
    | PREFER PACKAGING IMAGES
    |--------------------------------------------------------------------------
    */

    const packagingImages =
        images.filter(
            (
                image
            ) =>
                image
                    .toLowerCase()
                    .includes(
                        "packaging"
                    )
        );


    if (
        packagingImages.length
    ) {

        return packagingImages;

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

        const url =
            absoluteUrl(
                value
            );


        if (
            !url
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


        const lower =
            url.toLowerCase();


        if (
            lower.includes(
                "dosage-form"
            ) ||
            lower.includes(
                "dosage-forms"
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


    $("img")
        .each(
            (
                index,
                element
            ) => {

                addCandidate(
                    $(element)
                        .attr(
                            "data-src"
                        )
                );


                addCandidate(
                    $(element)
                        .attr(
                            "src"
                        )
                );

            }
        );


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
| CHEMICAL IMAGE
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

        const url =
            absoluteUrl(
                value
            );


        if (
            !url
        ) {

            return;

        }


        if (
            !looksLikeImage(
                url,
                true
            )
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


                const context =
                    `${alt} ${title}`;


                addCandidate(
                    $(element)
                        .attr(
                            "data-src"
                        ),
                    context
                );


                addCandidate(
                    $(element)
                        .attr(
                            "src"
                        ),
                    context
                );

            }
        );


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
                yellow(
                    `   ↻ Retry ${retry + 1}/${MAX_RETRIES} → ${url}`
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
                `[${index + 1}/${total}] ✗ Missing sourceUrl`
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
        | STRIP PRICE
        |--------------------------------------------------------------------------
        */

        const newStripInfo =
            getStripPriceInformation(
                $
            );


        const oldStripPrices =
            getExistingStripPrices(
                medicine
            );


        const finalStripPrices =

            newStripInfo
                .stripPrices
                .length

                ? newStripInfo
                    .stripPrices

                : oldStripPrices;


        const finalStripPrice =

            newStripInfo
                .stripPrice ||

            oldStripPrices[0] ||

            0;


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
        | OTHER
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
        | COLORFUL CONSOLE
        |--------------------------------------------------------------------------
        */

        console.log(
            `${green("✓")} ${cyan(
                `[${index + 1}/${total}]`
            )} ${bold(
                medicine.brandName ||
                medicine.slug
            )} ${gray(
                `${duration}s`
            )}`
        );


        if (
            newStripInfo
                .stripPrices
                .length
        ) {

            console.log(
                `   ${green("💰 Strip Price FOUND")} ${newStripInfo.stripPrices
                    .map(
                        (
                            price
                        ) =>
                            `৳ ${price.toFixed(
                                2
                            )}`
                    )
                    .join(
                        ", "
                    )}`
            );

        } else if (
            finalStripPrice
        ) {

            console.log(
                `   ${yellow("💰 Strip Price OLD")} ৳ ${finalStripPrice.toFixed(
                    2
                )}`
            );

        } else {

            console.log(
                `   ${red("💰 Strip Price NOT AVAILABLE")}`
            );

        }


        console.log(
            `   ${magenta("Images")} ${
                images.length
                    ? green(
                        images.length
                    )
                    : yellow(
                        "0"
                    )
            } | ${blue("Composition")} ${
                composition
                    ? green(
                        "YES"
                    )
                    : yellow(
                        "NO"
                    )
            }`
        );


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return {

            ...medicine,


            /*
            |--------------------------------------------------------------------------
            | STRIP PRICE
            |--------------------------------------------------------------------------
            */

            stripPrice:
                finalStripPrice,


            stripPrices:
                finalStripPrices,


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
            | AVAILABLE AS
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
            | REFERENCE DATA
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

                ...(
                    medicine.chemical ||
                    {}
                ),


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

        const status =
            error.response
                ?.status;


        console.error(
            `${red("✗")} ${cyan(
                `[${index + 1}/${total}]`
            )} ${medicine.brandName || medicine.slug}`
        );


        console.error(
            red(
                `   ${
                    status
                        ? `HTTP ${status}`
                        : error.message
                }`
            )
        );


        /*
        |--------------------------------------------------------------------------
        | PRESERVE EXISTING STRIP PRICE ON FAILURE
        |--------------------------------------------------------------------------
        */

        const oldStripPrices =
            getExistingStripPrices(
                medicine
            );


        return {

            ...medicine,


            stripPrice:

                oldStripPrices[0] ||

                0,


            stripPrices:
                oldStripPrices,


            sourceUrl,


            enrichedAt:
                new Date()
                    .toISOString(),


            enrichmentSuccess:
                false,


            enrichmentError:

                status

                    ? `HTTP ${status}`

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
                    "medex-output3.json"
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
            | CHECK INPUT
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


            /*
            |--------------------------------------------------------------------------
            | LOAD
            |--------------------------------------------------------------------------
            */

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


            let stripPriceFound =
                0;


            let multipleStripPricesFound =
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
                        "              MEDEX ENRICHMENT STARTED"
                    )
                )
            );


            console.log(
                cyan(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                `${cyan("Input:")} medex-output.json`
            );


            console.log(
                `${cyan("Output:")} ${green(
                    "medex-output2.json"
                )}`
            );


            console.log(
                `${cyan("Total:")} ${bold(
                    medicines.length
                )}`
            );


            console.log(
                `${cyan("Concurrency:")} ${green(
                    CONCURRENCY
                )}`
            );


            console.log(
                `${cyan("Batches:")} ${bold(
                    totalBatches
                )}`
            );


            console.log(
                cyan(
                    "════════════════════════════════════════════════════════════"
                )
            );


            /*
            |--------------------------------------------------------------------------
            | PROMISE.ALL BATCHES
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
                    )} ${gray(
                        `${start + 1}-${Math.min(
                            start +
                            batch.length,
                            medicines.length
                        )}`
                    )}`
                );


                /*
                |--------------------------------------------------------------------------
                | PROMISE.ALL
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


                    /*
                    |--------------------------------------------------------------------------
                    | STRIP PRICE STATS
                    |--------------------------------------------------------------------------
                    */

                    if (
                        Number(
                            item.stripPrice
                        ) >
                        0
                    ) {

                        stripPriceFound++;

                    }


                    if (
                        Array.isArray(
                            item.stripPrices
                        ) &&
                        item.stripPrices.length >
                        1
                    ) {

                        multipleStripPricesFound++;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | OTHER STATS
                    |--------------------------------------------------------------------------
                    */

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
                    `${green("✓ Successful")} ${successful}    ${red(
                        "✗ Failed"
                    )} ${failed}`
                );


                console.log(
                    ""
                );


                console.log(
                    `${green("💰 Strip Price")} ${stripPriceFound}/${completed}`
                );


                console.log(
                    `${magenta("💰 Multiple Strip Prices")} ${multipleStripPricesFound}`
                );


                console.log(
                    `${blue("🖼 Pack Images")} ${packImagesFound}`
                );


                console.log(
                    `${blue("◉ Dosage Images")} ${dosageImagesFound}`
                );


                console.log(
                    `${cyan("Composition")} ${compositionFound}`
                );


                console.log(
                    `${cyan("Therapeutic Class")} ${therapeuticFound}`
                );


                console.log(
                    `${cyan("Storage")} ${storageFound}`
                );


                console.log(
                    `${yellow("Molecular Formula")} ${molecularFound}`
                );


                console.log(
                    `${yellow("Chemical Image")} ${chemicalImagesFound}`
                );


                console.log(
                    ""
                );


                console.log(
                    `${cyan("ETA")} ~${etaMinutes} minutes`
                );


                console.log(
                    `${green("Saved")} medex-output2.json`
                );


                console.log(
                    cyan(
                        "────────────────────────────────────────────────────────────"
                    )
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


            const stripPercentage =
                results.length

                    ? Number(
                        (
                            (
                                stripPriceFound /
                                results.length
                            ) *
                            100
                        )
                            .toFixed(
                                2
                            )
                    )

                    : 0;


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
                        "             MEDEX ENRICHMENT COMPLETE"
                    )
                )
            );


            console.log(
                green(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.log(
                `${bold("Total:")} ${results.length}`
            );


            console.log(
                `${green("Successful:")} ${successful}`
            );


            console.log(
                `${red("Failed:")} ${failed}`
            );


            console.log(
                ""
            );


            console.log(
                `${green("💰 Strip Price:")} ${stripPriceFound}/${results.length} (${stripPercentage}%)`
            );


            console.log(
                `${magenta("Multiple Strip Prices:")} ${multipleStripPricesFound}`
            );


            console.log(
                `${blue("Pack Images:")} ${packImagesFound}`
            );


            console.log(
                `${blue("Dosage Images:")} ${dosageImagesFound}`
            );


            console.log(
                `${cyan("Composition:")} ${compositionFound}`
            );


            console.log(
                `${cyan("Therapeutic Class:")} ${therapeuticFound}`
            );


            console.log(
                `${cyan("Storage:")} ${storageFound}`
            );


            console.log(
                `${yellow("Molecular Formula:")} ${molecularFound}`
            );


            console.log(
                `${yellow("Chemical Images:")} ${chemicalImagesFound}`
            );


            console.log(
                ""
            );


            console.log(
                `${green("Duration:")} ${totalSeconds}s`
            );


            console.log(
                `${green("Output:")} medex-output2.json`
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


                    statistics: {

                        stripPrice: {

                            found:
                                stripPriceFound,

                            missing:
                                results.length -
                                stripPriceFound,

                            percentage:
                                stripPercentage,

                        },


                        multipleStripPrices: {

                            found:
                                multipleStripPricesFound,

                        },


                        image: {

                            found:
                                packImagesFound,

                            missing:
                                results.length -
                                packImagesFound,

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
                red(
                    "════════════════════════════════════════════════════════════"
                )
            );


            console.error(
                red(
                    bold(
                        "MEDEX ENRICHMENT FATAL ERROR"
                    )
                )
            );


            console.error(
                red(
                    "════════════════════════════════════════════════════════════"
                )
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