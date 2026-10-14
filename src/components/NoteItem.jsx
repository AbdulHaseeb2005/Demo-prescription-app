import { useSortable } from '@dnd-kit/sortable';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export function NoteItem(props) {
    if (props.isPrintPreview) {
        return <DraggableNoteItem {...props} />;
    }
    return <SortableNoteItem {...props} />;
}

function DraggableNoteItem({ id, data, forceFlow }) {
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
        marginBottom: '2px',
        padding: '2px 0',
        userSelect: 'none',
        width: hasPosition ? (data.width ? `${data.width}px` : '300px') : '100%',
        minWidth: hasPosition ? '200px' : undefined,
        backgroundColor: '#fff', // Ensure opacity to prevent overlapping issues
    };

    return (
        <div
            ref={setNodeRef}
            id={id}
            {...attributes}
            {...listeners}
            className="note-item-print"
            style={style}
        >
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                {data.text || 'Empty Note'}
            </div>
        </div>
    );
}

function SortableNoteItem({ id, data, onUpdate, onDelete }) {
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
            className="card note-item"
            style={{
                ...style,
                padding: '1rem',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'start',
                backgroundColor: '#fff9c4', // Light yellow for notes
                border: '1px solid #fde047',
                boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
            }}
        >
            <div
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', marginTop: '4px', color: '#b45309' }}
                className="drag-handle"
            >
                <GripVertical size={20} />
            </div>

            <div style={{ flex: 1 }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#b45309' }}>Note</h4>
                    <button onClick={() => onDelete(id)} className="btn-ghost" style={{ padding: '4px', color: '#b45309' }} title="Remove">
                        <Trash2 size={16} />
                    </button>
                </div>

                <textarea
                    placeholder="Type your note here..."
                    value={data.text || ''}
                    onChange={(e) => onUpdate(id, { text: e.target.value })}
                    rows={2}
                    style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: '1px dashed #fde047',
                        resize: 'vertical',
                        minHeight: '60px'
                    }}
                />
            </div>
        </div>
    );
}
