import React, { useState } from 'react';
import styles from '../../styles/Utility/Upload.module.css';
import Loading from './Loading';

const Upload = ({ handle, type }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'medilocate'); // replace with your preset
      formData.append('folder', 'division'); // optional folder in Cloudinary

      // Cloudinary upload URL
      const url = `https://api.cloudinary.com/v1_1/dicwszs3e/image/upload`;

      const xhr = new XMLHttpRequest();

      xhr.open('POST', url);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          console.log('Cloudinary URL:', res.secure_url);
          setImage(res.secure_url);
          handle({
            name: file.name,
            size: file.size,
            type: file.type,
            url: res.secure_url,
          });
        } else {
          alert('Upload failed!');
          console.error(xhr.responseText);
        }
        setUploading(false);
        setFile(null);
      };

      xhr.onerror = () => {
        alert('Upload error!');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      {uploading && <Loading />}

      <input
        type="file"
        accept={type || '.png, .jpg, .jpeg'}
        className={styles.inputfile}
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          setFile(selectedFile);
          handleFile(selectedFile);
        }}
        style={uploading ? { display: 'none' } : { display: 'block' }}
      />

      {/* {uploading && <div>{progress}% uploaded</div>} */}

      {/* {image && (
        <div style={{ marginTop: '10px' }}>
          <img src={image} alt="uploaded" style={{ width: '150px' }} />
        </div>
      )} */}
    </div>
  );
};

export default Upload;