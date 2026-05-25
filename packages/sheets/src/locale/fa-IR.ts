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

import type enUS from './en-US';

const locale: typeof enUS = {
    sheets: {
        tabs: {
            sheetCopy: '(کپی{0})',
            sheet: 'برگ',
        },
        info: {
            overlappingSelections: 'نمی‌توان از این دستور روی انتخاب‌های همپوشانی استفاده کرد',
            acrossMergedCell: 'در سراسر سلول ادغام شده',
            partOfCell: 'فقط بخشی از سلول ادغام شده انتخاب شده است',
            hideSheet: 'پس از پنهان کردن این برگ، هیچ برگی قابل مشاهده نخواهد بود',
        },
        definedName: {
            nameEmpty: 'نام نمی‌تواند خالی باشد',
            nameDuplicate: 'نام از قبل وجود دارد',
            nameInvalid: 'نام نامعتبر است',
            nameSheetConflict: 'نام با نام برگه تداخل دارد',
            formulaOrRefStringEmpty: 'فرمول یا رشته مرجع نمی‌تواند خالی باشد',
            nameConflict: 'نام با نام تابع تداخل دارد',
            defaultName: 'DefinedName',
        },
        permission: {
            dialog: {
                autoFillErr: 'محدوده محافظت شده است و شما مجوز پر کردن خودکار را ندارید. برای استفاده از پر کردن خودکار، لطفا با سازنده تماس بگیرید.',
                editErr: 'محدوده محافظت شده است و شما مجوز ویرایش را ندارید. برای ویرایش، لطفا با سازنده تماس بگیرید.',
                formulaErr: 'محدوده یا محدوده مرجع محافظت شده است و شما مجوز ویرایش را ندارید. برای ویرایش، لطفا با سازنده تماس بگیرید.',
                insertOrDeleteMoveRangeErr: 'محدوده درج شده یا حذف شده با محدوده محافظت شده تلاقی دارد و این عملیات در حال حاضر پشتیبانی نمی‌شود.',
                insertRowColErr: 'محدوده محافظت شده است و شما مجوز درج سطرها و ستون‌ها را ندارید. برای درج سطرها و ستون‌ها، لطفا با سازنده تماس بگیرید.',
                moveRangeErr: 'محدوده محافظت شده است و شما مجوز جابجایی انتخاب را ندارید. برای جابجایی انتخاب، لطفا با سازنده تماس بگیرید.',
                moveRowColErr: 'محدوده محافظت شده است و شما مجوز جابجایی سطرها و ستون‌ها را ندارید. برای جابجایی سطرها و ستون‌ها، لطفا با سازنده تماس بگیرید.',
                operatorSheetErr: 'کاربرگ محافظت شده است و شما مجوز کار با کاربرگ را ندارید. برای کار با کاربرگ، لطفا با سازنده تماس بگیرید.',
                removeRowColErr: 'محدوده محافظت شده است و شما مجوز حذف سطرها و ستون‌ها را ندارید. برای حذف سطرها و ستون‌ها، لطفا با سازنده تماس بگیرید.',
                setRowColStyleErr: 'محدوده محافظت شده است و شما مجوز تنظیم سبک‌های سطر و ستون را ندارید. برای تنظیم سبک‌های سطر و ستون، لطفا با سازنده تماس بگیرید.',
                setStyleErr: 'محدوده محافظت شده است و شما مجوز تنظیم سبک‌ها را ندارید. برای تنظیم سبک‌ها، لطفا با سازنده تماس بگیرید.',
            },
        },
        autoFill: {
            copy: 'کپی سلول',
            series: 'پر کردن سری',
            formatOnly: 'فقط قالب',
            noFormat: 'بدون قالب',
        },
        merge: {
            confirm: {
                title: 'ادغام ادامه‌دار فقط مقدار سلول بالا-چپ را حفظ می‌کند و سایر مقادیر را حذف می‌کند. آیا مطمئن هستید که ادامه می‌دهید؟',
                cancel: 'لغو ادغام',
                confirm: 'ادغام ادامه‌دار',
                warning: 'هشدار',
                dismantleMergeCellWarning: 'این باعث تقسیم برخی سلول‌های ادغام‌شده می‌شود. آیا می‌خواهید ادامه دهید؟',
            },
        },
    },
};

export default locale;
