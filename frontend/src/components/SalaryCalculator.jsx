import React, { useState } from "react";

const SalaryCalculator = () => {
  const [brutto, setBrutto] = useState(0);
  const [netto, setNetto] = useState(null);
  const [details, setDetails] = useState(null);

  const calculateSalary = () => {
    const bruttoValue = parseFloat(brutto);
    if (isNaN(bruttoValue) || bruttoValue <= 0) {
      setNetto(null);
      setDetails(null);
      return;
    }

    // Stałe podatkowe w Polsce (przybliżone)
    const skladkaEmerytalna = bruttoValue * 0.0976;
    const skladkaRentowa = bruttoValue * 0.015;
    const skladkaChorobowa = bruttoValue * 0.0245;
    const podstawaZdrowotna = bruttoValue - (skladkaEmerytalna + skladkaRentowa + skladkaChorobowa);
    const skladkaZdrowotna = podstawaZdrowotna * 0.09;
    const podstawaOpodatkowania = podstawaZdrowotna - 300;
    const podatekDoch = podstawaOpodatkowania * 0.12;

    const nettoValue = bruttoValue - (skladkaEmerytalna + skladkaRentowa + skladkaChorobowa + skladkaZdrowotna + podatekDoch);

    setNetto(nettoValue.toFixed(2));
    setDetails({
      skladkaEmerytalna: skladkaEmerytalna.toFixed(2),
      skladkaRentowa: skladkaRentowa.toFixed(2),
      skladkaChorobowa: skladkaChorobowa.toFixed(2),
      skladkaZdrowotna: skladkaZdrowotna.toFixed(2),
      podatekDoch: podatekDoch.toFixed(2),
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold mb-4">Kalkulator Pensji Netto</h1>
      <input
        type="number"
        value={brutto}
        onChange={(e) => setBrutto(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Wpisz pensję brutto"
      />
      <button
        onClick={calculateSalary}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        Oblicz
      </button>
      {netto !== null && details !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-bold">Pensja Netto: {netto} zł</h2>
          <h3 className="font-semibold mt-2">Szczegóły składek i podatków:</h3>
          <ul className="list-disc pl-4">
            <li>Składka Emerytalna: {details.skladkaEmerytalna} zł</li>
            <li>Składka Rentowa: {details.skladkaRentowa} zł</li>
            <li>Składka Chorobowa: {details.skladkaChorobowa} zł</li>
            <li>Składka Zdrowotna: {details.skladkaZdrowotna} zł</li>
            <li>Podatek Dochodowy: {details.podatekDoch} zł</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;
