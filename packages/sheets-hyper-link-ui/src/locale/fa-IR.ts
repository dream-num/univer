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
    hyperLink: {
        form: {
            editTitle: 'ویرایش لینک',
            addTitle: 'درج لینک',
            label: 'برچسب',
            type: 'نوع',
            link: 'لینک',
            linkPlaceholder: 'لینک را وارد کنید',
            range: 'محدوده',
            worksheet: 'برگ کار',
            definedName: 'نام تعریف شده',
            ok: 'تایید',
            cancel: 'انصراف',
            labelPlaceholder: 'برچسب را وارد کنید',
            inputError: 'لطفا وارد کنید',
            selectError: 'لطفا انتخاب کنید',
            linkError: 'لطفا یک لینک معتبر وارد کنید',
        },
        menu: {
            add: 'درج لینک',
        },
        message: {
            noSheet: 'برگ هدف حذف شده است',
            refError: 'محدوده نامعتبر',
            hiddenSheet: 'نمی‌توان لینک را باز کرد زیرا برگ مرتبط پنهان است',
            coped: 'لینک به کلیپ بورد کپی شد',
        },
        popup: {
            copy: 'کپی لینک',
            edit: 'ویرایش لینک',
            cancel: 'لینک را لغو کنید',
        },
    },
};

export default locale;
