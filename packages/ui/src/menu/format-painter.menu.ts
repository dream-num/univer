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
import type { IMenuButtonItem } from '../services/menu/menu';
import { map } from 'rxjs';
import { ActivateFormatPainterOperation, ClearFormattingCommand, ContinuousFormatPainterOperation } from '../controllers/format-painter.controller';
import { FormatPainterSessionService } from '../services/format-painter/format-painter-session.service';
import { MenuItemType } from '../services/menu/menu';

export function FormatPainterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const session = accessor.get(FormatPainterSessionService);
    return {
        id: ActivateFormatPainterOperation.id,
        subId: ContinuousFormatPainterOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'BrushIcon',
        title: 'ui.formatPainter',
        tooltip: 'ui.formatPainter',
        activated$: session.state$.pipe(map((mode) => mode !== 'off')),
        disabled$: session.state$.pipe(map((mode) => mode === 'off' && !session.canStart())),
    };
}

export function ClearFormattingMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const session = accessor.get(FormatPainterSessionService);
    return {
        id: ClearFormattingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ClearFormatDoubleIcon',
        title: 'ui.clearFormatting',
        tooltip: 'ui.clearFormatting',
        disabled$: session.state$.pipe(map(() => !session.canClear())),
    };
}
