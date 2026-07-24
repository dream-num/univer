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
    ARRAY_CONSTRAIN: {
        description: 'يقيّد ناتج صفيف إلى حجم محدد.',
        abstract: 'يقيّد ناتج صفيف إلى حجم محدد.',
        links: [{ title: 'التعليمات', url: 'https://support.google.com/docs/answer/3267036?hl=ar' }],
        functionParameter: {
            inputRange: { name: 'نطاق_الإدخال', detail: 'النطاق المراد تقييده.' },
            numRows: { name: 'عدد_الصفوف', detail: 'عدد الصفوف التي يجب أن يحتوي عليها الناتج.' },
            numCols: { name: 'عدد_الأعمدة', detail: 'عدد الأعمدة التي يجب أن يحتوي عليها الناتج.' },
        },
    },
    FLATTEN: {
        description: 'يجمع كل القيم من نطاق واحد أو أكثر في عمود واحد.',
        abstract: 'يجمع كل القيم من نطاق واحد أو أكثر في عمود واحد.',
        links: [{ title: 'التعليمات', url: 'https://support.google.com/docs/answer/10307761?hl=ar' }],
        functionParameter: {
            range1: { name: 'النطاق1', detail: 'النطاق الأول المراد جمعه.' },
            range2: { name: 'النطاق2', detail: '[اختياري، قابل للتكرار] نطاقات إضافية مراد جمعها.' },
        },
    },
};

export default locale;
