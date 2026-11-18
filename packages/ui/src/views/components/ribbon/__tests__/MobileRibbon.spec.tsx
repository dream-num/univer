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
import { Injector, LocaleService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { BehaviorSubject, of } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../../../locale/en-US';
import { ContextMenuHostService, IContextMenuHostService } from '../../../../services/contextmenu/contextmenu-host.service';
import { IRibbonService } from '../../../../services/ribbon/ribbon.service';
import { IWorkbenchService } from '../../../../services/workbench/workbench.service';
import { MobileRibbon } from '../MobileRibbon';

const injectors: Injector[] = [];

describe('MobileRibbon', () => {
    afterEach(() => {
        cleanup();
        injectors.splice(0).forEach((injector) => injector.dispose());
    });

    it.each([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC])('keeps a stable hook order when workbench %s becomes ready', (unitType) => {
        const rootUnitType$ = new BehaviorSubject<UniverInstanceType | null>(null);
        const injector = new Injector([
            [IContextMenuHostService, { useClass: ContextMenuHostService }],
            [LocaleService],
            [IRibbonService, {
                useValue: {
                    ribbon$: of([]),
                    activatedTab$: of(''),
                    setActivatedTab: () => {},
                },
            }],
            [IWorkbenchService, { useValue: { rootUnitType$ } }],
        ]);
        injectors.push(injector);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const ConnectedMobileRibbon = connectInjector(MobileRibbon, injector);

        render(<ConnectedMobileRibbon />);

        expect(() => {
            act(() => rootUnitType$.next(unitType));
        }).not.toThrow();
    });
});
