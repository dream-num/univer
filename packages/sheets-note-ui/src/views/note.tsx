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
import type { IUniverSheetsNoteUIPluginConfig } from '../controllers/config.schema';
import { ICommandService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetUpdateNoteCommand } from '@univerjs/sheets-note';
import { useConfigValue, useDebounceFn, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { of } from 'rxjs';
import { SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';

export const SheetsNote = (props: { popup: IPopup<{ location: ISheetLocationBase }> }) => {
    const noteModel = useDependency(SheetsNoteModel);
    const localeService = useDependency(LocaleService);
    const config = useConfigValue<IUniverSheetsNoteUIPluginConfig>(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY);
    const activePopup = props.popup.extraProps?.location;
    if (!activePopup) {
        console.error('Popup extraProps or location is undefined.');
        return null; // Or handle this case appropriately
    }
    const [note, setNote] = useState<ISheetNote>(() => {
        const defaultNote = { width: config?.defaultNoteSize?.width || 216, height: config?.defaultNoteSize?.height || 92, note: '' };
        const existingNote = noteModel.getNote(activePopup.unitId, activePopup.subUnitId!, activePopup.row, activePopup.col);
        return existingNote || defaultNote;
    });

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
            if (!existingNote) {
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
            if (width === 0 && height === 0) return;
            const newNote = { ...note, width, height };
            setNote(newNote);
            updateNote(newNote);
        });

        resizeObserver.observe(textarea);

        return () => {
            resizeObserver.unobserve(textarea);
            resizeObserver.disconnect();
        };
    }, [note.note]); // Only re-run when note content changes

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const noteString = e.target.value;
        const newNote = { ...note, note: noteString };
        setNote(newNote);
        updateNote(newNote);
    };

    return (
        <textarea
            ref={textareaRef}
            data-u-comp="note-textarea"
            className={clsx(`
              univer-resize-both univer-ml-px univer-rounded-md univer-bg-white univer-p-2 univer-text-gray-900
              univer-shadow
              dark:univer-bg-gray-800 dark:univer-text-white
              focus:univer-outline-none
            `, borderClassName, scrollbarClassName)}
            style={{ width: note.width, height: note.height }}
            value={note.note}
            placeholder={localeService.t('note.placeholder')}
            onChange={handleNoteChange}
        />
    );
};
