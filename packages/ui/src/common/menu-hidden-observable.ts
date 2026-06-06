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
import { DocumentFlavor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Observable } from 'rxjs';

export interface IMenuHiddenContext {
    unitId: string;
    unitType: UniverInstanceType | undefined;
    targetType: UniverInstanceType;
}

export interface IMenuHiddenOptions {
    targetType: UniverInstanceType;
    onlyUnitId?: string;
    excludeUnitIds?: string | string[];
    shouldHide?: (context: IMenuHiddenContext) => boolean;
}

export function getMenuHiddenObservable(
    accessor: IAccessor,
    options: IMenuHiddenOptions
): Observable<boolean>;
export function getMenuHiddenObservable(
    accessor: IAccessor,
    targetUniverType: UniverInstanceType,
    matchUnitId?: string,
    excludeUnitIds?: string | string[]
): Observable<boolean>;
export function getMenuHiddenObservable(
    accessor: IAccessor,
    optionsOrTargetType: IMenuHiddenOptions | UniverInstanceType,
    matchUnitId?: string,
    excludeUnitIds?: string | string[]
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const options: IMenuHiddenOptions = typeof optionsOrTargetType === 'object'
        ? optionsOrTargetType
        : {
            targetType: optionsOrTargetType,
            onlyUnitId: matchUnitId,
            excludeUnitIds,
        };

    const isExcludedUnitId = (unitId: string) => {
        const { excludeUnitIds } = options;
        return Boolean(excludeUnitIds && (Array.isArray(excludeUnitIds) ? excludeUnitIds.includes(unitId) : excludeUnitIds === unitId));
    };

    const getHiddenState = (unitId: string) => {
        const { onlyUnitId, shouldHide, targetType } = options;

        if (onlyUnitId && onlyUnitId !== unitId) {
            return true;
        }

        if (isExcludedUnitId(unitId)) {
            return true;
        }

        const unitType = univerInstanceService.getUnitType(unitId);
        const context = { unitId, unitType, targetType };

        if (shouldHide?.(context)) {
            return true;
        }

        return unitType !== targetType;
    };

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }

            subscriber.next(getHiddenState(unitId));
        });

        const focusedUniverInstance = univerInstanceService.getFocusedUnit();

        if (focusedUniverInstance == null) {
            const currentUnit = univerInstanceService.getCurrentUnitOfType(options.targetType);
            subscriber.next(currentUnit == null);
        } else {
            subscriber.next(getHiddenState(focusedUniverInstance.getUnitId()));
        }

        return () => subscription.unsubscribe();
    });
}

export function getDocMenuHiddenObservable(
    accessor: IAccessor,
    options: Omit<IMenuHiddenOptions, 'targetType'> = {}
): Observable<boolean> {
    return getMenuHiddenObservable(accessor, {
        ...options,
        targetType: UniverInstanceType.UNIVER_DOC,
    });
}

export function getSheetMenuHiddenObservable(
    accessor: IAccessor,
    options: Omit<IMenuHiddenOptions, 'targetType'> = {}
): Observable<boolean> {
    return getMenuHiddenObservable(accessor, {
        ...options,
        targetType: UniverInstanceType.UNIVER_SHEET,
    });
}

export function getHeaderFooterMenuHiddenObservable(
    accessor: IAccessor
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;

            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        });

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (docDataModel == null) {
            subscriber.next(true);
        } else {
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;
            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        }

        return () => subscription.unsubscribe();
    });
}
