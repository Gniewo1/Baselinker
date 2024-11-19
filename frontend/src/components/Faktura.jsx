import React, { useState } from 'react';
import Navbar from './Navbar';

function Faktura() {
    const [file, setFile] = useState(null);
    const [choice, setChoice] = useState(""); // State for choice selection
    const [result, setResult] = useState({});

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleChoiceChange = (e) => {
        setChoice(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file.");
            return;
        }
        if (!choice) {
            alert("Please select a courier.");
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('choice', choice); // Append choice to form data

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

                <select value={choice} onChange={handleChoiceChange}>
                    <option value="">Select Courier</option>
                    <option value="DHL">DHL</option>
                    <option value="Fedex">Fedex</option>
                    <option value="GLS">GLS</option>
                    <option value="UPS">UPS</option>
                </select>

                <button type="submit" >Upload</button>
            </form>
            {result.text && (
                <div>
                    <h3>Cost:</h3>
                    <p>{result.amount[0] || "Not found"}</p>
                    <h3>Document Number:</h3>
                    <p>{result.amount[1] || "Not found"}</p>
                </div>
            )}
        </div>
        </>
    );
}

export default Faktura;