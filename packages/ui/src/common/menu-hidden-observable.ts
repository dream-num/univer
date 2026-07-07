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

import type { DocumentDataModel, IAccessor } from '@univerjs/core';
import { DocumentFlavor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Observable } from 'rxjs';

export function getMenuHiddenObservable(
    accessor: IAccessor,
    targetUniverType: UniverInstanceType,
    matchUnitId?: string,
    needHideUnitId?: string | string[]
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            if (matchUnitId && matchUnitId !== unitId) {
                return subscriber.next(true);
            }

            if (needHideUnitId && (Array.isArray(needHideUnitId) ? needHideUnitId.includes(unitId) : needHideUnitId === unitId)) {
                return subscriber.next(true);
            }
            const univerType = univerInstanceService.getUnitType(unitId);

            subscriber.next(univerType !== targetUniverType);
        });

        const focusedUniverInstance = univerInstanceService.getFocusedUnit();

        if (focusedUniverInstance == null) {
            const currentUnit = univerInstanceService.getCurrentUnitOfType(targetUniverType);
            subscriber.next(currentUnit == null);
        } else {
            const univerType = univerInstanceService.getUnitType(focusedUniverInstance.getUnitId());
            subscriber.next(univerType !== targetUniverType);
        }

        return () => subscription.unsubscribe();
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
            const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;

            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        });

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

        if (docDataModel == null) {
            subscriber.next(true);
        } else {
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;
            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        }

        return () => subscription.unsubscribe();
    });
}
