import { useState, useCallback } from 'react';

const STORAGE_KEY_PRESCRIPTION = 'doctor_app_current_prescription_v1';

const INITIAL_SECTIONS = {
    medications: [],
    tests: [],
    advice: [],
    notes: [] // General notes
};

export function usePrescription() {
    const [sections, setSections] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY_PRESCRIPTION);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with INITIAL_SECTIONS to ensure new keys (like 'notes') exist
            return { ...INITIAL_SECTIONS, ...parsed };
        }
        return INITIAL_SECTIONS;
    });

    const [sectionPositions, setSectionPositions] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY_PRESCRIPTION + '_layout');
        return stored ? JSON.parse(stored) : {};
    });

    const saveLayout = (newLayout) => {
        setSectionPositions(newLayout);
        localStorage.setItem(STORAGE_KEY_PRESCRIPTION + '_layout', JSON.stringify(newLayout));
    };

    const updateSectionPosition = (sectionId, position) => {
        saveLayout({
            ...sectionPositions,
            [sectionId]: position
        });
    };

    const saveSections = (newSections) => {
        setSections(newSections);
        localStorage.setItem(STORAGE_KEY_PRESCRIPTION, JSON.stringify(newSections));
    };

    const addItem = (sectionId, itemData) => {
        const newItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...itemData
        };

        const newSections = {
            ...sections,
            [sectionId]: [...(sections[sectionId] || []), newItem]
        };
        saveSections(newSections);
    };

    const updateItem = (sectionId, itemId, updates) => {
        const newSections = {
            ...sections,
            [sectionId]: sections[sectionId].map(item => {
                if (item.id === itemId) {
                    // If we are updating content (not position), reset position to trigger re-layout
                    // This prevents overlaps if text grows
                    const isPositionUpdate = 'x' in updates || 'y' in updates;
                    if (!isPositionUpdate) {
                        return { ...item, ...updates, x: undefined, y: undefined };
                    }
                    return { ...item, ...updates };
                }
                return item;
            })
        };
        saveSections(newSections);
    };

    const batchUpdateItems = (updatesArray) => {
        // updatesArray: [{ sectionId, itemId, updates }, ...]
        let newSections = { ...sections };
        let hasChanges = false;

        updatesArray.forEach(({ sectionId, itemId, updates }) => {
            if (newSections[sectionId]) {
                const index = newSections[sectionId].findIndex(i => i.id === itemId);
                if (index !== -1) {
                    const updatedList = [...newSections[sectionId]];
                    updatedList[index] = { ...updatedList[index], ...updates };
                    newSections[sectionId] = updatedList;
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            saveSections(newSections);
        }
    };

    const removeItem = (sectionId, itemId) => {
        const newSections = {
            ...sections,
            [sectionId]: sections[sectionId].filter(item => item.id !== itemId)
        };
        saveSections(newSections);
    };

    const moveItem = (activeId, overId, activeSection, overSection) => {
        // If sections are different or same, we need to find indices and move
        const sourceList = [...sections[activeSection]];
        const destList = activeSection === overSection ? sourceList : [...sections[overSection]];

        const activeIndex = sourceList.findIndex(i => i.id === activeId);
        let overIndex = destList.findIndex(i => i.id === overId);

        if (activeIndex === -1) return;

        let itemToMove = sourceList[activeIndex];

        if (activeSection === overSection) {
            // Reordering within same list
            // arrayMove logic
            const [removed] = sourceList.splice(activeIndex, 1);
            sourceList.splice(overIndex, 0, removed);

            saveSections({
                ...sections,
                [activeSection]: sourceList
            });
        } else {
            // Moving to different list
            // If overId is null/container, append to end? handled by caller
            const [removed] = sourceList.splice(activeIndex, 1);
            // If dropping on a container (empty list), overIndex might be -1.
            if (overIndex === -1) {
                destList.push(removed);
            } else {
                // For simplicity, insert before?
                destList.splice(overIndex, 0, removed);
            }

            saveSections({
                ...sections,
                [activeSection]: sourceList,
                [overSection]: destList
            });
        }
    };

    // Helper for dnd-kit specifically
    const setSectionItems = (sectionId, items) => {
        saveSections({
            ...sections,
            [sectionId]: items
        });
    };

    const resetPrescription = () => {
        saveSections(INITIAL_SECTIONS);
    }

    return {
        sections,
        addItem,
        updateItem,
        batchUpdateItems,
        removeItem,
        moveItem,
        setSectionItems,
        resetPrescription,
        sectionPositions,
        updateSectionPosition
    };
}
