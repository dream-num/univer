/**
 * Copyright 2023 DreamNum Inc.
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

import { BehaviorSubject } from 'rxjs';

import type { IDisplayMenuItem, IMenuItem } from '../../../../services/menu/menu';
import { MenuPosition } from '../../../../services/menu/menu';

export interface IMenuGroup {
    name: MenuPosition;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export const positions = [
    MenuPosition.TOOLBAR_START,
    MenuPosition.TOOLBAR_INSERT,
    MenuPosition.TOOLBAR_FORMULAS,
    MenuPosition.TOOLBAR_DATA,
    MenuPosition.TOOLBAR_VIEW,
    MenuPosition.TOOLBAR_OTHERS,
];

const positionSubject = new BehaviorSubject(MenuPosition.TOOLBAR_START);

export const position$ = positionSubject.asObservable();

export function setPosition(position: MenuPosition) {
    positionSubject.next(position);
}
