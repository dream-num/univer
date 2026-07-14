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
    ENCODEURL: {
        description: 'ترجع الدالة ENCODEURL سلسلة مشفرة بعنوان URL، مع استبدال بعض الأحرف غير الأبجدية الرقمية برمز النسبة المئوية (٪) ورقم سداسي عشري.',
        abstract: 'ترجع الدالة ENCODEURL سلسلة مشفرة بعنوان URL، مع استبدال بعض الأحرف غير الأبجدية الرقمية برمز النسبة المئوية (٪) ورقم سداسي عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/encodeurl-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'سلسلة لتكون مشفرة بعنوان URL' },
        },
    },
    FILTERXML: {
        description: 'ترجع الدالة FILTERXML بيانات محددة من محتوى XML باستخدام xpath المحدد.',
        abstract: 'ترجع الدالة FILTERXML بيانات محددة من محتوى XML باستخدام xpath المحدد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/filterxml-function',
            },
        ],
        functionParameter: {
            xml: { name: 'xml', detail: 'سلسلة بتنسيق XML صالح.' },
            xpath: { name: 'xpath', detail: 'سلسلة بتنسيق XPath قياسي.' },
        },
    },
    WEBSERVICE: {
        description: 'ترجع الدالة WEBSERVICE البيانات من خدمة ويب على الإنترنت أو إنترانت.',
        abstract: 'ترجع الدالة WEBSERVICE البيانات من خدمة ويب على الإنترنت أو إنترانت.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/webservice-function',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'عنوان URL لخدمة الويب.' },
        },
    },
};

export default locale;
