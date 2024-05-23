import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [previewImages, setPreviewImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
    setOriginalFileName(file.name);
    setUploading(true);

    setTimeout(() => setUploading(false), 1000); // Simulate a delay for loader demonstration
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/colorize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPreviewImages(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageData, modelName) => {
    const fileExtension = originalFileName.split(".").pop();
    const baseName = originalFileName.replace(`.${fileExtension}`, "");
    const downloadName = `${baseName}_colorized_${modelName}.${fileExtension}`;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      {(loading || uploading) && (
        <div className="loader-overlay">
          <ClipLoader color="#f0f0f0" size={60} />
        </div>
      )}
      <h1>Image Colorization</h1>
      <div className="file-input">
        <label className="file-label">
          Upload Image
          <input type="file" onChange={handleUpload} />
        </label>
      </div>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!image || loading}
      >
        Colorize Image
      </button>

      {previewImages && (
        <div className="preview-container">
          <h2>Preview</h2>
          <div className="image-container">
            <div className="image-preview">
              <h3>ECCV16</h3>
              <img
                src={`data:image/png;base64,${previewImages.eccv16}`}
                alt="ECCV16"
              />
              <button
                className="download-button"
                onClick={() => handleDownload(previewImages.eccv16, "ECCV16")}
              >
                Download ECCV16
              </button>
            </div>
            <div className="image-preview">
              <h3>SIGGRAPH17</h3>
              <img
                src={`data:image/png;base64,${previewImages.siggraph17}`}
                alt="SIGGRAPH17"
              />
              <button
                className="download-button"
                onClick={() =>
                  handleDownload(previewImages.siggraph17, "SIGGRAPH17")
                }
              >
                Download SIGGRAPH17
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
