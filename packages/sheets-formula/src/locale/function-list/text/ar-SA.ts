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
    ASC: {
        description: 'بالنسبة للغات التي تتضمن مجموعة أحرف مزدوجة البايت (DBCS)، تقوم هذه الدالة بتغيير الأحرف ذات العرض الكامل (مزدوجة البايت) إلى أحرف ذات عرض نصفي (أحادية البايت).',
        abstract: 'بالنسبة للغات التي تتضمن مجموعة أحرف مزدوجة البايت (DBCS)، تقوم هذه الدالة بتغيير الأحرف ذات العرض الكامل (مزدوجة البايت) إلى أحرف ذات عرض نصفي (أحادية البايت).',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. وهي النص أو مرجع الخلية الذي يحتوي على النص المطلوب تغييره. لن يتم تغيير النص إذا لم يكن يحتوي على أي أحرف ذات عرض كامل.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'ترجع الدالة ARRAYTOTEXT مصفوفة من القيم النصية من أي نطاق محدد. يمرر القيم النصية دون تغيير، ويحول القيم غير النصية إلى نص.',
        abstract: 'ترجع الدالة ARRAYTOTEXT مصفوفة من القيم النصية من أي نطاق محدد. يمرر القيم النصية دون تغيير، ويحول القيم غير النصية إلى نص.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'المصفوفة المراد إرجاعها كنص. مطلوبة.' },
            format: { name: 'format', detail: 'تنسيق البيانات التي تم إرجاعها. اختيارية. يمكن أن تكون واحدة من قيمتين: 0 افتراضي. تنسيق مختصر يسهل قراءته. سيكون النص الذي يتم إرجاعه هو نفسه النص المعروض في خلية تم تطبيق التنسيق العام عليها. 1 تنسيق صارم يتضمن أحرف الإلغاء ومحددات الصفوف. يولد سلسلة يمكن تحليلها عند إدخالها في شريط الصيغة. لتضمين السلاسل التي تم إرجاعها في علامات الاقتباس باستثناء القيم المنطقية والأرقام والأخطاء.' },
        },
    },
    BAHTTEXT: {
        description: 'تحوّل رقماً إلى نص باللغة التايلاندية وتضيف اللاحقة "باهت".',
        abstract: 'تحوّل رقماً إلى نص باللغة التايلاندية وتضيف اللاحقة "باهت".',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. رقم تريد تحويله إلى نص، أو مرجع لخلية تحتوي على رقم، أو صيغة يتم تقييمها إلى رقم.' },
        },
    },
    CHAR: {
        description: 'تُرجع الحرف المحدد بواسطة رقم. استخدم CHAR لترجمة أرقام صفحات الترميز اللغوي التي قد تحصل عليها من ملفات موجودة على أنواع أخرى من أجهزة الكمبيوتر إلى أحرف.',
        abstract: 'تُرجع الحرف المحدد بواسطة رقم. استخدم CHAR لترجمة أرقام صفحات الترميز اللغوي التي قد تحصل عليها من ملفات موجودة على أنواع أخرى من أجهزة الكمبيوتر إلى أحرف.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي رقم بين 1 و255 يحدد الحرف الذي تريده. ويتم الحصول على الحرف من مجموعة الأحرف التي يستخدمها الكمبيوتر. ملاحظة يدعم Excel على الويب CHAR(9) وCHAR(10) وCHAR(13) وCHAR (32) وما فوق فقط.' },
        },
    },
    CLEAN: {
        description: 'تزيل كافة الأحرف غير القابلة للطباعة من النص. استخدم CLEAN مع نص مستورد من تطبيقات أخرى ويحتوي على أحرف قد لا تتم طباعتها مع نظام التشغيل الموجود لديك. على سبيل المثال، يمكنك استخدام CLEAN لإزالة رموز الكمبيوتر غير المهمة والتي تتكرر عادةً في بداية ملفات البيانات ونهايتها وتتعذّر طباعته.',
        abstract: 'تزيل كافة الأحرف غير القابلة للطباعة من النص. استخدم CLEAN مع نص مستورد من تطبيقات أخرى ويحتوي على أحرف قد لا تتم طباعتها مع نظام التشغيل الموجود لديك. على سبيل المثال، يمكنك استخدام CLEAN لإزالة رموز الكمبيوتر غير المهمة والتي تتكرر عادةً في بداية ملفات البيانات ونهايتها وتتعذّر طباعته.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. وهي أي معلومات في ورقة العمل تريد إزالة الأحرف غير القابلة للطباعة منها.' },
        },
    },
    CODE: {
        description: 'تُرجع رمزاً رقمياً للحرف الأول في سلسلة نصية. يتوافق الرمز الذي يتم إرجاعه مع مجموعة الأحرف التي يستخدمها الكمبيوتر.',
        abstract: 'تُرجع رمزاً رقمياً للحرف الأول في سلسلة نصية. يتوافق الرمز الذي يتم إرجاعه مع مجموعة الأحرف التي يستخدمها الكمبيوتر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. وهي النص الذي تريد رمز الحرف الأول له.' },
        },
    },
    CONCAT: {
        description: 'تجمع الدالة CONCAT بين النص من نطاقات و/أو سلاسل متعددة، ولكنها لا توفر محددا أو وسيطات IgnoreEmpty.',
        abstract: 'تجمع الدالة CONCAT بين النص من نطاقات و/أو سلاسل متعددة، ولكنها لا توفر محددا أو وسيطات IgnoreEmpty.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'العنصر النصي المطلوب ضمه. سلسلة أو صفيف من السلاسل مثل نطاق من الخلايا.' },
            text2: { name: 'text2', detail: 'العناصر النصية الإضافية المطلوب ضمها. الحد الأقصى للوسيطات النصية هو 253 للعناصر النصية. يمكن أن تكون كل منها سلسلة أو صفيف من السلاسل مثل نطاق من الخلايا.' },
        },
    },
    CONCATENATE: {
        description: 'استخدم CONCATENATE ، وهي إحدى دالات النص ، لجمع سلستين نصيتين أو أكثر في سلسلة واحدة.',
        abstract: 'استخدم CONCATENATE ، وهي إحدى دالات النص ، لجمع سلستين نصيتين أو أكثر في سلسلة واحدة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'العنصر الأول المراد ضمه. يمكن أن يكون قيمة نصية أو رقماً أو مرجع خلية.' },
            text2: { name: 'text2', detail: 'عناصر نصية إضافية للضم. يمكنك إدخال ما يصل إلى 255 عنصراً، بإجمالي لا يتجاوز 8192 حرفاً.' },
        },
    },
    DBCS: {
        description: 'تقوم الدالة الموضحة في موضوع "التعليمات" هذا بتحويل الأحرف بنصف العرض (وحيدة البايت) بإحدى سلاسل الأحرف إلى أحرف كاملة العرض (مزدوجة البايت). يعتمد اسم الدالة (والأحرف التي تقوم بتحويلها) على إعدادات اللغة لديك.',
        abstract: 'تقوم الدالة الموضحة في موضوع "التعليمات" هذا بتحويل الأحرف بنصف العرض (وحيدة البايت) بإحدى سلاسل الأحرف إلى أحرف كاملة العرض (مزدوجة البايت). يعتمد اسم الدالة (والأحرف التي تقوم بتحويلها) على إعدادات اللغة لديك.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص أو مرجع الخلية الذي يحتوي على النص الذي تريد تغييره. إذا لم يتضمن النص أي أحرف إنجليزية أو أحرف كاتاكانا بنصف العرض، فلا يتغير النص.' },
        },
    },
    DOLLAR: {
        description: 'تحوّل الدالة DOLLAR ، إحدى دالات TEXT ، الرقم إلى نص باستخدام تنسيق العملة، مع تقريب الأرقام العشرية إلى عدد الأماكن التي تحددها. تستخدم الدالة DOLLAR تنسيق الأرقام ‎$#,##0.00_);($#,##0.00)‎، رغم أن رمز العملة المنطبق يعتمد على إعدادات اللغة المحلية لديك.',
        abstract: 'تحوّل الدالة DOLLAR ، إحدى دالات TEXT ، الرقم إلى نص باستخدام تنسيق العملة، مع تقريب الأرقام العشرية إلى عدد الأماكن التي تحددها. تستخدم الدالة DOLLAR تنسيق الأرقام ‎$#,##0.00_);($#,##0.00)‎، رغم أن رمز العملة المنطبق يعتمد على إعدادات اللغة المحلية لديك.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. رقم أو مرجع لخلية تحتوي على رقم أو صيغة يتم تقييمها إلى رقم.' },
            decimals: { name: 'decimals', detail: 'الاختياري. عدد الأرقام إلى يمين الفاصلة العشرية. إذا كانت هذه القيمة سالبة، فسيتم تقريب الرقم إلى يسار الفاصلة العشرية. إذا حذفت الوسيطة decimals، فسيُفترض أنها 2.' },
        },
    },
    EXACT: {
        description: 'تقارن هذه الدالة بين سلسلتين نصيتين وتُرجع القيمة TRUE عند وجود تطابق تام بينهما، وإلا فتُرجع القيمة FALSE. إن الدالة EXACT حساسة لحالة الأحرف ولكنها تتجاهل الاختلافات في التنسيق. استخدم الدالة EXACT لاختبار النص الذي يتم إدخاله في المستند.',
        abstract: 'تقارن هذه الدالة بين سلسلتين نصيتين وتُرجع القيمة TRUE عند وجود تطابق تام بينهما، وإلا فتُرجع القيمة FALSE. إن الدالة EXACT حساسة لحالة الأحرف ولكنها تتجاهل الاختلافات في التنسيق. استخدم الدالة EXACT لاختبار النص الذي يتم إدخاله في المستند.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'مطلوب. السلسلة النصية الأولى.' },
            text2: { name: 'text2', detail: 'مطلوب. السلسلة النصية الثانية.' },
        },
    },
    FIND: {
        description: 'تعثر على قيمة نصية داخل قيمة نصية أخرى مع مراعاة حالة الأحرف.',
        abstract: 'تعثر على قيمة نصية داخل قيمة نصية أخرى مع مراعاة حالة الأحرف.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'النص الذي تريد العثور عليه.' },
            withinText: { name: 'within_text', detail: 'النص الذي يحتوي على النص الذي تريد العثور عليه.' },
            startNum: { name: 'start_num', detail: 'يحدد الحرف الذي يبدأ عنده البحث. إذا حذفت start_num، يُفترض أنها 1.' },
        },
    },
    FINDB: {
        description: 'تعثر على قيمة نصية داخل قيمة نصية أخرى مع مراعاة حالة الأحرف.',
        abstract: 'تعثر على قيمة نصية داخل قيمة نصية أخرى مع مراعاة حالة الأحرف.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'النص الذي تريد العثور عليه.' },
            withinText: { name: 'within_text', detail: 'النص الذي يحتوي على النص الذي تريد العثور عليه.' },
            startNum: { name: 'start_num', detail: 'يحدد الحرف الذي يبدأ عنده البحث. إذا حذفت start_num، يُفترض أنها 1.' },
        },
    },
    FIXED: {
        description: 'تقرّب هذه الدالة رقماً إلى عدد محدد من الأرقام العشرية، وتنسّق الرقم بالتنسيق العشري باستخدام نقطة وفواصل، وتُرجع النتيجة كنص.',
        abstract: 'تقرّب هذه الدالة رقماً إلى عدد محدد من الأرقام العشرية، وتنسّق الرقم بالتنسيق العشري باستخدام نقطة وفواصل، وتُرجع النتيجة كنص.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي تريد تقريبه وتحويله إلى نص.' },
            decimals: { name: 'decimals', detail: 'الاختياري. عدد الأرقام إلى يمين الفاصلة العشرية.' },
            noCommas: { name: 'no_commas', detail: 'الاختياري. قيمة منطقية تمنع FIXED من تضمين فواصل في النص الذي يتم إرجاعه إذا تم تقييمها إلى TRUE.' },
        },
    },
    LEFT: {
        description: 'ترجع الأحرف الموجودة في أقصى يسار قيمة نصية.',
        abstract: 'ترجع الأحرف الموجودة في أقصى يسار قيمة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            numChars: { name: 'num_chars', detail: 'يحدد عدد الأحرف التي تريد أن تستخرجها LEFT.' },
        },
    },
    LEFTB: {
        description: 'ترجع الأحرف الموجودة في أقصى يسار قيمة نصية.',
        abstract: 'ترجع الأحرف الموجودة في أقصى يسار قيمة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            numBytes: { name: 'num_bytes', detail: 'يحدد عدد البايتات التي تريد أن تستخرجها LEFTB.' },
        },
    },
    LEN: {
        description: 'ترجع عدد الأحرف في سلسلة نصية.',
        abstract: 'ترجع عدد الأحرف في سلسلة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تريد معرفة طوله. تُحتسب المسافات كأحرف.' },
        },
    },
    LENB: {
        description: 'ترجع عدد البايتات المستخدمة لتمثيل الأحرف في سلسلة نصية.',
        abstract: 'ترجع عدد البايتات المستخدمة لتمثيل الأحرف في سلسلة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تريد معرفة طوله. تُحتسب المسافات كأحرف.' },
        },
    },
    LOWER: {
        description: 'تحويل كافة الأحرف الكبيرة في سلسلة نصية إلى أحرف صغيرة.',
        abstract: 'تحويل كافة الأحرف الكبيرة في سلسلة نصية إلى أحرف صغيرة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص الذي تريد تحويله إلى أحرف صغيرة. لا تغيّر الدالة LOWER الأحرف غير الأبجدية في النص.' },
        },
    },
    MID: {
        description: 'ترجع عدداً محدداً من الأحرف من سلسلة نصية بدءاً من الموضع الذي تحدده.',
        abstract: 'ترجع عدداً محدداً من الأحرف من سلسلة نصية بدءاً من الموضع الذي تحدده.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            startNum: { name: 'start_num', detail: 'موضع أول حرف تريد استخراجه من text.' },
            numChars: { name: 'num_chars', detail: 'يحدد عدد الأحرف التي تريد أن تستخرجها MID.' },
        },
    },
    MIDB: {
        description: 'ترجع عدداً محدداً من الأحرف من سلسلة نصية بدءاً من الموضع الذي تحدده.',
        abstract: 'ترجع عدداً محدداً من الأحرف من سلسلة نصية بدءاً من الموضع الذي تحدده.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            startNum: { name: 'start_num', detail: 'موضع أول حرف تريد استخراجه من text.' },
            numBytes: { name: 'num_bytes', detail: 'يحدد عدد البايتات التي تريد أن تستخرجها MIDB.' },
        },
    },
    NUMBERSTRING: {
        description: 'تحوّل الأرقام إلى سلاسل نصية صينية.',
        abstract: 'تحوّل الأرقام إلى سلاسل نصية صينية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'القيمة المحولة إلى سلسلة نصية صينية.' },
            type: { name: 'type', detail: 'نوع النتيجة المعادة. \n1. أحرف صينية صغيرة \n2. أحرف صينية كبيرة \n3. قراءة وكتابة الأحرف الصينية' },
        },
    },
    NUMBERVALUE: {
        description: 'تقوم هذه الدالة بتحويل نص إلى رقم، بشكل مستقل عن الإعدادات المحلية.',
        abstract: 'تقوم هذه الدالة بتحويل نص إلى رقم، بشكل مستقل عن الإعدادات المحلية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص المراد تحويله إلى رقم.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'الاختياري. الحرف المستخدم لفصل العدد الصحيح والجزء الكسري من النتيجة.' },
            groupSeparator: { name: 'group_separator', detail: 'الاختياري. الحرف المستخدم لفصل تجميعات الأرقام، مثل الآلاف من المئات والملايين عن الآلاف.' },
        },
    },
    PHONETIC: {
        description: 'تستخرج هذه الدالة الأحرف الصوتية (furigana) من سلسلة نصية.',
        abstract: 'تستخرج هذه الدالة الأحرف الصوتية (furigana) من سلسلة نصية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'مرجع', detail: 'مطلوب. سلسلة نصية أو مرجع إلى خلية واحدة أو نطاق خلايا يحتوي على سلسلة furigana النصية.' },
        },
    },
    PROPER: {
        description: 'تحوّل هذه الدالة الحرف الأول في سلسلة نصية وأي أحرف أخرى في النص الذي يلي أي حرف آخر غير حرف أبجدي إلى حرف كبير. وتحوّل كافة الأحرف الأخرى إلى أحرف صغيرة.',
        abstract: 'تحوّل هذه الدالة الحرف الأول في سلسلة نصية وأي أحرف أخرى في النص الذي يلي أي حرف آخر غير حرف أبجدي إلى حرف كبير. وتحوّل كافة الأحرف الأخرى إلى أحرف صغيرة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. نص مضمّن بين علامتي اقتباس، أو صيغة تُرجع نصاً، أو مرجع إلى خلية تحتوي على النص الذي تريد تحويل جزء منه إلى أحرف كبيرة.' },
        },
    },
    REGEXEXTRACT: {
        description: 'تستخرج أول سلسلة فرعية مطابقة وفقاً لتعبير عادي.',
        abstract: 'تستخرج أول سلسلة فرعية مطابقة وفقاً لتعبير عادي.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=ar',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص المُدخل.' },
            regularExpression: { name: 'regular_expression', detail: 'يُرجع الجزء الأول من النص الذي يطابق هذا التعبير.' },
        },
    },
    REGEXMATCH: {
        description: 'تحدد ما إذا كان جزء من النص يطابق تعبيراً عادياً.',
        abstract: 'تحدد ما إذا كان جزء من النص يطابق تعبيراً عادياً.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=ar',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص المراد اختباره مقابل التعبير العادي.' },
            regularExpression: { name: 'regular_expression', detail: 'التعبير العادي لاختبار النص مقابله.' },
        },
    },
    REGEXREPLACE: {
        description: 'تستبدل جزءاً من سلسلة نصية بسلسلة نصية أخرى باستخدام تعبيرات عادية.',
        abstract: 'تستبدل جزءاً من سلسلة نصية بسلسلة نصية أخرى باستخدام تعبيرات عادية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=ar',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي سيُستبدل جزء منه.' },
            regularExpression: { name: 'regular_expression', detail: 'التعبير العادي. ستُستبدل كل الحالات المطابقة في text.' },
            replacement: { name: 'replacement', detail: 'النص الذي سيُدرج في النص الأصلي.' },
        },
    },
    REPLACE: {
        description: 'تستبدل الأحرف داخل النص.',
        abstract: 'تستبدل الأحرف داخل النص.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'النص الذي تريد استبدال بعض أحرفه.' },
            startNum: { name: 'start_num', detail: 'موضع الحرف في old_text الذي تريد استبداله بـ new_text.' },
            numChars: { name: 'num_chars', detail: 'عدد الأحرف في old_text التي تريد أن تستبدلها REPLACE بـ new_text.' },
            newText: { name: 'new_text', detail: 'النص الذي سيستبدل الأحرف في old_text.' },
        },
    },
    REPLACEB: {
        description: 'تستبدل الأحرف داخل النص.',
        abstract: 'تستبدل الأحرف داخل النص.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'النص الذي تريد استبدال بعض أحرفه.' },
            startNum: { name: 'start_num', detail: 'موضع الحرف في old_text الذي تريد استبداله بـ new_text.' },
            numBytes: { name: 'num_bytes', detail: 'عدد البايتات في old_text التي تريد أن تستبدلها REPLACEB بـ new_text.' },
            newText: { name: 'new_text', detail: 'النص الذي سيستبدل الأحرف في old_text.' },
        },
    },
    REPT: {
        description: 'تكرر هذه الدالة نصاً لعدد معيّن من المرات. استخدم الدالة REPT لتعبئة خلية بعدد من مثيلات سلسلة نصية.',
        abstract: 'تكرر هذه الدالة نصاً لعدد معيّن من المرات. استخدم الدالة REPT لتعبئة خلية بعدد من مثيلات سلسلة نصية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص الذي تريد تكراره.' },
            numberTimes: { name: 'number_times', detail: 'مطلوب. عدد موجب يحدد عدد المرات التي تريد فيها تكرار النص.' },
        },
    },
    RIGHT: {
        description: 'ترجع الأحرف الموجودة في أقصى يمين قيمة نصية.',
        abstract: 'ترجع الأحرف الموجودة في أقصى يمين قيمة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            numChars: { name: 'num_chars', detail: 'يحدد عدد الأحرف التي تريد أن تستخرجها RIGHT.' },
        },
    },
    RIGHTB: {
        description: 'ترجع الأحرف الموجودة في أقصى يمين قيمة نصية.',
        abstract: 'ترجع الأحرف الموجودة في أقصى يمين قيمة نصية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'السلسلة النصية التي تحتوي على الأحرف التي تريد استخراجها.' },
            numBytes: { name: 'num_bytes', detail: 'يحدد عدد البايتات التي تريد أن تستخرجها RIGHTB.' },
        },
    },
    SEARCH: {
        description: 'تعثر على قيمة نصية داخل قيمة نصية أخرى دون مراعاة حالة الأحرف.',
        abstract: 'تعثر على قيمة نصية داخل قيمة نصية أخرى دون مراعاة حالة الأحرف.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'النص الذي تريد العثور عليه.' },
            withinText: { name: 'within_text', detail: 'النص الذي يحتوي على النص الذي تريد العثور عليه.' },
            startNum: { name: 'start_num', detail: 'يحدد الحرف الذي يبدأ عنده البحث. إذا حذفت start_num، يُفترض أنها 1.' },
        },
    },
    SEARCHB: {
        description: 'تعثر على قيمة نصية داخل قيمة نصية أخرى دون مراعاة حالة الأحرف.',
        abstract: 'تعثر على قيمة نصية داخل قيمة نصية أخرى دون مراعاة حالة الأحرف.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'النص الذي تريد العثور عليه.' },
            withinText: { name: 'within_text', detail: 'النص الذي يحتوي على النص الذي تريد العثور عليه.' },
            startNum: { name: 'start_num', detail: 'يحدد الحرف الذي يبدأ عنده البحث. إذا حذفت start_num، يُفترض أنها 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'تستبدل هذه الدالة old_text بـ new_text في سلسلة نصية. استخدم الدالة SUBSTITUTE عندما تريد استبدال نص محدد في سلسلة نصية؛ استخدم الدالة REPLACE عندما تريد استبدال أي نص موجود في موقع محدد في سلسلة نصية.',
        abstract: 'تستبدل هذه الدالة old_text بـ new_text في سلسلة نصية. استخدم الدالة SUBSTITUTE عندما تريد استبدال نص محدد في سلسلة نصية؛ استخدم الدالة REPLACE عندما تريد استبدال أي نص موجود في موقع محدد في سلسلة نصية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص أو مرجع الخلية التي تحتوي على النص الذي ترغب في استبدال أحرف به.' },
            oldText: { name: 'old_text', detail: 'مطلوب. النص الذي تريد استبداله.' },
            newText: { name: 'new_text', detail: 'مطلوب. النص الذي تريد استبدال old_text به.' },
            instanceNum: { name: 'instance_num', detail: 'الاختياري. تحديد مثيل old_text الذي تريد استبداله بـ new_text. إذا حددت instance_num، يتم استبدال مثيل old_text هذا فقط. عدا ذلك، يتم تغيير كل مرات حدوث old_text في النص إلى new_text.' },
        },
    },
    T: {
        description: 'تُرجع هذه الدالة النص الذي تشير إليه القيمة.',
        abstract: 'تُرجع هذه الدالة النص الذي تشير إليه القيمة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. القيمة التي ترغب في اختبارها.' },
        },
    },
    TEXT: {
        description: 'تتيح لك الدالة TEXT تغيير طريقة ظهور الأرقام من خلال تطبيق التنسيق عليها باستخدام رموز التنسيقات . وهذا مفيد عندما تريد عرض الأرقام بتنسيق أكثر قابلية للقراءة، أو تريد دمج الأرقام مع النصوص أو الرموز.',
        abstract: 'تتيح لك الدالة TEXT تغيير طريقة ظهور الأرقام من خلال تطبيق التنسيق عليها باستخدام رموز التنسيقات . وهذا مفيد عندما تريد عرض الأرقام بتنسيق أكثر قابلية للقراءة، أو تريد دمج الأرقام مع النصوص أو الرموز.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'قيمة رقمية تريد تحويلها إلى نص.' },
            formatText: { name: 'format_text', detail: 'سلسلة نصية تحدد التنسيق الذي تريد تطبيقه على القيمة المقدمة.' },
        },
    },
    TEXTAFTER: {
        description: 'إرجاع النص الذي يحدث بعد حرف معين أو سلسلة معينة. إنه عكس الدالة TEXTBEFORE .',
        abstract: 'إرجاع النص الذي يحدث بعد حرف معين أو سلسلة معينة. إنه عكس الدالة TEXTBEFORE .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تبحث داخله. لا يُسمح بأحرف البدل.' },
            delimiter: { name: 'delimiter', detail: 'النص الذي يحدد النقطة التي تريد استخراج النص بعدها.' },
            instanceNum: { name: 'instance_num', detail: 'موضع ظهور المحدد الذي تريد استخراج النص بعده.' },
            matchMode: { name: 'match_mode', detail: 'يحدد ما إذا كان البحث في النص حساساً لحالة الأحرف. الإعداد الافتراضي حساس لحالة الأحرف.' },
            matchEnd: { name: 'match_end', detail: 'يعامل نهاية النص كمحدد. افتراضياً يجب أن يكون النص مطابقاً تماماً.' },
            ifNotFound: { name: 'if_not_found', detail: 'القيمة المعادة إذا لم يُعثر على تطابق. افتراضياً تُرجع #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'إرجاع النص الذي يحدث قبل حرف أو سلسلة معينة. إنها نقيض الدالة TEXTAFTER .',
        abstract: 'إرجاع النص الذي يحدث قبل حرف أو سلسلة معينة. إنها نقيض الدالة TEXTAFTER .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تبحث داخله. لا يُسمح بأحرف البدل.' },
            delimiter: { name: 'delimiter', detail: 'النص الذي يحدد النقطة التي تريد استخراج النص قبلها.' },
            instanceNum: { name: 'instance_num', detail: 'موضع ظهور المحدد الذي تريد استخراج النص قبله.' },
            matchMode: { name: 'match_mode', detail: 'يحدد ما إذا كان البحث في النص حساساً لحالة الأحرف. الإعداد الافتراضي حساس لحالة الأحرف.' },
            matchEnd: { name: 'match_end', detail: 'يعامل نهاية النص كمحدد. افتراضياً يجب أن يكون النص مطابقاً تماماً.' },
            ifNotFound: { name: 'if_not_found', detail: 'القيمة المعادة إذا لم يُعثر على تطابق. افتراضياً تُرجع #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'تعمل دالة TEXTJOIN على دمج النص من نطاقات و/أو سلاسل متعددة، وتضمين المحدِد الذي تحدده بين كل قيمة نصية سيتم دمجها. إذا كان المحدِد عبارة عن سلسلة نصية فارغة، فستعمل هذه الدالة على تسلسل النطاقات بطريقة فعّالة.',
        abstract: 'تعمل دالة TEXTJOIN على دمج النص من نطاقات و/أو سلاسل متعددة، وتضمين المحدِد الذي تحدده بين كل قيمة نصية سيتم دمجها. إذا كان المحدِد عبارة عن سلسلة نصية فارغة، فستعمل هذه الدالة على تسلسل النطاقات بطريقة فعّالة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'عبارة عن سلسلة نصية، إما أن تكون فارغة أو تكون حرفاً واحداً أو أكثر محاطاً بعلامات الاقتباس المزدوجة أو مرجعاً إلى سلسلة نصية صالحة. إذا تم إدخال رقم، فسيُعامل كنص.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'إذا كانت TRUE، فستتجاهل الخلايا الفارغة.' },
            text1: { name: 'text1', detail: 'هي العنصر النصي المطلوب دمجه. عبارة عن سلسلة نصية أو صفيف من السلاسل مثل نطاق من الخلايا.' },
            text2: { name: 'text2', detail: 'هي العناصر النصية الإضافية المطلوب دمجها. قد يكون هناك حد أقصى يبلغ 252 من الوسيطات النصية للعناصر النصية بما في ذلك text1 . يمكن أن يكون كل عنصر منها عبارة عن سلسلة أو صفيف من السلاسل مثل نطاق من الخلايا.' },
        },
    },
    TEXTSPLIT: {
        description: 'تعمل الدالة TEXTSPLIT بالطريقة نفسها التي يعمل بها معالج Text-to-Columns ، ولكن في نموذج الصيغة. يسمح لك بالتقسيم عبر الأعمدة أو لأسفل حسب الصفوف. وهو عكس الدالة TEXTJOIN .',
        abstract: 'تعمل الدالة TEXTSPLIT بالطريقة نفسها التي يعمل بها معالج Text-to-Columns ، ولكن في نموذج الصيغة. يسمح لك بالتقسيم عبر الأعمدة أو لأسفل حسب الصفوف. وهو عكس الدالة TEXTJOIN .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تريد تقسيمه. مطلوبة.' },
            colDelimiter: { name: 'col_delimiter', detail: 'النص الذي يضع علامة على النقطة التي يتم فيها سكب النص عبر الأعمدة.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'النص الذي يضع علامة على النقطة التي يتم فيها تصغير النص إلى أسفل الصفوف. اختيارية.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'حدد TRUE لتجاهل المحددات المتتالية. يتم تعيين القيمة الافتراضية إلى "FALSE" مما يؤدي إلى إنشاء خلية فارغة. اختيارية.' },
            matchMode: { name: 'match_mode', detail: 'حدد 1 لإجراء تطابق غير حساس لحالة الأحرف. يتم تعيين القيمة الافتراضية إلى "0" مما يؤدي إلى إجراء تطابق حساس لحالة الأحرف. اختيارية.' },
            padWith: { name: 'pad_with', detail: 'القيمة التي سيتم بها فرز النتيجة. الإعداد الافتراضي هو #N/A.' },
        },
    },
    TRIM: {
        description: 'تُزيل هذه الدالة كافة المسافات من النص باستثناء المسافات الفردية بين الكلمات. استخدم الدالة TRIM على نص تلقيته من تطبيق آخر قد يكون تباعد الكلمات فيه غير منتظم.',
        abstract: 'تُزيل هذه الدالة كافة المسافات من النص باستثناء المسافات الفردية بين الكلمات. استخدم الدالة TRIM على نص تلقيته من تطبيق آخر قد يكون تباعد الكلمات فيه غير منتظم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'النص الذي تريد إزالة المسافات منه. يجب أن يكون النص مضمنا في علامات الاقتباس.' },
        },
    },
    UNICHAR: {
        description: 'إرجاع حرف Unicode المشار إليه بالقيمة الرقمية المُعطاة.',
        abstract: 'إرجاع حرف Unicode المشار إليه بالقيمة الرقمية المُعطاة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم هو رقم Unicode الذي يمثل الحرف.' },
        },
    },
    UNICODE: {
        description: 'إرجاع الرقم (نقطة الرمز) المقابل للحرف الأول من النص.',
        abstract: 'إرجاع الرقم (نقطة الرمز) المقابل للحرف الأول من النص.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص هو الحرف الذي تريد قيمة Unicode له.' },
        },
    },
    UPPER: {
        description: 'تحوّل هذه الدالة النص إلى أحرف كبيرة.',
        abstract: 'تحوّل هذه الدالة النص إلى أحرف كبيرة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص الذي تريد تحويله إلى أحرف كبيرة. يمكن أن يكون النص مرجعاً أو سلسلة نصية.' },
        },
    },
    VALUE: {
        description: 'تحوّل هذه الدالة سلسلة نصية تمثل رقماً إلى رقم.',
        abstract: 'تحوّل هذه الدالة سلسلة نصية تمثل رقماً إلى رقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. النص المضمّن بين علامات اقتباس أو مرجع إلى خلية تحتوي على النص الذي ترغب في تحويله.' },
        },
    },
    VALUETOTEXT: {
        description: 'ترجع الدالة "VALUETOTEXT" نصاً من أي قيمة محددة. يمرر القيم النصية دون تغيير، ويحول القيم غير النصية إلى نص.',
        abstract: 'ترجع الدالة "VALUETOTEXT" نصاً من أي قيمة محددة. يمرر القيم النصية دون تغيير، ويحول القيم غير النصية إلى نص.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'القيمة المراد إرجاعها كنص. مطلوبة.' },
            format: { name: 'format', detail: 'تنسيق البيانات التي تم إرجاعها. اختيارية. يمكن أن تكون واحدة من قيمتين: 0 افتراضي. تنسيق مختصر يسهل قراءته. سيكون النص الذي يتم إرجاعه هو نفسه النص المعروض في خلية تم تطبيق التنسيق العام عليها. 1 تنسيق صارم يتضمن أحرف الإلغاء ومحددات الصفوف. يولد سلسلة يمكن تحليلها عند إدخالها في شريط الصيغة. لتضمين السلاسل التي تم إرجاعها في علامات الاقتباس باستثناء القيم المنطقية والأرقام والأخطاء.' },
        },
    },
    CALL: {
        description: 'تستدعي إجراءاً في مكتبة الارتباطات الديناميكية أو في مورد التعليمات البرمجية. ثمة نموذجان لبناء جملة هذه الدالة. استخدم بناء الجملة 1 مع مورد تعليمات برمجية مسجل مسبقاً فقط، والذي يستخدم وسيطات من الدالة REGISTER. واستخدم بناء الجملة 2أ أو 2ب لتسجيل مورد تعليمات برمجية واستدعائه بشكلٍ متزامن.',
        abstract: 'تستدعي إجراءاً في مكتبة الارتباطات الديناميكية أو في مورد التعليمات البرمجية. ثمة نموذجان لبناء جملة هذه الدالة. استخدم بناء الجملة 1 مع مورد تعليمات برمجية مسجل مسبقاً فقط، والذي يستخدم وسيطات من الدالة REGISTER. واستخدم بناء الجملة 2أ أو 2ب لتسجيل مورد تعليمات برمجية واستدعائه بشكلٍ متزامن.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'مطلوب. وهي النص المقتبس الذي يحدد اسم مكتبة الارتباطات الديناميكية (DLL) التي تحتوي على الإجراء في Microsoft Excel لـ Windows.' },
            procedure: { name: 'الاجراء', detail: 'مطلوب. وهي النص الذي يحدد اسم الدالة في DLL في Microsoft Excel لـ Windows. يمكنك أيضاً استخدام القيمة الترتيبية للدالة من جملة EXPORTS في ملف تعريف الوحدة النمطية (DEF.). يجب ألا تكون القيمة الترتيبية في شكل نص.' },
            typeText: { name: 'Type_text', detail: 'مطلوب. وهي النص الذي يحدد نوع البيانات للقيمة المرجعة وأنواع بيانات كافة الوسيطات لـ DLL أو مورد التعليمات البرمجية. يحدد أول حرف من type_text القيمة المرجعة. يتم شرح التعليمات البرمجية التي تستخدمها لـ type_text بشكلٍ تفصيلي في استخدام الدالتين CALL وREGISTER . وبالنسبة إلى مكتبات DLL أو موارد التعليمات البرمجية (XLLs) المستقلة، يمكنك إهمال هذه الوسيطة.' },
            argument1: { name: 'الوسيطة 1,...', detail: 'الاختياري. وهي الوسيطات التي يتم تمريرها إلى الإجراء.' },
        },
    },
    EUROCONVERT: {
        description: 'تحوّل هذا الدالة رقماً إلى عملة اليورو أو تحوّل رقماً من عملة اليورو إلى عملة اليورو لأي من الدول الأعضاء في الاتحاد الأوروبي أو تحوّل رقماً من عملة دولة عضو في الاتحاد الأوروبي إلى عملة دولة أخرى باستخدام اليورو كوسيط (تحويل ثلاثي). إن العملات المتوفرة للتحويل هي عملات الدول الأعضاء في الاتحاد الأوروبي التي تتعامل باليورو. تستخدم الدالة أسعار تحويل ثابتة تم تحديدها من قِبل الاتحاد الأوروبي.',
        abstract: 'تحوّل هذا الدالة رقماً إلى عملة اليورو أو تحوّل رقماً من عملة اليورو إلى عملة اليورو لأي من الدول الأعضاء في الاتحاد الأوروبي أو تحوّل رقماً من عملة دولة عضو في الاتحاد الأوروبي إلى عملة دولة أخرى باستخدام اليورو كوسيط (تحويل ثلاثي). إن العملات المتوفرة للتحويل هي عملات الدول الأعضاء في الاتحاد الأوروبي التي تتعامل باليورو. تستخدم الدالة أسعار تحويل ثابتة تم تحديدها من قِبل الاتحاد الأوروبي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Number', detail: 'مطلوبة. قيمة العملة التي تريد تحويلها أو مرجع إلى خلية تتضمن القيمة.' },
            source: { name: 'مصدر', detail: 'مطلوب. سلسلة مكونة من ثلاثة أحرف، أو مرجع إلى خلية تحتوي على السلسلة، تتطابق مع رمز ISO الخاص بالعملة المصدر. تتوفر رموز العملات التالية في الدالة EUROCONVERT:' },
            target: { name: 'الهدف', detail: 'مطلوب. سلسلة مكونة من ثلاثة أحرف، أو مرجع خلية، تتطابق مع رمز ISO الخاص بالعملة التي تريد تحويل الرقم إليها. انظر جدول المصدر السابق للحصول على رموز ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'مطلوب. قيمة منطقية (TRUE أو FALSE)، أو تعبير يتم تقييمه إلى القيمة TRUE أو FALSE، التي تحدد طريقة عرض النتيجة.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'مطلوب. عدد صحيح يساوي 3 أو أكبر منه يحدد عدد الأرقام المهمة التي سيتم استخدامها لقيمة اليورو الوسيطة عند التحويل بين عملتين لعضوين من أعضاء الاتحاد الأوروبي. إذا حذفت هذه الوسيطة، فلن يقوم Excel بتقريب قيمة اليورو الوسيطة. إذا قمت بتضمين هذه الوسيطة عند تحويل عملة أحد أعضاء الاتحاد الأوروبي إلى اليورو، فسيقوم Excel بحساب قيمة اليورو الوسيطة والتي يمكن تحويلها بعد ذلك إلى عملة أحد أعضاء الاتحاد الأوروبي.' },
        },
    },
    REGISTER_ID: {
        description: 'تُرجع هذه الدالة معرّف التسجيل لمكتبة الارتباطات الديناميكية (DLL) المحددة أو مورد التعليمات البرمجية الذي تم تسجيله مسبقاً. إذا لم يتم تسجيل DLL أو مورد التعليمات البرمجية، فتسجل هذه الدالة DLL أو مورد التعليمات البرمجية ثم تُرجع معرّف التسجيل.',
        abstract: 'تُرجع هذه الدالة معرّف التسجيل لمكتبة الارتباطات الديناميكية (DLL) المحددة أو مورد التعليمات البرمجية الذي تم تسجيله مسبقاً. إذا لم يتم تسجيل DLL أو مورد التعليمات البرمجية، فتسجل هذه الدالة DLL أو مورد التعليمات البرمجية ثم تُرجع معرّف التسجيل.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'مطلوب. النص الذي يحدد اسم DLL التي تحتوي على الدالة في Microsoft Excel لـ Windows.' },
            procedure: { name: 'الاجراء', detail: 'مطلوب. وهي النص الذي يحدد اسم الدالة في DLL في Microsoft Excel لـ Windows. يمكنك أيضاً استخدام القيمة الترتيبية للدالة من جملة EXPORTS في ملف تعريف الوحدة النمطية (DEF.). لا يجب أن تكون القيمة الترتيبية أو رقم معرّف المورد بتنسيق نصي.' },
            typeText: { name: 'Type_text', detail: 'الاختياري. نص يحدد نوع البيانات للقيمة المرجعة وأنواع بيانات كافة الوسيطات لـ DLL. يحدد أول حرف من type_text القيمة المرجعة. إذا تم تسجيل الدالة أو مورد التعليمات البرمجية مسبقاً، فيمكنك حذف هذه الوسيطة.' },
        },
    },
};

export default locale;
