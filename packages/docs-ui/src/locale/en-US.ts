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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    toolbar: {
        undo: 'Undo',
        redo: 'Redo',
        font: 'Font',
        fontSize: 'Font size',
        bold: 'Bold',
        italic: 'Italic',
        strikethrough: 'Strikethrough',
        subscript: 'Subscript',
        superscript: 'Superscript',
        underline: 'Underline',
        textColor: {
            main: 'Text color',
            right: 'Choose color',
        },
        fillColor: {
            main: 'Text Background color',
            right: 'Choose color',
        },
        table: {
            main: 'Table',
            insert: 'Insert Table',
            colCount: 'Column count',
            rowCount: 'Row count',
        },
        resetColor: 'Reset',
        order: 'Ordered list',
        unorder: 'Unordered list',
        checklist: 'Task list',
        documentFlavor: 'Modern Mode',
        alignLeft: 'Align Left',
        alignCenter: 'Align Center',
        alignRight: 'Align Right',
        alignJustify: 'Justify',
        horizontalLine: 'Horizontal line',
        headerFooter: 'Header & Footer',
        pageSetup: 'Page Setup',
    },
    table: {
        insert: 'Insert',
        insertRowAbove: 'Insert row above',
        insertRowBelow: 'Insert row below',
        insertColumnLeft: 'Insert column left',
        insertColumnRight: 'Insert column right',
        delete: 'Table delete',
        deleteRows: 'Delete row',
        deleteColumns: 'Delete column',
        deleteTable: 'Delete table',
    },
    headerFooter: {
        header: 'Header',
        footer: 'Footer',
        panel: 'Header & Footer Settings',
        firstPageCheckBox: 'Different first page',
        oddEvenCheckBox: 'Different odd and even pages',
        headerTopMargin: 'Header top margin(px)',
        footerBottomMargin: 'Footer bottom margin(px)',
        closeHeaderFooter: 'Close header & footer',
        disableText: 'Header & footer settings are disabled',
    },
    doc: {
        menu: {
            paragraphSetting: 'Paragraph Settings',
        },
        slider: {
            paragraphSetting: 'Paragraph Settings',
        },
        paragraphSetting: {
            alignment: 'Alignment',
            indentation: 'Indentation',
            left: 'Left',
            right: 'Right',
            firstLine: 'First Line',
            hanging: 'Hanging',
            spacing: 'Spacing',
            before: 'Before',
            after: 'After',
            lineSpace: 'Line Space',
            multiSpace: 'Multi Space',
            fixedValue: 'Fixed Value(px)',
        },
    },
    rightClick: {
        bulletList: 'Bullet list',
        orderList: 'Ordered list',
        checkList: 'Task list',
        insertBellow: 'Insert below',
    },
    'page-settings': {
        'document-setting': 'Document Setting',
        'paper-size': 'Paper size',
        'page-size': {
            main: 'Paper size',
            a4: 'A4',
            a3: 'A3',
            a5: 'A5',
            b4: 'B4',
            b5: 'B5',
            letter: 'Letter',
            legal: 'Legal',
            tabloid: 'Tabloid',
            statement: 'Statement',
            executive: 'Executive',
            folio: 'Folio',
        },
        orientation: 'Orientation',
        portrait: 'Portrait',
        landscape: 'Landscape',
        'custom-paper-size': 'Custom Paper size',
        top: 'Top',
        bottom: 'Bottom',
        left: 'Left',
        right: 'Right',
        cancel: 'Cancel',
        confirm: 'Confirm',
    },
};

export default locale;
