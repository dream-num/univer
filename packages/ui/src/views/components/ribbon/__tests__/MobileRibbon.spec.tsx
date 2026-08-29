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

/**
 * @vitest-environment jsdom
 */

import { act, cleanup, render } from '@testing-library/react';
import { Injector, LocaleService, UniverInstanceType } from '@univerjs/core';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { BehaviorSubject, of } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { IRibbonService } from '../../../../services/ribbon/ribbon.service';
import { IWorkbenchService } from '../../../../services/workbench/workbench.service';
import { MobileRibbon } from '../MobileRibbon';

describe('MobileRibbon', () => {
    afterEach(cleanup);

    it('keeps a stable hook order when the sheet workbench becomes ready', () => {
        const rootUnitType$ = new BehaviorSubject<UniverInstanceType | null>(null);
        const injector = new Injector([
            [LocaleService, { useValue: { t: (key: string) => key } }],
            [IRibbonService, {
                useValue: {
                    ribbon$: of([]),
                    activatedTab$: of(''),
                    setActivatedTab: () => {},
                },
            }],
            [IWorkbenchService, { useValue: { rootUnitType$ } }],
        ]);
        const ConnectedMobileRibbon = connectInjector(MobileRibbon, injector);

        render(<ConnectedMobileRibbon />);

        expect(() => {
            act(() => rootUnitType$.next(UniverInstanceType.UNIVER_SHEET));
        }).not.toThrow();
    });
});
