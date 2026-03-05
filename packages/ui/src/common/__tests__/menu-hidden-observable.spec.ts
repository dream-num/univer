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

import type { IAccessor, UniverInstanceType } from '@univerjs/core';
import { DocumentFlavor } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHeaderFooterMenuHiddenObservable, getMenuHiddenObservable } from '../menu-hidden-observable';

const TARGET_TYPE = 'sheet' as unknown as UniverInstanceType;
const OTHER_TYPE = 'doc' as unknown as UniverInstanceType;

function createDocModel(flavor: DocumentFlavor) {
    return {
        getSnapshot: () => ({
            documentStyle: {
                documentFlavor: flavor,
            },
        }),
    };
}

function createMenuAccessor(options?: {
    focusedUnitId?: string | null;
    unitType?: UniverInstanceType;
    docFlavorByUnitId?: Record<string, DocumentFlavor>;
    currentDocFlavor?: DocumentFlavor | null;
}) {
    const focused$ = new Subject<string | null>();
    const unitType = options?.unitType ?? TARGET_TYPE;
    const hasFocusedUnitId = options != null && Object.prototype.hasOwnProperty.call(options, 'focusedUnitId');
    const focusedUnitId = hasFocusedUnitId ? options.focusedUnitId! : 'unit-1';
    const docFlavorByUnitId = options?.docFlavorByUnitId ?? {};
    const hasCurrentDocFlavor = options != null && Object.prototype.hasOwnProperty.call(options, 'currentDocFlavor');
    const currentDocFlavor = hasCurrentDocFlavor ? options.currentDocFlavor! : null;

    const service = {
        focused$,
        getUnitType: vi.fn(() => unitType),
        getFocusedUnit: vi.fn(() => (focusedUnitId == null ? null : { getUnitId: () => focusedUnitId })),
        getUniverDocInstance: vi.fn((unitId: string) => {
            const flavor = docFlavorByUnitId[unitId];
            return flavor == null ? null : createDocModel(flavor);
        }),
        getCurrentUniverDocInstance: vi.fn(() => {
            if (currentDocFlavor == null) {
                return null;
            }
            return createDocModel(currentDocFlavor);
        }),
    };

    const accessor = {
        get: () => service,
    } as unknown as IAccessor;

    return { accessor, service };
}

describe('getMenuHiddenObservable', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should emit true when there is no focused unit initially', () => {
        const { accessor } = createMenuAccessor({ focusedUnitId: null });
        const hiddenValues: boolean[] = [];
        const sub = getMenuHiddenObservable(accessor, TARGET_TYPE).subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([true]);
        sub.unsubscribe();
    });

    it('should emit false when focused unit type matches target type', () => {
        const { accessor } = createMenuAccessor({ unitType: TARGET_TYPE });
        const hiddenValues: boolean[] = [];
        const sub = getMenuHiddenObservable(accessor, TARGET_TYPE).subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([false]);
        sub.unsubscribe();
    });

    it('should emit true when focused unit type does not match target type', () => {
        const { accessor } = createMenuAccessor({ unitType: OTHER_TYPE });
        const hiddenValues: boolean[] = [];
        const sub = getMenuHiddenObservable(accessor, TARGET_TYPE).subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([true]);
        sub.unsubscribe();
    });

    it('should hide when focused unit does not match matchUnitId', () => {
        const { accessor, service } = createMenuAccessor({ focusedUnitId: 'expected-unit' });
        const hiddenValues: boolean[] = [];
        const sub = getMenuHiddenObservable(accessor, TARGET_TYPE, 'expected-unit').subscribe((hidden) => hiddenValues.push(hidden));

        service.focused$.next('other-unit');

        expect(hiddenValues).toEqual([false, true]);
        sub.unsubscribe();
    });

    it('should hide when needHideUnitId matches current unit (string and array)', () => {
        const { accessor, service } = createMenuAccessor({ focusedUnitId: 'unit-1' });
        const hiddenWithString: boolean[] = [];
        const hiddenWithArray: boolean[] = [];

        const sub1 = getMenuHiddenObservable(accessor, TARGET_TYPE, undefined, 'blocked-unit').subscribe((hidden) =>
            hiddenWithString.push(hidden)
        );
        const sub2 = getMenuHiddenObservable(accessor, TARGET_TYPE, undefined, ['blocked-unit']).subscribe((hidden) =>
            hiddenWithArray.push(hidden)
        );

        service.focused$.next('blocked-unit');

        expect(hiddenWithString).toEqual([false, true]);
        expect(hiddenWithArray).toEqual([false, true]);

        sub1.unsubscribe();
        sub2.unsubscribe();
    });

    it('should hide when focused$ emits null unit id', () => {
        const { accessor, service } = createMenuAccessor({ focusedUnitId: 'unit-1' });
        const hiddenValues: boolean[] = [];
        const sub = getMenuHiddenObservable(accessor, TARGET_TYPE).subscribe((hidden) => hiddenValues.push(hidden));

        service.focused$.next(null);

        expect(hiddenValues).toEqual([false, true]);
        sub.unsubscribe();
    });
});

describe('getHeaderFooterMenuHiddenObservable', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should emit true when current doc instance is missing', () => {
        const { accessor } = createMenuAccessor({ currentDocFlavor: null });
        const hiddenValues: boolean[] = [];
        const sub = getHeaderFooterMenuHiddenObservable(accessor).subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([true]);
        sub.unsubscribe();
    });

    it('should emit false when current document flavor is traditional', () => {
        const { accessor } = createMenuAccessor({ currentDocFlavor: DocumentFlavor.TRADITIONAL });
        const hiddenValues: boolean[] = [];
        const sub = getHeaderFooterMenuHiddenObservable(accessor).subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([false]);
        sub.unsubscribe();
    });

    it('should react to focused unit changes based on document flavor', () => {
        const { accessor, service } = createMenuAccessor({
            currentDocFlavor: DocumentFlavor.TRADITIONAL,
            docFlavorByUnitId: {
                modernDoc: DocumentFlavor.MODERN,
                traditionalDoc: DocumentFlavor.TRADITIONAL,
            },
        });
        const hiddenValues: boolean[] = [];
        const sub = getHeaderFooterMenuHiddenObservable(accessor).subscribe((hidden) => hiddenValues.push(hidden));

        service.focused$.next('modernDoc');
        service.focused$.next('traditionalDoc');
        service.focused$.next(null);

        expect(hiddenValues).toEqual([false, true, false, true]);
        sub.unsubscribe();
    });
});
