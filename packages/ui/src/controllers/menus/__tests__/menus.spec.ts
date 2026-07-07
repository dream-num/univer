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

import type { IAccessor } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, IContextService, IUndoRedoService, LocaleService } from '@univerjs/core';
import { BehaviorSubject, isObservable, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { RedoMenuItemFactory, UndoMenuItemFactory } from '../menus';

function createAccessor() {
    const undoRedoStatus$ = new BehaviorSubject({ undos: 1, redos: 1 });
    const contextChanged$ = new Subject<void>();
    const direction$ = new BehaviorSubject<'ltr' | 'rtl'>('ltr');
    const contextStore: Record<string, boolean> = {
        [EDITOR_ACTIVATED]: false,
        [FOCUSING_FX_BAR_EDITOR]: false,
    };

    const undoRedoService = { undoRedoStatus$ };
    const contextService = {
        contextChanged$,
        getContextValue: (key: string) => contextStore[key] ?? false,
    };
    const localeService = { direction$ };

    const accessor = {
        get: (token: unknown) => {
            if (token === IUndoRedoService) return undoRedoService;
            if (token === IContextService) return contextService;
            if (token === LocaleService) return localeService;
            throw new Error('Unknown token');
        },
    } as unknown as IAccessor;

    return { accessor, undoRedoStatus$, contextChanged$, contextStore, direction$ };
}

describe('menus controller factories', () => {
    it('should toggle undo disabled state by status and editor context', () => {
        const { accessor, undoRedoStatus$, contextChanged$, contextStore } = createAccessor();
        const item = UndoMenuItemFactory(accessor);
        const values: boolean[] = [];
        const sub = item.disabled$!.subscribe((v) => values.push(v));

        expect(values.at(-1)).toBe(false);

        undoRedoStatus$.next({ undos: 0, redos: 1 });
        expect(values.at(-1)).toBe(true);

        contextStore[EDITOR_ACTIVATED] = true;
        contextChanged$.next();
        undoRedoStatus$.next({ undos: 2, redos: 1 });
        expect(values.at(-1)).toBe(true);

        contextStore[EDITOR_ACTIVATED] = false;
        contextStore[FOCUSING_FX_BAR_EDITOR] = false;
        contextChanged$.next();
        undoRedoStatus$.next({ undos: 3, redos: 1 });
        expect(values.at(-1)).toBe(false);

        sub.unsubscribe();
    });

    it('should toggle redo disabled state by status and fx bar context', () => {
        const { accessor, undoRedoStatus$, contextChanged$, contextStore } = createAccessor();
        const item = RedoMenuItemFactory(accessor);
        const values: boolean[] = [];
        const sub = item.disabled$!.subscribe((v) => values.push(v));

        expect(values.at(-1)).toBe(false);

        undoRedoStatus$.next({ undos: 1, redos: 0 });
        expect(values.at(-1)).toBe(true);

        contextStore[FOCUSING_FX_BAR_EDITOR] = true;
        contextChanged$.next();
        undoRedoStatus$.next({ undos: 1, redos: 3 });
        expect(values.at(-1)).toBe(true);

        contextStore[FOCUSING_FX_BAR_EDITOR] = false;
        contextChanged$.next();
        undoRedoStatus$.next({ undos: 1, redos: 4 });
        expect(values.at(-1)).toBe(false);

        sub.unsubscribe();
    });

    it('should use rtl-specific undo and redo icons when locale direction changes', () => {
        const { accessor, direction$ } = createAccessor();
        const undoItem = UndoMenuItemFactory(accessor);
        const redoItem = RedoMenuItemFactory(accessor);
        const undoIcon$ = undoItem.icon as Observable<string>;
        const redoIcon$ = redoItem.icon as Observable<string>;
        const undoIcons: string[] = [];
        const redoIcons: string[] = [];

        expect(isObservable(undoItem.icon)).toBe(true);
        expect(isObservable(redoItem.icon)).toBe(true);

        const undoSub = undoIcon$.subscribe((icon) => undoIcons.push(icon));
        const redoSub = redoIcon$.subscribe((icon) => redoIcons.push(icon));

        expect(undoIcons.at(-1)).toBe('UndoIcon');
        expect(redoIcons.at(-1)).toBe('RedoIcon');

        direction$.next('rtl');

        expect(undoIcons.at(-1)).toBe('RedoIcon');
        expect(redoIcons.at(-1)).toBe('UndoIcon');

        direction$.next('ltr');

        expect(undoIcons.at(-1)).toBe('UndoIcon');
        expect(redoIcons.at(-1)).toBe('RedoIcon');

        undoSub.unsubscribe();
        redoSub.unsubscribe();
    });
});
