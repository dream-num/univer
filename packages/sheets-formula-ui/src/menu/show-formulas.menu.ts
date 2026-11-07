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
import type { LocaleKey } from '../locale/types';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { map, merge, Observable, startWith } from 'rxjs';
import { ToggleShowFormulasOperation } from '../commands/operations/toggle-show-formulas.operation';
import { SheetsShowFormulasService } from '../services/show-formulas.service';

export function ShowFormulasMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const showFormulasService = accessor.get(SheetsShowFormulasService);

    const isActiveSheetEnabled = (): boolean => {
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return false;
        }

        return showFormulasService.isEnabled(workbook.getUnitId(), worksheet.getSheetId());
    };

    const activeSheetChanged$ = new Observable<void>((observer) => {
        const disposable = commandService.onCommandExecuted((command) => {
            if (command.id === SetWorksheetActiveOperation.id) {
                observer.next();
            }
        });

        return () => disposable.dispose();
    });

    return {
        id: ToggleShowFormulasOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'FxIcon',
        tooltip: 'sheets-formula-ui.showFormulas.tooltip',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        activated$: merge(
            showFormulasService.changed$,
            activeSheetChanged$,
            univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
        ).pipe(
            startWith(null),
            map(() => isActiveSheetEnabled())
        ),
    };
}
