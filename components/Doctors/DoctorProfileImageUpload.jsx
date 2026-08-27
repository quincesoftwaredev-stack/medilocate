import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import styles from "./DoctorProfileImageUpload.module.css";


export default function DoctorProfileImageUpload({
    value = "",
    onChange,
}) {

    const inputRef =
        useRef(null);

    const [image, setImage] =
        useState(value || "");

    const [uploading, setUploading] =
        useState(false);

    const [progress, setProgress] =
        useState(0);


    useEffect(() => {

        setImage(
            value || ""
        );

    }, [value]);


    const uploadImage = (
        file
    ) => {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                formData.append(
                    "upload_preset",
                    "mediLocate"
                );

                formData.append(
                    "folder",
                    "medilocate/doctors/profiles"
                );


                const xhr =
                    new XMLHttpRequest();


                xhr.open(
                    "POST",
                    "https://api.cloudinary.com/v1_1/dicwszs3e/image/upload"
                );


                xhr.upload.addEventListener(
                    "progress",
                    (
                        event
                    ) => {

                        if (
                            !event.lengthComputable
                        ) {
                            return;
                        }

                        setProgress(
                            Math.round(
                                (
                                    event.loaded /
                                    event.total
                                ) *
                                100
                            )
                        );

                    }
                );


                xhr.onload = () => {

                    if (
                        xhr.status < 200 ||
                        xhr.status >= 300
                    ) {

                        reject(
                            new Error(
                                "Profile image upload failed."
                            )
                        );

                        return;
                    }


                    try {

                        const response =
                            JSON.parse(
                                xhr.responseText
                            );


                        if (
                            !response?.secure_url
                        ) {

                            reject(
                                new Error(
                                    "No image URL was returned."
                                )
                            );

                            return;
                        }


                        resolve({
                            url:
                                response.secure_url,

                            publicId:
                                response.public_id ||
                                "",
                        });

                    } catch (
                        error
                    ) {

                        reject(
                            error
                        );

                    }

                };


                xhr.onerror = () => {

                    reject(
                        new Error(
                            "Unable to upload profile image."
                        )
                    );

                };


                xhr.send(
                    formData
                );

            }
        );

    };


    const handleFile = async (
        file
    ) => {

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            alert(
                "Please upload a JPG, PNG or WebP image."
            );

            return;
        }


        if (
            file.size >
            5 *
            1024 *
            1024
        ) {

            alert(
                "Profile image must be smaller than 5MB."
            );

            return;
        }


        try {

            setUploading(
                true
            );

            setProgress(
                0
            );


            const uploaded =
                await uploadImage(
                    file
                );


            setImage(
                uploaded.url
            );


            onChange(
                uploaded
            );

        } catch (
            error
        ) {

            console.error(
                "Doctor profile image upload error:",
                error
            );


            alert(
                error?.message ||
                "Unable to upload profile image."
            );

        } finally {

            setUploading(
                false
            );

            setProgress(
                0
            );

        }

    };


    const handleChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        handleFile(
            file
        );


        event.target.value =
            "";

    };


    const removeImage = () => {

        setImage(
            ""
        );

        onChange({
            url: "",
            publicId: "",
        });

    };


    return (
        <div
            className={
                styles.wrapper
            }
        >

            <div
                className={
                    styles.preview
                }
            >

                {image ? (

                    <img
                        src={image}
                        alt="Doctor profile"
                    />

                ) : (

                    <PersonOutlineRoundedIcon />

                )}


                {uploading && (

                    <div
                        className={
                            styles.uploadOverlay
                        }
                    >

                        <strong>
                            {progress}%
                        </strong>

                    </div>

                )}

            </div>


            <div
                className={
                    styles.controls
                }
            >

                <div>

                    <strong>
                        Profile picture
                    </strong>

                    <span>
                        JPG, PNG or WebP · Max 5MB
                    </span>

                </div>


                <div
                    className={
                        styles.buttons
                    }
                >

                    <button
                        type="button"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        disabled={
                            uploading
                        }
                    >

                        <CloudUploadOutlinedIcon />

                        {image
                            ? "Change"
                            : "Upload"}

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        disabled={
                            uploading
                        }
                        className={
                            styles.cameraButton
                        }
                    >

                        <CameraAltOutlinedIcon />

                        Camera

                    </button>


                    {image && (

                        <button
                            type="button"
                            onClick={
                                removeImage
                            }
                            disabled={
                                uploading
                            }
                            className={
                                styles.deleteButton
                            }
                        >

                            <DeleteOutlineRoundedIcon />

                            Remove

                        </button>

                    )}

                </div>

            </div>


            {image && !uploading && (

                <div
                    className={
                        styles.uploaded
                    }
                >

                    <CheckCircleRoundedIcon />

                    Profile picture uploaded

                </div>

            )}


            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                hidden
                onChange={
                    handleChange
                }
            />

        </div>
    );
}