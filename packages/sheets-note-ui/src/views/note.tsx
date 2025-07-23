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
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetUpdateNoteCommand } from '@univerjs/sheets-note';
import { useConfigValue, useDebounceFn, useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';

export const SheetsNote = (props: { popup: IPopup<{ location: ISheetLocationBase }> }) => {
    const { popup } = props;

    const noteModel = useDependency(SheetsNoteModel);
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const config = useConfigValue<IUniverSheetsNoteUIConfig>(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY);
    const activePopup = popup.extraProps?.location;
    if (!activePopup) {
        console.error('Popup extraProps or location is undefined.');
        return null; // Or handle this case appropriately
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const currentRender = renderManagerService.getRenderById(activePopup.unitId)!;

    const [note, setNote] = useState<ISheetNote | null>(null);

    useEffect(() => {
        const { unitId, subUnitId, row, col } = activePopup;

        const { width = 160, height = 72 } = config?.defaultNoteSize ?? {};
        const note = noteModel.getNote(unitId, subUnitId, row, col) ?? { width, height, note: '' };

        if (textareaRef.current) {
            // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
            setNote(note);

            textareaRef.current.style.width = `${note.width}px`;
            textareaRef.current.style.height = `${note.height}px`;
        }
    }, [activePopup, textareaRef]);

    const commandService = useDependency(ICommandService);
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

    const handleNoteChange = useCallback((value: string) => {
        if (!note) return;

        const newNote = { ...note, note: value };
        setNote(newNote);
        updateNote(newNote);
    }, [note]);

    const handleResize = useCallback((width: number, height: number) => {
        if (!note) return;

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
