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
    threadCommentUI: {
        panel: {
            title: 'مدیریت نظرات',
            empty: 'هنوز نظری وجود ندارد',
            filterEmpty: 'نتیجه ای یافت نشد',
            reset: 'بازنشانی فیلتر',
            addComment: 'افزودن نظر',
            solved: 'حل شده',
        },
        editor: {
            placeholder: 'پاسخ یا اضافه کردن دیگران با @',
            reply: 'نظر',
            cancel: 'انصراف',
            save: 'ذخیره',
        },
        item: {
            edit: 'ویرایش',
            delete: 'حذف این نظر',
        },
        filter: {
            sheet: {
                all: 'همه برگه‌ها',
                current: 'برگه فعلی',
            },
            status: {
                all: 'همه نظرات',
                resolved: 'حل شده',
                unsolved: 'حل نشده',
                concernMe: 'موضوع مربوط به من',
            },
        },
    },
};

export default locale;
