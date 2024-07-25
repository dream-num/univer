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

import type { IAccessor } from '@univerjs/core';
import { UndoCommand, UniverInstanceType } from '@univerjs/core';
import type {
    IMenuButtonItem,
} from '@univerjs/ui';
import {
    getMenuHiddenObservable,
    MenuGroup,
    MenuItemType,
    MenuPosition,
} from '@univerjs/ui';
import { Observable } from 'rxjs';

// export function AddTextMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
//     // const formatPainterService = accessor.get(IFormatPainterService);

//     return {
//         id: 'slide.command.addtext',
//         group: MenuGroup.TOOLBAR_LAYOUT,
//         type: MenuItemType.BUTTON,
//         icon: 'UndoSingle',
//         title: 'Undo',
//         tooltip: 'toolbar.undo',
//         positions: [MenuPosition.TOOLBAR_START],
//         // disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.undos <= 0)),
//         activated$: new Observable<boolean>((subscriber) => {
//             console.log('activated$activated$');
//             let active = false;
//             active = true;
//         // const status$ = formatPainterService.status$.subscribe((s) => {
//         //     active = s !== FormatPainterStatus.OFF;
//         //     subscriber.next(active);
//         // });

//             subscriber.next(active);

//             return () => {
//             // status$.unsubscribe();
//             };
//         }),
//     };
// }
