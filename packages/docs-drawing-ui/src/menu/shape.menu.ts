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
import type { IMenuButtonItem, IMenuItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { InsertDocEllipseShapeCommand, InsertDocRectangleShapeCommand } from '../commands/commands/insert-shape.command';

export const DOCS_SHAPE_MENU_ID = 'doc.command.menu-insert-shape';
export const DOCS_SHAPE_BELOW_MENU_ID = 'doc.command.menu-insert-shape.below';

export function ShapeMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DOCS_SHAPE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ShapeIcon',
        title: 'Insert Shape',
        tooltip: 'Insert Shape',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ShapeBelowMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DOCS_SHAPE_BELOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ShapeIcon',
        title: 'Insert Shape',
        tooltip: 'Insert Shape',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRectangleShapeMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertDocRectangleShapeCommand.id,
        title: 'Insert Rectangle',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertEllipseShapeMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertDocEllipseShapeCommand.id,
        title: 'Insert Ellipse',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRectangleShapeBelowMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: `${InsertDocRectangleShapeCommand.id}.below`,
        commandId: InsertDocRectangleShapeCommand.id,
        title: 'Insert Rectangle',
        type: MenuItemType.BUTTON,
        params: {
            paragraphMenuPlacement: 'below',
        },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertEllipseShapeBelowMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: `${InsertDocEllipseShapeCommand.id}.below`,
        commandId: InsertDocEllipseShapeCommand.id,
        title: 'Insert Ellipse',
        type: MenuItemType.BUTTON,
        params: {
            paragraphMenuPlacement: 'below',
        },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
