import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    useDraggable
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { MedicineItem } from './MedicineItem';
import { NoteItem } from './NoteItem';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ id, title, items, onUpdate, onDelete, isPrintPreview, position, margin, forceFlow }) {
    // Normal mode: Droppable for sorting
    const { setNodeRef: setDroppableRef } = useDroppable({ id, disabled: isPrintPreview });

    // Preview mode: Draggable section
    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
        transform,
        isDragging
    } = useDraggable({
        id: `section-${id}`,
        data: { type: 'section', id },
        disabled: !isPrintPreview
    });

    const style = {
        flex: 1,
        minWidth: '300px',
        // If we have a stored position (absolute), uses it. Otherwise flow.
        position: position ? 'absolute' : 'relative',
        left: position ? position.x : undefined,
        top: position ? position.y : undefined,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : (position ? 10 : 'auto'),
        width: position ? '300px' : undefined, // Fixed width when floating?
    };

    if (isPrintPreview && items.length === 0) {
        return null;
    }

    // Merge refs
    const setRef = (node) => {
        setDroppableRef(node);
        setDraggableRef(node);
    };

    return (
        <div
            ref={setRef}
            id={`section-${id}`}
            className="flex-col"
            style={style}
            {...(isPrintPreview ? { ...attributes, ...listeners } : {})}
        >
            <h3 className="section-title" style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-secondary)',
                borderBottom: '2px solid var(--color-border)',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
                cursor: isPrintPreview ? 'move' : 'default'
            }}>
                {title}
            </h3>

            <div
                className="section-drop-zone"
                style={{
                    minHeight: isPrintPreview ? 'auto' : '200px',
                    backgroundColor: isPrintPreview ? 'transparent' : 'var(--color-background)',
                    borderRadius: 'var(--radius-lg)',
                    padding: isPrintPreview ? '0' : '1rem',
                    border: isPrintPreview ? 'none' : '2px dashed var(--color-border)'
                }}
            >
                {/* In preview, we skip SortableContext to allow free drag of items */}
                {isPrintPreview ? (
                    items.map(item => (
                        id === 'notes' ? (
                            <NoteItem
                                key={item.id}
                                id={item.id}
                                data={item}
                                onUpdate={(itemId, newData) => onUpdate(id, itemId, newData)}
                                onDelete={(itemId) => onDelete(id, itemId)}
                                isPrintPreview={isPrintPreview}
                                forceFlow={forceFlow}
                            />
                        ) : (
                            <MedicineItem
                                key={item.id}
                                id={item.id}
                                data={item}
                                // In measurement mode (which reuses this component), we want them to render normally
                                // Logic handled by parent regarding Flattened vs Sectioned
                                onUpdate={(itemId, newData) => onUpdate(id, itemId, newData)}
                                onDelete={(itemId) => onDelete(id, itemId)}
                                isPrintPreview={isPrintPreview}
                                forceFlow={forceFlow}
                            />
                        )
                    ))
                ) : (
                    <SortableContext
                        id={id}
                        items={items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map(item => (
                            id === 'notes' ? (
                                <NoteItem
                                    key={item.id}
                                    id={item.id}
                                    data={item}
                                    onUpdate={(itemId, newData) => onUpdate(id, itemId, newData)}
                                    onDelete={(itemId) => onDelete(id, itemId)}
                                    isPrintPreview={isPrintPreview}
                                    forceFlow={forceFlow}
                                />
                            ) : (
                                <MedicineItem
                                    key={item.id}
                                    id={item.id}
                                    data={item}
                                    onUpdate={(itemId, newData) => onUpdate(id, itemId, newData)}
                                    onDelete={(itemId) => onDelete(id, itemId)}
                                    isPrintPreview={isPrintPreview}
                                    forceFlow={forceFlow}
                                />
                            )
                        ))}
                    </SortableContext>
                )}

                {items.length === 0 && !isPrintPreview && (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '2rem', userSelect: 'none' }}>
                        Drag items here
                    </div>
                )}
            </div>
        </div>
    );
}

