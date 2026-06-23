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
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import {
    InsertDocEllipseShapeCommand,
    InsertDocRectangleShapeCommand,
} from '../commands/commands/insert-shape.command';

export const DOCS_SHAPE_MENU_ID = 'doc.command.menu-insert-shape';
export const DOCS_SHAPE_BELOW_MENU_ID = 'doc.command.menu-insert-shape.below';

export function ShapeMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: DOCS_SHAPE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ShapeIcon',
        title: 'docs-drawing-ui.shape.insert.title',
        tooltip: 'docs-drawing-ui.shape.insert.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ShapeBelowMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: DOCS_SHAPE_BELOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ShapeIcon',
        title: 'docs-drawing-ui.shape.insert.title',
        tooltip: 'docs-drawing-ui.shape.insert.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRectangleShapeMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: InsertDocRectangleShapeCommand.id,
        title: 'docs-drawing-ui.shape.insert.rectangle',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertEllipseShapeMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: InsertDocEllipseShapeCommand.id,
        title: 'docs-drawing-ui.shape.insert.ellipse',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRectangleShapeBelowMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${InsertDocRectangleShapeCommand.id}.below`,
        commandId: InsertDocRectangleShapeCommand.id,
        title: 'docs-drawing-ui.shape.insert.rectangle',
        type: MenuItemType.BUTTON,
        params: {
            paragraphMenuPlacement: 'below',
        },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertEllipseShapeBelowMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${InsertDocEllipseShapeCommand.id}.below`,
        commandId: InsertDocEllipseShapeCommand.id,
        title: 'docs-drawing-ui.shape.insert.ellipse',
        type: MenuItemType.BUTTON,
        params: {
            paragraphMenuPlacement: 'below',
        },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
