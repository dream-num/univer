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

import type { IDataValidationRule, IUniverInstanceService, Nullable, UnitModel } from '@univerjs/core';
import type { ISidebarMethodOptions, ISidebarService } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DATA_VALIDATION_PANEL } from '../../commands/operations/data-validation.operation';
import { DataValidationPanelService } from '../data-validation-panel.service';

type SidebarOptions = ISidebarMethodOptions;
type UniverInstanceServiceStub = Pick<IUniverInstanceService, 'getCurrentTypeOfUnit$'>;
type SidebarServiceStub = Pick<ISidebarService, 'sidebarOptions$'>;

describe('DataValidationPanelService', () => {
    let sheet$ = new Subject<unknown>();
    let sidebarOptions$ = new BehaviorSubject<SidebarOptions>({ visible: true });

    beforeEach(() => {
        vi.useFakeTimers();
        sheet$ = new Subject();
        sidebarOptions$ = new BehaviorSubject<SidebarOptions>({ visible: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function createService() {
        const univerInstanceService: UniverInstanceServiceStub = {
            getCurrentTypeOfUnit$<T extends UnitModel<object, number>>(): Observable<Nullable<T>> {
                return sheet$.asObservable() as Observable<Nullable<T>>;
            },
        };
        const sidebarService: SidebarServiceStub = {
            sidebarOptions$,
        };

        return new DataValidationPanelService(
            univerInstanceService as unknown as IUniverInstanceService,
            sidebarService as unknown as ISidebarService
        );
    }

    it('tracks open state, active rules, and runs close disposables exactly once', () => {
        const service = createService();
        const openStates: boolean[] = [];
        const activeRules: Array<Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }>> = [];
        const disposeSpy = vi.fn();

        const openSub = service.open$.subscribe((value) => openStates.push(value));
        const activeSub = service.activeRule$.subscribe((value) => activeRules.push(value));

        service.setCloseDisposable({ dispose: disposeSpy });
        service.open();
        service.setActiveRule({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: { uid: 'rule-1' } as IDataValidationRule,
        });
        service.close();
        service.close();

        expect(service.isOpen).toBe(false);
        expect(service.activeRule).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: { uid: 'rule-1' },
        });
        expect(openStates).toEqual([false, true, false]);
        expect(activeRules).toEqual([
            undefined,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                rule: { uid: 'rule-1' },
            },
        ]);
        expect(disposeSpy).toHaveBeenCalledTimes(1);

        openSub.unsubscribe();
        activeSub.unsubscribe();
        service.dispose();
    });

    it('closes automatically when the current sheet disappears', () => {
        const service = createService();

        service.open();
        sheet$.next(null);

        expect(service.isOpen).toBe(false);

        service.dispose();
    });

    it('re-emits a hidden sidebar state after the data validation panel closes', async () => {
        const service = createService();

        sidebarOptions$.next({
            id: DATA_VALIDATION_PANEL,
            visible: false,
        });

        await vi.runAllTimersAsync();

        expect(sidebarOptions$.getValue()).toEqual({ visible: false });

        service.dispose();
    });
});