export function PrescriptionCanvas({
    sections,
    onMove,
    onUpdate,
    onDelete,
    isPrintPreview,
    sectionPositions,
    onSectionPositionChange,
    batchUpdateItems
}) {
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const pageRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Collect all items to check if they have positions
    const allItems = useMemo(() => {
        return Object.entries(sections).flatMap(([sectionId, items]) =>
            items.map(item => ({ ...item, sectionId }))
        );
    }, [sections]);

    // Identify sections that need measurement (if any item lacks x/y)
    const sectionsNeedingUpdate = useMemo(() => {
        if (!isPrintPreview) return new Set();

        let hasInvalidItems = false;
        Object.values(sections).forEach((items) => {
            if (items.some(item => item.x === undefined || item.y === undefined)) {
                hasInvalidItems = true;
            }
        });

        if (hasInvalidItems) {
            // If ANY item needs update, we force ALL sections to flow.
            // This prevents "collapsed section" bugs and ensures "one after another" layout.
            return new Set(Object.keys(sections));
        }

        return new Set();
    }, [isPrintPreview, sections]);

    const needsMeasurement = sectionsNeedingUpdate.size > 0;

    // Measurement Effect
    useLayoutEffect(() => {
        if (needsMeasurement && pageRef.current) {
            const pageRect = pageRef.current.getBoundingClientRect();
            const updates = [];

            // We only measure items in invalid sections
            // But we must update ALL items in those sections to reflect the new flow
            allItems.forEach(item => {
                if (sectionsNeedingUpdate.has(item.sectionId)) {
                    const el = document.getElementById(item.id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        updates.push({
                            sectionId: item.sectionId,
                            itemId: item.id,
                            updates: {
                                x: rect.left - pageRect.left,
                                y: rect.top - pageRect.top,
                                width: rect.width,
                                height: rect.height
                            }
                        });
                    }
                }
            });

            if (updates.length > 0) {
                batchUpdateItems(updates);
            }
        }
    }, [needsMeasurement, sectionsNeedingUpdate, allItems, batchUpdateItems]);

    const findContainer = (id) => {
        if (id in sections) return id;
        return Object.keys(sections).find(key => sections[key].find(i => i.id === id));
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const { id } = active;
        const type = active.data.current?.type;

        setActiveId(id);

        if (type === 'item') {
            const container = findContainer(id);
            if (container) {
                const item = sections[container].find(i => i.id === id);
                setActiveItem(item);
            }
        } else if (type === 'section') {
            setActiveItem({ type: 'section', id });
        }
    };

    const handleDragEnd = (event) => {
        const { active, delta } = event;
        const type = active.data.current?.type;

        if (isPrintPreview) {
            if (type === 'item') {
                const itemId = active.id;
                const container = findContainer(itemId);
                const currentItem = sections[container].find(i => i.id === itemId);
                const pageRect = pageRef.current?.getBoundingClientRect();

                if (!currentItem) return;

                // Get current position or calculate from DOM if not set
                let currentX, currentY;
                if (currentItem.x !== undefined && currentItem.y !== undefined) {
                    // Item already has saved position
                    currentX = currentItem.x;
                    currentY = currentItem.y;
                } else {
                    // First time dragging - get position from DOM
                    const itemElement = document.getElementById(itemId);
                    if (itemElement && pageRect) {
                        const itemRect = itemElement.getBoundingClientRect();
                        currentX = itemRect.left - pageRect.left;
                        currentY = itemRect.top - pageRect.top;
                    } else {
                        // Can't determine position
                        return;
                    }
                }

                // Calculate new position
                let newX = currentX + delta.x;
                let newY = currentY + delta.y;

                // Boundaries
                const headerHeightPx = (70 * 96) / 25.4; // ~264.5px

                // Page bounds
                const pageWidth = pageRect.width;
                const pageHeight = pageRect.height;

                // Item dimensions
                const itemRect = active.rect.current.translated;
                const itemWidth = itemRect ? itemRect.width : 200;
                const itemHeight = itemRect ? itemRect.height : 50;

                // Constrain
                newX = Math.max(0, Math.min(newX, pageWidth - itemWidth));
                newY = Math.max(headerHeightPx, Math.min(newY, pageHeight - itemHeight));

                // Collision Detection
                const candidateRect = {
                    left: newX,
                    right: newX + itemWidth,
                    top: newY,
                    bottom: newY + itemHeight
                };

                let hasCollision = false;
                for (const otherItem of allItems) {
                    if (otherItem.id === itemId) continue;
                    if (otherItem.x === undefined || otherItem.y === undefined) continue;

                    // Use stored dims or fallback
                    const otherWidth = otherItem.width || 200;
                    const otherHeight = otherItem.height || 50;

                    const otherRect = {
                        left: otherItem.x,
                        right: otherItem.x + otherWidth,
                        top: otherItem.y,
                        bottom: otherItem.y + otherHeight
                    };

                    // Check intersection
                    const isOverlapping = !(
                        candidateRect.right < otherRect.left ||
                        candidateRect.left > otherRect.right ||
                        candidateRect.bottom < otherRect.top ||
                        candidateRect.top > otherRect.bottom
                    );

                    if (isOverlapping) {
                        hasCollision = true;
                        break;
                    }
                }

                if (!hasCollision) {
                    onUpdate(container, itemId, { x: newX, y: newY, width: itemWidth, height: itemHeight });
                }
                // Else: do nothing, item snaps back to original position via local state consistency
            } else if (type === 'section') {
                const sectionId = active.data.current.id;
                const currentPos = sectionPositions?.[sectionId] || { x: 0, y: 0 };
                const pageRect = pageRef.current?.getBoundingClientRect();
                const initialRect = active.rect.current?.initial?.client;
                if (pageRect && initialRect) {
                    const relativeX = initialRect.left - pageRect.left;
                    const relativeY = initialRect.top - pageRect.top;
                    const newX = relativeX + delta.x;
                    const newY = relativeY + delta.y;
                    onSectionPositionChange(sectionId, { x: newX, y: newY });
                }
            }
        } else {
            // Edit Mode sorting
            const { over } = event;
            const activeContainer = findContainer(active.id);
            const overContainer = findContainer(over?.id);

            if (
                activeContainer &&
                overContainer &&
                (activeContainer !== overContainer || active.id !== over.id)
            ) {
                onMove(active.id, over.id, activeContainer, overContainer);
            }
        }

        setActiveId(null);
        setActiveItem(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div
                ref={pageRef}
                className="canvas-layout"
                style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    position: 'relative', // Anchor for absolute items
                    minHeight: '100%' // Ensure full page area
                }}
            >
                {/* 
                  Render Logic:
                  1. If needsMeasurement: Render Sections (Flow) so we can measure.
                  2. If Preview & !needsMeasurement: Render Flattened Items (Absolute).
                  3. If !Preview: Render Sections (Flow) for editing.
                */}

                {needsMeasurement ? (
                    // Measurement Mode: Force Single Column Stack to ensure top sections push bottom ones
                    <div className="flex-col" style={{ width: '100%', gap: '1rem' }}>
                        <SortableSection
                            id="medications"
                            title="Medications"
                            items={sections.medications}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isPrintPreview={isPrintPreview}
                            position={sectionPositions?.medications}
                            margin="0"
                            forceFlow={sectionsNeedingUpdate.has('medications')}
                        />
                        <SortableSection
                            id="tests"
                            title="Lab Tests"
                            items={sections.tests}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isPrintPreview={isPrintPreview}
                            position={sectionPositions?.tests}
                            forceFlow={sectionsNeedingUpdate.has('tests')}
                        />
                        <SortableSection
                            id="advice"
                            title="Advice / Instructions"
                            items={sections.advice}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isPrintPreview={isPrintPreview}
                            position={sectionPositions?.advice}
                            forceFlow={sectionsNeedingUpdate.has('advice')}
                        />
                        <SortableSection
                            id="notes"
                            title="Notes"
                            items={sections.notes}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isPrintPreview={isPrintPreview}
                            position={sectionPositions?.notes}
                            forceFlow={sectionsNeedingUpdate.has('notes')}
                        />
                    </div>
                ) : !isPrintPreview ? (
                    // Edit Mode: Split Columns
                    <>
                        <SortableSection
                            id="medications"
                            title="Medications"
                            items={sections.medications}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isPrintPreview={isPrintPreview}
                            position={sectionPositions?.medications}
                            margin="0"
                            forceFlow={sectionsNeedingUpdate.has('medications')}
                        />
                        <div className="flex-col" style={{ flex: 1 }}>
                            <SortableSection
                                id="tests"
                                title="Lab Tests"
                                items={sections.tests}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                isPrintPreview={isPrintPreview}
                                position={sectionPositions?.tests}
                                forceFlow={sectionsNeedingUpdate.has('tests')}
                            />
                            <SortableSection
                                id="advice"
                                title="Advice / Instructions"
                                items={sections.advice}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                isPrintPreview={isPrintPreview}
                                position={sectionPositions?.advice}
                                forceFlow={sectionsNeedingUpdate.has('advice')}
                            />
                            <SortableSection
                                id="notes"
                                title="Notes"
                                items={sections.notes}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                isPrintPreview={isPrintPreview}
                                position={sectionPositions?.notes}
                                forceFlow={sectionsNeedingUpdate.has('notes')}
                            />
                        </div>
                    </>
                ) : (
                    /* Flattened Canvas Mode */
                    <>
                        <div className="header-space-placeholder" style={{ width: '100%', height: '70mm', pointerEvents: 'none' }}>
                            {/* Transparent placeholder if needed, or just logic */}
                        </div>
                        {allItems.map(item => (
                            item.sectionId === 'notes' ? (
                                <NoteItem
                                    key={item.id}
                                    id={item.id}
                                    data={item}
                                    onUpdate={(itemId, newData) => onUpdate(item.sectionId, itemId, newData)}
                                    onDelete={(itemId) => onDelete(item.sectionId, itemId)}
                                    isPrintPreview={isPrintPreview}
                                />
                            ) : (
                                <MedicineItem
                                    key={item.id}
                                    id={item.id}
                                    data={item}
                                    onUpdate={(itemId, newData) => onUpdate(item.sectionId, itemId, newData)}
                                    onDelete={(itemId) => onDelete(item.sectionId, itemId)}
                                    isPrintPreview={isPrintPreview}
                                />
                            )
                        ))}
                    </>
                )}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? (
                    <div style={{ transform: 'rotate(2deg)' }}>
                        {activeItem.type === 'section' ? (
                            <div className="section-title" style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: 'var(--color-secondary)',
                                border: '1px solid var(--color-primary)'
                            }}>
                                Moving Section...
                            </div>
                        ) : activeItem.sectionId === 'notes' ? (
                            <NoteItem
                                id={activeId}
                                data={activeItem}
                                onUpdate={() => { }}
                                onDelete={() => { }}
                                isPrintPreview={isPrintPreview}
                            />
                        ) : (
                            <MedicineItem
                                id={activeId}
                                data={activeItem}
                                onUpdate={() => { }}
                                onDelete={() => { }}
                                isPrintPreview={isPrintPreview}
                            />
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
