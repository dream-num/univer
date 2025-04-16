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

import type { IWorkbookData } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { CancelFrozenCommand, SetFrozenMutation, SetSelectionsOperation, SheetSkeletonService } from '@univerjs/sheets';

import { BehaviorSubject } from 'rxjs';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SelectAllService } from '../../../services/select-all/select-all.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { ShortcutExperienceService } from '../../../services/shortcut-experience.service';
import {
    SetColumnFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../set-frozen.command';
import { ExpandSelectionCommand, MoveSelectionCommand, SelectAllCommand } from '../set-selection.command';
import { createCommandTestBed } from './create-command-test-bed';

export const SELECTION_WITH_EMPTY_CELLS_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'B1',
                    },
                    2: {
                        v: 'C1',
                    },
                    3: {
                        v: '',
                    },
                    4: {
                        v: '',
                    },
                    5: {
                        v: 'F1',
                    },
                    6: {
                        v: '', // merged to F1
                    },
                    7: {
                        v: '',
                    },
                    8: {
                        v: '',
                    },
                },
            },
            mergeData: [{ startRow: 0, startColumn: 5, endColumn: 6, endRow: 1 }],
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export const SELECTION_WITH_MERGED_CELLS_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'B1',
                    },
                    2: {
                        v: 'C1',
                    },
                },
                1: {
                    0: {
                        v: 'A2',
                    },
                    1: {
                        v: '', // merged to B1
                    },
                    2: {
                        v: 'C2',
                    },
                },
            },
            mergeData: [{ startRow: 0, startColumn: 1, endRow: 1, endColumn: 1 }],
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export const SIMPLE_SELECTION_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
                    },
                },
                1: {
                    0: {
                        v: 'B1',
                    },
                    1: {
                        v: 'B2',
                    },
                },
            },
            mergeData: [{ startRow: 3, startColumn: 4, endRow: 4, endColumn: 4 }],
            rowCount: 20,
            columnCount: 20,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export function createSelectionCommandTestBed(workbookData?: IWorkbookData) {
    const { univer, get, sheet } = createCommandTestBed(workbookData || SIMPLE_SELECTION_WORKBOOK_DATA, [
        [ShortcutExperienceService],
        [SelectAllService],
        [IRenderManagerService, { useClass: RenderManagerService }],
    ]);

    const commandService = get(ICommandService);
    [MoveSelectionCommand, ExpandSelectionCommand, SelectAllCommand, SetSelectionsOperation].forEach((c) => {
        commandService.registerCommand(c);
    });

    return {
        univer,
        get,
        sheet,
    };
}

export function createFrozenCommandTestBed(workbookData?: IWorkbookData) {
    const { univer, get, sheet } = createCommandTestBed(workbookData || SIMPLE_SELECTION_WORKBOOK_DATA, [
        [SheetScrollManagerService],
        [ShortcutExperienceService],
        [IRenderManagerService, { useClass: RenderManagerService }],
    ]);

    const commandService = get(ICommandService);
    [
        SetSelectionFrozenCommand,
        SetRowFrozenCommand,
        SetColumnFrozenCommand,
        CancelFrozenCommand,
        SetSelectionsOperation,
        SetFrozenMutation,
    ].forEach((c) => {
        commandService.registerCommand(c);
    });

    const unitId = sheet.getUnitId();
    const injector = univer.__getInjector();
    injector.add([SheetSkeletonService]);
    // NOTE: this is a hack. Please refer to ./services/clipboard/__tests__/clipboard-test-bed.ts
    const mockSheetSkService = new SheetSkeletonService(injector);
    const fakeSheetSkeletonManagerService = new SheetSkeletonManagerService({
        unit: sheet,
        unitId,
        type: UniverInstanceType.UNIVER_SHEET,

        engine: null as any,
        scene: null as any,
        mainComponent: null as any,
        components: null as any,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    }, injector, injector.get(SheetSkeletonService));

    injector.add([SheetSkeletonManagerService, { useValue: fakeSheetSkeletonManagerService }]);
    injector.get(IRenderManagerService).addRender(unitId, {
        unitId,
        type: UniverInstanceType.UNIVER_SHEET,
        engine: new Disposable() as any,
        scene: new DisposableCollection() as any,
        mainComponent: null as any,
        components: new Map(),
        isMainScene: true,
        with: injector.get.bind(injector),
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    });

    return {
        univer,
        get,
        sheet,
    };
}

// export class MockRenderManagerService implements Pick<IRenderManagerService, 'getRenderById'> {
//     constructor(
//         @Inject(Injector) private readonly _injector: Injector
//     ) { }

//     getRenderById(_unitId: string): Nullable<IRender> {
//         return {
//             with: <T>(identifier: DependencyIdentifier<T>) => this._injector.get(identifier),
//         } as unknown as IRender;
//     }
// }
