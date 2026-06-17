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

import type { Workbook } from '@univerjs/core';
import type { WorkbookSelectionModel } from '../selection-data-model';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { firstValueFrom, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RefSelectionsService } from '../ref-selections.service';

function createWorkbook(unitId: string): Workbook {
    return {
        getUnitId: () => unitId,
    } as unknown as Workbook;
}

function createSelectionModelMock() {
    return {
        selectionMoveStart$: new Subject<unknown>(),
        selectionMoving$: new Subject<unknown>(),
        selectionMoveEnd$: new Subject<unknown>(),
        selectionSet$: new Subject<unknown>(),
        dispose: vi.fn(),
        clear: vi.fn(),
    };
}

class TestRefSelectionsService extends RefSelectionsService {
    public get modelMap() {
        const self = this as unknown as { __modelMap?: Map<string, ReturnType<typeof createSelectionModelMock>> };
        if (!self.__modelMap) {
            self.__modelMap = new Map<string, ReturnType<typeof createSelectionModelMock>>();
        }
        return self.__modelMap;
    }

    public get removedUnitIds() {
        const self = this as unknown as { __removedUnitIds?: string[] };
        if (!self.__removedUnitIds) {
            self.__removedUnitIds = [];
        }
        return self.__removedUnitIds;
    }

    protected override _ensureWorkbookSelection(unitId: string): WorkbookSelectionModel {
        let model = this.modelMap.get(unitId);
        if (!model) {
            model = createSelectionModelMock();
            this.modelMap.set(unitId, model);
            this._workbookSelections.set(unitId, model as unknown as WorkbookSelectionModel);
        }

        return model as unknown as WorkbookSelectionModel;
    }

    protected override _removeWorkbookSelection(unitId: string): void {
        this.removedUnitIds.push(unitId);
        this.modelMap.delete(unitId);
        this._workbookSelections.delete(unitId);
    }
}

describe('RefSelectionsService', () => {
    const workbookA = createWorkbook('wb-a');
    const workbookB = createWorkbook('wb-b');

    let add$: Subject<{ unit: Workbook }>;
    let disposed$: Subject<Workbook>;

    class TestUniverInstanceService {
        getAllUnitsForType = vi.fn(() => [workbookA]);
        getTypeOfUnitAdded$ = vi.fn(() => add$.asObservable());
        getTypeOfUnitDisposed$ = vi.fn(() => disposed$.asObservable());
    }

    let service: TestRefSelectionsService;

    beforeEach(() => {
        add$ = new Subject<{ unit: Workbook }>();
        disposed$ = new Subject<Workbook>();
    });

    afterEach(() => {
        service?.dispose();
        add$.complete();
        disposed$.complete();
    });

    it('merges all workbook selection streams and handles workbook lifecycle', () => {
        const injector = new Injector();
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([TestRefSelectionsService]);
        service = injector.get(TestRefSelectionsService);

        const startEvents: unknown[] = [];
        const movingEvents: unknown[] = [];
        const endEvents: unknown[] = [];
        const setEvents: unknown[] = [];

        service.selectionMoveStart$.subscribe((event) => startEvents.push(event));
        service.selectionMoving$.subscribe((event) => movingEvents.push(event));
        service.selectionMoveEnd$.subscribe((event) => endEvents.push(event));
        service.selectionSet$.subscribe((event) => setEvents.push(event));

        const modelA = service.modelMap.get('wb-a')!;
        modelA.selectionMoveStart$.next('a-start');
        modelA.selectionMoving$.next('a-moving');
        modelA.selectionMoveEnd$.next('a-end');
        modelA.selectionSet$.next('a-set');

        expect(startEvents).toEqual(['a-start']);
        expect(movingEvents).toEqual(['a-moving']);
        expect(endEvents).toEqual(['a-end']);
        expect(setEvents).toEqual(['a-set']);

        add$.next({ unit: workbookB });
        const modelB = service.modelMap.get('wb-b')!;
        modelB.selectionMoving$.next('b-moving');
        expect(movingEvents).toEqual(['a-moving', 'b-moving']);

        disposed$.next(workbookA);
        expect(service.removedUnitIds).toEqual(['wb-a']);
        modelA.selectionMoving$.next('a-moving-after-dispose');
        expect(movingEvents).toEqual(['a-moving', 'b-moving']);
    });

    it('clears workbook state and resets streams on dispose', async () => {
        const injector = new Injector();
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([TestRefSelectionsService]);
        service = injector.get(TestRefSelectionsService);
        const modelA = service.modelMap.get('wb-a')!;

        service.dispose();

        expect(modelA.dispose).toHaveBeenCalled();
        expect((service as unknown as { _workbookSelections: Map<string, unknown> })._workbookSelections.size).toBe(0);
        await expect(firstValueFrom(service.selectionMoveStart$)).resolves.toBeNull();
        await expect(firstValueFrom(service.selectionMoving$)).resolves.toBeNull();
        await expect(firstValueFrom(service.selectionMoveEnd$)).resolves.toBeNull();
        await expect(firstValueFrom(service.selectionSet$)).resolves.toBeNull();
    });
});
