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

import { IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IWorkbenchService, WorkbenchService } from '../workbench.service';

describe('WorkbenchService', () => {
    let univer: Univer;
    let instanceService: IUniverInstanceService;
    let service: IWorkbenchService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IWorkbenchService, { useClass: WorkbenchService }]);
        instanceService = injector.get(IUniverInstanceService);
        service = injector.get(IWorkbenchService);
    });

    afterEach(() => univer.dispose());

    it('keeps the skeleton visible until every loading token is disposed', () => {
        const states: boolean[] = [];
        service.skeletonVisible$.subscribe((visible) => states.push(visible));

        const first = service.acquireSkeleton();
        const second = service.acquireSkeleton();
        first.dispose();

        expect(states).toEqual([false, true]);

        second.dispose();
        expect(states).toEqual([false, true, false]);
    });

    it('identifies root units without treating editors or embedded units as workbench roots', () => {
        const states: Array<UniverInstanceType | null> = [];
        service.rootUnitType$.subscribe((unitType) => states.push(unitType));

        const rootDoc = instanceService.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'root-doc' });
        instanceService.createUnit(UniverInstanceType.UNIVER_DOC, { id: '__INTERNAL_EDITOR__doc' });
        const backgroundSheet = instanceService.createUnit(
            UniverInstanceType.UNIVER_SHEET,
            { id: 'background-sheet' },
            { makeCurrent: false }
        );

        instanceService.focusUnit(backgroundSheet.getUnitId());

        const embeddedDoc = instanceService.createUnit(
            UniverInstanceType.UNIVER_DOC,
            { id: 'embedded-doc' },
            { makeCurrent: false, skipAutoRender: true, embeddedRender: true }
        );
        instanceService.focusUnit(embeddedDoc.getUnitId());
        instanceService.disposeUnit(backgroundSheet.getUnitId());

        expect(rootDoc.getUnitId()).toBe('root-doc');
        expect(states).toEqual([
            null,
            UniverInstanceType.UNIVER_DOC,
            UniverInstanceType.UNIVER_SHEET,
            null,
        ]);
    });
});
