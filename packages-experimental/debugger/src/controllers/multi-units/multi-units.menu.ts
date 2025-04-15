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

import type { IAccessor, IOperation, Workbook } from '@univerjs/core';
import type { IMenuSelectorItem, IValueOption, MenuSchemaType } from '@univerjs/ui';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { MenuItemType, RibbonStartGroup } from '@univerjs/ui';
import { merge, Observable, shareReplay } from 'rxjs';

export const SwitchUnitOperation: IOperation<{ value: string }> = {
    id: 'debugger.operation.switch-unit',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        if (!univerInstanceService.getUnit(params.value)) return false;
        univerInstanceService.setCurrentUnitForType(params.value);
        return true;
    },
};

function SwitchUnitMenuFactory(accessor: IAccessor): IMenuSelectorItem {
    const instanceService = accessor.get(IUniverInstanceService);
    const selections$ = new Observable<Array<IValueOption>>((observer) => {
        function emit() {
            const sheets = instanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const options = sheets.map((sheet) => ({ label: sheet.getName() || sheet.getUnitId(), value: sheet.getUnitId() }));
            observer.next(options);
        }

        merge(instanceService.unitAdded$, instanceService.unitDisposed$).subscribe(() => emit());
        emit();
    }).pipe(shareReplay(1));

    return {
        id: SwitchUnitOperation.id,
        title: 'Switch Unit', // TODO: i18n,
        type: MenuItemType.SELECTOR,
        selections: selections$,
    };
}

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.OTHERS]: {
        [SwitchUnitOperation.id]: {
            order: 999,
            menuItemFactory: SwitchUnitMenuFactory,
        },
    },
};
