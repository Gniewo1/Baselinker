import React, { useState } from 'react';
import Navbar from './Navbar'

function Faktura() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState({});

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await fetch('http://localhost:8000/api/process-pdf/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setResult(data);
            } else {
                console.error("Error:", data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
        <Navbar />
        <div>
            <h1>Upload PDF</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {result.text && (
                <div>
                    {/* <h2>Extracted Text</h2>
                    <p>{result.text}</p> */}
                    <h3>Razem PLN:</h3>
                    <p>{result.amount || "Not found"}</p>
                </div>
            )}
        </div>
        </>
    );
}

export default Faktura;