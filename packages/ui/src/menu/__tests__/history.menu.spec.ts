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

import {
    EDITOR_ACTIVATED,
    FOCUSING_FX_BAR_EDITOR,
    IContextService,
    IUndoRedoService,
    IUniverInstanceService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { RedoMenuItemFactory, UndoMenuItemFactory } from '../history.menu';

describe('history menu context changes', () => {
    it.each([['undo', UndoMenuItemFactory], ['redo', RedoMenuItemFactory]] as const)('refreshes %s after an editor exits without a new history entry', (_label, factory) => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const host = univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'host' });
        const instances = injector.get(IUniverInstanceService);
        const context = injector.get(IContextService);
        const history = injector.get(IUndoRedoService);
        instances.focusUnit(host.getUnitId());
        history.pushUndoRedo({ unitID: host.getUnitId(), undoMutations: [{ id: 'test.mutation', params: {} }], redoMutations: [{ id: 'test.mutation', params: {} }] });
        history.pushUndoRedo({ unitID: host.getUnitId(), undoMutations: [{ id: 'test.mutation', params: {} }], redoMutations: [{ id: 'test.mutation', params: {} }] });
        history.popUndoToRedo();
        context.setContextValue(EDITOR_ACTIVATED, true);
        let disabled: boolean | undefined;
        const menu = injector.invoke((accessor) => factory(accessor));
        const subscription = menu.disabled$!.subscribe((value) => {
            disabled = Boolean(value);
        });
        try {
            expect(disabled).toBe(true);
            context.setContextValue(EDITOR_ACTIVATED, false);
            expect(disabled).toBe(false);
            context.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
            expect(disabled).toBe(true);
            context.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
            expect(disabled).toBe(false);
            history.clearUndoRedo(host.getUnitId());
            expect(disabled).toBe(true);
        } finally {
            subscription.unsubscribe();
            univer.dispose();
        }
    });
});
