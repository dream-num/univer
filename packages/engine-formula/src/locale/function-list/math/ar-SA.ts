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
    ABS: {
        description: 'تُرجع القيمة المطلقة لرقم. والقيمة المطلقة لرقم هي الرقم بدون العلامة الخاصة به.',
        abstract: 'تُرجع القيمة المطلقة لرقم. والقيمة المطلقة لرقم هي الرقم بدون العلامة الخاصة به.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي الرقم الحقيقي الذي تريد قيمته المطلقة.' },
        },
    },
    ACOS: {
        description: 'تُرجع قوس جيب التمام أو جيب التمام العكسي لرقم. إن قوس جيب التمام هو زاوية جيب تمامها عبارة عن رقم . ويتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من 0 (صفر) إلى باي.',
        abstract: 'تُرجع قوس جيب التمام أو جيب التمام العكسي لرقم. إن قوس جيب التمام هو زاوية جيب تمامها عبارة عن رقم . ويتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من 0 (صفر) إلى باي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي جيب تمام الزاوية الذي تريده ويجب أن يكون من 1- إلى 1.' },
        },
    },
    ACOSH: {
        description: 'تُرجع جيب التمام العكسي للقطع الزائد لأحد الأرقام. يجب أن يكون الرقم أكبر من أو يساوي 1. ويعد جيب التمام العكسي للقطع الزائد عبارة عن القيمة التي يكون جيب تمام القطع الزائد الخاص بها عبارة عن رقم ، بحيث تساوي ACOSH(COSH(number))‎ رقماً .',
        abstract: 'تُرجع جيب التمام العكسي للقطع الزائد لأحد الأرقام. يجب أن يكون الرقم أكبر من أو يساوي 1. ويعد جيب التمام العكسي للقطع الزائد عبارة عن القيمة التي يكون جيب تمام القطع الزائد الخاص بها عبارة عن رقم ، بحيث تساوي ACOSH(COSH(number))‎ رقماً .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي أي رقم حقيقي يساوي أو أكبر من 1.' },
        },
    },
    ACOT: {
        description: 'تُرجع هذه الدالة القيمة الأساسية لقوس ظل تمام الزاوية أو ظل التمام العكسي لرقم.',
        abstract: 'تُرجع هذه الدالة القيمة الأساسية لقوس ظل تمام الزاوية أو ظل التمام العكسي لرقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم هو ظل الزاوية التي تريدها. يجب أن يكون هذا رقما حقيقيا.' },
        },
    },
    ACOTH: {
        description: 'تُرجع ظل التمام الزائدي العكسي لرقم.',
        abstract: 'تُرجع ظل التمام الزائدي العكسي لرقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'يجب أن تكون القيمة المطلقة للعدد Number أكبر من 1.' },
        },
    },
    AGGREGATE: {
        description: 'تُرجع هذه الدالة مجموعاً في قائمة أو قاعدة بيانات. يمكن أن تقوم الدالة AGGREGATE بتطبيق دالات تجميعية مختلفة على قائمة أو قاعدة بيانات مع توفير خيار تجاهل الصفوف المخفية وقيم الخطأ.',
        abstract: 'تُرجع هذه الدالة مجموعاً في قائمة أو قاعدة بيانات. يمكن أن تقوم الدالة AGGREGATE بتطبيق دالات تجميعية مختلفة على قائمة أو قاعدة بيانات مع توفير خيار تجاهل الصفوف المخفية وقيم الخطأ.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'مطلوب. رقم من 1 إلى 19 يحدد الدالة المراد استخدامها.' },
            options: { name: 'options', detail: 'مطلوب. قيمة رقمية تحدد القيم المُراد تجاهلها في نطاق التقييم للدالة. ملاحظة لن تتجاهل الدالة الصفوف المخفية أو الإجماليات الفرعية المتداخلة أو التجميعات المتداخلة إذا كانت وسيطة الصفيف تتضمن عملية حسابية، على سبيل المثال: =AGGREGATE(14,3,A1:A100*(A1:A100>0),1)' },
            ref1: { name: 'ref1', detail: 'مطلوب. وهي الوسيطة الرقمية الأولى للدالات التي تضم وسيطات رقمية متعددة تريد القيمة التجميعية لها.' },
            ref2: { name: 'ref2', detail: 'الاختياري. وهي الوسيطات الرقمية من 2 حتى 253 التي تريد القيمة التجميعية لها. بالنسبة إلى الدالات التي تضم صفيفاً، تكون ref1 عبارة عن صفيف أو صيغة صفيف أو مرجع لنطاق من الخلايا التي تريد القيمة التجميعية لها. وتعتبر Ref2 وسيطة ثانية مطلوبة لدالات معينة. تتطلب الدالات التالية الوسيطة ref2:' },
        },
    },
    ARABIC: {
        description: 'تحويل رقم روماني إلى رقم عربي.',
        abstract: 'تحويل رقم روماني إلى رقم عربي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة. سلسلة محاطة بعلامات اقتباس أو سلسلة فارغة ("") أو مرجع إلى خلية تحتوي على نص.' },
        },
    },
    ASIN: {
        description: 'تُرجع قوس جيب الزاوية أو الجيب العكسي لأحد الأرقام. إن قوس الجيب هو الزاوية التي يكون الجيب الخاص بها عبارة عن رقم . يتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من -pi/2 إلى pi/2.',
        abstract: 'تُرجع قوس جيب الزاوية أو الجيب العكسي لأحد الأرقام. إن قوس الجيب هو الزاوية التي يكون الجيب الخاص بها عبارة عن رقم . يتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من -pi/2 إلى pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي جيب الزاوية الذي تريده ويجب أن يتراوح بين 1- و1.' },
        },
    },
    ASINH: {
        description: 'تُرجع جيب الزاوية العكسي للقطع الزائد لأحد الأرقام. إن جيب الزاوية العكسي للقطع الزائد هو القيمة التي يكون جيب زاوية القطع الزائد الخاص بها عبارة عن رقم ، بحيث تساوي ASINH(SINH(number))‎ ‏ رقماً .',
        abstract: 'تُرجع جيب الزاوية العكسي للقطع الزائد لأحد الأرقام. إن جيب الزاوية العكسي للقطع الزائد هو القيمة التي يكون جيب زاوية القطع الزائد الخاص بها عبارة عن رقم ، بحيث تساوي ASINH(SINH(number))‎ ‏ رقماً .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي.' },
        },
    },
    ATAN: {
        description: 'تُرجع قوس ظل الزاوية أو المماس المعكوس لأحد الأرقام. إن قوس ظل الزاوية هو الزاوية التي يكون المماس الخاص بها عبارة عن رقم . ويتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من -pi/2 إلى pi/2.',
        abstract: 'تُرجع قوس ظل الزاوية أو المماس المعكوس لأحد الأرقام. إن قوس ظل الزاوية هو الزاوية التي يكون المماس الخاص بها عبارة عن رقم . ويتم تعيين الزاوية التي يتم إرجاعها بالتقدير الدائري في النطاق من -pi/2 إلى pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. مماس الزاوية التي تريدها.' },
        },
    },
    ATAN2: {
        description: 'تُرجع قوس ظل الزاوية أو المماس المعكوس للإحداثيين المحددين س وص. إن قوس ظل الزاوية هو الزاوية من المحور "س" إلى خط يحتوي على نقطة الأصل (0، 0) والنقطة ذات الإحداثيين (x_num وy_num). يتم تعيين الزاوية بالتقدير الدائري بين -pi وpi، مع استثناء -pi.',
        abstract: 'تُرجع قوس ظل الزاوية أو المماس المعكوس للإحداثيين المحددين س وص. إن قوس ظل الزاوية هو الزاوية من المحور "س" إلى خط يحتوي على نقطة الأصل (0، 0) والنقطة ذات الإحداثيين (x_num وy_num). يتم تعيين الزاوية بالتقدير الدائري بين -pi وpi، مع استثناء -pi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'مطلوب. وهي الإحداثي س للنقطة.' },
            yNum: { name: 'y_num', detail: 'مطلوب. وهي الإحداثي ص للنقطة.' },
        },
    },
    ATANH: {
        description: 'تُرجع الظل العكسي لقطع زائد لأحد الأرقام. يجب أن يكون الرقم بين -1 و1 (باستثناء -1 و1). إن الظل العكسي للقطع الزائد هو القيمة التي يكون ظل الزاوية للقطع الزائد الخاص بها عبارة عن رقم ، وبذلك فإن ATANH(TANH(number))‎ تساوي رقماً .',
        abstract: 'تُرجع الظل العكسي لقطع زائد لأحد الأرقام. يجب أن يكون الرقم بين -1 و1 (باستثناء -1 و1). إن الظل العكسي للقطع الزائد هو القيمة التي يكون ظل الزاوية للقطع الزائد الخاص بها عبارة عن رقم ، وبذلك فإن ATANH(TANH(number))‎ تساوي رقماً .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي بين 1 و-1.' },
        },
    },
    BASE: {
        description: 'تحوّل رقماً إلى تمثيل نصي باستخدام الجذر (الأساس).',
        abstract: 'تحوّل رقماً إلى تمثيل نصي باستخدام الجذر (الأساس).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي تريد تحويله. يجب أن يكون عددا صحيحا أكبر من أو يساوي 0 وأقل من 2^53.' },
            radix: { name: 'radix', detail: 'مطلوب. radix الأساسي الذي تريد تحويل الرقم إليه. يجب أن يكون عددا صحيحا أكبر من أو يساوي 2 وأقل من أو يساوي 36.' },
            minLength: { name: 'min_length', detail: 'الاختياري. الحد الأدنى لطول السلسلة التي تم إرجاعها. يجب أن يكون عددا صحيحا أكبر من أو يساوي 0.' },
        },
    },
    CEILING: {
        description: 'تُرجع رقماً تم تقريبه للأعلى، بعيداً عن الصفر، إلى أقرب مضاعف للوسيطة significance. على سبيل المثال، إذا كنت تريد تجنب استخدام السنت في الأسعار وكان سعر المنتج 4,42 ر.س.، فاستخدم الصيغة ‎=CEILING(4,42,0,05)‎ لتقريب السعر للأعلى إلى أقرب مبلغ صحيح.',
        abstract: 'تُرجع رقماً تم تقريبه للأعلى، بعيداً عن الصفر، إلى أقرب مضاعف للوسيطة significance. على سبيل المثال، إذا كنت تريد تجنب استخدام السنت في الأسعار وكان سعر المنتج 4,42 ر.س.، فاستخدم الصيغة ‎=CEILING(4,42,0,05)‎ لتقريب السعر للأعلى إلى أقرب مبلغ صحيح.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي القيمة التي تريد تقريبها.' },
            significance: { name: 'significance', detail: 'مطلوب. وهي المضاعف الذي تريد التقريب إليه.' },
        },
    },
    CEILING_MATH: {
        description: 'السقف. تقوم الدالة MATH بتقريب رقم إلى الأعلى إلى أقرب عدد صحيح أو اختياريا إلى أقرب مضاعف ذي أهمية.',
        abstract: 'السقف. تقوم الدالة MATH بتقريب رقم إلى الأعلى إلى أقرب عدد صحيح أو اختياريا إلى أقرب مضاعف ذي أهمية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوب. (يجب أن يكون بين -2.229E-308.و9.99E+307.)' },
            significance: { name: 'significance', detail: 'الاختياري. هذا هو عدد الأرقام الهامة بعد الفاصلة العشرية التي سيتم تقريب الرقم إليها.' },
            mode: { name: 'mode', detail: 'الاختياري. يتحكم هذا في ما إذا كان يتم تقريب الأرقام السالبة نحو الصفر أو بعيدا عنه.' },
        },
    },
    CEILING_PRECISE: {
        description: 'إرجاع رقم تم تقريبه إلى الأعلى إلى أقرب رقم صحيح أو إلى أقرب مضاعف من مضاعفات significance. ويتم تقريب الرقم إلى الأعلى بغض النظر عن علامته. ولكن إذا كانت قيمة الوسيطة Number أو significance عبارة عن صفر، فيتم إرجاع الصفر.',
        abstract: 'إرجاع رقم تم تقريبه إلى الأعلى إلى أقرب رقم صحيح أو إلى أقرب مضاعف من مضاعفات significance. ويتم تقريب الرقم إلى الأعلى بغض النظر عن علامته. ولكن إذا كانت قيمة الوسيطة Number أو significance عبارة عن صفر، فيتم إرجاع الصفر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي القيمة المراد تقريبها.' },
            significance: { name: 'significance', detail: 'الاختياري. وهي المضاعف المراد تقريب الرقم إليه. إذا تم حذف الوسيطة significance، فتكون قيمتها الافتراضية 1.' },
        },
    },
    COMBIN: {
        description: 'تُرجع عدد التوافقيات لعدد معين من العناصر. استخدم COMBIN لتحديد إجمالي عدد المجموعات المحتملة لعدد معين من العناصر.',
        abstract: 'تُرجع عدد التوافقيات لعدد معين من العناصر. استخدم COMBIN لتحديد إجمالي عدد المجموعات المحتملة لعدد معين من العناصر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي عدد العناصر.' },
            numberChosen: { name: 'number_chosen', detail: 'مطلوب. وهي عدد العناصر الموجودة في كل توافقية.' },
        },
    },
    COMBINA: {
        description: 'تُرجع هذه الدالة عدد التركيبات (مع التكرارات) لعدد معين من العناصر.',
        abstract: 'تُرجع هذه الدالة عدد التركيبات (مع التكرارات) لعدد معين من العناصر.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. يجب أن يكون أكبر من أو يساوي 0، وأكبر من أو يساوي Number_chosen. يتم اقتطاع القيم غير الصحيحة.' },
            numberChosen: { name: 'number_chosen', detail: 'مطلوب. يجب أن يكون أكبر من أو يساوي 0. يتم اقتطاع القيم غير الصحيحة.' },
        },
    },
    COS: {
        description: 'إرجاع جيب تمام الزاوية المحددة.',
        abstract: 'إرجاع جيب تمام الزاوية المحددة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي الزاوية بالتقدير الدائري التي تريد معرفة جيب التمام الخاص بها.' },
        },
    },
    COSH: {
        description: 'إرجاع جيب تمام القطع الزائد لأحد الأرقام.',
        abstract: 'إرجاع جيب تمام القطع الزائد لأحد الأرقام.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي أي رقم حقيقي تريد العثور على جيب تمام القطع الزائد الخاص به.' },
        },
    },
    COT: {
        description: 'إرجاع ظل التمام لزاوية محددة بالتقدير الدائري.',
        abstract: 'إرجاع ظل التمام لزاوية محددة بالتقدير الدائري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الزاوية بالتقدير الدائري التي تريد التمام لها.' },
        },
    },
    COTH: {
        description: 'إرجاع التمام الزائدي لزاوية تشعبية.',
        abstract: 'إرجاع التمام الزائدي لزاوية تشعبية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة.' },
        },
    },
    CSC: {
        description: 'إرجاع قاطع تمام الزاوية المحددة بالتقدير الدائري.',
        abstract: 'إرجاع قاطع تمام الزاوية المحددة بالتقدير الدائري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة.' },
        },
    },
    CSCH: {
        description: 'إرجاع قاطع التمام الزائدي للزاوية المحددة بالتقدير الدائري.',
        abstract: 'إرجاع قاطع التمام الزائدي للزاوية المحددة بالتقدير الدائري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة.' },
        },
    },
    DECIMAL: {
        description: 'تحول التمثيل النصي لرقم في أساس معين إلى رقم عشري.',
        abstract: 'تحول التمثيل النصي لرقم في أساس معين إلى رقم عشري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'مطلوبة.' },
            radix: { name: 'radix', detail: 'مطلوب. يجب أن تكون قيمة الوسيطة Radix عدد صحيح.' },
        },
    },
    DEGREES: {
        description: 'تحويل التقدير الدائري إلى درجات.',
        abstract: 'تحويل التقدير الدائري إلى درجات.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'مطلوب. الزاوية بالتقدير الدائري التي تريد تحويلها.' },
        },
    },
    EVEN: {
        description: 'تُرجع رقماً تم تقريبه للأعلى إلى أقرب رقم صحيح زوجي. يمكنك استخدام هذه الدالة لمعالجة السلع الزوجية. على سبيل المثال، يتّسع صندوق سلع لصفوف من سلعة واحدة أو سلعتين. ويمتلئ الصندوق عندما يتوافق عدد السلع، بعد تقريبه للأعلى إلى أقرب عدد زوجي، مع سعة الصندوق.',
        abstract: 'تُرجع رقماً تم تقريبه للأعلى إلى أقرب رقم صحيح زوجي. يمكنك استخدام هذه الدالة لمعالجة السلع الزوجية. على سبيل المثال، يتّسع صندوق سلع لصفوف من سلعة واحدة أو سلعتين. ويمتلئ الصندوق عندما يتوافق عدد السلع، بعد تقريبه للأعلى إلى أقرب عدد زوجي، مع سعة الصندوق.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. القيمة التي يجب تقريبها.' },
        },
    },
    EXP: {
        description: 'تُرجع هذه الدالة e مرفوعة إلى أس. يساوي الثابت e القيمة 2,71828182845904، أساس اللوغاريتم الطبيعي.',
        abstract: 'تُرجع هذه الدالة e مرفوعة إلى أس. يساوي الثابت e القيمة 2,71828182845904، أساس اللوغاريتم الطبيعي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الأس المُطبّق على الأساس e.' },
        },
    },
    FACT: {
        description: 'تُرجع عامل الضرب لرقم. يساوي عامل الضرب لرقمٍ ما 1*2*3*...* الرقم.',
        abstract: 'تُرجع عامل الضرب لرقم. يساوي عامل الضرب لرقمٍ ما 1*2*3*...* الرقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم غير السالب الذي تريد الحصول على عامل الضرب الخاص به. إذا لم يكن الرقم عبارة عن عدد صحيح، فسيتم اقتطاعه.' },
        },
    },
    FACTDOUBLE: {
        description: 'تُرجع العامل المزدوج لرقم.',
        abstract: 'تُرجع العامل المزدوج لرقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. القيمة التي تريد إرجاع العامل المزدوج لها. إذا لم يكن الرقم عبارة عن عدد صحيح، فيتم اقتطاعه.' },
        },
    },
    FLOOR: {
        description: 'تقوم الدالة FLOOR في Excel بتقريب رقم محدد لأسفل إلى أقرب مضاعف محدد للأهمية. يتم تقريب الأرقام السالبة لأسفل (سالبة أخرى) إلى أقرب مضاعف كامل أقل من الصفر.',
        abstract: 'تقوم الدالة FLOOR في Excel بتقريب رقم محدد لأسفل إلى أقرب مضاعف محدد للأهمية. يتم تقريب الأرقام السالبة لأسفل (سالبة أخرى) إلى أقرب مضاعف كامل أقل من الصفر.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. تمثل القيمة الرقمية التي تريد تقريبها.' },
            significance: { name: 'significance', detail: 'مطلوب. وهي المضاعف الذي تريد التقريب إليه.' },
        },
    },
    FLOOR_MATH: {
        description: 'تقرّب هذه الدالة رقماً إلى الأدنى وصولاً إلى أقرب عدد صحيح أو إلى أقرب مضاعف ذي أهمية.',
        abstract: 'تقرّب هذه الدالة رقماً إلى الأدنى وصولاً إلى أقرب عدد صحيح أو إلى أقرب مضاعف ذي أهمية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم المطلوب تقريبه لأسفل.' },
            significance: { name: 'significance', detail: 'الاختياري. وهي المضاعف الذي تريد التقريب إليه.' },
            mode: { name: 'mode', detail: 'الاختياري. الاتجاه (نحو أو بعيدا عن 0) لتقريب الأرقام السالبة.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'تُرجع رقماً تم تقريبه إلى الأدنى إلى أقرب عدد صحيح أو إلى أقرب مضاعف لقيمة الوسيطة significance. ويتم تقريب الرقم إلى الأدنى بغض النظر عن علامته. ولكن إذا كانت الوسيطة number أو significance عبارة عن صفر، فسيتم إرجاع الصفر.',
        abstract: 'تُرجع رقماً تم تقريبه إلى الأدنى إلى أقرب عدد صحيح أو إلى أقرب مضاعف لقيمة الوسيطة significance. ويتم تقريب الرقم إلى الأدنى بغض النظر عن علامته. ولكن إذا كانت الوسيطة number أو significance عبارة عن صفر، فسيتم إرجاع الصفر.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي القيمة المراد تقريبها.' },
            significance: { name: 'significance', detail: 'الاختياري. وهي المضاعف المراد تقريب الرقم إليه. إذا تم حذف الوسيطة significance، فتكون قيمتها الافتراضية 1.' },
        },
    },
    GCD: {
        description: 'تُرجع عامل القسمة المشترك الأكبر لعددين صحيحين أو أكثر. إن عامل القسمة المشترك الأكبر هو العدد الصحيح الأكبر الذي يقسم number1 وnumber2 بدون قيمة باقية.',
        abstract: 'تُرجع عامل القسمة المشترك الأكبر لعددين صحيحين أو أكثر. إن عامل القسمة المشترك الأكبر هو العدد الصحيح الأكبر الذي يقسم number1 وnumber2 بدون قيمة باقية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. تتوفر القيم من 1 إلى 255. إذا لم تكن إحدى القيم عبارة عن عدد صحيح، فيتم اقتطاعها.' },
            number2: { name: 'number2', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. تتوفر القيم من 1 إلى 255. إذا لم تكن إحدى القيم عبارة عن عدد صحيح، فيتم اقتطاعها.' },
        },
    },
    INT: {
        description: 'تقريب رقم إلى أقرب عدد صحيح أصغر منه.',
        abstract: 'تقريب رقم إلى أقرب عدد صحيح أصغر منه.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. العدد الحقيقي الذي تريد تقريبه إلى عدد صحيح أصغر منه.' },
        },
    },
    ISO_CEILING: {
        description: 'إرجاع رقم تم تقريبه إلى الأعلى إلى أقرب رقم صحيح أو إلى أقرب مضاعف من مضاعفات significance. ويتم تقريب الرقم إلى الأعلى بغض النظر عن علامته. ولكن إذا كانت قيمة الوسيطة Number أو significance عبارة عن صفر، فيتم إرجاع الصفر.',
        abstract: 'إرجاع رقم تم تقريبه إلى الأعلى إلى أقرب رقم صحيح أو إلى أقرب مضاعف من مضاعفات significance. ويتم تقريب الرقم إلى الأعلى بغض النظر عن علامته. ولكن إذا كانت قيمة الوسيطة Number أو significance عبارة عن صفر، فيتم إرجاع الصفر.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي القيمة المراد تقريبها.' },
            significance: { name: 'significance', detail: 'الاختياري. وهي المضاعف المراد تقريب الرقم إليه. إذا تم حذف الوسيطة significance، فتكون قيمتها الافتراضية 1.' },
        },
    },
    LCM: {
        description: 'تُرجع هذه الدالة أقل مضاعف مشترك بين الأعداد الصحيحة. إن أقل مضاعف مشترك هو أصغر الأعداد الصحيحة الموجبة وهو مضاعف كل وسيطات الأعداد الصحيحة مثل number1،‏ number2، وهكذا. استخدم الدالة LCM لإضافة كسور ذات مقامات مختلفة.',
        abstract: 'تُرجع هذه الدالة أقل مضاعف مشترك بين الأعداد الصحيحة. إن أقل مضاعف مشترك هو أصغر الأعداد الصحيحة الموجبة وهو مضاعف كل وسيطات الأعداد الصحيحة مثل number1،‏ number2، وهكذا. استخدم الدالة LCM لإضافة كسور ذات مقامات مختلفة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. القيم من 1 إلى 255 التي تريد حساب أقل مضاعف مشترك لها. إذا لم تكن القيمة عبارة عن عدد صحيح، فسيتم اقتطاعها.' },
            number2: { name: 'number2', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. القيم من 1 إلى 255 التي تريد حساب أقل مضاعف مشترك لها. إذا لم تكن القيمة عبارة عن عدد صحيح، فسيتم اقتطاعها.' },
        },
    },
    LN: {
        description: 'تُرجع هذه الدالة اللوغاريتم الطبيعي لرقم. تستند اللوغاريتمات الطبيعية إلى الثابت e ‏(2,71828182845904)‎.',
        abstract: 'تُرجع هذه الدالة اللوغاريتم الطبيعي لرقم. تستند اللوغاريتمات الطبيعية إلى الثابت e ‏(2,71828182845904)‎.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. رقم حقيقي موجب تريد إيجاد اللوغاريتم الطبيعي له.' },
        },
    },
    LOG: {
        description: 'تُرجع هذه الدالة لوغاريتم رقم إلى الأساس الذي تحدده.',
        abstract: 'تُرجع هذه الدالة لوغاريتم رقم إلى الأساس الذي تحدده.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. هو الرقم الحقيقي الموجب الذي تريد معرفة اللوغاريتم له.' },
            base: { name: 'base', detail: 'الاختياري. أساس اللوغاريتم. إذا تم حذف الوسيطة base، فسيتم افتراض أنها 10.' },
        },
    },
    LOG10: {
        description: 'تُرجع هذه الدالة اللوغاريتم العشري لرقم.',
        abstract: 'تُرجع هذه الدالة اللوغاريتم العشري لرقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الحقيقي الموجب الذي تريد حساب اللوغاريتم العشري له.' },
        },
    },
    MDETERM: {
        description: 'تُرجع هذه الدالة محدد المصفوفة لصفيف.',
        abstract: 'تُرجع هذه الدالة محدد المصفوفة لصفيف.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'مطلوب. صفيف رقمي يحتوي على عدد متساوٍ من الصفوف والأعمدة.' },
        },
    },
    MINVERSE: {
        description: 'ترجع الدالة MINVERSE المصفوفة العكسية لمصفوفة مخزنة في صفيف.',
        abstract: 'ترجع الدالة MINVERSE المصفوفة العكسية لمصفوفة مخزنة في صفيف.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'مطلوب. صفيف رقمي يحتوي على عدد متساوٍ من الصفوف والأعمدة.' },
        },
    },
    MMULT: {
        description: 'ترجع الدالة MMULT منتج مصفوفة صفيفين. تكون النتيجة عبارة عن صفيف يتألف من عدد الصفوف نفسه في array1 وعدد الأعمدة نفسه في array 2.',
        abstract: 'ترجع الدالة MMULT منتج مصفوفة صفيفين. تكون النتيجة عبارة عن صفيف يتألف من عدد الصفوف نفسه في array1 وعدد الأعمدة نفسه في array 2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'المصفوفتان المراد ضربهما.' },
            array2: { name: 'array2', detail: 'المصفوفتان المراد ضربهما.' },
        },
    },
    MOD: {
        description: 'إرجاع الباقي بعد قسمة رقم على القاسم. ويحتوي الناتج على علامة القاسم نفسها.',
        abstract: 'إرجاع الباقي بعد قسمة رقم على القاسم. ويحتوي الناتج على علامة القاسم نفسها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي تريد إيجاد الباقي له.' },
            divisor: { name: 'divisor', detail: 'مطلوب. الرقم الذي تريد قسمة رقم ما عليه.' },
        },
    },
    MROUND: {
        description: 'يعمل MROUND على إرجاع رقم مقرب إلى المضاعف المطلوب.',
        abstract: 'يعمل MROUND على إرجاع رقم مقرب إلى المضاعف المطلوب.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. القيمة التي يجب تقريبها.' },
            multiple: { name: 'multiple', detail: 'مطلوب. المضاعف الذي تريد تقريب الرقم إليه.' },
        },
    },
    MULTINOMIAL: {
        description: 'تُرجع هذه الدالة نسبة مضروب مجموع من القيم إلى حاصل ضرب مضروباتها.',
        abstract: 'تُرجع هذه الدالة نسبة مضروب مجموع من القيم إلى حاصل ضرب مضروباتها.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. القيم من 1 إلى 255 التي تريد الحصول على التسمية المتعددة لها.' },
            number2: { name: 'number2', detail: 'Number1 مطلوب، والأرقام اللاحقة اختيارية. القيم من 1 إلى 255 التي تريد الحصول على التسمية المتعددة لها.' },
        },
    },
    MUNIT: {
        description: 'ترجع الدالة MUNIT مصفوفة الوحدة للبعد المحدد.',
        abstract: 'ترجع الدالة MUNIT مصفوفة الوحدة للبعد المحدد.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'عدد صحيح يحدد بُعد مصفوفة الوحدة التي تريد إرجاعها. ترجع الدالة مصفوفة، ويجب أن يكون البُعد أكبر من صفر.' },
        },
    },
    ODD: {
        description: 'تُرجع هذه الدالة رقماً تم تقريبه إلى الأعلى وصولاً إلى أقرب عدد صحيح فردي.',
        abstract: 'تُرجع هذه الدالة رقماً تم تقريبه إلى الأعلى وصولاً إلى أقرب عدد صحيح فردي.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوب. القيمة التي يجب تقريبها.' },
        },
    },
    PI: {
        description: 'تُرجع هذه الدالة الرقم 3,14159265358979، وهو الثابت الرياضي pi، بدقة تصل إلى 15رقماً.',
        abstract: 'تُرجع هذه الدالة الرقم 3,14159265358979، وهو الثابت الرياضي pi، بدقة تصل إلى 15رقماً.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'تُرجع هذه الدالة نتيجة رقم مرفوع إلى أس.',
        abstract: 'تُرجع هذه الدالة نتيجة رقم مرفوع إلى أس.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الأساسي. ويمكن أن يكون أي رقم حقيقي.' },
            power: { name: 'power', detail: 'مطلوب. الأس الذي يُرفع الرقم الأساسي إليه.' },
        },
    },
    PRODUCT: {
        description: 'تضرب الدالة PRODUCT كافة الأرقام المحددة كوسيطات وتُرجع الناتج. على سبيل المثال، إذا احتوت الخلايا A1 وA2 على أرقام، فيمكنك استخدام الصيغة =PRODUCT(A1، A2) لضرب هذين الرقمين معا. ويمكنك أيضاً إجراء العملية نفسها باستخدام العامل الرياضي الخاص بالضرب ( * )، مثلاً ‎=A1 * A2‎ .',
        abstract: 'تضرب الدالة PRODUCT كافة الأرقام المحددة كوسيطات وتُرجع الناتج. على سبيل المثال، إذا احتوت الخلايا A1 وA2 على أرقام، فيمكنك استخدام الصيغة =PRODUCT(A1، A2) لضرب هذين الرقمين معا. ويمكنك أيضاً إجراء العملية نفسها باستخدام العامل الرياضي الخاص بالضرب ( * )، مثلاً ‎=A1 * A2‎ .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'مطلوب. الرقم أو النطاق الأول الذي تريد ضربه.' },
            number2: { name: 'number2', detail: 'الاختياري. الأرقام أو النطاقات الإضافية التي تريد ضربها، ويمكن استخدام لغاية 255 وسيطة كحد أقصى.' },
        },
    },
    QUOTIENT: {
        description: 'تُرجع هذه الدالة جزء العدد الصحيح لقسمة. استخدم هذه الدالة عندما تريد إهمال باقي القسمة.',
        abstract: 'تُرجع هذه الدالة جزء العدد الصحيح لقسمة. استخدم هذه الدالة عندما تريد إهمال باقي القسمة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'مطلوب. المقسوم.' },
            denominator: { name: 'denominator', detail: 'مطلوب. القاسم.' },
        },
    },
    RADIANS: {
        description: 'تحوّل هذه الدالة الدرجات إلى التقدير الدائري.',
        abstract: 'تحوّل هذه الدالة الدرجات إلى التقدير الدائري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'مطلوب. الزاوية بالدرجات التي تريد تحويلها.' },
        },
    },
    RAND: {
        description: 'RAND إرجاع عدد حقيقي عشوائي موزع بشكل متساوٍ أكبر من أو يساوي 0 وأصغر من 1. يتم إرجاع عدد حقيقي عشوائي جديد كل مرة يتم فيها حساب ورقة العمل .',
        abstract: 'RAND إرجاع عدد حقيقي عشوائي موزع بشكل متساوٍ أكبر من أو يساوي 0 وأصغر من 1. يتم إرجاع عدد حقيقي عشوائي جديد كل مرة يتم فيها حساب ورقة العمل .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'في المثال الآتي، أنشأنا صفيفًا بطول 5 صفوف وعرض 3 أعمدة. يُرجع الأول مجموعة عشوائية من القيم بين 0 و1، وذلك هو السلوك الافتراضي للدالة RANDARRAY. ويُرجع الثاني سلسلة من القيم العشرية العشوائية بين 1 و100. وأخيراً، يُرجع المثال الثالث سلسلة من الأعداد الصحيحة بين 1 و100.',
        abstract: 'في المثال الآتي، أنشأنا صفيفًا بطول 5 صفوف وعرض 3 أعمدة. يُرجع الأول مجموعة عشوائية من القيم بين 0 و1، وذلك هو السلوك الافتراضي للدالة RANDARRAY. ويُرجع الثاني سلسلة من القيم العشرية العشوائية بين 1 و100. وأخيراً، يُرجع المثال الثالث سلسلة من الأعداد الصحيحة بين 1 و100.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'عدد الصفوف التي سيتم إرجاعها' },
            columns: { name: 'columns', detail: 'عدد الأعمدة المراد إرجاعها' },
            min: { name: 'min', detail: 'أدنى عدد تريد إرجاعه' },
            max: { name: 'max', detail: 'أقصى عدد تريد إرجاعه' },
            wholeNumber: { name: 'whole_number', detail: 'إرجاع عدد صحيح أو قيمة عشرية TRUE لعدد صحيح FALSE لرقم عشري' },
        },
    },
    RANDBETWEEN: {
        description: 'تُرجع هذه الدالة عدداً صحيحاً عشوائياً بين الأرقام التي تحددها. يتم إرجاع عدد صحيح عشوائي جديد في كل مرة يتم فيها حساب ورقة العمل.',
        abstract: 'تُرجع هذه الدالة عدداً صحيحاً عشوائياً بين الأرقام التي تحددها. يتم إرجاع عدد صحيح عشوائي جديد في كل مرة يتم فيها حساب ورقة العمل.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'مطلوب. أصغر عدد صحيح تُرجعه الدالة RANDBETWEEN.' },
            top: { name: 'top', detail: 'مطلوب. أكبر عدد صحيح تُرجعه الدالة RANDBETWEEN.' },
        },
    },
    ROMAN: {
        description: 'تحوّل هذه الدالة أرقاماً عربية إلى أرقام رومانية كنص.',
        abstract: 'تحوّل هذه الدالة أرقاماً عربية إلى أرقام رومانية كنص.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم العربي الذي تريد تحويله.' },
            form: { name: 'form', detail: 'الاختياري. رقم يحدد نوع الرقم الروماني الذي تريده. يتراوح نمط الرقم الروماني من "كلاسيكي" إلى "مبسّط"، ويكون أكثر إيجازاً كلما ارتفعت قيمة الوسيطة form. انظر المثال التالي ROMAN(499,0) أدناه.' },
        },
    },
    ROUND: {
        description: 'تقرّب الدالة ROUND رقماً إلى عدد معين من الأرقام. على سبيل المثال، إذا كانت الخلية A1 تحتوي على الرقم 23.7825، وكنت تريد تقريب هذه القيمة إلى منزلتين عشريتين، فيمكنك استخدام الصيغة التالية:',
        abstract: 'تقرّب الدالة ROUND رقماً إلى عدد معين من الأرقام. على سبيل المثال، إذا كانت الخلية A1 تحتوي على الرقم 23.7825، وكنت تريد تقريب هذه القيمة إلى منزلتين عشريتين، فيمكنك استخدام الصيغة التالية:',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوب. الرقم الذي تريد تقريبه.' },
            numDigits: { name: 'num_digits', detail: 'مطلوب. عدد الأرقام التي تريد تقريب الوسيطة number إليها.' },
        },
    },
    ROUNDBANK: {
        description: 'تقرّب رقماً باستخدام أسلوب التقريب المصرفي.',
        abstract: 'تقرّب رقماً باستخدام أسلوب التقريب المصرفي.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'الرقم الذي تريد تقريبه باستخدام التقريب المصرفي.' },
            numDigits: { name: 'num_digits', detail: 'عدد المنازل التي تريد التقريب إليها باستخدام التقريب المصرفي.' },
        },
    },
    ROUNDDOWN: {
        description: 'تقرّب هذه الدالة رقماً إلى الأدنى، باتجاه الصفر.',
        abstract: 'تقرّب هذه الدالة رقماً إلى الأدنى، باتجاه الصفر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي تريد تقريبه إلى الأدنى.' },
            numDigits: { name: 'num_digits', detail: 'مطلوب. عدد الأرقام التي تريد تقريب الرقم إليها.' },
        },
    },
    ROUNDUP: {
        description: 'تقرّب هذه الدالة رقماً إلى الأعلى، بعيداً عن 0 (صفر).',
        abstract: 'تقرّب هذه الدالة رقماً إلى الأعلى، بعيداً عن 0 (صفر).',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي تريد تقريبه إلى الأعلى.' },
            numDigits: { name: 'num_digits', detail: 'مطلوب. عدد الأرقام التي تريد تقريب الرقم إليها.' },
        },
    },
    SEC: {
        description: 'تُرجع هذه الدالة قاطع المنحنى لزاوية.',
        abstract: 'تُرجع هذه الدالة قاطع المنحنى لزاوية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'الزاوية بالراديان التي تريد حساب قاطعها.' },
        },
    },
    SECH: {
        description: 'تُرجع هذه الدالة قاطع المنحنى الزائدي لزاوية.',
        abstract: 'تُرجع هذه الدالة قاطع المنحنى الزائدي لزاوية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'الزاوية بالراديان التي تريد حساب قاطعها الزائدي.' },
        },
    },
    SERIESSUM: {
        description: 'يمكن مقاربة عدد من الدالات بواسطة توسيع سلسلة أس.',
        abstract: 'يمكن مقاربة عدد من الدالات بواسطة توسيع سلسلة أس.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'مطلوبة. قيمة إدخال سلسلة الأس.' },
            n: { name: 'n', detail: 'مطلوبة. الأس الأولي الذي تريد رفع x إليه.' },
            m: { name: 'm', detail: 'مطلوبة. الخطوة التي يتم اتخاذها لزيادة n لكل طرف في السلسلة.' },
            coefficients: { name: 'coefficients', detail: 'مطلوب. مجموعة من المعاملات التي يتم ضرب كل أس لاحق لـ x بها. يحدد عدد القيم في الوسيطة coefficients عدد الأطراف في سلسلة الأس. على سبيل المثال، إذا كان هناك ثلاث قيم في الوسيطة coefficients، فسيكون هناك ثلاثة أطراف في سلسلة الأس.' },
        },
    },
    SEQUENCE: {
        description: 'أنشأنا في المثال التالي صفيفاً بطول 4 صفوف مضروباً في 5 أعمدة واسع مع =SEQUENCE(4,5) .',
        abstract: 'أنشأنا في المثال التالي صفيفاً بطول 4 صفوف مضروباً في 5 أعمدة واسع مع =SEQUENCE(4,5) .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'عدد الصفوف التي سيتم إرجاعها' },
            columns: { name: 'columns', detail: 'عدد الأعمدة التي سيتم إرجاعها' },
            start: { name: 'start', detail: 'الرقم الأول في التسلسل' },
            step: { name: 'step', detail: 'مقدار الزيادة لكل قيمة لاحقة في الصفيف' },
        },
    },
    SIGN: {
        description: 'تحدد هذه الدالة علامة الرقم. تُرجع هذه الدالة 1 إذا كان الرقم موجباً، وصفراً (0) إذا كان الرقم 0، و 1- إذا كان الرقم سالباً.',
        abstract: 'تحدد هذه الدالة علامة الرقم. تُرجع هذه الدالة 1 إذا كان الرقم موجباً، وصفراً (0) إذا كان الرقم 0، و 1- إذا كان الرقم سالباً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي.' },
        },
    },
    SIN: {
        description: 'تُرجع هذه الدالة جيب الزاوية المحددة.',
        abstract: 'تُرجع هذه الدالة جيب الزاوية المحددة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الزاوية المحسوبة بالتقدير الدائري التي تريد جيب الزاوية الخاص بها.' },
        },
    },
    SINH: {
        description: 'تُرجع هذه الدالة جيب الزاوية للقطع الزائد لأحد الأرقام.',
        abstract: 'تُرجع هذه الدالة جيب الزاوية للقطع الزائد لأحد الأرقام.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي.' },
        },
    },
    SQRT: {
        description: 'إرجاع جذر تربيعي موجب.',
        abstract: 'إرجاع جذر تربيعي موجب.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي تريد حساب جذره التربيعي.' },
        },
    },
    SQRTPI: {
        description: 'إرجاع الجذر التربيعي لـ (number * pi).',
        abstract: 'إرجاع الجذر التربيعي لـ (number * pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي يتم ضرب pi به.' },
        },
    },
    SUBTOTAL: {
        description: 'تُرجع هذه الدالة إجمالي فرعي في قائمة أو قاعدة بيانات. بوجه عام، من السهل إنشاء قائمة تتضمّن إجماليات فرعية باستخدام الأمر إجمالي فرعي في المجموعة مخطط تفصيلي ضمن علامة التبويب بيانات . بعد إنشاء قائمة الإجماليات الفرعية، يمكنك تعديلها بتحرير الدالة SUBTOTAL.',
        abstract: 'تُرجع هذه الدالة إجمالي فرعي في قائمة أو قاعدة بيانات. بوجه عام، من السهل إنشاء قائمة تتضمّن إجماليات فرعية باستخدام الأمر إجمالي فرعي في المجموعة مخطط تفصيلي ضمن علامة التبويب بيانات . بعد إنشاء قائمة الإجماليات الفرعية، يمكنك تعديلها بتحرير الدالة SUBTOTAL.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'مطلوب. وهي أحد الأرقام من 1 إلى 11 أو من 101 إلى 111 الذي يحدد الدالة المطلوب استخدامها للحصول على الإجمالي الفرعي. يقوم الرقم من 1 إلى 11 بتضمين الصفوف المخفية يدوياً، بينما يقوم الرقم من 101 إلى 111 باستبعادها؛ يتم دوماً استبعاد الخلايا المُصفاة.' },
            ref1: { name: 'ref1', detail: 'مطلوب. النطاق أو المرجع المسمى الأول الذي تريد حساب الإجمالي الفرعي له.' },
            ref2: { name: 'ref2', detail: 'الاختياري. النطاقات أو المراجع المسماة من 2 إلى 254 التي تريد حساب الإجمالي الفرعي لها.' },
        },
    },
    SUM: {
        description: 'تضيف الدالة SUM قيما. يمكنك إضافة قيم فردية أو مراجع خلايا أو نطاقات أو خليط من الثلاثة.',
        abstract: 'تضيف الدالة SUM قيما. يمكنك إضافة قيم فردية أو مراجع خلايا أو نطاقات أو خليط من الثلاثة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'الرقم الأول الذي تريد جمعه. يمكن أن يكون الرقم مثل 4 أو مرجع خلية مثل B6 أو نطاق خلايا مثل B2:B8.' },
            number2: { name: 'Number 2', detail: 'هذا هو الرقم الثاني الذي تريد جمعه. يمكنك تحديد ما يصل إلى 255 رقماً بهذه الطريقة.' },
        },
    },
    SUMIF: {
        description: 'يمكنك استخدام الدالة SUMIF لجمع القيم في نطاق يفي بالمعايير التي تحددها. على سبيل المثال، بفرض أن عمود يتضمن أرقاماً، وتريد جمع القيم الأكبر من 5 فقط. يمكنك استخدام الصيغة التالية: =SUMIF(B2:B25,">5")',
        abstract: 'يمكنك استخدام الدالة SUMIF لجمع القيم في نطاق يفي بالمعايير التي تحددها. على سبيل المثال، بفرض أن عمود يتضمن أرقاماً، وتريد جمع القيم الأكبر من 5 فقط. يمكنك استخدام الصيغة التالية: =SUMIF(B2:B25,">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'مطلوب. نطاق الخلايا التي تريد تقييمها حسب المعايير. يجب أن تكون الخلايا في كل نطاق أرقاما أو أسماء أو صفائف أو مراجع تحتوي على أرقام. ويتم تجاهل القيم الفارغة والنصية. قد يحتوي النطاق المحدد على تواريخ بتنسيق Excel القياسي (الأمثلة أدناه).' },
            criteria: { name: 'criteria', detail: 'مطلوب. المعايير الموجودة على شكل رقم أو تعبير أو مرجع خلية أو نص أو دالة تحدد الخلايا التي سيتم جمعها. يمكن تضمين أحرف البدل - علامة استفهام (؟) لمطابقة أي حرف واحد، علامة نجمية (*) لمطابقة أي تسلسل من الأحرف. إذا كنت تريد العثور على علامة استفهام أو علامة نجمية فعلية، فاكتب tilde ( ~ ) يسبق الحرف. على سبيل المثال، يمكن التعبير عن المعايير على أنها 32 أو ">32" أو B5 أو "3؟" أو "apple*" أو "*~?"" أو TODAY(). هام يجب تضمين أي معيار نصي أو أي معايير تحتوي على رموز منطقية أو رياضية بين علامتي اقتباس مزدوجتين ( " ). إذا كانت المعايير رقمية، فلا حاجة إلى وضع علامتي اقتباس مزدوجتين.' },
            sumRange: { name: 'sum_range', detail: 'الاختياري. الخلايا الفعلية المراد إضافتها، إذا كنت تريد إضافة خلايا أخرى غير تلك المحددة في وسيطة النطاق . إذا تم حذف الوسيطة sum_range ، فسيضيف Excel الخلايا المحددة في وسيطة النطاق (الخلايا نفسها التي يتم تطبيق المعايير عليها). يجب أن يكون Sum_range بنفس حجم النطاق وشكله. إذا لم يكن كذلك، فقد يعاني الأداء، وستحصل الصيغة على نطاق من الخلايا يبدأ بالخلية الأولى في sum_range ولكن له نفس أبعاد النطاق . على سبيل المثال: نطاق Sum_range الخلايا الفعلية التي تم جمعها A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'تعمل الدالة SUMIFS، وهي إحدى الدالات الرياضية والمثلثية ، على جمع كل وسيطاتها التي تفي بمعايير متعددة. على سبيل المثال، يمكنك استخدام SUMIFS لجمع عدد بائعي التجزئة في البلد الذين (1) يقيمون ضمن رمز بريدي واحد و(2) الذين تتجاوز أرباحهم قيمة الريال السعودي المحددة.',
        abstract: 'تعمل الدالة SUMIFS، وهي إحدى الدالات الرياضية والمثلثية ، على جمع كل وسيطاتها التي تفي بمعايير متعددة. على سبيل المثال، يمكنك استخدام SUMIFS لجمع عدد بائعي التجزئة في البلد الذين (1) يقيمون ضمن رمز بريدي واحد و(2) الذين تتجاوز أرباحهم قيمة الريال السعودي المحددة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'نطاق الخلايا المطلوب جمعها.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'النطاق الذي يتم اختباره باستخدام Criteria1 . Criteria_range1 و Criteria1 إعداد زوج بحث حيث يتم البحث عن نطاق لمعايير محددة. بمجرد العثور على العناصر في النطاق، تتم إضافة القيم المقابلة لها في Sum_range .' },
            criteria1: { name: 'criteria1', detail: 'المعايير التي تحدد الخلايا الموجودة في Criteria_range1 التي ستتم إضافتها. على سبيل المثال، يمكن إدخال المعايير على أنها 32 أو ">32" أو B4 أو "تفاح" أو "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'النطاقات الإضافية والمعايير المقترنة بها. يمكنك إدخال ما يصل إلى 127 زوج من النطاقات/المعايير.' },
            criteria2: { name: 'criteria2', detail: 'النطاقات الإضافية والمعايير المقترنة بها. يمكنك إدخال ما يصل إلى 127 زوج من النطاقات/المعايير.' },
        },
    },
    SUMPRODUCT: {
        description: 'ترجع الدالة SUMPRODUCT مجموع منتجات النطاقات أو الصفائف المقابلة. العملية الافتراضية هي الضرب، ولكن من الممكن أيضا الجمع والطرح والقسمة.',
        abstract: 'ترجع الدالة SUMPRODUCT مجموع منتجات النطاقات أو الصفائف المقابلة. العملية الافتراضية هي الضرب، ولكن من الممكن أيضا الجمع والطرح والقسمة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'وسيطة الصفيف الأول التي ترغب في ضرب مكوناتها ثم جمعها.' },
            array2: { name: 'array', detail: 'وسيطات الصفيف من 2 إلى 255 التي ترغب في ضرب مكوناتها ثم جمعها.' },
        },
    },
    SUMSQ: {
        description: 'تُرجع هذه الدالة مجموع مربعات الوسيطات.',
        abstract: 'تُرجع هذه الدالة مجموع مربعات الوسيطات.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Number1 مطلوب. الأرقام اللاحقة اختيارية. يمكن أن يكون هناك ما يصل إلى 255 وسيطة تريد جمع المربعات لها.' },
            number2: { name: 'number2', detail: 'Number1 مطلوب. الأرقام اللاحقة اختيارية. يمكن أن يكون هناك ما يصل إلى 255 وسيطة تريد جمع المربعات لها.' },
        },
    },
    SUMX2MY2: {
        description: 'ترجع دالة Excel هذه مجموع الفرق بين مربعات القيم المقابلة في صفيفين.',
        abstract: 'ترجع دالة Excel هذه مجموع الفرق بين مربعات القيم المقابلة في صفيفين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'مطلوب. الصفيف أو نطاق القيم الأول.' },
            arrayY: { name: 'array_y', detail: 'مطلوب. الصفيف أو نطاق القيم الثاني.' },
        },
    },
    SUMX2PY2: {
        description: 'تُرجع هذه الدالة المجموع الخاص بمجموع مربعات قيم مناظرة في صفيفين. ويُعد المجموع الخاص بمجموع المربعات تعبيراً شائعاً في العديد من الحسابات الإحصائية.',
        abstract: 'تُرجع هذه الدالة المجموع الخاص بمجموع مربعات قيم مناظرة في صفيفين. ويُعد المجموع الخاص بمجموع المربعات تعبيراً شائعاً في العديد من الحسابات الإحصائية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'مطلوب. الصفيف أو نطاق القيم الأول.' },
            arrayY: { name: 'array_y', detail: 'مطلوب. الصفيف أو نطاق القيم الثاني.' },
        },
    },
    SUMXMY2: {
        description: 'ترجع الدالة SUMXMY2 مجموع مربعات الاختلافات للقيم المقابلة في صفيفين.',
        abstract: 'ترجع الدالة SUMXMY2 مجموع مربعات الاختلافات للقيم المقابلة في صفيفين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'الصفيف الأول أو نطاق القيم. مطلوبة.' },
            arrayY: { name: 'array_y', detail: 'الصفيف الثاني أو نطاق القيم. مطلوبة.' },
        },
    },
    TAN: {
        description: 'تُرجع هذه الدالة ظل الزاوية المعيّنة.',
        abstract: 'تُرجع هذه الدالة ظل الزاوية المعيّنة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الزاوية بالتقدير الدائري التي تريد ظلها.' },
        },
    },
    TANH: {
        description: 'إرجاع ظل الزاوية الزائدي لأحد الأرقام.',
        abstract: 'إرجاع ظل الزاوية الزائدي لأحد الأرقام.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. أي رقم حقيقي.' },
        },
    },
    TRUNC: {
        description: 'تقوم دالات TRUNC باقتطاع رقم إلى عدد صحيح عن طريق إزالة الجزء الكسري من الرقم.',
        abstract: 'تقوم دالات TRUNC باقتطاع رقم إلى عدد صحيح عن طريق إزالة الجزء الكسري من الرقم.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الذي ترغب في اقتطاعه.' },
            numDigits: { name: 'num_digits', detail: 'الاختياري. رقم يحدد دقة الاقتطاع. القيمة الافتراضية لـ num_digits هي 0 (صفر).' },
        },
    },
};

export default locale;
