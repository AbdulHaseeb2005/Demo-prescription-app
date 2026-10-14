import { useState } from 'react';
import { X, Search, Edit2, Check, RotateCcw } from 'lucide-react';

export function MedicineManager({ isOpen, onClose, medicines, addMedicine, deleteMedicine, updateMedicine }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [newMedicine, setNewMedicine] = useState('');
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [editValue, setEditValue] = useState('');

    if (!isOpen) return null;

    const filteredMedicines = searchQuery
        ? medicines.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
        : medicines;

    const handleDelete = (medicine) => {
        if (medicines.length <= 1) {
            alert('Cannot delete all medicines. At least one medicine must remain.');
            return;
        }

        if (confirm(`Delete "${medicine}" from database?`)) {
            deleteMedicine(medicine);
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newMedicine.trim()) return;

        const added = addMedicine(newMedicine);
        if (added) {
            setNewMedicine('');
        } else {
            alert('Medicine already exists in database');
        }
    };

    const handleEditStart = (medicine) => {
        setEditingMedicine(medicine);
        setEditValue(medicine);
    };

    const handleEditSave = (e) => {
        e?.preventDefault();
        const trimmedValue = editValue.trim();

        if (!trimmedValue || trimmedValue === editingMedicine) {
            setEditingMedicine(null);
            return;
        }

        const success = updateMedicine(editingMedicine, trimmedValue);
        if (success) {
            setEditingMedicine(null);
        } else {
            alert('Medicine name already exists in database or is invalid');
        }
    };

    const handleEditCancel = () => {
        setEditingMedicine(null);
        setEditValue('');
    };

    return (
        <div
            className="medicine-manager-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'flex-end'
            }}
        >
            <div
                className="medicine-manager-panel"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '400px',
                    maxWidth: '90vw',
                    height: '100vh',
                    backgroundColor: 'white',
                    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        Medicine Database
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                        style={{ padding: '0.5rem' }}
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }}
                        />
                        <input
                            type="search"
                            placeholder="Search medicines..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem'
                            }}
                        />
                    </div>
                </div>

                {/* Add Medicine Form */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Add new medicine..."
                            value={newMedicine}
                            onChange={e => setNewMedicine(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            Add
                        </button>
                    </form>
                </div>

                {/* Medicine List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {filteredMedicines.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                            {searchQuery ? 'No medicines found' : 'No medicines in database'}
                        </p>
                    ) : (
                        filteredMedicines.map(medicine => (
                            <div
                                key={medicine}
                                className="medicine-list-item"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    margin: '0.25rem 0',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-surface)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                            >
                                {editingMedicine === medicine ? (
                                    <form onSubmit={handleEditSave} style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            autoFocus
                                            style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                        />
                                        <button type="submit" className="btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} title="Save">
                                            <Check size={18} />
                                        </button>
                                        <button type="button" onClick={handleEditCancel} className="btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-text-muted)' }} title="Cancel">
                                            <X size={18} />
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <span style={{ fontWeight: 500 }}>{medicine}</span>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button
                                                onClick={() => handleEditStart(medicine)}
                                                className="btn-ghost"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    color: 'var(--color-primary)',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                                title="Edit medicine"
                                            >
                                                <Edit2 size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(medicine)}
                                                className="btn-ghost"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    color: 'var(--color-error)',
                                                    fontSize: '0.85rem'
                                                }}
                                                title="Delete medicine"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.9rem'
                }}>
                    {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in database
                </div>
            </div>
        </div>
    );
}
