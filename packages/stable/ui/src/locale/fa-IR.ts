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
            normal: 'متن عادی',
            title: 'عنوان',
            subTitle: 'زیر عنوان',
            1: 'عنوان 1',
            2: 'عنوان 2',
            3: 'عنوان 3',
            4: 'عنوان 4',
            5: 'عنوان 5',
            6: 'عنوان 6',
            tooltip: 'تنظیم عنوان',
        },
    },
    ribbon: {
        start: 'شروع',
        insert: 'درج',
        formulas: 'فرمول‌ها',
        data: 'داده‌ها',
        view: 'نمایش',
        others: 'دیگر',
        more: 'بیشتر',
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
        title: 'کلیدهای میانبر',
    },
    shortcut: {
        undo: 'بازگرداندن',
        redo: 'تکرار',
        cut: 'بریدن',
        copy: 'کپی کردن',
        paste: 'چسباندن',
        'shortcut-panel': 'نمایش/مخفی کردن پنل کلیدهای میانبر',
    },
    'common-edit': 'کلیدهای میانبر ویرایش عمومی',
    'toggle-shortcut-panel': 'نمایش/مخفی کردن پنل کلیدهای میانبر',
    clipboard: {
        authentication: {
            title: 'اجازه دسترسی داده نشده است',
            content: 'لطفا به Univer اجازه دسترسی به کلیپ بورد خود را بدهید.',
        },
    },
    textEditor: {
        formulaError: 'لطفا یک فرمول معتبر مانند =SUM(A1) وارد کنید.',
        rangeError: 'لطفا یک محدوده معتبر مانند A1:B10 وارد کنید.',
    },
    rangeSelector: {
        title: 'انتخاب محدوده داده',
        addAnotherRange: 'افزودن محدوده',
        buttonTooltip: 'انتخاب محدوده داده',
        placeHolder: 'انتخاب محدوده یا وارد کردن.',
        confirm: 'تایید',
        cancel: 'انصراف',
    },
    'global-shortcut': 'کلید میانبر جهانی',
    'zoom-slider': {
        resetTo: 'بازنشانی به',
    },
};

export default locale;
