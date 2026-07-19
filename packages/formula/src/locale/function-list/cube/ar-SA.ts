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
    CUBEKPIMEMBER: {
        description: 'تُرجع خاصية مؤشر الأداء الرئيسي (KPI) وتعرض اسم KPI في الخلية. يعتبر KPI مقياساً كمياً، يحسب مثلاً إجمالي الربح الشهري أو معدل الدوران الربع سنوي للموظفين، ويتم استخدامه لمراقبة أداء المؤسسة.',
        abstract: 'تُرجع خاصية مؤشر الأداء الرئيسي (KPI) وتعرض اسم KPI في الخلية. يعتبر KPI مقياساً كمياً، يحسب مثلاً إجمالي الربح الشهري أو معدل الدوران الربع سنوي للموظفين، ويتم استخدامه لمراقبة أداء المؤسسة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            kpiName: { name: 'Kpi_name', detail: 'مطلوب. سلسلة نصية لاسم KPI الموجود في المكعب.' },
            kpiProperty: { name: 'Kpi_property', detail: 'مطلوب. وهي مكون KPI الذي يتم إرجاعه ويمكن أن يكون واحداً مما يلي:' },
            caption: { name: 'التسميه التوضيحيه', detail: 'الاختياري. وهي سلسلة نصية بديلة يتم عرضها في الخلية بدلاً من kpi_name وkpi_property.' },
        },
    },
    CUBEMEMBER: {
        description: 'تُرجع عضواً واحداً أو مجموعة من المكعب. ويمكن استخدامها للتحقق من وجود العضو أو المجموعة في المكعب.',
        abstract: 'تُرجع عضواً واحداً أو مجموعة من المكعب. ويمكن استخدامها للتحقق من وجود العضو أو المجموعة في المكعب.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            memberExpression: { name: 'Member_expression', detail: 'مطلوب. وهي سلسلة نصية لتعبير متعدد الأبعاد (MDX) يتم تقييمه إلى عضو فريد في المكعب. بدلاً من ذلك، يمكن أن تكون member_expression عبارة عن مجموعة تم تعيينها كنطاق خلايا أو كثابت صفيف.' },
            caption: { name: 'التسميه التوضيحيه', detail: 'الاختياري. وهي سلسلة نصية يتم عرضها في الخلية بدلاً من التسمية التوضيحية، وذلك إذا تم تعريف إحداها، من المكعب. عند إرجاع إحدى المجموعات، تكون التسمية التوضيحية المُستخدمة هي تلك الخاصة بآخر عضو في المجموعة.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'ترجع الدالة CUBEMEMBERPROPERTY ، إحدى دالات Cube في Excel، قيمة خاصية عضو من مكعب. ويمكن استخدامها للتحقق من وجود اسم العضو داخل المكعب وإرجاع الخاصية المحددة لهذا العضو.',
        abstract: 'ترجع الدالة CUBEMEMBERPROPERTY ، إحدى دالات Cube في Excel، قيمة خاصية عضو من مكعب. ويمكن استخدامها للتحقق من وجود اسم العضو داخل المكعب وإرجاع الخاصية المحددة لهذا العضو.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            memberExpression: { name: 'Member_expression', detail: 'مطلوب. وهي سلسلة نصية لتعبير متعدد الأبعاد (MDX) خاص بأحد الأعضاء داخل المكعب.' },
            property: { name: 'الخاصيه', detail: 'مطلوب. وهي سلسلة نصية لاسم الخاصية التي تم إرجاعها أو مرجع إلى خلية تحتوي على اسم الخاصية.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'تُرجع العضو الأعلى أو المُصنف في مجموعة. ويمكن استخدامها لإرجاع عنصر واحد أو أكثر في مجموعة، مثل صاحب أعلى نسبة مبيعات أو أفضل عشرة طلاب.',
        abstract: 'تُرجع العضو الأعلى أو المُصنف في مجموعة. ويمكن استخدامها لإرجاع عنصر واحد أو أكثر في مجموعة، مثل صاحب أعلى نسبة مبيعات أو أفضل عشرة طلاب.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            setExpression: { name: 'Set_expression', detail: 'مطلوب. وهي سلسلة نصية لتعبير مجموعة، مثل "{[العنصر 1].الأطفال}". يمكن أيضاً أن تكون Set_expression عبارة عن الدالة CUBESET أو مرجع لخلية تحتوي على الدالة CUBESET.' },
            rank: { name: 'رتبه', detail: 'مطلوب. وهي قيمة عدد صحيح يحدد أعلى قيمة يتم إرجاعها. إذا كانت قيمة التصنيف تساوي 1، فإنها تُرجع أعلى قيمة، وإذا كانت قيمة التصنيف تساوي 2، فإنها تُرجع ثاني أعلى قيمة، وما إلى ذلك. لإرجاع أعلى خمس قيم، استخدم الدالة CUBERANKEDMEMBER خمس مرات، مع تحديد تصنيف مختلف، من 1 إلى 5، في كل مرة.' },
            caption: { name: 'التسميه التوضيحيه', detail: 'الاختياري. وهي سلسلة نصية يتم عرضها في الخلية بدلاً من التسمية التوضيحية، وذلك إذا تم تعريف إحداها، من المكعب.' },
        },
    },
    CUBESET: {
        description: 'تعرّف مجموعة محسوبة من قيم أعضاء أو مجموعة عن طريق إرسال تعبير مجموعة إلى المكعب على الخادم، مما يؤدي إلى إنشاء المجموعة، ثم إرجاع تلك المجموعة إلى Microsoft Excel.',
        abstract: 'تعرّف مجموعة محسوبة من قيم أعضاء أو مجموعة عن طريق إرسال تعبير مجموعة إلى المكعب على الخادم، مما يؤدي إلى إنشاء المجموعة، ثم إرجاع تلك المجموعة إلى Microsoft Excel.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            setExpression: { name: 'Set_expression', detail: 'مطلوب. وهي سلسلة نصية لتعبير مجموعة ينتج عنها مجموعة أعضاء أو مجموعات قيم. يمكن أيضاً أن تكون Set_expression عبارة عن مرجع خلية لنطاق Excel يحتوي على واحد أو أكثر من الأعضاء أو مجموعات القيم أو المجموعات التي تم تضمينها في المجموعة.' },
            caption: { name: 'التسميه التوضيحيه', detail: 'الاختياري. وهي سلسلة نصية يتم عرضها في الخلية بدلاً من التسمية التوضيحية، وذلك إذا تم تعريف إحداها، من المكعب.' },
            sortOrder: { name: 'Sort_order', detail: 'الاختياري. نوع الفرز الذي تريد تطبيقه، إن وجد، ويمكن أن يكون أياً مما يلي:' },
            sortBy: { name: 'Sort_by', detail: 'الاختياري. سلسلة نصية للقيمة التي سيتم الفرز بواسطتها. على سبيل المثال، للحصول على المدينة ذات المبيعات الأعلى، قد تكون set_expression مجموعة من المدن، وتكون sort_by هي مقياس المبيعات. أو، للحصول على المدينة ذات عدد السكان الأعلى، قد تكون set_expression مجموعة من المدن، وتكون sort_by هي مقياس عدد السكان. إذا sort_order تطلّب sort_by، وتم حذف sort_by، ترجع CUBESET رسالة الخطأ #VALUE!.' },
        },
    },
    CUBESETCOUNT: {
        description: 'تُرجع عدد العناصر الموجودة في مجموعة.',
        abstract: 'تُرجع عدد العناصر الموجودة في مجموعة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'تعيين', detail: 'مطلوب. وهي سلسلة نصية لتعبير Microsoft Excel يتم تقييمه إلى مجموعة معرّفة بواسطة الدالة CUBESET. يمكن أيضاً أن تكون Set عبارة عن الدالة CUBESET أو مرجعاً لخلية تحتوي على الدالة CUBESET.' },
        },
    },
    CUBEVALUE: {
        description: 'تُرجع قيمة مجمّعة من المكعب.',
        abstract: 'تُرجع قيمة مجمّعة من المكعب.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'اتصال', detail: 'مطلوب. وهي سلسلة نصية لاسم الاتصال بالمكعب.' },
            memberExpression: { name: 'Member_expression', detail: 'الاختياري. وهي سلسلة نصية لتعبير متعدد الأبعاد (MDX) يتم تقييمه إلى عضو أو مجموعة داخل المكعب. ويمكن أن تكون member_expression بدلاً من ذلك عبارة عن مجموعة تم تعريفها باستخدام الدالة CUBESET. استخدم member_expression كمقسم طريقة عرض لتعريف جزء المكعب الذي يتم إرجاع القيمة المجمّعة له. إذا لم يتم تحديد أي مقياس في member_expression، فيتم استخدام المقياس الافتراضي لهذا المكعب.' },
        },
    },
};

export default locale;
