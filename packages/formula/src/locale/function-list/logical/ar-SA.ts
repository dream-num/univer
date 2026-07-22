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
    AND: {
        description: 'ترجع الدالة ‏AND‏ القيمة TRUE إذا تم تقييم كافة الوسيطات الخاصة بها بالقيمة TRUE، وترجع القيمة FALSE إذا تم تقييم واحدة أو أكثر من الوسيطات الخاصة بها بالقيمة FALSE.',
        abstract: 'ترجع الدالة ‏AND‏ القيمة TRUE إذا تم تقييم كافة الوسيطات الخاصة بها بالقيمة TRUE، وترجع القيمة FALSE إذا تم تقييم واحدة أو أكثر من الوسيطات الخاصة بها بالقيمة FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'الشرط الأول الذي تريد اختباره، ويمكن أن تكون نتيجته TRUE أو FALSE.' },
            logical2: { name: 'logical2', detail: 'شروط إضافية تريد اختبارها، ويمكن أن تكون نتيجتها TRUE أو FALSE، بحد أقصى 255 شرطاً.' },
        },
    },
    BYCOL: {
        description: 'تطبيق LAMBDA على كل عمود وإرجاع صفيف من النتائج. على سبيل المثال، إذا كان الصفيف الأصلي 3 أعمدة في صفين، فإن الصفيف الذي يتم إرجاعه هو 3 أعمدة في صف واحد.',
        abstract: 'تطبيق LAMBDA على كل عمود وإرجاع صفيف من النتائج. على سبيل المثال، إذا كان الصفيف الأصلي 3 أعمدة في صفين، فإن الصفيف الذي يتم إرجاعه هو 3 أعمدة في صف واحد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'صفيف يُعالج عموداً بعمود.' },
            lambda: { name: 'lambda', detail: 'دالة LAMBDA تأخذ عموداً كمعلمة واحدة وتحسب نتيجة واحدة. تأخذ LAMBDA معلمة واحدة: عموداً من array.' },
        },
    },
    BYROW: {
        description: 'تطبيق LAMBDA على كل صف وإرجاع صفيف من النتائج. على سبيل المثال، إذا كان الصفيف الأصلي 3 أعمدة في صفين، يكون الصفيف الذي تم إرجاعه عموداً واحداً في صفين.',
        abstract: 'تطبيق LAMBDA على كل صف وإرجاع صفيف من النتائج. على سبيل المثال، إذا كان الصفيف الأصلي 3 أعمدة في صفين، يكون الصفيف الذي تم إرجاعه عموداً واحداً في صفين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'صفيف يُعالج صفاً بصف.' },
            lambda: { name: 'lambda', detail: 'دالة LAMBDA تأخذ صفاً كمعلمة واحدة وتحسب نتيجة واحدة. تأخذ LAMBDA معلمة واحدة: صفاً من array.' },
        },
    },
    FALSE: {
        description: 'تُرجع القيمة المنطقية FALSE.',
        abstract: 'تُرجع القيمة المنطقية FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'على سبيل المثال، تشير =IF(C2="Yes",1,2) أنه إذا كان IF(C2 = نعم، يتم إرجاع 1، وبخلاف ذلك يتم إرجاع 2).',
        abstract: 'على سبيل المثال، تشير =IF(C2="Yes",1,2) أنه إذا كان IF(C2 = نعم، يتم إرجاع 1، وبخلاف ذلك يتم إرجاع 2).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'القيمة التي تريد اختبارها.' },
            valueIfTrue: { name: 'value_if_true', detail: 'القيمة التي تريد إرجاعها إذا كانت نتيجة logical_test TRUE.' },
            valueIfFalse: { name: 'value_if_false', detail: 'القيمة التي تريد إرجاعها إذا كانت نتيجة logical_test هي FALSE.' },
        },
    },
    IFERROR: {
        description: 'يمكنك استخدام الدالة IFERROR لمعالجة الأخطاء في صيغة. ترجع الدالة IFERROR قيمة تحددها إذا تم تقييم صيغة إلى خطأ؛ وإلا، فإنه يرجع نتيجة الصيغة.',
        abstract: 'يمكنك استخدام الدالة IFERROR لمعالجة الأخطاء في صيغة. ترجع الدالة IFERROR قيمة تحددها إذا تم تقييم صيغة إلى خطأ؛ وإلا، فإنه يرجع نتيجة الصيغة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. الوسيطة التي يتم فحصها بحثاً عن خطأ.' },
            valueIfError: { name: 'value_if_error', detail: 'مطلوب. القيمة التي يجب إرجاعها إذا تم تقييم الصيغة إلى خطأ. يتم تقييم أنواع الخطأ التالية: ‎#N/A أو ‎#VALUE!‎ أو ‎#REF!‎ أو ‎#DIV/0!‎ أو ‎#NUM!‎ أو ‎#NAME?‎ أو ‎#NULL!‎.' },
        },
    },
    IFNA: {
        description: 'ترجع الدالة IFNA القيمة التي تحددها إذا كانت الصيغة ترجع قيمة الخطأ #N/A؛ وإلا فإنه يرجع نتيجة الصيغة.',
        abstract: 'ترجع الدالة IFNA القيمة التي تحددها إذا كانت الصيغة ترجع قيمة الخطأ #N/A؛ وإلا فإنه يرجع نتيجة الصيغة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'الوسيطة التي تم التحقق منها لقيمة الخطأ #N/A.' },
            valueIfNa: { name: 'value_if_na', detail: 'القيمة المراد إرجاعها إذا تم تقييم الصيغة إلى قيمة الخطأ #N/A.' },
        },
    },
    IFS: {
        description: 'تتحقق الدالة IFS مما إذا تم استيفاء شرط واحد أو أكثر، وتُرجع القيمة التي تتوافق مع شرط TRUE الأول. يمكن تستبدل IFS العديد من عبارات IF المتداخلة، وتكون القراءة أسهل بكثير مع الشروط المتعددة.',
        abstract: 'تتحقق الدالة IFS مما إذا تم استيفاء شرط واحد أو أكثر، وتُرجع القيمة التي تتوافق مع شرط TRUE الأول. يمكن تستبدل IFS العديد من عبارات IF المتداخلة، وتكون القراءة أسهل بكثير مع الشروط المتعددة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'شرط نتيجته TRUE أو FALSE.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'النتيجة التي تُرجع إذا كانت نتيجة logical_test1 هي TRUE. يمكن أن تكون فارغة.' },
            logicalTest2: { name: 'logical_test2', detail: 'شرط نتيجته TRUE أو FALSE.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'النتيجة التي تُرجع إذا كانت نتيجة logical_testN هي TRUE. يقابل كل value_if_trueN الشرط logical_testN، ويمكن أن تكون فارغة.' },
        },
    },
    LAMBDA: {
        description: 'يمكنك إنشاء دالة لصيغة شائعة الاستخدام، وإزالة الحاجة إلى نسخ ولصق هذه الصيغة (التي يمكن أن تكون عرضة للخطأ)، وإضافة وظائفك الخاصة بشكل فعال إلى مكتبة دالات Excel الأصلية. علاوة على ذلك، لا تتطلب دالة LAMBDA VBA أو وحدات الماكرو أو JavaScript، لذلك يمكن لغير المبرمجين أيضا الاستفادة من استخدامها.',
        abstract: 'يمكنك إنشاء دالة لصيغة شائعة الاستخدام، وإزالة الحاجة إلى نسخ ولصق هذه الصيغة (التي يمكن أن تكون عرضة للخطأ)، وإضافة وظائفك الخاصة بشكل فعال إلى مكتبة دالات Excel الأصلية. علاوة على ذلك، لا تتطلب دالة LAMBDA VBA أو وحدات الماكرو أو JavaScript، لذلك يمكن لغير المبرمجين أيضا الاستفادة من استخدامها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'قيمة تريد تمريرها إلى الدالة، مثل مرجع خلية أو سلسلة أو رقم. يمكنك إدخال ما يصل إلى 253 معلمة. هذه الوسيطة اختيارية.' },
            calculation: { name: 'calculation', detail: 'الصيغة التي تريد تنفيذها والعودة كنتيجة للدالة. يجب أن تكون الوسيطة الأخيرة، ويجب أن تعيد نتيجة. هذه الوسيطة مطلوبة.' },
        },
    },
    LET: {
        description: 'تعين LET الدالة أسماء لنتائج الحساب. يسمح ذلك بتخزين القيم أو العمليات الحسابية الوسيطة أو تعريف الأسماء داخل صيغة. تنطبق هذه الأسماء فقط ضمن نطاق الدالة LET . على غرار المتغيرات في البرمجة، LET يتم إنجازها من خلال بناء جملة الصيغة الأصلية في Excel.',
        abstract: 'تعين LET الدالة أسماء لنتائج الحساب. يسمح ذلك بتخزين القيم أو العمليات الحسابية الوسيطة أو تعريف الأسماء داخل صيغة. تنطبق هذه الأسماء فقط ضمن نطاق الدالة LET . على غرار المتغيرات في البرمجة، LET يتم إنجازها من خلال بناء جملة الصيغة الأصلية في Excel.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'الاسم الأول المراد تعيينه. يجب أن يبدأ بحرف، وألا يكون ناتج صيغة أو متعارضاً مع صياغة النطاق.' },
            nameValue1: { name: 'name_value1', detail: 'القيمة المعيّنة إلى name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'أحد الخيارين التاليين:\n1. عملية حسابية تستخدم كل الأسماء داخل LET. يجب أن تكون هذه الوسيطة الأخيرة في LET.\n2. اسم ثانٍ لتعيينه إلى name_value ثانٍ. إذا حُدّد اسم، تصبح name_value2 وcalculation_or_name3 مطلوبتين.' },
            nameValue2: { name: 'name_value2', detail: 'القيمة المعيّنة إلى calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'أحد الخيارين التاليين:\n1. عملية حسابية تستخدم كل الأسماء داخل LET. يجب أن تكون الوسيطة الأخيرة في LET عملية حسابية.\n2. اسم ثالث لتعيينه إلى name_value ثالث. إذا حُدّد اسم، تصبح name_value3 وcalculation_or_name4 مطلوبتين.' },
        },
    },
    MAKEARRAY: {
        description: 'إرجاع صفيف محسوب لحجم صف وعمود محدد، عن طريق تطبيق دالة LAMBDA .',
        abstract: 'إرجاع صفيف محسوب لحجم صف وعمود محدد، عن طريق تطبيق دالة LAMBDA .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'عدد صفوف الصفيف. يجب أن يكون أكبر من صفر.' },
            number2: { name: 'cols', detail: 'عدد أعمدة الصفيف. يجب أن يكون أكبر من صفر.' },
            value3: { name: 'lambda', detail: 'دالة LAMBDA تُستدعى لإنشاء الصفيف. تأخذ LAMBDA معلمتين: row (فهرس صف الصفيف) وcol (فهرس عمود الصفيف).' },
        },
    },
    MAP: {
        description: 'إرجاع صفيف تم تكوينه عن طريق تعيين كل قيمة في الصفيف (الصفيفات) إلى قيمة جديدة عن طريق تطبيق LAMBDA لإنشاء قيمة جديدة.',
        abstract: 'إرجاع صفيف تم تكوينه عن طريق تعيين كل قيمة في الصفيف (الصفيفات) إلى قيمة جديدة عن طريق تطبيق LAMBDA لإنشاء قيمة جديدة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'الصفيف الأول المراد تعيينه.' },
            array2: { name: 'array2', detail: 'الصفيف الثاني المراد تعيينه.' },
            lambda: { name: 'lambda', detail: 'دالة LAMBDA يجب أن تكون الوسيطة الأخيرة، وأن تتضمن معلمة لكل صفيف مُمرَّر.' },
        },
    },
    NOT: {
        description: 'تعكس الدالة NOT قيمة الوسيطة الخاصة بها.',
        abstract: 'تعكس الدالة NOT قيمة الوسيطة الخاصة بها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'الشرط الذي تريد عكس منطقه، ويمكن أن تكون نتيجته TRUE أو FALSE.' },
        },
    },
    OR: {
        description: 'ترجع دالة OR القيمة TRUE إذا كان تقييم أي من وسيطاتها TRUE، وترجع FALSE إذا كان تقييم أي من وسيطاتها FALSE.',
        abstract: 'ترجع دالة OR القيمة TRUE إذا كان تقييم أي من وسيطاتها TRUE، وترجع FALSE إذا كان تقييم أي من وسيطاتها FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'الشرط الأول الذي تريد اختباره، ويمكن أن تكون نتيجته TRUE أو FALSE.' },
            logical2: { name: 'logical2', detail: 'شروط إضافية تريد اختبارها، ويمكن أن تكون نتيجتها TRUE أو FALSE، بحد أقصى 255 شرطاً.' },
        },
    },
    REDUCE: {
        description: 'تختزل مصفوفة إلى قيمة متراكمة بتطبيق LAMBDA على كل قيمة وإرجاع القيمة الإجمالية في المُجمّع.',
        abstract: 'تختزل مصفوفة إلى قيمة متراكمة بتطبيق LAMBDA على كل قيمة وإرجاع القيمة الإجمالية في المُجمّع.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'يحدد قيمة البداية للمُجمّع.' },
            array: { name: 'array', detail: 'صفيف المراد اختزاله.' },
            lambda: { name: 'lambda', detail: 'دالة LAMBDA تُستدعى لاختزال الصفيف. تأخذ LAMBDA ثلاث معلمات: 1. القيمة المتراكمة التي تُرجع كنتيجة نهائية. 2. القيمة الحالية من الصفيف. 3. العملية الحسابية المطبقة على كل عنصر في الصفيف.' },
        },
    },
    SCAN: {
        description: 'يقوم بفحص صفيف عن طريق تطبيق LAMBDA على كل قيمة وإرجاع صفيف يحتوي على كل قيمة وسيطة.',
        abstract: 'يقوم بفحص صفيف عن طريق تطبيق LAMBDA على كل قيمة وإرجاع صفيف يحتوي على كل قيمة وسيطة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'يحدد قيمة البداية للمُجمّع.' },
            array: { name: 'array', detail: 'صفيف المراد فحصه.' },
            lambda: { name: 'lambda', detail: 'دالة LAMBDA تُستدعى لفحص الصفيف. تأخذ LAMBDA ثلاث معلمات: 1. القيمة المتراكمة. 2. القيمة الحالية من الصفيف. 3. العملية الحسابية المطبقة على كل عنصر في الصفيف.' },
        },
    },
    SWITCH: {
        description: 'تقيّم تعبيراً مقابل قائمة قيم وترجع النتيجة المقابلة لأول قيمة مطابقة. وإذا لم توجد مطابقة، فقد ترجع قيمة افتراضية اختيارية.',
        abstract: 'تقيّم تعبيراً مقابل قائمة قيم وترجع النتيجة المقابلة لأول قيمة مطابقة. وإذا لم توجد مطابقة، فقد ترجع قيمة افتراضية اختيارية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'القيمة (مثل رقم أو تاريخ أو نص) التي ستُقارن بـ value1 إلى value126.' },
            value1: { name: 'value1', detail: 'قيمة تُقارن بـ expression.' },
            result1: { name: 'result1', detail: 'القيمة التي تُرجع عندما تطابق وسيطة valueN المقابلة expression. يجب توفير resultN لكل وسيطة valueN مقابلة.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'القيمة التي تُرجع إذا لم يُعثر على تطابق في تعبيرات valueN. تُعرَّف وسيطة Default بعدم وجود تعبير resultN مقابل لها، ويجب أن تكون الوسيطة الأخيرة في الدالة.' },
            result2: { name: 'result2', detail: 'القيمة التي تُرجع عندما تطابق وسيطة valueN المقابلة expression. يجب توفير resultN لكل وسيطة valueN مقابلة.' },
        },
    },
    TRUE: {
        description: 'إرجاع القيمة المنطقية TRUE. يمكنك استخدام هذه الدالة عندما تريد إرجاع القيمة TRUE استنادا إلى شرط. على سبيل المثال:',
        abstract: 'إرجاع القيمة المنطقية TRUE. يمكنك استخدام هذه الدالة عندما تريد إرجاع القيمة TRUE استنادا إلى شرط. على سبيل المثال:',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'ترجع الدالة XOR قيمة حصرية منطقية أو لكافة الوسيطات.',
        abstract: 'ترجع الدالة XOR قيمة حصرية منطقية أو لكافة الوسيطات.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'الشرط الأول الذي تريد اختباره، ويمكن أن تكون نتيجته TRUE أو FALSE.' },
            logical2: { name: 'logical2', detail: 'شروط إضافية تريد اختبارها، ويمكن أن تكون نتيجتها TRUE أو FALSE، بحد أقصى 255 شرطاً.' },
        },
    },
};

export default locale;
