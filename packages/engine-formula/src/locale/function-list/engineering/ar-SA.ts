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
    BESSELI: {
        description: 'تُرجع الدالة Bessel المُعدلة، والتي تكافئ الدالة Bessel التي يتم تقييمها إلى وسيطات تخيلية تماماً.',
        abstract: 'تُرجع الدالة Bessel المُعدلة، والتي تكافئ الدالة Bessel التي يتم تقييمها إلى وسيطات تخيلية تماماً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'مطلوبة. القيمة التي يتم تقييم الدالة إليها.' },
            n: { name: 'N', detail: 'مطلوبة. وهي ترتيب الدالة Bessel. إذا لم تكن n عدداً صحيحاً، فإنه يتم اقتطاعها.' },
        },
    },
    BESSELJ: {
        description: 'تُرجع الدالة Bessel.',
        abstract: 'تُرجع الدالة Bessel.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'مطلوبة. القيمة التي يتم تقييم الدالة إليها.' },
            n: { name: 'N', detail: 'مطلوبة. وهي ترتيب الدالة Bessel. إذا لم تكن n عدداً صحيحاً، فإنه يتم اقتطاعها.' },
        },
    },
    BESSELK: {
        description: 'تُرجع الدالة Bessel المُعدلة، والتي تكافئ دالات Bessel التي يتم تقييمها إلى وسيطات تخيلية تماماً.',
        abstract: 'تُرجع الدالة Bessel المُعدلة، والتي تكافئ دالات Bessel التي يتم تقييمها إلى وسيطات تخيلية تماماً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'مطلوبة. القيمة التي يتم تقييم الدالة إليها.' },
            n: { name: 'N', detail: 'مطلوبة. وهي ترتيب الدالة. إذا لم تكن n عدداً صحيحاً، فإنه يتم اقتطاعها.' },
        },
    },
    BESSELY: {
        description: 'تُرجع الدالة Bessel، التي تسمى أيضاً الدالة Weber أو الدالة Neumann.',
        abstract: 'تُرجع الدالة Bessel، التي تسمى أيضاً الدالة Weber أو الدالة Neumann.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'مطلوبة. القيمة التي يتم تقييم الدالة إليها.' },
            n: { name: 'N', detail: 'مطلوبة. وهي ترتيب الدالة. إذا لم تكن n عدداً صحيحاً، فإنه يتم اقتطاعها.' },
        },
    },
    BIN2DEC: {
        description: 'تحويل رقم ثنائي إلى رقم عشري.',
        abstract: 'تحويل رقم ثنائي إلى رقم عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي الرقم الثنائي الذي ترغب في تحويله. لا يمكن أن تحتوي الوسيطة Number على أكثر من 10 أحرف (10 بت). إن بت العلامة هو بت الرقم الأكثر أهمية. أما وحدات البت التسع المتبقية، فهي تشير إلى وحدات بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
        },
    },
    BIN2HEX: {
        description: 'تقوم بتحويل رقم ثنائي إلى رقم سداسي عشري.',
        abstract: 'تقوم بتحويل رقم ثنائي إلى رقم سداسي عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي الرقم الثنائي الذي ترغب في تحويله. لا يمكن أن تحتوي الوسيطة Number على أكثر من 10 أحرف (10 بت). إن بت العلامة هو بت الرقم الأكثر أهمية. أما وحدات البت التسع المتبقية، فهي تشير إلى وحدات بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. وهي عدد الأحرف المراد استخدامها. إذا تم إهمال قيمة places، فإن BIN2HEX تستخدم الحد الأدنى لعدد الأحرف الضرورية. ويفيد تعيين قيمة places في ترك مساحات كافية للقيم المرجعة ذات الأصفار البادئة (0).' },
        },
    },
    BIN2OCT: {
        description: 'تقوم بتحويل رقم ثنائي إلى رقم ثماني.',
        abstract: 'تقوم بتحويل رقم ثنائي إلى رقم ثماني.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. وهي الرقم الثنائي الذي ترغب في تحويله. لا يمكن أن تحتوي الوسيطة Number على أكثر من 10 أحرف (10 بت). إن بت العلامة هو بت الرقم الأكثر أهمية. أما وحدات البت التسع المتبقية، فهي تشير إلى وحدات بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. وهي عدد الأحرف المراد استخدامها. إذا تم إهمال قيمة places، فإن BIN2OCT تستخدم الحد الأدنى لعدد الأحرف الضرورية. ويفيد تعيين قيمة places في ترك مساحات كافية للقيم المرجعة ذات الأصفار البادئة (0).' },
        },
    },
    BITAND: {
        description: 'ترجع البت And لرقمين.',
        abstract: 'ترجع البت And لرقمين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'مطلوب. يجب أن تكون في شكل عشري وأكبر من أو تساوي 0.' },
            number2: { name: 'number2', detail: 'مطلوب. يجب أن تكون في شكل عشري وأكبر من أو تساوي 0.' },
        },
    },
    BITLSHIFT: {
        description: 'تُرجع رقماً تمت إزاحته إلى اليسار بمقدار العدد المحدد من أرقام البت.',
        abstract: 'تُرجع رقماً تمت إزاحته إلى اليسار بمقدار العدد المحدد من أرقام البت.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. يجب أن يكون الرقم عددا صحيحا أكبر من أو يساوي 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'مطلوب. يجب أن يكون Shift_amount عددا صحيحا.' },
        },
    },
    BITOR: {
        description: 'تُرجع هذه الدالة البت \'OR\' لرقمين.',
        abstract: 'تُرجع هذه الدالة البت \'OR\' لرقمين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'مطلوب. يجب أن تكون في شكل عشري وأكبر من أو تساوي 0.' },
            number2: { name: 'number2', detail: 'مطلوب. يجب أن تكون في شكل عشري وأكبر من أو تساوي 0.' },
        },
    },
    BITRSHIFT: {
        description: 'تُرجع هذه الدالة رقماً تمت إزاحته إلى اليمين بمقدار عدد محدد من البت.',
        abstract: 'تُرجع هذه الدالة رقماً تمت إزاحته إلى اليمين بمقدار عدد محدد من البت.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. يجب أن يكون عددا صحيحا أكبر من أو يساوي 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'مطلوب. يجب أن يكون عددا صحيحا.' },
        },
    },
    BITXOR: {
        description: 'تُرجع هذه الدالة البت \'XOR\' لرقمين.',
        abstract: 'تُرجع هذه الدالة البت \'XOR\' لرقمين.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'مطلوب. يجب أن يكون أكبر من أو يساوي 0.' },
            number2: { name: 'number2', detail: 'مطلوب. يجب أن يكون أكبر من أو يساوي 0.' },
        },
    },
    COMPLEX: {
        description: 'تحويل المعاملات الحقيقية والتخيلية إلى عدد مركب بالشكل x + yi أو x + yj.',
        abstract: 'تحويل المعاملات الحقيقية والتخيلية إلى عدد مركب بالشكل x + yi أو x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'مطلوب. المعامل الحقيقي للعدد المركب.' },
            iNum: { name: 'i_num', detail: 'مطلوب. المعامل التخيلي للعدد المركب.' },
            suffix: { name: 'suffix', detail: 'الاختياري. لاحقة المكون التخيلي للعدد المركب. إذا تم حذف الوسيطة Suffix، فيتم افتراض أنها "i".' },
        },
    },
    CONVERT: {
        description: 'تقوم بتحويل رقم من أحد أنظمة القياس إلى نظام آخر. على سبيل المثال، بإمكان CONVERT ترجمة جدول للمسافات بالميل إلى جدول للمسافات بالكيلومتر.',
        abstract: 'تقوم بتحويل رقم من أحد أنظمة القياس إلى نظام آخر. على سبيل المثال، بإمكان CONVERT ترجمة جدول للمسافات بالميل إلى جدول للمسافات بالكيلومتر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'القيمة بوحدات from_unit المراد تحويلها.' },
            fromUnit: { name: 'from_unit', detail: 'وحدات القيمة number.' },
            toUnit: { name: 'to_unit', detail: 'وحدات النتيجة.' },
        },
    },
    DEC2BIN: {
        description: 'تحويل رقم عشري إلى رقم ثنائي.',
        abstract: 'تحويل رقم عشري إلى رقم ثنائي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم العشري الصحيح الذي ترغب في تحويله. إذا كان الرقم سالباً، فيتم تجاهل قيم المنازل الصحيحة وتُرجع الدالة DEC2BIN رقماً ثنائياً يتألف من 10 أحرف (10 بت) حيث تكون بت الإشارة وحدة البت الأكثر أهمية. وتشير وحدات البت التسع المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. عدد الأحرف التي سيتم استخدامها. في حالة حذف المنازل، تستخدم DEC2BIN أقل عدد ممكن من الأحرف الضرورية. وتُعد الوسيطة Places مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    DEC2HEX: {
        description: 'تحويل رقم عشري إلى رقم سداسي عشري.',
        abstract: 'تحويل رقم عشري إلى رقم سداسي عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم العشري الصحيح الذي ترغب في تحويله. إذا كان الرقم سالباً، فيتم تجاهل المنازل العشرية وترجع DEC2HEX رقماً سداسياً عشرياً يتألف من 10 أحرف (40 بت) حيث يكون بت الإشارة وحدة البت الأكثر أهمية. وتشير وحدات البت التسع والثلاثون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. عدد الأحرف التي سيتم استخدامها. في حالة حذف المنازل، تستخدم DEC2HEX أقل عدد ممكن من الأحرف الضرورية. وتُعد وسيطة المنازل مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    DEC2OCT: {
        description: 'تحويل رقم عشري إلى رقم ثماني.',
        abstract: 'تحويل رقم عشري إلى رقم ثماني.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم العشري الصحيح الذي ترغب في تحويله. إذا كان الرقم سالباً، فيتم تجاهل المنازل العشرية وترجع DEC2OCT رقماً ثمانياً يتألف من 10 أحرف (30 بت) حيث يكون بت الإشارة وحدة البت الأكثر أهمية. وتشير وحدات البت التسع والعشرون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. عدد الأحرف التي سيتم استخدامها. في حالة حذف المنازل، تستخدم DEC2OCT أقل عدد ممكن من الأحرف الضرورية. وتُعد الوسيطة Places مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    DELTA: {
        description: 'اختبار المساواة بين قيمتين. تُرجع هذه الدالة 1 إذا كانت قيمة number1 = ‏number2، وتُرجع 0 خلاف ذلك. استخدم هذه الدالة لتصفية مجموعة من القيم. على سبيل المثال، يمكنك حساب عدد الأزواج المتساوية عبر جمع دالات DELTA متعددة. تعرف هذه الدالة أيضاً باسم Kronecker Delta.',
        abstract: 'اختبار المساواة بين قيمتين. تُرجع هذه الدالة 1 إذا كانت قيمة number1 = ‏number2، وتُرجع 0 خلاف ذلك. استخدم هذه الدالة لتصفية مجموعة من القيم. على سبيل المثال، يمكنك حساب عدد الأزواج المتساوية عبر جمع دالات DELTA متعددة. تعرف هذه الدالة أيضاً باسم Kronecker Delta.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'مطلوب. الرقم الأول.' },
            number2: { name: 'number2', detail: 'الاختياري. الرقم الثاني. إذا تم حذف الوسيطة number2، فسيتم افتراض أن قيمتها تساوي الصفر.' },
        },
    },
    ERF: {
        description: 'تُرجع دالة الخطأ المتكاملة بين الحد_الأدنى والحد_الأعلى.',
        abstract: 'تُرجع دالة الخطأ المتكاملة بين الحد_الأدنى والحد_الأعلى.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'مطلوب. الحد الأدنى لتكامل ERF.' },
            upperLimit: { name: 'upper_limit', detail: 'الاختياري. الحد الأعلى لتكامل ERF. في حال حذف هذه الوسيطة، تحقق الدالة ERF تكاملاً بين الصفر والحد_الأدنى.' },
        },
    },
    ERF_PRECISE: {
        description: 'تُرجع دالة الخطأ.',
        abstract: 'تُرجع دالة الخطأ.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'مطلوبة. الحد الأدنى لتكامل ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'تُرجع دالة ERF المتممة المتكاملة بين x وما لا نهاية.',
        abstract: 'تُرجع دالة ERF المتممة المتكاملة بين x وما لا نهاية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'مطلوبة. الحد الأدنى لتكامل ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'تُرجع دالة ERF المتممة المتكاملة بين x وما لا نهاية.',
        abstract: 'تُرجع دالة ERF المتممة المتكاملة بين x وما لا نهاية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'مطلوبة. الحد الأدنى لتكامل ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'تُرجع هذه الدالة 1 إذا كان الرقم ≥ الخطوة، وتُرجع 0 (صفر) خلاف ذلك. استخدم هذه الدالة لتصفية مجموعة من القيم. على سبيل المثال، يمكنك عبر جمع عدد من دالات GESTEP حساب عدد القيم التي تتجاوز العتبة.',
        abstract: 'تُرجع هذه الدالة 1 إذا كان الرقم ≥ الخطوة، وتُرجع 0 (صفر) خلاف ذلك. استخدم هذه الدالة لتصفية مجموعة من القيم. على سبيل المثال، يمكنك عبر جمع عدد من دالات GESTEP حساب عدد القيم التي تتجاوز العتبة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. القيمة المراد اختبارها مقارنة بالخطوة.' },
            step: { name: 'step', detail: 'الاختياري. قيمة العتبة. إذا حذفت قيمة الخطوة، فتستخدم GESTEP الصفر.' },
        },
    },
    HEX2BIN: {
        description: 'تحويل رقم سداسي عشري إلى رقم ثنائي.',
        abstract: 'تحويل رقم سداسي عشري إلى رقم ثنائي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم السداسي العشري الذي ترغب في تحويله. لا يمكن أن يحتوي الرقم على أكثر من 10 أحرف. إن بت الرقم الأكثر أهمية هو بت الإشارة (البت الأربعون من اليسار). وتشير وحدات البت التسع المتبقية إلى بت الحجم. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'اختياري. عدد الأحرف التي سيتم استخدامها. في حال حذف المنازل، تستخدم الدالة HEX2BIN أقل عدد ممكن من الأحرف الضرورية. وتُعد وسيطة عدد المنازل مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    HEX2DEC: {
        description: 'تحويل رقم سداسي عشري إلى رقم عشري.',
        abstract: 'تحويل رقم سداسي عشري إلى رقم عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم السداسي العشري الذي ترغب في تحويله. لا يمكن أن يحتوي الرقم على أكثر من 10 أحرف (40 بت). إن بت الرقم الأكثر أهمية هو بت الإشارة. وتشير وحدات البت التسع والثلاثون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
        },
    },
    HEX2OCT: {
        description: 'تحويل رقم سداسي عشري إلى رقم ثماني.',
        abstract: 'تحويل رقم سداسي عشري إلى رقم ثماني.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم السداسي العشري الذي ترغب في تحويله. لا يمكن أن يحتوي الرقم على أكثر من 10 أحرف. إن بت الرقم الأكثر أهمية هو بت الإشارة. وتشير وحدات البت التسع والثلاثون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'اختياري. عدد الأحرف التي سيتم استخدامها. وفي حالة حذف المنازل، تستخدم الدالة HEX2OCT أقل عدد ممكن من الأحرف الضرورية. وتُعد وسيطة المنازل مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    IMABS: {
        description: 'إرجاع القيمة المطلقة (المُعامل) لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع القيمة المطلقة (المُعامل) لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب القيمة المطلقة له.' },
        },
    },
    IMAGINARY: {
        description: 'إرجاع المُعامل التخيلي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع المُعامل التخيلي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب المُعامل التخيلي له.' },
        },
    },
    IMARGUMENT: {
        description: 'ترجع الوسيطة (theta)، وهي زاوية يتم التعبير عنها بالتقدير الدائري، بحيث:',
        abstract: 'ترجع الوسيطة (theta)، وهي زاوية يتم التعبير عنها بالتقدير الدائري، بحيث:',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. رقم مركب تريد الوسيطة له .' },
        },
    },
    IMCONJUGATE: {
        description: 'إرجاع المرافق المركب لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع المرافق المركب لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب المرافق له.' },
        },
    },
    IMCOS: {
        description: 'إرجاع جيب تمام عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع جيب تمام عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب جيب التمام له.' },
        },
    },
    IMCOSH: {
        description: 'تُرجع هذه الدالة جيب التمام الزائدي لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة جيب التمام الزائدي لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد جيب التمام الزائدي له.' },
        },
    },
    IMCOT: {
        description: 'تُرجع هذه الدالة ظل التمام لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة ظل التمام لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'عدد مركب تريد حساب ظل التمام له.' },
        },
    },
    IMCOTH: {
        description: 'ترجع الدالة IMCOTH ظل التمام الزائدي للعدد المركب المحدد. على سبيل المثال، ترجع للعدد المركب "x+yi" القيمة "coth(x+yi)".',
        abstract: 'ترجع الدالة IMCOTH ظل التمام الزائدي للعدد المركب المحدد. على سبيل المثال، ترجع للعدد المركب "x+yi" القيمة "coth(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=ar',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'العدد المركب الذي تريد حساب ظل التمام الزائدي له. يمكن أن يكون ناتج الدالة COMPLEX أو عدداً حقيقياً يُفسَّر كعدد مركب جزؤه التخيلي يساوي 0، أو سلسلة بالتنسيق “x+yi” حيث x وy رقميان.' },
        },
    },
    IMCSC: {
        description: 'تُرجع هذه الدالة قاطع التمام لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة قاطع التمام لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد أن يكون آمنا له.' },
        },
    },
    IMCSCH: {
        description: 'إرجاع التمام الزائدي لعدد مركب بتنسيق نص x+yi أو x+yj.',
        abstract: 'إرجاع التمام الزائدي لعدد مركب بتنسيق نص x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد أن يكون آمنا للفرط.' },
        },
    },
    IMDIV: {
        description: 'إرجاع حاصل قسمة عددين مركبين بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع حاصل قسمة عددين مركبين بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'مطلوب. الكسر المركب أو المقسوم المركب.' },
            inumber2: { name: 'inumber2', detail: 'مطلوب. المقام المركب أو عامل القسمة المركب.' },
        },
    },
    IMEXP: {
        description: 'إرجاع أس عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع أس عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب الأس له.' },
        },
    },
    IMLN: {
        description: 'إرجاع اللوغاريتم الطبيعي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع اللوغاريتم الطبيعي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب اللوغاريتم الطبيعي له.' },
        },
    },
    IMLOG: {
        description: 'ترجع الدالة IMLOG لوغاريتم عدد مركب للأساس المحدد.',
        abstract: 'ترجع الدالة IMLOG لوغاريتم عدد مركب للأساس المحدد.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=ar',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'قيمة الإدخال لدالة اللوغاريتم. يمكن كتابة العدد كعدد عادي، مثل 1، ليُفسَّر كعدد حقيقي، أو كنص بين علامتي اقتباس لتحديد المعاملين الحقيقي والتخيلي.' },
            base: { name: 'base', detail: 'الأساس المستخدم لحساب اللوغاريتم. يجب أن يكون عدداً حقيقياً موجباً.' },
        },
    },
    IMLOG10: {
        description: 'إرجاع اللوغاريتم المشترك (الأساس 10) لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع اللوغاريتم المشترك (الأساس 10) لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب الذي تريد إيجاد اللوغاريتم المشترك الخاص به.' },
        },
    },
    IMLOG2: {
        description: 'إرجاع اللوغاريتم ذي الأساس 2 لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع اللوغاريتم ذي الأساس 2 لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب اللوغاريتم ذي الأساس 2 له.' },
        },
    },
    IMPOWER: {
        description: 'إرجاع عدد مركب بالتنسيق النصي x + yi أو x + yj مرفوعاً إلى أس.',
        abstract: 'إرجاع عدد مركب بالتنسيق النصي x + yi أو x + yj مرفوعاً إلى أس.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد رفعه إلى أس.' },
            number: { name: 'number', detail: 'مطلوبة. الأس المراد رفع العدد المركب إليه.' },
        },
    },
    IMPRODUCT: {
        description: 'إرجاع ناتج من 1 إلى 255 عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع ناتج من 1 إلى 255 عدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'من 1 إلى 255 عدداً مركباً لضربها.' },
            inumber2: { name: 'inumber2', detail: 'من 1 إلى 255 عدداً مركباً لضربها.' },
        },
    },
    IMREAL: {
        description: 'إرجاع المُعامل الحقيقي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع المُعامل الحقيقي لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب المُعامل الحقيقي له.' },
        },
    },
    IMSEC: {
        description: 'تُرجع هذه الدالة قاطع المنحنى لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة قاطع المنحنى لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد من أجله أن يكون قاطعا.' },
        },
    },
    IMSECH: {
        description: 'تُرجع هذه الدالة قاطع المنحنى الزائدي لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة قاطع المنحنى الزائدي لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد أن يكون قاطع الثواني الزائدي له.' },
        },
    },
    IMSIN: {
        description: 'إرجاع جيب الزاوية لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع جيب الزاوية لعدد مركب بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. العدد المركب المراد حساب جيب الزاوية له.' },
        },
    },
    IMSINH: {
        description: 'ترجع الدالة IMSINH جيب الزاوية الزائدي لعدد مركب بتنسيق نص x+yi أو x+yj.',
        abstract: 'ترجع الدالة IMSINH جيب الزاوية الزائدي لعدد مركب بتنسيق نص x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد جيب الزاوية الزائدي له.' },
        },
    },
    IMSQRT: {
        description: 'ترجع الجذر التربيعي لعدد مركب.',
        abstract: 'ترجع الجذر التربيعي لعدد مركب.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'عدد مركب تريد حساب جذره التربيعي.' },
        },
    },
    IMSUB: {
        description: 'إرجاع الفرق بين عددين مركبين بالتنسيق النصي x + yi or x + yj.',
        abstract: 'إرجاع الفرق بين عددين مركبين بالتنسيق النصي x + yi or x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'مطلوب. العدد المركب الذي يتم طرح inumber2 منه.' },
            inumber2: { name: 'inumber2', detail: 'مطلوب. العدد المركب الذي يتم طرحه من inumber1.' },
        },
    },
    IMSUM: {
        description: 'إرجاع مجموع عددين مركبين أو أكثر بالتنسيق النصي x + yi أو x + yj.',
        abstract: 'إرجاع مجموع عددين مركبين أو أكثر بالتنسيق النصي x + yi أو x + yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'من 1 إلى 255 عدداً مركباً لجمعها.' },
            inumber2: { name: 'inumber2', detail: 'من 1 إلى 255 عدداً مركباً لجمعها.' },
        },
    },
    IMTAN: {
        description: 'تُرجع هذه الدالة المماس لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        abstract: 'تُرجع هذه الدالة المماس لعدد مركب بالتنسيق النصي x+yi أو x+yj.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'مطلوب. عدد مركب تريد ظل الزاوية له.' },
        },
    },
    IMTANH: {
        description: 'ترجع الدالة IMTANH الظل الزائدي للعدد المركب المحدد. على سبيل المثال، ترجع للعدد المركب "x+yi" القيمة "tanh(x+yi)".',
        abstract: 'ترجع الدالة IMTANH الظل الزائدي للعدد المركب المحدد. على سبيل المثال، ترجع للعدد المركب "x+yi" القيمة "tanh(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=ar',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'العدد المركب الذي تريد حساب ظله الزائدي. يمكن أن يكون ناتج الدالة COMPLEX أو عدداً حقيقياً يُفسَّر كعدد مركب جزؤه التخيلي يساوي 0، أو سلسلة بالتنسيق “x+yi” حيث x وy رقميان.' },
        },
    },
    OCT2BIN: {
        description: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم ثنائي.',
        abstract: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم ثنائي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الثماني الذي ترغب في تحويله. يجب ألا تحتوي الوسيطة Number على أكثر من 10 أحرف. ويُعتبر بت الإشارة في الرقم أكثر وحدات البت أهمية. وتشير وحدات البت التسع والعشرون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. عدد الأحرف التي سيتم استخدامها. وفي حال تم حذف الوسيطة places، تستخدم الدالة OCT2BIN أقل عدد ممكن من الأحرف الضرورية. وتُعد الوسيطة places مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
    OCT2DEC: {
        description: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم عشري.',
        abstract: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم عشري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الثماني الذي ترغب في تحويله. يجب ألا يحتوي الرقم على أكثر من 10 أحرف ثمانية (30 بت). يُعتبر بت الإشارة أكثر وحدات البت أهمية في الرقم. وتشير وحدات البت التسع والعشرون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
        },
    },
    OCT2HEX: {
        description: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم سداسي عشري.',
        abstract: 'تقوم هذه الدالة بتحويل رقم ثماني إلى رقم سداسي عشري.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'مطلوبة. الرقم الثماني الذي ترغب في تحويله. يجب ألا يحتوي الرقم على أكثر من 10 أحرف ثمانية (30 بت). يُعتبر بت الإشارة أكثر وحدات البت أهمية في الرقم. وتشير وحدات البت التسع والعشرون المتبقية إلى بت المقدار. ويتم تمثيل الأرقام السالبة باستخدام علامة المتمم الثنائي.' },
            places: { name: 'places', detail: 'الاختياري. عدد الأحرف التي سيتم استخدامها. في حالة حذف الوسيطة places، تستخدم الدالة OCT2HEX أقل عدد ممكن من الأحرف الضرورية. وتُعد الوسيطة places مفيدة لترك مساحة للقيمة المرجعة بأصفار بادئة (0).' },
        },
    },
};

export default locale;
