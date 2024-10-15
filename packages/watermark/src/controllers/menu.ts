/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IMenuButtonItem } from '@univerjs/ui';
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, type IAccessor, IUniverInstanceService } from '@univerjs/core';
import { MenuItemType } from '@univerjs/ui';
import { of, switchMap } from 'rxjs';
import { OpenWatermarkPanelOperation } from '../commands/operations/OpenWatermarkPanelOperation';
import { UNIVER_WATERMARK_MENU } from '../common/const';
import { UniverWatermarkService } from '../services/watermarkService';

export function WatermarkMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: OpenWatermarkPanelOperation.id,
        title: 'univer-watermark.title',
        tooltip: 'univer-watermark.title',
        icon: UNIVER_WATERMARK_MENU,
        type: MenuItemType.BUTTON,
        hidden$: getWatermarkMenuHiddenObservable(accessor),
    };
}

function getWatermarkMenuHiddenObservable(accessor: IAccessor) {
    const univerWatermarkService = accessor.get(UniverWatermarkService);
    // return univerWatermarkService.menuHidden$.pipe(map((hidden) => hidden));

    return univerWatermarkService.menuHidden$.pipe(
        switchMap((menuHidden) => {
            if (menuHidden) {
                return of(true);
            }
            const univerInstanceService = accessor.get(IUniverInstanceService);
            return univerInstanceService.focused$.pipe(
                switchMap((id) => {
                    if (id === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                        return of(true);
                    } else {
                        return of(false);
                    }
                })
            );
        })
    );
}

