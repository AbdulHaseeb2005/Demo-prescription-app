import { useSortable } from '@dnd-kit/sortable';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { DosageSelector } from './DosageSelector';

export function MedicineItem(props) {
    if (props.isPrintPreview) {
        return <DraggableMedicineItem {...props} />;
    }
    return <SortableMedicineItem {...props} />;
}

function DraggableMedicineItem({ id, data, forceFlow }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: id,
        data: { ...data, type: 'item' }
    });

    const hasPosition = !forceFlow && data.x !== undefined && data.y !== undefined;

    const style = {
        transform: CSS.Translate.toString(transform),
        position: hasPosition ? 'absolute' : 'relative',
        left: hasPosition ? data.x : undefined,
        top: hasPosition ? data.y : undefined,
        zIndex: isDragging ? 100 : (hasPosition ? 10 : 'auto'),
        cursor: 'move',
        cursor: 'move',
        marginBottom: '2px',
        padding: '2px 0',
        userSelect: 'none',
        width: hasPosition ? (data.width ? `${data.width}px` : '300px') : '100%',
        minWidth: hasPosition ? '200px' : undefined, // Prevent thin columns if measured small
        backgroundColor: '#fff',
    };

    return (
        <div
            ref={setNodeRef}
            id={id}
            {...attributes}
            {...listeners}
            className="medicine-item-print"
            style={style}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {data.name}{data.strength ? ` (${data.strength})` : ''}
                </span>
                <span style={{ fontSize: '0.9rem' }}>{data.frequency} • {data.timing}</span>
            </div>
            {data.duration && (
                <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '2px' }}>
                    {data.duration}
                </div>
            )}
            {data.instruction && (
                <div style={{
                    fontSize: '0.85rem',
                    color: '#444',
                    marginTop: '1px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.3'
                }}>
                    <span style={{ marginRight: '4px' }}>—</span>
                    {data.instruction}
                </div>
            )}
        </div>
    );
}

function SortableMedicineItem({ id, data, onUpdate, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id, data: { ...data, type: 'item' } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto'
    };

    return (
        <div
            ref={setNodeRef}
            className="card medicine-item"
            style={{
                ...style,
                padding: '1rem',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'start',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
            }}
        >
            <div
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', marginTop: '4px', color: 'var(--color-text-muted)' }}
                className="drag-handle"
            >
                <GripVertical size={20} />
            </div>

            <div style={{ flex: 1 }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{data.name}</h4>
                    <button onClick={() => onDelete(id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--color-text-muted)' }} title="Remove">
                        <Trash2 size={16} />
                    </button>
                </div>

                <DosageSelector
                    value={data}
                    onChange={(newData) => onUpdate(id, newData)}
                />
            </div>
        </div>
    );
}
