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
