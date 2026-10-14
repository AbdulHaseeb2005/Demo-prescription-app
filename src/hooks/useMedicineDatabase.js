import { useState, useEffect } from 'react';

const STORAGE_KEY = 'doctor_app_medicines_v1';

const DEFAULT_MEDICINES = [
    'Paracetamol',
    'Amoxicillin',
    'Ibuprofen',
    'Cetirizine',
    'Metformin',
    'Atorvastatin',
    'Aspirin',
    'Omeprazole',
    'Losartan',
    'Amlodipine',
    'Lisinopril',
    'Simvastatin',
    'Levothyroxine',
    'Gabapentin',
    'Tramadol',
    'Ciprofloxacin',
    'Azithromycin',
    'Clopidogrel',
    'Pantoprazole',
    'Diclofenac'
];

export function useMedicineDatabase() {
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setMedicines(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse medicines", e);
                setMedicines(DEFAULT_MEDICINES);
            }
        } else {
            setMedicines(DEFAULT_MEDICINES);
        }
    }, []);

    const saveMedicines = (newList) => {
        setMedicines(newList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    };

    const addMedicine = (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        // Check duplicates (case insensitive)
        if (!medicines.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
            const newList = [...medicines, trimmed].sort();
            saveMedicines(newList);
            return true; // Added
        }
        return false; // Exists
    };

    const searchMedicines = (query) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return medicines.filter(m => m.toLowerCase().includes(lowerQuery));
    };

    const deleteMedicine = (name) => {
        const newList = medicines.filter(m => m !== name);
        saveMedicines(newList);
    };

    const updateMedicine = (oldName, newName) => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) return false;

        // Check duplicates (excluding current name)
        if (!medicines.some(m => m.toLowerCase() === trimmed.toLowerCase() && m !== oldName)) {
            const newList = medicines.map(m => m === oldName ? trimmed : m).sort();
            saveMedicines(newList);
            return true;
        }
        return false;
    };

    return {
        medicines,
        addMedicine,
        searchMedicines,
        deleteMedicine,
        updateMedicine
    };
}
