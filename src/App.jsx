import { useState, useEffect } from 'react';
import { Stethoscope, FileDown, RotateCcw, Database } from 'lucide-react';
import { MedicineInput } from './components/MedicineInput';
import { PrescriptionCanvas } from './components/PrescriptionCanvas';
import { MedicineManager } from './components/MedicineManager';
import { usePrescription } from './hooks/usePrescription';
import { useMedicineDatabase } from './hooks/useMedicineDatabase';

function App() {
  const {
    sections,
    addItem,
    updateItem,
    batchUpdateItems,
    removeItem,
    moveItem,
    resetPrescription,
    sectionPositions,
    updateSectionPosition
  } = usePrescription();

  const {
    medicines,
    addMedicine,
    searchMedicines,
    deleteMedicine,
    updateMedicine
  } = useMedicineDatabase();

  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMedicineManagerOpen, setIsMedicineManagerOpen] = useState(false);

  useEffect(() => {
    if (isPrinting && isPrintPreview) {
      // Allow render to update DOM
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, isPrintPreview]);

  const handleAddMedicine = (name) => {
    addItem('medications', {
      name,
      frequency: '1-0-1',
      timing: 'After Food',
      duration: '5 days',
      instruction: ''
    });
  };

  const handleAddNote = () => {
    addItem('notes', {
      text: ''
    });
  };

  const handlePrint = () => {
    if (!isPrintPreview) {
      setIsPrintPreview(true);
      setIsPrinting(true);
    } else {
      window.print();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="flex-row" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }} title="Go to Home">
          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary)'
          }}>
            <Stethoscope size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Doctor Prescription App</h1>
        </div>

        <div className="flex-row">
          <button
            onClick={() => setIsPrintPreview(!isPrintPreview)}
            className={`btn ${isPrintPreview ? 'btn-primary' : 'btn-secondary'} `}
          >
            {isPrintPreview ? 'Edit Mode' : 'Print Preview'}
          </button>
          <button onClick={resetPrescription} className="btn btn-ghost" title="Reset">
            <RotateCcw size={18} />
            <span className="text-sm">Reset</span>
          </button>
          <button onClick={handleAddNote} className="btn btn-secondary" title="Add General Note">
            <span className="text-sm">+ Note</span>
          </button>
          <button onClick={() => setIsMedicineManagerOpen(true)} className="btn btn-secondary" title="Manage Medicine Database">
            <Database size={18} />
            <span className="text-sm">Manage Medicines</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary" title="Print or Save as PDF">
            <FileDown size={18} />
            <span>Print / Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>

        {/* Input Area */}
        {!isPrintPreview && (
          <section style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Medicine</h2>
              <MedicineInput
                onSelect={handleAddMedicine}
                addMedicine={addMedicine}
                searchMedicines={searchMedicines}
              />
              <p className="text-sm text-muted">Type to search or add new medicines. Press Enter to select.</p>
            </div>
          </section>
        )}

        {/* Prescription Canvas */}
        <section className={isPrintPreview ? 'print-preview-wrapper' : ''}>
          <div className={isPrintPreview ? 'page-a4' : ''}>
            {isPrintPreview && <div className="header-space"></div>}
            <PrescriptionCanvas
              sections={sections}
              onMove={moveItem}
              onUpdate={updateItem}
              onDelete={removeItem}
              isPrintPreview={isPrintPreview}
              sectionPositions={sectionPositions}
              onSectionPositionChange={updateSectionPosition}
              batchUpdateItems={batchUpdateItems}
            />
          </div>
        </section>


      </main>

      {/* Medicine Manager Modal */}
      <MedicineManager
        isOpen={isMedicineManagerOpen}
        onClose={() => setIsMedicineManagerOpen(false)}
        medicines={medicines}
        addMedicine={addMedicine}
        deleteMedicine={deleteMedicine}
        updateMedicine={updateMedicine}
      />
    </div>
  );
}

export default App;
