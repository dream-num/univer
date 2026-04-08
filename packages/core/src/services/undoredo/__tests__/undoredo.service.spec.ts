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

import type { ICommand } from '../../command/command.service';
import type { IUniverInstanceService } from '../../instance/instance.service';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '../../../common/const';
import { Injector } from '../../../common/di';
import { CommandService, CommandType, ICommandService } from '../../command/command.service';
import { ConfigService, IConfigService } from '../../config/config.service';
import { EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, FOCUSING_SHEET } from '../../context/context';
import { ContextService, IContextService } from '../../context/context.service';
import { DesktopLogService, ILogService, LogLevel } from '../../log/log.service';
import { IUndoRedoService, LocalUndoRedoService, RedoCommandId, UndoCommandId } from '../undoredo.service';

const MUTATION_ID = 'test.mutation';

class FocusedUnit {
    constructor(private readonly _unitId: string) {}

    getUnitId() {
        return this._unitId;
    }
}

describe('LocalUndoRedoService', () => {
    let injector: Injector;
    let commandService: ICommandService;
    let contextService: ContextService;
    let logService: DesktopLogService;
    let focused$: BehaviorSubject<FocusedUnit | null>;
    let instanceService: IUniverInstanceService;
    let undoRedoService: LocalUndoRedoService;
    let mutationLog: string[];

    beforeEach(() => {
        injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);

        commandService = injector.get(ICommandService);
        contextService = injector.get(IContextService) as ContextService;
        logService = injector.get(ILogService) as DesktopLogService;
        logService.setLogLevel(LogLevel.SILENT);

        focused$ = new BehaviorSubject<FocusedUnit | null>(new FocusedUnit('unit-1'));
        instanceService = {
            focused$: focused$.asObservable(),
            getFocusedUnit: () => focused$.value,
        } as IUniverInstanceService;

        undoRedoService = new LocalUndoRedoService(instanceService, commandService, contextService);
        injector.add([IUndoRedoService, { useValue: undoRedoService }]);

        mutationLog = [];
        commandService.registerCommand({
            id: MUTATION_ID,
            type: CommandType.MUTATION,
            handler: (_accessor, params?: { label: string; fail?: boolean }) => {
                mutationLog.push(params?.label ?? 'unknown');
                return !params?.fail;
            },
        } as ICommand);
    });

    afterEach(() => {
        undoRedoService.dispose();
        focused$.complete();
        logService.dispose();
        contextService.dispose();
    });

    it('should push undo items, clear redo stack and expose focused status', () => {
        const statuses: Array<{ undos: number; redos: number }> = [];
        undoRedoService.undoRedoStatus$.subscribe((status) => {
            statuses.push(status);
        });

        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-1' } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-1' } }],
            id: 'item-1',
        });

        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('item-1');
        expect(undoRedoService.pitchTopRedoElement()).toBeNull();

        undoRedoService.popUndoToRedo();
        expect(undoRedoService.pitchTopUndoElement()).toBeNull();
        expect(undoRedoService.pitchTopRedoElement()?.id).toBe('item-1');

        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-2' } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-2' } }],
            id: 'item-2',
        });

        expect(undoRedoService.pitchTopRedoElement()).toBeNull();
        expect(statuses.at(-1)).toEqual({ undos: 1, redos: 0 });
    });

    it('should execute undo and redo commands against registered mutations', () => {
        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-run' } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-run' } }],
            id: 'run',
        });

        expect(commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(mutationLog).toEqual(['undo-run']);
        expect(undoRedoService.pitchTopRedoElement()?.id).toBe('run');

        expect(commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
        expect(mutationLog).toEqual(['undo-run', 'redo-run']);
        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('run');
    });

    it('should rollback the latest undo item and support batching', () => {
        const batching = undoRedoService.__tempBatchingUndoRedo('unit-1');

        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-batch-1' } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-batch-1' } }],
            id: 'batch',
        });
        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-batch-2' } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-batch-2' } }],
            id: 'batch',
        });

        batching.dispose();

        const top = undoRedoService.pitchTopUndoElement();
        expect(top?.undoMutations).toHaveLength(2);
        expect(top?.redoMutations).toHaveLength(2);

        undoRedoService.rollback('batch');
        expect(mutationLog).toEqual(['undo-batch-1', 'undo-batch-2']);
        expect(undoRedoService.pitchTopUndoElement()).toBeNull();
    });

    it('should resolve focused unit id from sheet editor contexts and clear unit stacks', () => {
        contextService.setContextValue(FOCUSING_SHEET, true);
        contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
        undoRedoService.pushUndoRedo({
            unitID: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            undoMutations: [{ id: MUTATION_ID, params: { label: 'fx-undo' } }],
            redoMutations: [],
            id: 'fx',
        });
        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('fx');

        contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
        contextService.setContextValue(EDITOR_ACTIVATED, true);
        undoRedoService.pushUndoRedo({
            unitID: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            undoMutations: [{ id: MUTATION_ID, params: { label: 'doc-undo' } }],
            redoMutations: [],
            id: 'doc',
        });
        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('doc');

        undoRedoService.clearUndoRedo(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(undoRedoService.pitchTopUndoElement()).toBeNull();
    });

    it('should still move stacks on failed undo or redo execution and reject nested batching', () => {
        undoRedoService.pushUndoRedo({
            unitID: 'unit-1',
            undoMutations: [{ id: MUTATION_ID, params: { label: 'undo-fail', fail: true } }],
            redoMutations: [{ id: MUTATION_ID, params: { label: 'redo-fail', fail: true } }],
            id: 'fail',
        });

        expect(commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(undoRedoService.pitchTopUndoElement()).toBeNull();
        expect(undoRedoService.pitchTopRedoElement()?.id).toBe('fail');

        expect(commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
        expect(undoRedoService.pitchTopRedoElement()).toBeNull();
        expect(undoRedoService.pitchTopUndoElement()?.id).toBe('fail');

        const batching = undoRedoService.__tempBatchingUndoRedo('unit-1');
        expect(() => undoRedoService.__tempBatchingUndoRedo('unit-1')).toThrowError(/cannot batching undo redo twice/);
        batching.dispose();
    });
});
