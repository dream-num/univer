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
        heading: {
            normal: 'Normal',
            title: 'Title',
            subTitle: 'Sub Title',
            1: 'Heading 1',
            2: 'Heading 2',
            3: 'Heading 3',
            4: 'Heading 4',
            5: 'Heading 5',
            6: 'Heading 6',
            tooltip: 'Set Heading',
        },
    },
    ribbon: {
        start: 'Start',
        insert: 'Insert',
        formulas: 'Formulas',
        data: 'Data',
        view: 'View',
        others: 'Others',
        more: 'More',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'Shortcuts',
    },
    shortcut: {
        undo: 'Undo',
        redo: 'Redo',
        cut: 'Cut',
        copy: 'Copy',
        paste: 'Paste',
        'shortcut-panel': 'Toggle Shortcut Panel',
    },
    'common-edit': 'Common Editing Shortcuts',
    'toggle-shortcut-panel': 'Toggle Shortcut Panel',
    clipboard: {
        authentication: {
            title: 'Permission Denied',
            content: 'Please allow Univer to access your clipboard.',
        },
    },
    textEditor: {
        formulaError: 'Please enter a valid formula, such as =SUM(A1)',
        rangeError: 'Please enter a valid range, such as A1:B10',
    },
    rangeSelector: {
        title: 'Select a data range',
        addAnotherRange: 'Add range',
        buttonTooltip: 'Select data range',
        placeHolder: 'Select range or enter.',
        confirm: 'Confirm',
        cancel: 'Cancel',
    },
    'global-shortcut': 'Global Shortcut',
    'zoom-slider': {
        resetTo: 'Reset to',
    },
};

export default locale;
