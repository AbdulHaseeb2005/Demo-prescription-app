import { useState, useEffect } from 'react';

// Enhanced Medical Abbreviations
const FREQUENCIES = [
    "OD (once daily)",
    "BD (twice daily)",
    "TDS (three times daily)",
    "QID (four times daily)",
    "QHS (at bedtime)",
    "PRN (as needed)",
    "STAT (immediately)",
    "SOS",
    "Q4H",
    "Q6H",
    "Q8H",
    "Q12H"
];

const TIMINGS = ["After Food", "Before Food", "With Food"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "15 days", "1 month"];
const STRENGTHS = ["250mg", "500mg", "1g", "5mg", "10mg", "25mg", "50mg", "100mg", "200mg", "Custom"];
const COMMON_INSTRUCTIONS = [
    "Take with warm water",
    "Shake well before use",
    "May cause drowsiness",
    "Complete the full course",
    "Do not crush or chew",
    "Keep refrigerated",
    "Take after meals",
    "Take on empty stomach",
    "Avoid dairy products",
    "Dissolve in water"
];

export function DosageSelector({ value, onChange }) {
    // value = { strength, frequency, timing, duration, instruction }

    // Internal state to track if we are in "custom" mode for specific fields
    // We infer custom mode if the value exists but isn't in the predefined list
    const isCustomDuration = value.duration && !DURATIONS.includes(value.duration) && value.duration !== 'custom';
    const [showCustomDuration, setShowCustomDuration] = useState(isCustomDuration);

    const isCustomFrequency = value.frequency && !FREQUENCIES.includes(value.frequency) && value.frequency !== 'custom';
    const [showCustomFrequency, setShowCustomFrequency] = useState(isCustomFrequency);

    const isCustomStrength = value.strength && !STRENGTHS.includes(value.strength) && value.strength !== 'Custom';
    const [showCustomStrength, setShowCustomStrength] = useState(isCustomStrength);

    const handleChange = (field, val) => {
        onChange({ ...value, [field]: val });
    };

    const handleDurationChange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            setShowCustomDuration(true);
            handleChange('duration', ''); // Clear it so input shows empty
        } else {
            setShowCustomDuration(false);
            handleChange('duration', val);
        }
    };

    const handleFrequencyChange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            setShowCustomFrequency(true);
            handleChange('frequency', '');
        } else {
            setShowCustomFrequency(false);
            handleChange('frequency', val);
        }
    };

    const handleStrengthChange = (e) => {
        const val = e.target.value;
        if (val === 'Custom') {
            setShowCustomStrength(true);
            handleChange('strength', '');
        } else {
            setShowCustomStrength(false);
            handleChange('strength', val);
        }
    };

    return (
        <div className="dosage-selector flex-row" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {/* Strength/Dosage Selector */}
            {showCustomStrength ? (
                <div style={{ position: 'relative', width: '120px' }}>
                    <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={value.strength || ''}
                        onChange={e => handleChange('strength', e.target.value)}
                        style={{ width: '120px', paddingRight: '25px' }}
                        autoFocus
                    />
                    <button
                        onClick={() => setShowCustomStrength(false)}
                        className="btn-ghost"
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 5px', fontSize: '0.8rem' }}
                        title="Back to list"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <select
                    value={value.strength || ''}
                    onChange={handleStrengthChange}
                    style={{ width: 'auto', minWidth: '120px' }}
                >
                    <option value="" disabled>Strength</option>
                    {STRENGTHS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            )}

            {/* Frequency Selector */}
            {showCustomFrequency ? (
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Freq e.g. OD"
                        value={value.frequency || ''}
                        onChange={e => handleChange('frequency', e.target.value)}
                        style={{ width: '140px' }}
                        autoFocus
                    />
                    <button
                        onClick={() => setShowCustomFrequency(false)}
                        className="btn-ghost"
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 5px', fontSize: '0.8rem' }}
                        title="Back to list"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <select
                    value={value.frequency || ''}
                    onChange={handleFrequencyChange}
                    style={{ width: 'auto', minWidth: '140px' }}
                >
                    <option value="" disabled>Frequency</option>
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    <option value="custom" style={{ fontWeight: 'bold' }}>+ Custom Input</option>
                </select>
            )}

            {/* Timing Selector */}
            <select
                value={value.timing || ''}
                onChange={e => handleChange('timing', e.target.value)}
                style={{ width: 'auto', minWidth: '110px' }}
            >
                <option value="" disabled>Timing</option>
                {TIMINGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Duration Selector */}
            {showCustomDuration ? (
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="e.g. 2 weeks"
                        value={value.duration || ''}
                        onChange={e => handleChange('duration', e.target.value)}
                        style={{ width: '120px' }}
                        autoFocus
                    />
                    <button
                        onClick={() => setShowCustomDuration(false)}
                        className="btn-ghost"
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 5px', fontSize: '0.8rem' }}
                        title="Back to list"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <select
                    value={value.duration || ''}
                    onChange={handleDurationChange}
                    style={{ width: 'auto', minWidth: '110px' }}
                >
                    <option value="" disabled>Duration</option>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="custom" style={{ fontWeight: 'bold' }}>+ Custom Input</option>
                </select>
            )}

            {/* Instructions Multiline with Helper */}
            <div className="flex-col" style={{ flex: 1, gap: '0.2rem', minWidth: '200px' }}>
                <select
                    value=""
                    onChange={e => {
                        const newText = value.instruction
                            ? `${value.instruction}\n${e.target.value}`
                            : e.target.value;
                        handleChange('instruction', newText);
                    }}
                    style={{ fontSize: '0.8rem', padding: '2px', color: 'var(--color-primary)' }}
                >
                    <option value="" disabled>+ Add Quick Instruction</option>
                    {COMMON_INSTRUCTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <textarea
                    placeholder="Instructions... (Enter for new line)"
                    value={value.instruction || ''}
                    onChange={e => handleChange('instruction', e.target.value)}
                    style={{
                        width: '100%',
                        minHeight: '38px',
                        resize: 'vertical',
                        padding: '0.4rem',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem'
                    }}
                    rows={2}
                />
            </div>
        </div>
    );
}
