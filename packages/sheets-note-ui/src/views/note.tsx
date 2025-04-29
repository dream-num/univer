/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ISheetNote } from '@univerjs/sheets-note';
import { ICommandService } from '@univerjs/core';
import { RemoveNoteMutation, SheetsNoteModel, UpdateNoteMutation } from '@univerjs/sheets-note';
import { useDebounceFn, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { SheetsNotePopupService } from '../services/sheets-note-popup.service';

export const SheetsNote = () => {
    const notePopupService = useDependency(SheetsNotePopupService);
    const noteModel = useDependency(SheetsNoteModel);
    const [note, setNote] = useState<ISheetNote>({ width: 160, height: 60, note: '' });
    const activePopup = useObservable(notePopupService.activePopup$);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const commandService = useDependency(ICommandService);

    const updateNote = useDebounceFn((newNote: ISheetNote) => {
        if (!activePopup) return;

        if (newNote.note) {
            commandService.executeCommand(UpdateNoteMutation.id, {
                unitId: activePopup.unitId,
                sheetId: activePopup.subUnitId!,
                row: activePopup.row,
                col: activePopup.col,
                note: newNote,
            });
        } else {
            commandService.executeCommand(RemoveNoteMutation.id, {
                unitId: activePopup.unitId,
                sheetId: activePopup.subUnitId!,
                row: activePopup.row,
                col: activePopup.col,
            });
        }
    });

    useEffect(() => {
        if (activePopup) {
            const existingNote = noteModel.getNote(activePopup.unitId, activePopup.subUnitId!, activePopup.row, activePopup.col);
            if (existingNote) {
                setNote(existingNote);
            } else {
                textareaRef.current?.focus();
            }
        }
    }, [activePopup, noteModel]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            const { width, height } = entry.contentRect;
            const newNote = { ...note, width, height };
            setNote(newNote);
            updateNote(newNote);
        });

        resizeObserver.observe(textarea);

        return () => {
            resizeObserver.disconnect();
        };
    }, [note.note]); // Only re-run when note content changes

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const noteString = e.target.value;
        const newNote = { ...note, note: noteString };
        setNote(newNote);
        updateNote(newNote);
    };

    if (!activePopup) return null;

    return (
        <textarea
            style={{ width: note.width, height: note.height }}
            ref={textareaRef}
            className={`
              univer-note-textarea univer-resize-both univer-ml-[1px] univer-rounded univer-p-1 univer-shadow-sm
              focus:univer-outline-none
            `}
            value={note.note}
            onChange={handleNoteChange}
            placeholder="type here"

        />
    );
};
