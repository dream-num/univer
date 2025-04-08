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

export enum MenuManagerPosition {
    RIBBON = 'ribbon',
    CONTEXT_MENU = 'contextMenu',
}

export enum RibbonPosition {
    START = 'ribbon.start',
    INSERT = 'ribbon.insert',
    FORMULAS = 'ribbon.formulas',
    DATA = 'ribbon.data',
    VIEW = 'ribbon.view',
    OTHERS = 'ribbon.others',
}

export enum RibbonStartGroup {
    HISTORY = 'ribbon.start.history',
    FORMAT = 'ribbon.start.format',
    LAYOUT = 'ribbon.start.layout',
    FORMULAS_INSERT = 'ribbon.start.insert',
    FORMULAS_VIEW = 'ribbon.start.view',
    FILE = 'ribbon.start.file',
    OTHERS = 'ribbon.start.others',
}

export enum RibbonInsertGroup {
    OTHERS = 'ribbon.insert.others',
}

export enum RibbonFormulasGroup {
    OTHERS = 'ribbon.formulas.others',
}

export enum RibbonDataGroup {
    OTHERS = 'ribbon.data.others',
}

export enum RibbonViewGroup {
    OTHERS = 'ribbon.view.others',
}

export enum RibbonOthersGroup {
    OTHERS = 'ribbon.others.others',
}

export enum ContextMenuPosition {
    MAIN_AREA = 'contextMenu.mainArea',
    COL_HEADER = 'contextMenu.colHeader',
    ROW_HEADER = 'contextMenu.rowHeader',
    FOOTER_TABS = 'contextMenu.footerTabs',
    FOOTER_MENU = 'contextMenu.footerMenu',
    /**
     * paragraph context menu in doc
     */
    PARAGRAPH = 'contextMenu.paragraph',
}

export enum ContextMenuGroup {
    /**
     * quick context menu, displayed as icon
     */
    QUICK = 'contextMenu.quick',
    FORMAT = 'contextMenu.format',
    LAYOUT = 'contextMenu.layout',
    DATA = 'contextMenu.data',
    OTHERS = 'contextMenu.others',
}
