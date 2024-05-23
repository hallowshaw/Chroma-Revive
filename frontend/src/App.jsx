import React, { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [previewImages, setPreviewImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
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

  const handleDownload = (imageData, imageName) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          padding: "0 20px",
        }}
      >
        <h1>Image Colorization</h1>
        <input type="file" onChange={handleUpload} />
        <button onClick={handleSubmit} disabled={!image || loading}>
          {loading ? "Colorizing..." : "Colorize Image"}
        </button>

        {previewImages && (
          <div style={{ marginTop: "20px" }}>
            <h2>Preview</h2>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ marginRight: "20px" }}>
                <h3>ECCV16</h3>
                <img
                  src={`data:image/png;base64,${previewImages.eccv16}`}
                  alt="ECCV16"
                  style={{ maxWidth: "300px", maxHeight: "300px" }}
                />
                <button
                  onClick={() =>
                    handleDownload(previewImages.eccv16, "eccv16.png")
                  }
                >
                  Download ECCV16
                </button>
              </div>
              <div>
                <h3>SIGGRAPH17</h3>
                <img
                  src={`data:image/png;base64,${previewImages.siggraph17}`}
                  alt="SIGGRAPH17"
                  style={{ maxWidth: "300px", maxHeight: "300px" }}
                />
                <button
                  onClick={() =>
                    handleDownload(previewImages.siggraph17, "siggraph17.png")
                  }
                >
                  Download SIGGRAPH17
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
