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
    CELL: {
        description: 'تُرجع الدالة CELL معلومات حول تنسيق الخلية أو موقعها أو محتوياتها. على سبيل المثال، إذا أردت التحقق من أن إحدى الخلايا تحتوي على قيمة رقمية بدلاً من نص قبل إجراء عملية حسابية عليها، فبإمكانك استخدام الصيغة التالية:',
        abstract: 'تُرجع الدالة CELL معلومات حول تنسيق الخلية أو موقعها أو محتوياتها. على سبيل المثال، إذا أردت التحقق من أن إحدى الخلايا تحتوي على قيمة رقمية بدلاً من نص قبل إجراء عملية حسابية عليها، فبإمكانك استخدام الصيغة التالية:',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'وهي قيمة نصية تحدد نوع معلومات الخلية الذي تريد إرجاعه. تعرض القائمة التالية القيم المحتملة للوسيطة Info_type والنتائج المقابلة.' },
            reference: { name: 'reference', detail: 'وهي الخلية التي تريد معلومات حولها. إذا تم حذفها، يتم إرجاع المعلومات المحددة في الوسيطة info_type للخلية المحددة في وقت الحساب. إذا كانت الوسيطة المرجعية عبارة عن نطاق خلايا، فترجع الدالة CELL معلومات الخلية النشطة في النطاق المحدد. الهامه: على الرغم من أن المرجع من الناحية الفنية اختياري، إلا أنه يتم تشجيع تضمينه في الصيغة، إلا إذا كنت تفهم تأثير غيابه على نتيجة الصيغة وتريد تطبيق هذا التأثير. لا يؤدي حذف الوسيطة المرجعية إلى إنتاج معلومات حول خلية معينة بشكل موثوق، للأسباب التالية: في وضع الحساب التلقائي، عند تعديل خلية من قبل مستخدم، قد يتم تشغيل العملية الحسابية قبل تقدم التحديد أو بعده، اعتمادا على النظام الأساسي الذي تستخدمه ل Excel. على سبيل المثال، يقوم Excel for Windows حاليا بتشغيل الحساب قبل تغيير التحديد، ولكن Excel على الويب تشغيله بعد ذلك. عند Co-Authoring مع مستخدم آخر يقوم بإجراء تحرير، ستقوم هذه الدالة بالإبلاغ عن الخلية النشطة بدلا من المحرر. ستؤدي أي إعادة حساب، على سبيل المثال الضغط على F9، إلى إرجاع الدالة نتيجة جديدة على الرغم من عدم حدوث أي تحرير للخلية.' },
        },
    },
    ERROR_TYPE: {
        description: 'تُرجع هذه الدالة رقماً يطابق إحدى قيم الخطأ في Microsoft Excel أو تُرجع الخطأ ‎#N/A في حال عدم وجود أي خطأ. يمكنك استخدام الدالة ERROR.TYPE في دالة IF لاختبار قيمة خطأ وإرجاع سلسلة نصية، كرسالة مثلاً، بدلاً من قيمة الخطأ.',
        abstract: 'تُرجع هذه الدالة رقماً يطابق إحدى قيم الخطأ في Microsoft Excel أو تُرجع الخطأ ‎#N/A في حال عدم وجود أي خطأ. يمكنك استخدام الدالة ERROR.TYPE في دالة IF لاختبار قيمة خطأ وإرجاع سلسلة نصية، كرسالة مثلاً، بدلاً من قيمة الخطأ.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'مطلوب. قيمة الخطأ التي تريد البحث عن رقم التعريف الخاص بها. على الرغم من أن error_val قد تكون قيمة الخطأ الفعلية، فهي ستكون عادةً عبارة عن مرجع إلى خلية تحتوي على صيغة تريد اختبارها.' },
        },
    },
    INFO: {
        description: 'إرجاع معلومات حول بيئة التشغيل الحالية.',
        abstract: 'إرجاع معلومات حول بيئة التشغيل الحالية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'مطلوب. نص يحدد نوع المعلومات التي تريد إرجاعها.' },
        },
    },
    ISBETWEEN: {
        description: 'تتحقق مما إذا كان الرقم المقدم يقع بين رقمين آخرين، بشكل شامل أو حصري.',
        abstract: 'تتحقق مما إذا كان الرقم المقدم يقع بين رقمين آخرين، بشكل شامل أو حصري.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=ar',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'القيمة المراد اختبار وقوعها بين `lower_value` و`upper_value`.' },
            lowerValue: { name: 'lower_value', detail: 'الحد الأدنى لنطاق القيم الذي يمكن أن تقع ضمنه `value_to_compare`.' },
            upperValue: { name: 'upper_value', detail: 'الحد الأعلى لنطاق القيم الذي يمكن أن تقع ضمنه `value_to_compare`.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'ما إذا كان نطاق القيم يتضمن `lower_value`. القيمة الافتراضية TRUE.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'ما إذا كان نطاق القيم يتضمن `upper_value`. القيمة الافتراضية TRUE.' },
        },
    },
    ISBLANK: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISDATE: {
        description: 'ترجع الدالة ISDATE ما إذا كانت القيمة تاريخاً.',
        abstract: 'ترجع الدالة ISDATE ما إذا كانت القيمة تاريخاً.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=ar',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'القيمة المطلوب التحقق من أنها تاريخ.' },
        },
    },
    ISEMAIL: {
        description: 'تتحقق الدالة ISEMAIL مما إذا كانت القيمة عنوان بريد إلكتروني صالحاً. فهي تتحقق من اتباع القيمة لتنسيق شائع لعناوين البريد الإلكتروني، لكنها لا تتحقق من وجود العنوان.',
        abstract: 'تتحقق الدالة ISEMAIL مما إذا كانت القيمة عنوان بريد إلكتروني صالحاً. فهي تتحقق من اتباع القيمة لتنسيق شائع لعناوين البريد الإلكتروني، لكنها لا تتحقق من وجود العنوان.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=ar',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'القيمة المطلوب التحقق من أنها عنوان بريد إلكتروني.' },
        },
    },
    ISERR: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISERROR: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISEVEN: {
        description: 'إرجاع القيمة TRUE إذا كان الرقم زوجياً، أو FALSE إذا كان الرقم فردياً.',
        abstract: 'إرجاع القيمة TRUE إذا كان الرقم زوجياً، أو FALSE إذا كان الرقم فردياً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوبة. القيمة التي يجب اختبارها. إذا لم يكن الرقم عدداً صحيحاً، فسيتم اقتطاعه.' },
        },
    },
    ISFORMULA: {
        description: 'تتحقق هذه الدالة من وجود مرجع إلى خلية تحتوي على صيغة، وتُرجع TRUE أو FALSE.',
        abstract: 'تتحقق هذه الدالة من وجود مرجع إلى خلية تحتوي على صيغة، وتُرجع TRUE أو FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'مطلوب. المرجع هو مرجع إلى الخلية التي تريد اختبارها. يمكن أن يكون المرجع مرجع خلية أو صيغة أو اسما يشير إلى خلية.' },
        },
    },
    ISLOGICAL: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISNA: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISNONTEXT: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISNUMBER: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISODD: {
        description: 'إرجاع القيمة TRUE إذا كان الرقم فردياً أو FALSE إذا كان الرقم زوجياً.',
        abstract: 'إرجاع القيمة TRUE إذا كان الرقم فردياً أو FALSE إذا كان الرقم زوجياً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوبة. القيمة التي يجب اختبارها. إذا لم تكن قيمة الوسيطة Number عدداً صحيحاً، فسيتم اقتطاعها.' },
        },
    },
    ISOMITTED: {
        description: 'التحقق من أن القيمة في LAMBDA مفقودة وإرجاع TRUE أو FALSE.',
        abstract: 'التحقق من أن القيمة في LAMBDA مفقودة وإرجاع TRUE أو FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'الوسيطه', detail: 'القيمة التي تريد اختبارها، مثل معلمة LAMBDA.' },
        },
    },
    ISREF: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISTEXT: {
        description: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        abstract: 'تقوم كل دالة من هذه الدالات، ويشار إليها جميعاً بدالات IS ، بالتحقق من القيمة المحددة وإرجاع TRUE أو FALSE استناداً إلى النتائج. تقوم الدالة ISBLANK مثلاً بإرجاع القيمة المنطقية TRUE إذا كانت وسيطة القيمة مرجعاً إلى خلية فارغة، وبخلاف ذلك فإنها تقوم بإرجاع FALSE.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. هي القيمة التي تريد اختبارها. يمكن لوسيطة القيمة أن تكون عبارة عن قيمة فارغة (خلية فارغة) أو قيمة خطأ أو قيمة منطقية أو نص أو رقم أو قيمة مرجعية أو اسم يشير إلى أي من هذه.' },
        },
    },
    ISURL: {
        description: 'تتحقق مما إذا كانت القيمة عنوان URL صالحاً.',
        abstract: 'تتحقق مما إذا كانت القيمة عنوان URL صالحاً.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=ar',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'القيمة المطلوب التحقق من أنها عنوان URL.' },
        },
    },
    N: {
        description: 'تُرجع هذه الدالة قيمة محوّلة إلى رقم.',
        abstract: 'تُرجع هذه الدالة قيمة محوّلة إلى رقم.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. القيمة التي تريد تحويلها. تحوّل الدالة N القيم المذكورة في الجدول التالي.' },
        },
    },
    NA: {
        description: 'تُرجع هذه الدالة قيمة الخطأ ‎#N/A. #N/A هي قيمة الخطأ التي تعني "لا توجد قيمة متوفرة". استخدم NA لوضع علامة على الخلايا الفارغة. عن طريق إدخال ‎#N/A في الخلايا ذات المعلومات الناقصة، يمكنك تفادي مشكلة تضمين خلايا فارغة في عملياتك الحسابية عن طريق الخطأ. (عندما تشير الصيغة إلى خلية تحتوي على ‎#N/A، تُرجع الصيغة قيمة الخطأ ‎#N/A.)',
        abstract: 'تُرجع هذه الدالة قيمة الخطأ ‎#N/A. #N/A هي قيمة الخطأ التي تعني "لا توجد قيمة متوفرة". استخدم NA لوضع علامة على الخلايا الفارغة. عن طريق إدخال ‎#N/A في الخلايا ذات المعلومات الناقصة، يمكنك تفادي مشكلة تضمين خلايا فارغة في عملياتك الحسابية عن طريق الخطأ. (عندما تشير الصيغة إلى خلية تحتوي على ‎#N/A، تُرجع الصيغة قيمة الخطأ ‎#N/A.)',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'ترجع الدالة SHEET رقم الورقة للورقة المحددة أو مرجعا آخر.',
        abstract: 'ترجع الدالة SHEET رقم الورقة للورقة المحددة أو مرجعا آخر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'وسيطة اختيارية. استخدم هذا لتحديد اسم ورقة أو مرجع تريد الحصول على رقم الورقة له. وإلا، سترجع الدالة عدد الورقة التي تحتوي على الدالة SHEET.' },
        },
    },
    SHEETS: {
        description: 'تُرجع هذه الدالة عدد الأوراق في مرجع.',
        abstract: 'تُرجع هذه الدالة عدد الأوراق في مرجع.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'تُرجع هذه الدالة نوع القيمة. استخدم الدالة TYPE عندما يستند سلوك دالة أخرى إلى نوع القيمة في خلية محددة.',
        abstract: 'تُرجع هذه الدالة نوع القيمة. استخدم الدالة TYPE عندما يستند سلوك دالة أخرى إلى نوع القيمة في خلية محددة.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'مطلوب. يمكنها أن تكون أي قيمة من قيم Microsoft Excel، كرقم ونص وقيمة منطقية، وهكذا.' },
        },
    },
};

export default locale;
