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
import type { IMenuButtonItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { SetZoomRatioFromToolbarCommand } from '../commands/commands/set-zoom-ratio-from-toolbar.command';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { SHEET_ZOOM_RANGE } from '../common/keys';
import { SHEET_ZOOM_INPUT_COMPONENT } from '../views/sheet-slider/SheetZoomInput';
import { deriveStateFromActiveSheet$ } from './menu-util';

export const ZOOM_RATIO_MENU_ID = 'sheet.menu.zoom-ratio';

const ZOOM_RATIO_LIST = [50, 75, 100, 125, 150, 175, 200, 400];

function getZoomRatioValue$(accessor: IAccessor) {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return deriveStateFromActiveSheet$(univerInstanceService, 100, ({ worksheet }) => new Observable<number>((subscriber) => {
        const update = () => subscriber.next(Math.round(worksheet.getZoomRatio() * 100));
        const disposable = commandService.onCommandExecuted((command) => {
            if (command.id === SetZoomRatioOperation.id) update();
        });

        update();
        return disposable.dispose;
    }));
}

export function ZoomRatioMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey, number> {
    return {
        id: ZOOM_RATIO_MENU_ID,
        commandId: SetZoomRatioFromToolbarCommand.id,
        type: MenuItemType.BUTTON,
        label: {
            name: SHEET_ZOOM_INPUT_COMPONENT,
            props: {
                min: SHEET_ZOOM_RANGE[0],
                max: SHEET_ZOOM_RANGE[1],
                shortcuts: ZOOM_RATIO_LIST,
            },
        },
        value$: getZoomRatioValue$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
