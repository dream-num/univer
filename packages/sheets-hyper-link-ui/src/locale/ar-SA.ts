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
    'sheets-hyper-link-ui': {
        form: {
            editTitle: 'تحرير الارتباط',
            addTitle: 'إدراج ارتباط تشعبي',
            label: 'التسمية',
            type: 'النوع',
            link: 'الرابط',
            linkPlaceholder: 'أدخل الرابط',
            range: 'النطاق',
            worksheet: 'ورقة العمل',
            definedName: 'الاسم المعرف',
            ok: 'تأكيد',
            cancel: 'إلغاء',
            labelPlaceholder: 'أدخل التسمية',
            inputError: 'الرجاء الإدخال',
            selectError: 'الرجاء التحديد',
            linkError: 'الرجاء إدخال رابط صالح',
        },
        menu: {
            add: 'إدراج ارتباط تشعبي',
        },
        permission: {
            hyperLinkErr: 'ليس لديك إذن لإدراج رابط.',
        },
        message: {
            noSheet: 'تم حذف الورقة المستهدفة',
            refError: 'نطاق غير صالح',
            hiddenSheet: 'تعذر فتح الرابط لأن الورقة المرتبطة مخفية',
            coped: 'تم نسخ الرابط إلى الحافظة',
        },
        popup: {
            copy: 'نسخ الرابط',
            edit: 'تحرير الرابط',
            cancel: 'إلغاء الارتباط',
        },
    },
};

export default locale;
