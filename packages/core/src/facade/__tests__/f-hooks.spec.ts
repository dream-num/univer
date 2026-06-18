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

import type { ICommand } from '../../index';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../common/di';
import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocalUndoRedoService,
    RedoCommandId,
    UndoCommandId,
} from '../../index';
import { FHooks } from '../f-hooks';

const MUTATION_ID = 'facade.test.mutation';

class FocusedUnit {
    constructor(private readonly _unitId: string) {}

    getUnitId() {
        return this._unitId;
    }
}

class TestUniverInstanceService {
    static focused$ = new BehaviorSubject<FocusedUnit | null>(new FocusedUnit('unit-1'));

    readonly focused$ = TestUniverInstanceService.focused$.asObservable();

    getFocusedUnit() {
        return TestUniverInstanceService.focused$.value;
    }
}

describe('FHooks', () => {
    let injector: Injector;
    let commandService: ICommandService;
    let lifecycleService: LifecycleService;
    let undoRedoService: LocalUndoRedoService;
    let hooks: FHooks;
    let mutationLog: string[];

    beforeEach(() => {
        TestUniverInstanceService.focused$ = new BehaviorSubject<FocusedUnit | null>(new FocusedUnit('unit-1'));
        injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([LifecycleService]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);

        commandService = injector.get(ICommandService);
        lifecycleService = injector.get(LifecycleService);
        undoRedoService = injector.get(IUndoRedoService) as LocalUndoRedoService;
        hooks = injector.createInstance(FHooks);

        mutationLog = [];
        commandService.registerCommand({
            id: MUTATION_ID,
            type: CommandType.MUTATION,
            handler: (_accessor, params?: { label: string }) => {
                mutationLog.push(params?.label ?? 'unknown');
                return true;
            },
        } as ICommand);
    });

    afterEach(() => {
        undoRedoService.dispose();
        TestUniverInstanceService.focused$.complete();
        injector.dispose();
    });

    it('should emit lifecycle hooks for matching stages only', () => {
        const events: string[] = [];

        hooks.onStarting(() => events.push('starting'));
        hooks.onReady(() => events.push('ready'));
        hooks.onRendered(() => events.push('rendered'));
        hooks.onSteady(() => events.push('steady'));

        lifecycleService.stage = LifecycleStages.Ready;
        lifecycleService.stage = LifecycleStages.Rendered;
        lifecycleService.stage = LifecycleStages.Steady;

        expect(events).toEqual(['starting', 'ready', 'rendered', 'steady']);
    });

    it('should wire undo and redo hooks through command and undo-redo services', async () => {
        const beforeUndo: string[] = [];
        const undo: string[] = [];
        const beforeRedo: string[] = [];
        const redo: string[] = [];

        hooks.onBeforeUndo((action) => beforeUndo.push(action.id ?? ''));
        hooks.onUndo((action) => undo.push(action.id ?? ''));
        hooks.onBeforeRedo((action) => beforeRedo.push(action.id ?? ''));
        hooks.onRedo((action) => redo.push(action.id ?? ''));

        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            id: 'first',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-first' }, type: CommandType.MUTATION }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-first' }, type: CommandType.MUTATION }],
        });
        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            id: 'second',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-second' }, type: CommandType.MUTATION }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-second' }, type: CommandType.MUTATION }],
        });

        expect(await commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(await commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(await commandService.executeCommand(RedoCommandId)).toBe(true);

        expect(beforeUndo).toEqual(['second', 'first']);
        expect(undo).toEqual(['first']);
        expect(beforeRedo).toEqual(['first']);
        expect(redo).toEqual(['second']);
        expect(mutationLog).toEqual(['undo-second', 'undo-first', 'redo-first']);
    });
});
