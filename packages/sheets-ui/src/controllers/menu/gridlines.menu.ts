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

import type { IAccessor, Workbook } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { BooleanNumber, DisposableCollection, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetWorksheetActiveOperation, ToggleGridlinesCommand, ToggleGridlinesMutation, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { getCurrentRangeDisable$ } from './menu-util';

export function ToggleGridlinesMenuFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);

    return {
        id: ToggleGridlinesCommand.id,
        type: MenuItemType.BUTTON,
        tooltip: 'toolbar.toggleGridlines',
        icon: 'HideGridlines',
        activated$: new Observable<boolean>((observer) => {
            const getValue = () => {
                const workbook = instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                if (workbook) return workbook.getActiveSheet().getConfig().showGridlines === BooleanNumber.TRUE;
                return false;
            };

            const disposable = new DisposableCollection();
            disposable.add(commandService.onCommandExecuted((c) => {
                if (c.id === ToggleGridlinesMutation.id || c.id === SetWorksheetActiveOperation.id) {
                    observer.next(getValue());
                }
            }));
            disposable.add(instanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
                observer.next(getValue());
            }));

            observer.next(getValue());
            return () => disposable.dispose();
        }),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission] }),
    };
}
