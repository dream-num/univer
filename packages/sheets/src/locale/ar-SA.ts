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
            sheetCopy: '(نسخ{0})',
            sheet: 'ورقة',
        },
        info: {
            overlappingSelections: 'لا يمكن استخدام هذا الأمر على التحديدات المتداخلة',
            acrossMergedCell: 'عبر خلية مدمجة',
            partOfCell: 'تم تحديد جزء فقط من خلية مدمجة',
            hideSheet: 'لا توجد ورقة مرئية بعد إخفاء هذه الورقة',
        },
        definedName: {
            nameEmpty: 'لا يمكن أن يكون الاسم فارغًا',
            nameDuplicate: 'الاسم موجود بالفعل',
            nameInvalid: 'الاسم غير صالح',
            nameSheetConflict: 'يتعارض الاسم مع اسم الورقة',
            formulaOrRefStringEmpty: 'لا يمكن أن تكون الصيغة أو سلسلة المرجع فارغة',
            nameConflict: 'يتعارض الاسم مع اسم الدالة',
            defaultName: 'اسم معرّف',
        },
        permission: {
            dialog: {
                autoFillErr: 'النطاق محمي، وليس لديك إذن للتعبئة التلقائية. لاستخدام التعبئة التلقائية، يرجى الاتصال بالمنشئ.',
                editErr: 'النطاق محمي، وليس لديك إذن التحرير. للتحرير، يرجى الاتصال بالمنشئ.',
                formulaErr: 'النطاق أو النطاق المُشار إليه محمي، وليس لديك إذن التحرير. للتحرير، يرجى الاتصال بالمنشئ.',
                insertOrDeleteMoveRangeErr: 'يتقاطع النطاق المدرج أو المحذوف مع النطاق المحمي، وهذه العملية غير مدعومة حاليًا.',
                insertRowColErr: 'النطاق محمي، وليس لديك إذن لإدراج صفوف وأعمدة. لإدراج صفوف وأعمدة، يرجى الاتصال بالمنشئ.',
                moveRangeErr: 'النطاق محمي، وليس لديك إذن لنقل التحديد. لنقل التحديد، يرجى الاتصال بالمنشئ.',
                moveRowColErr: 'النطاق محمي، وليس لديك إذن لنقل الصفوف والأعمدة. لنقل الصفوف والأعمدة، يرجى الاتصال بالمنشئ.',
                operatorSheetErr: 'ورقة العمل محمية، وليس لديك إذن لتشغيل ورقة العمل. لتشغيل ورقة العمل، يرجى الاتصال بالمنشئ.',
                removeRowColErr: 'النطاق محمي، وليس لديك إذن لحذف الصفوف والأعمدة. لحذف الصفوف والأعمدة، يرجى الاتصال بالمنشئ.',
                setRowColStyleErr: 'النطاق محمي، وليس لديك إذن لتعيين أنماط الصفوف والأعمدة. لتعيين أنماط الصفوف والأعمدة، يرجى الاتصال بالمنشئ.',
                setStyleErr: 'النطاق محمي، وليس لديك إذن لتعيين الأنماط. لتعيين الأنماط، يرجى الاتصال بالمنشئ.',
            },
        },
        autoFill: {
            copy: 'نسخ الخلية',
            series: 'تعبئة السلسلة',
            formatOnly: 'التنسيق فقط',
            noFormat: 'بدون تنسيق',
        },
        merge: {
            confirm: {
                title: 'سيؤدي الاستمرار في الدمج إلى الاحتفاظ بقيمة الخلية العلوية اليسرى فقط، وسيتم تجاهل القيم الأخرى. هل أنت متأكد من الاستمرار؟',
                cancel: 'إلغاء الدمج',
                confirm: 'الاستمرار في الدمج',
                warning: 'تحذير',
                dismantleMergeCellWarning: 'سيؤدي هذا إلى تقسيم بعض الخلايا المدمجة. هل تريد الاستمرار؟',
            },
        },
    },
};

export default locale;
