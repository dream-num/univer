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
    sheet: {
        cf: {
            title: 'قالب‌بندی شرطی',
            menu: {
                manageConditionalFormatting: 'مدیریت قالب‌بندی شرطی',
                createConditionalFormatting: 'ایجاد قالب‌بندی شرطی',
                clearRangeRules: 'پاک کردن قوانین برای محدوده انتخاب شده',
                clearWorkSheetRules: 'پاک کردن قوانین برای کل برگ',
            },
            form: {
                lessThan: 'مقدار باید کمتر از {0} باشد',
                lessThanOrEqual: 'مقدار باید کمتر از یا برابر با {0} باشد',
                greaterThan: 'مقدار باید بزرگتر از {0} باشد',
                greaterThanOrEqual: 'مقدار باید بزرگتر از یا برابر با {0} باشد',
                rangeSelector: 'انتخاب محدوده یا وارد کردن مقدار',
            },
            iconSet: {
                direction: 'جهت',
                shape: 'شکل',
                mark: 'علامت',
                rank: 'رتبه',
                rule: 'قانون',
                icon: 'آیکون',
                type: 'نوع',
                value: 'مقدار',
                reverseIconOrder: 'معکوس کردن ترتیب آیکون',
                and: 'و',
                when: 'هنگامی که',
                onlyShowIcon: 'فقط نمایش آیکون',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'ایجاد قانون',
                clear: 'پاک کردن همه قوانین',
                range: 'اعمال محدوده',
                styleType: 'نوع سبک',
                submit: 'ارسال',
                cancel: 'انصراف',
                rankAndAverage: 'بالا/پایین/میانگین',
                styleRule: 'قانون سبک',
                isNotBottom: 'بالا',
                isBottom: 'پایین',
                greaterThanAverage: 'بزرگتر از میانگین',
                lessThanAverage: 'کوچکتر از میانگین',
                medianValue: 'مقدار میانه',
                fillType: 'نوع پر کردن',
                pureColor: 'رنگ جامد',
                gradient: 'شیب رنگی',
                colorSet: 'مجموعه رنگ',
                positive: 'مثبت',
                native: 'منفی',
                workSheet: 'کل برگ',
                selectedRange: 'محدوده انتخاب شده',
                managerRuleSelect: 'مدیریت {0} قوانین',
                onlyShowDataBar: 'فقط نمایش نوار داده',
            },
            preview: {
                describe: {
                    beginsWith: 'با {0} شروع می‌شود',
                    endsWith: 'با {0} پایان می‌یابد',
                    containsText: 'شامل متن {0} است',
                    notContainsText: 'شامل متن {0} نیست',
                    equal: 'برابر است با {0}',
                    notEqual: 'برابر نیست با {0}',
                    containsBlanks: 'شامل مقادیر خالی است',
                    notContainsBlanks: 'شامل مقادیر خالی نیست',
                    containsErrors: 'شامل خطاها است',
                    notContainsErrors: 'شامل خطاها نیست',
                    greaterThan: 'بزرگتر از {0}',
                    greaterThanOrEqual: 'بزرگتر از یا برابر با {0}',
                    lessThan: 'کوچکتر از {0}',
                    lessThanOrEqual: 'کوچکتر از یا برابر با {0}',
                    notBetween: 'بین {0} و {1} نیست',
                    between: 'بین {0} و {1}',
                    yesterday: 'دیروز',
                    tomorrow: 'فردا',
                    last7Days: '7 روز گذشته',
                    thisMonth: 'این ماه',
                    lastMonth: 'ماه گذشته',
                    nextMonth: 'ماه آینده',
                    thisWeek: 'این هفته',
                    lastWeek: 'هفته گذشته',
                    nextWeek: 'هفته آینده',
                    today: 'امروز',
                    topN: '{0} برتر',
                    bottomN: '{0} پایین‌تر',
                    topNPercent: '{0}% برتر',
                    bottomNPercent: '{0}% پایین‌تر',
                },
            },
            operator: {
                beginsWith: 'با ... شروع می‌شود',
                endsWith: 'با ... پایان می‌یابد',
                containsText: 'شامل متن ... است',
                notContainsText: 'شامل متن ... نیست',
                equal: 'برابر است با',
                notEqual: 'برابر نیست با',
                containsBlanks: 'شامل مقادیر خالی است',
                notContainsBlanks: 'شامل مقادیر خالی نیست',
                containsErrors: 'شامل خطاها است',
                notContainsErrors: 'شامل خطاها نیست',
                greaterThan: 'بزرگتر از',
                greaterThanOrEqual: 'بزرگتر از یا برابر با',
                lessThan: 'کوچکتر از',
                lessThanOrEqual: 'کوچکتر از یا برابر با',
                notBetween: 'بین ... و ... نیست',
                between: 'بین ... و ...',
                yesterday: 'دیروز',
                tomorrow: 'فردا',
                last7Days: '7 روز گذشته',
                thisMonth: 'این ماه',
                lastMonth: 'ماه گذشته',
                nextMonth: 'ماه آینده',
                thisWeek: 'این هفته',
                lastWeek: 'هفته گذشته',
                nextWeek: 'هفته آینده',
                today: 'امروز',
            },
            ruleType: {
                highlightCell: 'برجسته کردن سلول',
                dataBar: 'نوار داده',
                colorScale: 'مقیاس رنگی',
                formula: 'فرمول سفارشی',
                iconSet: 'مجموعه آیکون',
                duplicateValues: 'مقادیر تکراری',
                uniqueValues: 'مقادیر منحصربه‌فرد',
            },
            subRuleType: {
                uniqueValues: 'مقادیر منحصربه‌فرد',
                duplicateValues: 'مقادیر تکراری',
                rank: 'رتبه',
                text: 'متن',
                timePeriod: 'دوره زمانی',
                number: 'عدد',
                average: 'میانگین',
            },
            valueType: {
                num: 'عدد',
                min: 'حداقل',
                max: 'حداکثر',
                percent: 'درصد',
                percentile: 'درصد صدک',
                formula: 'فرمول',
                none: 'هیچ کدام',
            },
            errorMessage: {
                notBlank: 'شرط نمی‌تواند خالی باشد',
                formulaError: 'فرمول اشتباه',
                rangeError: 'Bad selection',
            },
        },
    },
};

export default locale;
