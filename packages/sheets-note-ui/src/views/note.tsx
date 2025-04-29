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

import type { ISheetLocationBase } from '@univerjs/sheets';
import type { ISheetNote } from '@univerjs/sheets-note';
import type { IPopup } from '@univerjs/ui';
import { ICommandService, LocaleService } from '@univerjs/core';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetUpdateNoteCommand } from '@univerjs/sheets-note';
import { useDebounceFn, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { of } from 'rxjs';

export const SheetsNote = (props: { popup: IPopup<{ location: ISheetLocationBase }> }) => {
    const noteModel = useDependency(SheetsNoteModel);
    const localeService = useDependency(LocaleService);
    const [note, setNote] = useState<ISheetNote>({ width: 216, height: 92, note: '' });
    const activePopup = props.popup.extraProps?.location;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const commandService = useDependency(ICommandService);
    const cellNoteChange$ = useMemo(() => activePopup ? noteModel.getCellNoteChange$(activePopup.unitId, activePopup.subUnitId!, activePopup.row, activePopup.col) : of(null), [activePopup]);

    const updateNote = useDebounceFn((newNote: ISheetNote) => {
        if (!activePopup) return;

        if (newNote.note) {
            commandService.executeCommand(SheetUpdateNoteCommand.id, {
                unitId: activePopup.unitId,
                sheetId: activePopup.subUnitId!,
                row: activePopup.row,
                col: activePopup.col,
                note: newNote,
            });
        } else {
            commandService.executeCommand(SheetDeleteNoteCommand.id, {
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
        const sub = cellNoteChange$.subscribe(() => {
            if (!activePopup) return;
            const existingNote = noteModel.getNote(activePopup.unitId, activePopup.subUnitId!, activePopup.row, activePopup.col);
            if (existingNote) {
                setNote(existingNote);
            }
        });

        return () => sub.unsubscribe();
    }, [cellNoteChange$]);

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
              univer-note-textarea univer-resize-both univer-ml-[1px] univer-rounded univer-border univer-border-solid
              univer-border-gray-200 univer-p-2 univer-shadow
              focus:univer-outline-none
            `}
            value={note.note}
            onChange={handleNoteChange}
            placeholder={localeService.t('note.placeholder')}
        />
    );
};
