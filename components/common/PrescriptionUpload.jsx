import React, { useEffect, useState } from "react";
import styles from "@/styles/Common/PrescriptionUpload.module.css";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function PrescriptionUpload({
    value = [],
    onChange
}) {

    const [files, setFiles] = useState(value || []);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {

        setFiles(value || []);

    }, [value]);


    const formatFileSize = (bytes) => {

        if (!bytes) {
            return "";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    };


    const uploadFile = (file) => {

        return new Promise((resolve, reject) => {

            const formData = new FormData();

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
                "medilocate/prescriptions"
            );


            const xhr = new XMLHttpRequest();

            xhr.open(
                "POST",
                "https://api.cloudinary.com/v1_1/dicwszs3e/image/upload"
            );


            xhr.upload.addEventListener(
                "progress",
                (event) => {

                    if (!event.lengthComputable) {
                        return;
                    }

                    setProgress(
                        Math.round(
                            (event.loaded / event.total) * 100
                        )
                    );

                }
            );


            xhr.onload = () => {

                if (xhr.status < 200 || xhr.status >= 300) {

                    reject(
                        new Error(
                            "Prescription upload failed."
                        )
                    );

                    return;
                }


                try {

                    const response =
                        JSON.parse(
                            xhr.responseText
                        );


                    if (!response?.secure_url) {

                        reject(
                            new Error(
                                "Cloudinary did not return an image URL."
                            )
                        );

                        return;
                    }


                    resolve({
                        url: response.secure_url,
                        publicId: response.public_id || "",
                        name: file.name,
                        type: file.type,
                        size: file.size
                    });

                } catch (error) {

                    reject(error);

                }

            };


            xhr.onerror = () => {

                reject(
                    new Error(
                        "Unable to upload prescription."
                    )
                );

            };


            xhr.send(formData);

        });

    };


    const processFiles = async (selectedFiles) => {

        const filesArray =
            Array.from(selectedFiles || []);


        if (!filesArray.length) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];


        const validFiles = [];


        for (const file of filesArray) {

            if (!allowedTypes.includes(file.type)) {

                alert(
                    `${file.name} is not a supported file type.`
                );

                continue;
            }


            if (file.size > 10 * 1024 * 1024) {

                alert(
                    `${file.name} must be smaller than 10MB.`
                );

                continue;
            }


            validFiles.push(file);

        }


        if (!validFiles.length) {
            return;
        }


        setUploading(true);
        setProgress(0);


        try {

            const uploadedFiles = [];


            for (const file of validFiles) {

                const uploaded =
                    await uploadFile(file);

                uploadedFiles.push(uploaded);

            }


            const updatedFiles = [
                ...files,
                ...uploadedFiles
            ];


            setFiles(updatedFiles);

            onChange(updatedFiles);


        } catch (error) {

            console.error(
                "Prescription upload error:",
                error
            );

            alert(
                error?.message ||
                "Something went wrong while uploading prescription."
            );

        } finally {

            setUploading(false);
            setProgress(0);

        }

    };


    const handleFileChange = (event) => {

        if (!event.target.files?.length) {
            return;
        }

        processFiles(
            event.target.files
        );

        event.target.value = "";

    };


    const handleDragOver = (event) => {

        event.preventDefault();

        setDragActive(true);

    };


    const handleDragLeave = (event) => {

        event.preventDefault();

        setDragActive(false);

    };


    const handleDrop = (event) => {

        event.preventDefault();

        setDragActive(false);


        if (!event.dataTransfer.files?.length) {
            return;
        }


        processFiles(
            event.dataTransfer.files
        );

    };


    const handleRemoveFile = (index) => {

        const updatedFiles =
            files.filter(
                (_, fileIndex) =>
                    fileIndex !== index
            );


        setFiles(updatedFiles);

        onChange(updatedFiles);

    };


    const handleRemoveAll = () => {

        setFiles([]);

        onChange([]);

    };


    return (
        <div className={styles.wrapper}>

            <div
                className={`${styles.dropzone} ${
                    dragActive
                        ? styles.dragActive
                        : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >

                {!uploading && (

                    <>

                        <div className={styles.uploadIcon}>

                            <CloudUploadOutlinedIcon />

                        </div>


                        <h3>
                            Upload your prescription
                        </h3>


                        <p>
                            Drag & drop your file here
                            or choose from your device
                        </p>


                        <div className={styles.uploadActions}>

                            <button
                                type="button"
                                className={styles.chooseButton}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "prescription-file-input"
                                        )
                                        ?.click()
                                }
                            >

                                <AddPhotoAlternateOutlinedIcon />

                                Choose file

                            </button>


                            <button
                                type="button"
                                className={styles.cameraButton}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "prescription-camera-input"
                                        )
                                        ?.click()
                                }
                            >

                                <CameraAltOutlinedIcon />

                                Take photo

                            </button>

                        </div>


                        <span className={styles.fileHint}>

                            JPG, PNG, WEBP or PDF
                            {" "}•{" "}
                            Maximum 10 MB each

                        </span>

                    </>

                )}


                {uploading && (

                    <div className={styles.progressBox}>

                        <div className={styles.progressHeader}>

                            <span>
                                Uploading prescription
                            </span>

                            <strong>
                                {progress}%
                            </strong>

                        </div>


                        <div className={styles.progressBar}>

                            <div
                                className={styles.progress}
                                style={{
                                    width:
                                        `${progress}%`
                                }}
                            />

                        </div>

                    </div>

                )}


                <input
                    id="prescription-file-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    multiple
                    hidden
                    onChange={handleFileChange}
                />


                <input
                    id="prescription-camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={handleFileChange}
                />

            </div>


            {files.length > 0 && (

                <div className={styles.fileList}>

                    <div className={styles.fileListHeader}>

                        <span>
                            Uploaded files
                        </span>


                        <div>

                            <strong>
                                {files.length}
                            </strong>


                            <button
                                type="button"
                                onClick={handleRemoveAll}
                                className={styles.removeAll}
                            >
                                Remove all
                            </button>

                        </div>

                    </div>


                    {files.map((file, index) => (

                        <div
                            key={`${file.publicId || file.url}-${index}`}
                            className={styles.fileItem}
                        >

                            <div className={styles.filePreview}>

                                {file.type?.startsWith("image/") ? (

                                    <img
                                        src={file.url}
                                        alt={
                                            file.name ||
                                            "Prescription"
                                        }
                                    />

                                ) : (

                                    <DescriptionOutlinedIcon />

                                )}

                            </div>


                            <div className={styles.fileInfo}>

                                <strong>
                                    {file.name}
                                </strong>


                                <span>
                                    {formatFileSize(file.size)}
                                </span>

                            </div>


                            <CheckCircleRoundedIcon
                                className={styles.fileCheck}
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveFile(index)
                                }
                                className={styles.fileDelete}
                                aria-label="Remove file"
                            >

                                <DeleteOutlineRoundedIcon />

                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}