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

import { FEventName } from '@univerjs/core/facade';
import { describe, expect, it } from 'vitest';
import { CellFEventName, FSheetsUIEventName } from '../f-event';

describe('FSheetsUIEventName', () => {
    it('returns stable event keys for sheet-ui events', () => {
        const events = new FSheetsUIEventName();

        expect(events.BeforeClipboardChange).toBe('BeforeClipboardChange');
        expect(events.ClipboardChanged).toBe('ClipboardChanged');
        expect(events.BeforeClipboardPaste).toBe('BeforeClipboardPaste');
        expect(events.ClipboardPasted).toBe('ClipboardPasted');
        expect(events.BeforeSheetEditStart).toBe('BeforeSheetEditStart');
        expect(events.SheetEditStarted).toBe('SheetEditStarted');
        expect(events.SheetEditChanging).toBe('SheetEditChanging');
        expect(events.BeforeSheetEditEnd).toBe('BeforeSheetEditEnd');
        expect(events.SheetEditEnded).toBe('SheetEditEnded');

        expect(events.CellClicked).toBe(CellFEventName.CellClicked);
        expect(events.CellPointerDown).toBe(CellFEventName.CellPointerDown);
        expect(events.CellPointerUp).toBe(CellFEventName.CellPointerUp);
        expect(events.CellPointerMove).toBe(CellFEventName.CellPointerMove);
        expect(events.CellHover).toBe(CellFEventName.CellHover);

        expect(events.RowHeaderClick).toBe('RowHeaderClick');
        expect(events.RowHeaderPointerDown).toBe('RowHeaderPointerDown');
        expect(events.RowHeaderPointerUp).toBe('RowHeaderPointerUp');
        expect(events.RowHeaderHover).toBe('RowHeaderHover');
        expect(events.ColumnHeaderClick).toBe('ColumnHeaderClick');
        expect(events.ColumnHeaderPointerDown).toBe('ColumnHeaderPointerDown');
        expect(events.ColumnHeaderPointerUp).toBe('ColumnHeaderPointerUp');
        expect(events.ColumnHeaderHover).toBe('ColumnHeaderHover');

        expect(events.DragOver).toBe('DragOver');
        expect(events.Drop).toBe('Drop');
        expect(events.Scroll).toBe('Scroll');
        expect(events.SelectionMoveStart).toBe('SelectionMoveStart');
        expect(events.SelectionMoving).toBe('SelectionMoving');
        expect(events.SelectionMoveEnd).toBe('SelectionMoveEnd');
        expect(events.SelectionChanged).toBe('SelectionChanged');
        expect(events.BeforeSheetZoomChange).toBe('BeforeSheetZoomChange');
        expect(events.SheetZoomChanged).toBe('SheetZoomChanged');
        expect(events.SheetSkeletonChanged).toBe('SheetSkeletonChanged');
    });

    it('extends core FEventName with sheet-ui event accessors', () => {
        const mixed = new (FEventName as any)();

        expect(mixed.BeforeClipboardChange).toBe('BeforeClipboardChange');
        expect(mixed.ClipboardChanged).toBe('ClipboardChanged');
        expect(mixed.CellClicked).toBe('CellClicked');
        expect(mixed.SelectionChanged).toBe('SelectionChanged');
        expect(mixed.SheetZoomChanged).toBe('SheetZoomChanged');
    });
});
