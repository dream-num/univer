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
import type { IUniverSheetsNoteUIConfig } from '../controllers/config.schema';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx, Textarea } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsNoteModel, SheetUpdateNoteCommand } from '@univerjs/sheets-note';
import { useConfigValue, useDebounceFn, useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';
import { SheetsNotePopupService } from '../services/sheets-note-popup.service';

type INotePopupLocation = ISheetLocationBase & {
    temp?: boolean;
    trigger?: string;
};

export const SheetsNote = (props: { popup: IPopup<{ location: INotePopupLocation }> }) => {
    const { popup } = props;

    const noteModel = useDependency(SheetsNoteModel);
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const notePopupService = useDependency(SheetsNotePopupService);
    const config = useConfigValue<IUniverSheetsNoteUIConfig>(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY);

    const activePopup = popup.extraProps?.location;
    if (!activePopup) {
        console.error('Popup extraProps or location is undefined.');
        return null; // Or handle this case appropriately
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const currentRender = renderManagerService.getRenderById(activePopup.unitId)!;

    const [note, setNote] = useState<Partial<ISheetNote> | null>(null);

    useEffect(() => {
        const { unitId, subUnitId, row, col } = activePopup;
        const note = noteModel.getNote(unitId, subUnitId, { row, col });
        const width = note?.width ?? config?.defaultNoteSize?.width ?? 160;
        const height = note?.height ?? config?.defaultNoteSize?.height ?? 72;

        if (!note) {
            const initNote: Partial<ISheetNote> = {
                width,
                height,
                note: '',
            };
            setNote(initNote);
            updateNote(initNote);
        } else {
            setNote(note);
        }

        if (textareaRef.current) {
            textareaRef.current.style.width = `${width}px`;
            textareaRef.current.style.height = `${height}px`;
        }
    }, [activePopup, textareaRef]);

    useEffect(() => {
        if (!activePopup || activePopup.temp || !activePopup.trigger) return;
        if (!textareaRef.current) return;

        const focusId = requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });

        return () => cancelAnimationFrame(focusId);
    }, [activePopup]);

    const commandService = useDependency(ICommandService);
    const updateNote = useDebounceFn((newNote: Partial<ISheetNote>) => {
        if (!activePopup) return;

        const { unitId, subUnitId, row, col } = activePopup;
        const result = commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId,
            sheetId: subUnitId,
            row,
            col,
            note: newNote,
        });

        // If the update fails
        if (!result) {
            const oldNote = noteModel.getNote(unitId, subUnitId, { noteId: newNote.id, row, col });

            if (oldNote) {
                // Revert to old note
                setNote(oldNote);
            } else {
                // Hide popup if no old note exists
                notePopupService.hidePopup(true);
            }
        }
    });

    const handleNoteChange = useCallback((value: string) => {
        if (!note) return;
        if (value === note.note) return;

        const newNote = { ...note, note: value };
        setNote(newNote);
        updateNote(newNote);
    }, [note]);

    const handleResize = useCallback((width: number, height: number) => {
        if (!note) return;
        if (width === note.width && height === note.height) return;

        const newNote = { ...note, width, height };
        setNote(newNote);
        updateNote(newNote);
    }, [note]);

    return (
        <Textarea
            ref={textareaRef}
            data-u-comp="note-textarea"
            className={clsx(`
              univer-ml-px univer-min-h-1 univer-min-w-1 univer-bg-white !univer-text-sm univer-shadow
              dark:!univer-bg-gray-800
            `)}
            value={note?.note}
            placeholder={localeService.t('note.placeholder')}
            onResize={handleResize}
            onValueChange={handleNoteChange}
            onWheel={(e) => {
                if (document.activeElement !== textareaRef.current) {
                    currentRender.engine.getCanvasElement().dispatchEvent(new WheelEvent(e.type, e.nativeEvent));
                }
            }}
        />
    );
};
