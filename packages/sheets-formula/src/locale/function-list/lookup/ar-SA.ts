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
    ADDRESS: {
        description: 'يمكنك استخدام الدالة ADDRESS للحصول على عنوان إحدى الخلايا في ورقة العمل، عند معرفة رقم صف ورقم عمود محددين. على سبيل المثال، ترجع ADDRESS(2,3) $C$2 . كمثال آخر، ترجع ADDRESS(77,300) $KN$77 . وتستطيع استخدام دالات أخرى، مثل الدالتين ROW و COLUMN ، لتوفير وسيطتي رقم الصف ورقم العمود للدالة ADDRESS .',
        abstract: 'يمكنك استخدام الدالة ADDRESS للحصول على عنوان إحدى الخلايا في ورقة العمل، عند معرفة رقم صف ورقم عمود محددين. على سبيل المثال، ترجع ADDRESS(2,3) $C$2 . كمثال آخر، ترجع ADDRESS(77,300) $KN$77 . وتستطيع استخدام دالات أخرى، مثل الدالتين ROW و COLUMN ، لتوفير وسيطتي رقم الصف ورقم العمود للدالة ADDRESS .',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'مطلوب. وهي قيمة رقمية تحدد رقم الصف المراد استخدامه في مرجع الخلية.' },
            column_num: { name: 'column number', detail: 'مطلوب. وهي قيمة رقمية تحدد رقم العمود المراد استخدامه في مرجع الخلية.' },
            abs_num: { name: 'type of reference', detail: 'الاختياري. وهي قيمة رقمية تحدد نوع المرجع المراد إرجاعه.' },
            a1: { name: 'style of reference', detail: 'الاختياري. وهي قيمة منطقية تحدد نمط المرجع A1 أو R1C1. في النمط A1، تتم تسمية الأعمدة أبجدياً، وتتم تسمية الصفوف رقمياً. وفي نمط المرجع R1C1، تتم تسمية كل من الأعمدة والصفوف رقمياً. إذا كانت الوسيطة A1 تساوي TRUE أو تم إهمالها، فستُرجع الدالة ADDRESS مرجعاً بنمط A1، وإذا كانت تساوي FALSE، فستُرجع الدالة ADDRESS مرجعاً بنمط R1C1. ملاحظة لتغيير نمط المرجع الذي يستخدمه Excel، انقر فوق علامة التبويب ملف ، وانقر فوق خيارات ، ثم انقر فوق الصيغ . وضمن استخدام الصيغ ، حدد خانة الاختيار نمط المرجع R1C1 أو قم بإلغاء تحديدها.' },
            sheet_text: { name: 'worksheet name', detail: 'الاختياري. وهي قيمة نصية تحدد اسم ورقة العمل المراد استخدامها كمرجع خارجي. على سبيل المثال، ترجع الصيغة =ADDRESS(1,1,,,"Sheet2") Sheet2!$A$1 . إذا تم حذف الوسيطة sheet_text ، فلن يتم استخدام أي اسم ورقة، ويشير العنوان الذي تم إرجاعه بواسطة الدالة إلى خلية على الورقة الحالية.' },
        },
    },
    AREAS: {
        description: 'تُرجع عدد النواحي في مرجع. تعد الناحية نطاقاً من الخلايا المتجاورة أو خلية مفردة.',
        abstract: 'تُرجع عدد النواحي في مرجع. تعد الناحية نطاقاً من الخلايا المتجاورة أو خلية مفردة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'مطلوب. وهي مرجع لخلية أو نطاق خلايا ويمكن أن تشير إلى نواحٍ متعددة. إذا كنت تريد تحديد عدة مراجع كوسيطة مفردة، فعليك تضمين مجموعات إضافية من الأقواس حتى لا يفسر Microsoft Excel الفاصلة على أنها فاصل حقول. انظر المثال التالي.' },
        },
    },
    CHOOSE: {
        description: 'تستخدم index_num لإرجاع قيمة من قائمة وسيطات القيم. استخدم CHOOSE لتحديد قيمة من القيم الـ 254 استناداً إلى رقم الفهرس. على سبيل المثال، إذا كانت القيم من value1 إلى value7 تمثل أيام الأسبوع، فتُرجع CHOOSE أحد الأيام عند استخدام رقم بين 1 و7 كـ index_num.',
        abstract: 'تستخدم index_num لإرجاع قيمة من قائمة وسيطات القيم. استخدم CHOOSE لتحديد قيمة من القيم الـ 254 استناداً إلى رقم الفهرس. على سبيل المثال، إذا كانت القيم من value1 إلى value7 تمثل أيام الأسبوع، فتُرجع CHOOSE أحد الأيام عند استخدام رقم بين 1 و7 كـ index_num.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'يحدد وسيطة القيمة المختارة. يجب أن يكون index_num رقماً بين 1 و254، أو صيغة أو مرجعاً إلى خلية تحتوي على رقم بين 1 و254.\nإذا كان index_num يساوي 1، تُرجع CHOOSE value1؛ وإذا كان 2 تُرجع value2، وهكذا.\nإذا كان index_num أقل من 1 أو أكبر من رقم آخر قيمة في القائمة، تُرجع CHOOSE الخطأ #VALUE!.\nإذا كان index_num كسراً، فيُقتطع إلى أصغر عدد صحيح قبل استخدامه.' },
            value1: { name: 'value1', detail: 'تختار CHOOSE قيمة أو إجراءً لتنفيذه استناداً إلى index_num. يمكن أن تكون الوسيطات أرقاماً أو مراجع خلايا أو أسماء معرفة أو صيغاً أو دالات أو نصاً.' },
            value2: { name: 'value2', detail: 'من 1 إلى 254 وسيطة قيمة.' },
        },
    },
    CHOOSECOLS: {
        description: 'يتم إرجاع الأعمدة المُحدَّدة من صفيف.',
        abstract: 'يتم إرجاع الأعمدة المُحدَّدة من صفيف.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف الذي يحتوي على الأعمدة التي سيتم إرجاعها في الصفيف الجديد. مطلوبة.' },
            colNum1: { name: 'col_num1', detail: 'العمود الأول الذي سيتم إرجاعه. مطلوبة.' },
            colNum2: { name: 'col_num2', detail: 'أعمدة إضافية سيتم إرجاعها. اختيارية.' },
        },
    },
    CHOOSEROWS: {
        description: 'يتم إرجاع الصفوف المحددة من صفيف.',
        abstract: 'يتم إرجاع الصفوف المحددة من صفيف.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف الذي يحتوي على الأعمدة التي سيتم إرجاعها في الصفيف الجديد. مطلوبة.' },
            rowNum1: { name: 'row_num1', detail: 'رقم الصف الأول الذي سيتم إرجاعه. مطلوبة.' },
            rowNum2: { name: 'row_num2', detail: 'أرقام صفوف إضافية سيتم إرجاعها. اختيارية.' },
        },
    },
    COLUMN: {
        description: 'ترجع الدالة COLUMN رقم العمود لمرجع الخلية المحدد. على سبيل المثال، ترجع الصيغة =COLUMN(D10) 4، لأن العمود D هو العمود الرابع.',
        abstract: 'ترجع الدالة COLUMN رقم العمود لمرجع الخلية المحدد. على سبيل المثال، ترجع الصيغة =COLUMN(D10) 4، لأن العمود D هو العمود الرابع.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'الخلية أو نطاق الخلايا الذي تريد إرجاع رقم عموده.' },
        },
    },
    COLUMNS: {
        description: 'إرجاع عدد الأعمدة في صفيف أو مرجع.',
        abstract: 'إرجاع عدد الأعمدة في صفيف أو مرجع.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'مطلوب. صفيف أو صيغة صفيف، أو مرجع لنطاق خلايا تريد عدد الأعمدة له.' },
        },
    },
    DROP: {
        description: 'يستثني عددا محددا من الصفوف أو الأعمدة من بداية الصفيف أو نهايته. قد تجد هذه الدالة مفيدة لإزالة الرؤوس والتذييلات في تقرير Excel لإرجاع البيانات فقط.',
        abstract: 'يستثني عددا محددا من الصفوف أو الأعمدة من بداية الصفيف أو نهايته. قد تجد هذه الدالة مفيدة لإزالة الرؤوس والتذييلات في تقرير Excel لإرجاع البيانات فقط.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف الذي سيتم إسقاط الصفوف أو الأعمدة منه.' },
            rows: { name: 'rows', detail: 'عدد الصفوف التي يجب إسقاطها. يتم إسقاط قيمة سالبة من نهاية الصفيف.' },
            columns: { name: 'columns', detail: 'عدد الأعمدة المراد استبعادها. يتم إسقاط قيمة سالبة من نهاية الصفيف.' },
        },
    },
    EXPAND: {
        description: 'توسيع صفيف أو لوحته لأبعاد الصفوف والأعمدة المحددة.',
        abstract: 'توسيع صفيف أو لوحته لأبعاد الصفوف والأعمدة المحددة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف المراد توسيعه.' },
            rows: { name: 'rows', detail: 'عدد الصفوف في الصفيف الموسع. إذا كان مفقودًا، فلن يتم توسيع الصفوف.' },
            columns: { name: 'columns', detail: 'عدد الأعمدة في الصفيف الموسع. إذا كان مفقودًا، فلن يتم توسيع الأعمدة.' },
            padWith: { name: 'pad_with', detail: 'القيمة التي سيتم لوحة بها. الإعداد الافتراضي هو #N/A.' },
        },
    },
    FILTER: {
        description: 'في المثال التالي استخدمنا الصيغة =FILTER(A5:D20,C5:C20=H2,"") لإرجاع كافة سجلات Apple، كما هو محدد في الخلية H2، وإذا لم تكن هناك تفاح، فسترجع سلسلة فارغة ("").',
        abstract: 'في المثال التالي استخدمنا الصيغة =FILTER(A5:D20,C5:C20=H2,"") لإرجاع كافة سجلات Apple، كما هو محدد في الخلية H2، وإذا لم تكن هناك تفاح، فسترجع سلسلة فارغة ("").',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف، أو النطاق المطلوب فرزه' },
            include: { name: 'include', detail: 'صفيف "منطقي" يكون ارتفاعه أو عرضه مثل الصفيف' },
            ifEmpty: { name: 'if_empty', detail: 'القيمة المطلوب إرجاعها إذا كانت كل القيم في الصفيف المضمن فارغة (لا يقوم عامل التصفية بإرجاع أي شيء)' },
        },
    },
    FORMULATEXT: {
        description: 'تُرجع هذه الدالة الصيغة كسلسلة.',
        abstract: 'تُرجع هذه الدالة الصيغة كسلسلة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'مطلوب. مرجع إلى خلية أو نطاق خلايا.' },
        },
    },
    GETPIVOTDATA: {
        description: 'تُرجع البيانات المرئية المخزنة في PivotTable.',
        abstract: 'تُرجع البيانات المرئية المخزنة في PivotTable.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'اسم حقل PivotTable الذي يحتوي على البيانات التي تريد استردادها. يجب أن يكون هذا في علامات اقتباس. مثال: =GETPIVOTDATA("Sales", A3). هنا، "المبيعات" هو حقل القيم الذي نريد استرداده. نظرا لعدم تحديد أي حقل آخر، ترجع GETPIVOTDATA إجمالي مبلغ المبيعات.' },
            pivotTable: { name: 'pivotTable', detail: 'مرجع إلى أي خلية أو نطاق من الخلايا أو نطاق مسمى من الخلايا في PivotTable. يتم استخدام هذه المعلومات لتحديد أي PivotTable يحتوي على البيانات التي تريد استردادها. مثال: =GETPIVOTDATA("Sales", A3). هنا، A3 هو مرجع داخل PivotTable ويخبر الصيغة التي PivotTable لاستخدامها.' },
            field1: { name: 'field1', detail: 'أزواج أسماء الحقول وأسماء العناصر من 1 حتى 126 التي تصف البيانات التي تريد استردادها. يمكن وضع الأزواج بأي ترتيب. يجب تضمين أسماء الحقول وأسماء العناصر بخلاف التواريخ والأرقام بين علامات اقتباس. مثال: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). هنا، "Month" هو الحقل و"Mar" هو العنصر. لتحديد عناصر متعددة لحقل، قم بإحاطتها بأقواس متعرجة (على سبيل المثال: {"Mar"، "Apr"}). بالنسبة ل OLAP PivotTables ، يمكن أن تحتوي العناصر على الاسم المصدر للبعد وكذلك اسم مصدر العنصر. قد يظهر زوج حقل وعنصر PivotTable لـ OLAP، كما يلي: "[المنتج]"،"[المنتج].[كافة المنتجات].[الأطعمة].[المنتجات المخبوزة]"' },
            item1: { name: 'item1', detail: 'أزواج أسماء الحقول وأسماء العناصر من 1 حتى 126 التي تصف البيانات التي تريد استردادها. يمكن وضع الأزواج بأي ترتيب. يجب تضمين أسماء الحقول وأسماء العناصر بخلاف التواريخ والأرقام بين علامات اقتباس. مثال: =GETPIVOTDATA("Sales", A3, "Month", "Mar"). هنا، "Month" هو الحقل و"Mar" هو العنصر. لتحديد عناصر متعددة لحقل، قم بإحاطتها بأقواس متعرجة (على سبيل المثال: {"Mar"، "Apr"}). بالنسبة ل OLAP PivotTables ، يمكن أن تحتوي العناصر على الاسم المصدر للبعد وكذلك اسم مصدر العنصر. قد يظهر زوج حقل وعنصر PivotTable لـ OLAP، كما يلي: "[المنتج]"،"[المنتج].[كافة المنتجات].[الأطعمة].[المنتجات المخبوزة]"' },
        },
    },
    HLOOKUP: {
        description: 'يبحث عن قيمة في الصف العلوي من جدول أو صفيف من القيم، ثم يرجع قيمة في العمود نفسه من صف تحدده في الجدول أو الصفيف. استخدم HLOOKUP عندما تكون قيم المقارنة موجودة في أحد الصفوف أعلى جدول بيانات، وتريد البحث من أعلى إلى أسفل في عدد معين من الصفوف. استخدم VLOOKUP عندما تكون قيم المقارنة موجودة في عمود إلى يمين البيانات التي تريد البحث عنها.',
        abstract: 'يبحث عن قيمة في الصف العلوي من جدول أو صفيف من القيم، ثم يرجع قيمة في العمود نفسه من صف تحدده في الجدول أو الصفيف. استخدم HLOOKUP عندما تكون قيم المقارنة موجودة في أحد الصفوف أعلى جدول بيانات، وتريد البحث من أعلى إلى أسفل في عدد معين من الصفوف. استخدم VLOOKUP عندما تكون قيم المقارنة موجودة في عمود إلى يمين البيانات التي تريد البحث عنها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'مطلوب. قيمة يجب البحث عنها في الصف الأول من الجدول. يمكن أن تكون Lookup_value قيمة أو مرجعاً أو سلسلة نصية.' },
            tableArray: { name: 'table_array', detail: 'مطلوب. جدول من المعلومات يتم البحث فيه عن البيانات. استخدم مرجعاً لنطاق أو اسم نطاق. يمكن أن تكون القيم في الصف الأول من table_array نصاً أو أرقاماً أو قيماً منطقية. إذا كانت قيمة range_lookup تساوي TRUE، فيجب وضع القيم في الصف الأول من table_array بترتيب تصاعدي: ... -2، -1، 0، 1، 2، ...، أ-ي، FALSE،‏ TRUE؛ وإلا فقد لا تُرجع الدالة HLOOKUP القيمة الصحيحة. إذا كانت قيمة range_lookup تساوي FALSE، فلا حاجة لإجراء فرز في table_array. إن النصوص ذات الأحرف الكبيرة مكافئة للنصوص ذات الأحرف الصغيرة. يمكنك فرز القيم بترتيب تصاعدي، من اليمين إلى اليسار. لمزيد من المعلومات، راجع فرز البيانات في نطاق أو جدول .' },
            rowIndexNum: { name: 'row_index_num', detail: 'مطلوب. رقم الصف في table_array التي سيتم إرجاع القيمة المطابقة منها. ترجع row_index_num من 1 قيمة الصف الأول في table_array، row_index_num من 2 ترجع قيمة الصف الثاني في table_array، وهكذا. إذا كان row_index_num أقل من 1، فترجع الدالة HLOOKUP #VALUE! قيمة الخطأ؛ إذا كان row_index_num أكبر من عدد الصفوف في table_array، فترجع الدالة HLOOKUP #REF! وهي قيمة خطأ.' },
            rangeLookup: { name: 'range_lookup', detail: 'الاختياري. قيمة منطقية تحدد ما إذا كنت تريد من HLOOKUP البحث عن مطابقة تامة أم مطابقة تقريبية. إذا كانت هذه القيمة تساوي TRUE أو محذوفة، فيتم إرجاع مطابقة تقريبية. وبعبارة أخرى، في حالة عدم وجود مطابقة تامة، يتم إرجاع القيمة الكبرى التالية الأصغر من lookup_value. إذا كانت هذه القيمة تساوي FALSE، فتبحث الدالة HLOOKUP عن مطابقة تامة. وإذا لم يتم العثور على واحدة، فيتم إرجاع قيمة الخطأ ‎#N/A.' },
        },
    },
    HSTACK: {
        description: 'إلحاق الصفائف أفقياً وبتسلسل لإرجاع صفيف أكبر.',
        abstract: 'إلحاق الصفائف أفقياً وبتسلسل لإرجاع صفيف أكبر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'الصفائف المراد إلحاقها.' },
            array2: { name: 'array', detail: 'الصفائف المراد إلحاقها.' },
        },
    },
    HYPERLINK: {
        description: 'تنشئ ارتباطاً تشعبياً داخل خلية.',
        abstract: 'تنشئ ارتباطاً تشعبياً داخل خلية.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=ar',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'عنوان URL الكامل لموضع الارتباط، بين علامتي اقتباس، أو مرجع إلى خلية تحتوي على هذا العنوان. لا تُسمح إلا بأنواع ارتباط معينة: http:// وhttps:// وmailto: وaim: وftp:// وgopher:// وtelnet:// وnews://. إذا استُخدم بروتوكول آخر، يظهر link_label في الخلية دون ارتباط تشعبي. وإذا لم يُحدد بروتوكول، يُفترض http:// ويُضاف إلى url.' },
            linkLabel: { name: 'link_label', detail: '[اختياري — url افتراضياً] النص المعروض في الخلية كارتباط، بين علامتي اقتباس، أو مرجع إلى خلية تحتوي على تلك التسمية. إذا كان link_label مرجعاً إلى خلية فارغة، يُعرض url كرابط إذا كان صالحاً، أو كنص عادي في غير ذلك. إذا كان link_label سلسلة فارغة (""), تبدو الخلية فارغة مع بقاء الارتباط متاحاً بالنقر أو بالانتقال إلى الخلية.' },
        },
    },
    IMAGE: {
        description: 'تدرج الدالة IMAGE الصور في خلايا من موقع مصدر إلى جانب النص البديل. يمكنك بعد ذلك نقل الخلايا وتغيير حجمها وفرزها وتصفيتها واستخدام الصور ضمن جدول Excel. استخدم هذه الدالة لتحسين قوائم البيانات بشكل مرئي مثل قوائم المخزون والألعاب والموظفين والمفاهيم الرياضية.',
        abstract: 'تدرج الدالة IMAGE الصور في خلايا من موقع مصدر إلى جانب النص البديل. يمكنك بعد ذلك نقل الخلايا وتغيير حجمها وفرزها وتصفيتها واستخدام الصور ضمن جدول Excel. استخدم هذه الدالة لتحسين قوائم البيانات بشكل مرئي مثل قوائم المخزون والألعاب والموظفين والمفاهيم الرياضية.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'مسار URL لملف الصورة باستخدام بروتوكول "https".' },
            altText: { name: 'alt_text', detail: 'نص بديل يصف الصورة لأغراض إمكانية الوصول.' },
            sizing: { name: 'sizing', detail: 'يحدد أبعاد الصورة.' },
            height: { name: 'height', detail: 'الارتفاع المخصص للصورة بالبكسل.' },
            width: { name: 'width', detail: 'العرض المخصص للصورة بالبكسل.' },
        },
    },
    INDEX: {
        description: 'إرجاع قيمة عنصر في جدول أو صفيف، تم تحديده بواسطة فهارس أرقام الصفوف والأعمدة.',
        abstract: 'إرجاع قيمة عنصر في جدول أو صفيف، تم تحديده بواسطة فهارس أرقام الصفوف والأعمدة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'مرجع إلى نطاق خلية واحد أو أكثر.' },
            rowNum: { name: 'row_num', detail: 'رقم الصف في reference الذي سيُرجع مرجعاً منه.' },
            columnNum: { name: 'column_num', detail: 'رقم العمود في reference الذي سيُرجع مرجعاً منه.' },
            areaNum: { name: 'area_num', detail: 'يختار نطاقاً في reference يُرجع منه تقاطع row_num وcolumn_num.' },
        },
    },
    INDIRECT: {
        description: 'إرجاع المرجع المحدد بواسطة سلسلة نصية. يتم تقييم المراجع مباشرةً لعرض محتوياتها. استخدم INDIRECT عندما تريد تغيير مرجع إلى خلية داخل صيغة دون تغيير الصيغة نفسها.',
        abstract: 'إرجاع المرجع المحدد بواسطة سلسلة نصية. يتم تقييم المراجع مباشرةً لعرض محتوياتها. استخدم INDIRECT عندما تريد تغيير مرجع إلى خلية داخل صيغة دون تغيير الصيغة نفسها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'مطلوب. مرجع لخلية تحتوي على مرجع نمط A1، مرجع نمط R1C1، اسم معرف كمرجع، أو مرجع لخلية كسلسلة نصية. إذا لم تكن الوسيطة ref_text مرجع خلية صحيحة، فسترجع الدالة INDIRECT قيمة الخطأ #REF!. إذا كانت الوسيطة ref_text تشير إلى مصنف آخر (مرجع خارجي)، يجب أن يكون المصنف الآخر مفتوحاً. إذا لم يكن المصنف المصدر مفتوحاً، فسترجع الدالة INDIRECT قيمة الخطأ #REF!. ملاحظة المراجع الخارجية غير معتمدة في Excel Web App. إذا كانت الوسيطة ref_text تشير إلى نطاق خلايا خارج حد الصف 1048576 أو حد العمود 16384 (XFD)، ترجع INDIRECT قيمة الخطأ #REF!.' },
            a1: { name: 'a1', detail: 'الاختياري. قيمة منطقية تحدد نوع المرجع الذى تم احتواؤه فى الخلية ref_text. إذا كانت a1 تساوي TRUE أو تم حذفها، يتم تفسير ref_text كمرجع نمط A1. إذا كانت a1 تساوي FALSE، يتم تفسير ref_text كمرجع نمط R1C1.' },
        },
    },
    LOOKUP: {
        description: 'يبحث نموذج الخط المتجه للدالة LOOKUP في نطاق صف واحد أو عمود واحد (ويُعرف ذلك بالخط المتجه) عن قيمة ما ويرجع قيمة من الموضع نفسه في نطاق ثانٍ من صف واحد أو عمود واحد.',
        abstract: 'يبحث نموذج الخط المتجه للدالة LOOKUP في نطاق صف واحد أو عمود واحد (ويُعرف ذلك بالخط المتجه) عن قيمة ما ويرجع قيمة من الموضع نفسه في نطاق ثانٍ من صف واحد أو عمود واحد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'قيمة تبحث LOOKUP عنها في المتجه الأول. يمكن أن تكون lookup_value رقماً أو نصاً أو قيمة منطقية أو اسماً أو مرجعاً يشير إلى قيمة.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'نطاق لا يحتوي إلا على صف واحد أو عمود واحد.' },
            resultVector: { name: 'result_vector', detail: 'نطاق لا يحتوي إلا على صف واحد أو عمود واحد. يجب أن تكون وسيطة result_vector بالحجم نفسه لـ lookup_vector.' },
        },
    },
    MATCH: {
        description: 'تبحث الدالة مطابقة عن عنصر محدد في نطاق من الخلايا، ثم تُرجع الموضع النسبي لذلك العنصر في النطاق. على سبيل المثال، إذا احتوى النطاق A1:A3 على القيم 5 و25 و38، فستُرجع الصيغة ‎=MATCH(25,A1:A3,0)‎ الرقم 2، لأن 25 هو العنصر الثاني في النطاق.',
        abstract: 'تبحث الدالة مطابقة عن عنصر محدد في نطاق من الخلايا، ثم تُرجع الموضع النسبي لذلك العنصر في النطاق. على سبيل المثال، إذا احتوى النطاق A1:A3 على القيم 5 و25 و38، فستُرجع الصيغة ‎=MATCH(25,A1:A3,0)‎ الرقم 2، لأن 25 هو العنصر الثاني في النطاق.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'يعثر MATCH على أكبر قيمة أقل من أو تساوي lookup_value . يجب وضع القيم الموجودة في الوسيطة lookup_array بترتيب تصاعدي، على سبيل المثال: ...-2، -1، 0، 1، 2، ...، A-Z، FALSE، TRUE.' },
            lookupArray: { name: 'lookup_array', detail: 'يعثر MATCH على القيمة الأولى التي تساوي تماما lookup_value . يمكن أن تكون القيم الموجودة في الوسيطة lookup_array بأي ترتيب.' },
            matchType: { name: 'match_type', detail: 'يعثر MATCH على أصغر قيمة أكبر من أو تساوي lookup_value . يجب وضع القيم في الوسيطة lookup_array بترتيب تنازلي، على سبيل المثال: TRUE، FALSE، Z-A، ... 2 و1 و0 و-1 و-2 و...وما إلى ذلك.' },
        },
    },
    OFFSET: {
        description: 'تُرجع هذه الدالة مرجعاً إلى نطاق يتكوّن من عدد معين من الصفوف والأعمدة من خلية أو نطاق من الخلايا. يكون المرجع الذي يتم إرجاعه عبارة عن خلية واحدة أو نطاق من الخلايا. ويمكنك تحديد عدد الصفوف وعدد الأعمدة التي سيتم إرجاعها.',
        abstract: 'تُرجع هذه الدالة مرجعاً إلى نطاق يتكوّن من عدد معين من الصفوف والأعمدة من خلية أو نطاق من الخلايا. يكون المرجع الذي يتم إرجاعه عبارة عن خلية واحدة أو نطاق من الخلايا. ويمكنك تحديد عدد الصفوف وعدد الأعمدة التي سيتم إرجاعها.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'مطلوب. المرجع الذي تريد إنشاء الإزاحة منه. يجب أن يشير المرجع إلى خلية أو نطاق من الخلايا المتجاورة؛ وإلا، ترجع الدالة OFFSET #VALUE! وهي قيمة خطأ.' },
            rows: { name: 'rows', detail: 'مطلوب. عدد الصفوف، للأعلى أو للأسفل، التي تريد أن تشير إليها الخلية العلوية اليمنى. يؤدي استخدام 5 كوسيطة الصفوف إلى تعيين وقوع الخلية العلوية اليمنى في المرجع أسفل المرجع بخمسة صفوف. من الممكن أن تكون قيمة وسيطة الصفوف موجبة (أي أسفل مرجع البدء) أو سالبة (أي أعلى مرجع البدء).' },
            cols: { name: 'columns', detail: 'مطلوب. عدد الأعمدة، إلى اليمين أو اليسار، التي تريد أن تشير الخلية العلوية اليمنى من النتيجة إليها. يؤدي استخدام 5 كوسيطة الأعمدة إلى تعيين وقوع الخلية العلوية اليمنى في المرجع إلى يسار المرجع بمقدار خمسة صفوف. من الممكن أن تكون قيمة وسيطة الأعمدة موجبة (أي إلى يسار مرجع البدء) أو سالبة (أي إلى يمين مرجع البدء).' },
            height: { name: 'height', detail: 'الاختياري. الارتفاع، في عدد الصفوف، الذي تريده للمرجع الذي يتم إرجاعه. يجب أن تكون قيمة الارتفاع رقماً موجباً.' },
            width: { name: 'width', detail: 'الاختياري. العرض، في عدد الأعمدة، الذي تريده للمرجع الذي يتم إرجاعه. يجب أن تكون قيمة العرض رقماً موجباً.' },
        },
    },
    ROW: {
        description: 'تُرجع هذه الدالة رقم صف المرجع.',
        abstract: 'تُرجع هذه الدالة رقم صف المرجع.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'الاختياري. الخلية أو نطاق الخلايا التي تريد إرجاع رقم صفها. إذا تم حذف الوسيطة reference، فسيُفتراض أنها مرجع الخلية حيث تظهر الدالة ROW. إذا كان المرجع عبارة عن نطاق من الخلايا، وإذا تم إدخال ROW كصفيف عمودي، فترجع ROW أرقام صفوف المرجع كصفيف عمودي. لا يمكن للوسيطة Reference أن تشير إلى نواحٍ متعددة.' },
        },
    },
    ROWS: {
        description: 'إرجاع عدد الصفوف في مرجع أو صفيف.',
        abstract: 'إرجاع عدد الصفوف في مرجع أو صفيف.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'مطلوب. صفيف أو صيغة صفيف أو مرجع لنطاق خلايا تريد عدد الصفوف له.' },
        },
    },
    RTD: {
        description: 'تقوم باسترداد بيانات الوقت الحقيقي من برنامج يعتمد التنفيذ التلقائي لـ COM.',
        abstract: 'تقوم باسترداد بيانات الوقت الحقيقي من برنامج يعتمد التنفيذ التلقائي لـ COM.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'مطلوب. اسم ProgID للوظيفة الإضافية أتمتة COM المسجلة التي تم تثبيتها على الكمبيوتر المحلي. ضع الاسم بين علامتي اقتباس.' },
            server: { name: 'server', detail: 'مطلوب. وهي عبارة عن اسم الخادم الذي يجب تشغيل الوظيفة الإضافية عليه. وإذا لم يكن هناك أي خادم، وكان البرنامج قيد التشغيل محلياً، فاترك الوسيطة فارغة. وإلا، فأدخل علامتي اقتباس ("") حول اسم الخادم. أما عند استخدام الدالة RTD داخل Visual Basic for Applications (VBA)‎، فمن الضروري استخدام علامات اقتباس مزدوجة أو الخاصية NullString الموجودة في VBA للخادم، حتى إذا كان هذا الخادم قيد التشغيل محلياً.' },
            topic1: { name: 'topic1', detail: 'Topic1 مطلوب، والمواضيع اللاحقة اختيارية. وهي معلمات من 1 إلى 253 تمثل معاً جزءاً فريداً من بيانات الوقت الحقيقي.' },
            topic2: { name: 'topic2', detail: 'Topic1 مطلوب، والمواضيع اللاحقة اختيارية. وهي معلمات من 1 إلى 253 تمثل معاً جزءاً فريداً من بيانات الوقت الحقيقي.' },
        },
    },
    SORT: {
        description: 'في هذا المثال، نقوم بالفرز حسب المنطقة ومندوب المبيعات والمنتج بشكل فردي باستخدام = SORT (A2: A17)، التي يتم نسخها عبر الخلايا F2 وH2 وJ2.',
        abstract: 'في هذا المثال، نقوم بالفرز حسب المنطقة ومندوب المبيعات والمنتج بشكل فردي باستخدام = SORT (A2: A17)، التي يتم نسخها عبر الخلايا F2 وH2 وJ2.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'نطاق أو صفيف لإجراء الفرز' },
            sortIndex: { name: 'sort_index', detail: 'رقم يشير إلى الصف أو العمود للفرز حسب' },
            sortOrder: { name: 'sort_order', detail: 'رقم يشير إلى ترتيب الفرز المطلوب 1 لترتيب تصاعدي (افتراضي)، -1 لترتيب تنازلي' },
            byCol: { name: 'by_col', detail: 'قيمة منطقية تشير إلى اتجاه الفرز المطلوب؛ FALSE للفرز حسب الصف (افتراضي)، TRUE للفرز حسب العمود' },
        },
    },
    SORTBY: {
        description: 'في هذا المثال، قمنا بفرز قائمة بأسماء الأشخاص حسب عمرهم، بترتيب تصاعدي.',
        abstract: 'في هذا المثال، قمنا بفرز قائمة بأسماء الأشخاص حسب عمرهم، بترتيب تصاعدي.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف أو النطاق المطلوب فرزه' },
            byArray1: { name: 'by_array1', detail: 'الصفيف أو النطاق المطلوب فرزه' },
            sortOrder1: { name: 'sort_order1', detail: 'الترتيب المطلوب استخدامه للفرز. 1 للتصاعدي، -1 للتنازلي. الافتراضي تصاعدي.' },
            byArray2: { name: 'by_array2', detail: 'الصفيف أو النطاق المطلوب فرزه' },
            sortOrder2: { name: 'sort_order2', detail: 'الترتيب المطلوب استخدامه للفرز. 1 للتصاعدي، -1 للتنازلي. الافتراضي تصاعدي.' },
        },
    },
    TAKE: {
        description: 'إرجاع عدد محدد من الصفوف أو الأعمدة المتجاورة من بداية الصفيف أو نهايته.',
        abstract: 'إرجاع عدد محدد من الصفوف أو الأعمدة المتجاورة من بداية الصفيف أو نهايته.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف الذي يجب أخذ الصفوف أو الأعمدة منه.' },
            rows: { name: 'rows', detail: 'عدد الصفوف التي يجب أخذها. تأخذ القيمة السالبة من نهاية الصفيف.' },
            columns: { name: 'columns', detail: 'عدد الأعمدة التي يجب أخذها. تأخذ القيمة السالبة من نهاية الصفيف.' },
        },
    },
    TOCOL: {
        description: 'إرجاع ARRAY في عمود واحد.',
        abstract: 'إرجاع ARRAY في عمود واحد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف أو المرجع المراد إرجاعه كعمود.' },
            ignore: { name: 'ignore', detail: 'ما إذا كان يجب تجاهل أنواع معينة من القيم. افتراضياً لا تُتجاهل أي قيم. حدد أحد الآتي:\n0 الاحتفاظ بكل القيم (افتراضي)\n1 تجاهل الخلايا الفارغة\n2 تجاهل الأخطاء\n3 تجاهل الخلايا الفارغة والأخطاء' },
            scanByColumn: { name: 'scan_by_column', detail: 'يفحص الصفيف حسب العمود. افتراضياً يُفحص الصفيف حسب الصف. يحدد الفحص ما إذا كانت القيم مرتبة حسب الصف أو العمود.' },
        },
    },
    TOROW: {
        description: 'إرجاع الصفيف في صفٍ واحد.',
        abstract: 'إرجاع الصفيف في صفٍ واحد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'الصفيف أو المرجع المراد إرجاعه كصف.' },
            ignore: { name: 'ignore', detail: 'ما إذا كان يجب تجاهل أنواع معينة من القيم. افتراضياً لا تُتجاهل أي قيم. حدد أحد الآتي:\n0 الاحتفاظ بكل القيم (افتراضي)\n1 تجاهل الخلايا الفارغة\n2 تجاهل الأخطاء\n3 تجاهل الخلايا الفارغة والأخطاء' },
            scanByColumn: { name: 'scan_by_column', detail: 'يفحص الصفيف حسب العمود. افتراضياً يُفحص الصفيف حسب الصف. يحدد الفحص ما إذا كانت القيم مرتبة حسب الصف أو العمود.' },
        },
    },
    TRANSPOSE: {
        description: 'في بعض الأحيان ترغب في تبديل الخلايا أو تدويرها. يمكنك إجراء ذلك عن طريق نسخ خيار تبديل الموضع ولصقه واستخدامه . لكن القيام بذلك سيؤدي إلى إنشاء بيانات مكررة. وإذا لم تكن ترغب في ذلك، يمكنك كتابة صيغة بدلاً من ذلك باستخدام الدالة TRANSPOSE. على سبيل المثال، في الصور التالية، تأخذ الصيغة =TRANSPOSE‏(A1:B4)‏ الخلايا من A1 إلى B4 وتقوم بترتيبها أفقياً.',
        abstract: 'في بعض الأحيان ترغب في تبديل الخلايا أو تدويرها. يمكنك إجراء ذلك عن طريق نسخ خيار تبديل الموضع ولصقه واستخدامه . لكن القيام بذلك سيؤدي إلى إنشاء بيانات مكررة. وإذا لم تكن ترغب في ذلك، يمكنك كتابة صيغة بدلاً من ذلك باستخدام الدالة TRANSPOSE. على سبيل المثال، في الصور التالية، تأخذ الصيغة =TRANSPOSE‏(A1:B4)‏ الخلايا من A1 إلى B4 وتقوم بترتيبها أفقياً.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'نطاق خلايا أو صفيف في ورقة عمل.' },
        },
    },
    UNIQUE: {
        description: 'إرجاع أسماء فريدة من قائمة الأسماء',
        abstract: 'إرجاع أسماء فريدة من قائمة الأسماء',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'النطاق أو الصفيف الذي سيتم إرجاع صفوف أو أعمدة فريدة منه' },
            byCol: { name: 'by_col', detail: 'الوسيطة by_col هي قيمة منطقية تشير إلى كيفية المقارنة. سيقوم TRUE بمقارنة الأعمدة مقابل بعضها البعض وإرجاع الأعمدة الفريدة سيقوم FALSE (أو تم حذفه) بمقارنة الصفوف مقابل بعضها البعض وإرجاع الصفوف الفريدة' },
            exactlyOnce: { name: 'exactly_once', detail: 'الوسيطة exactly_once هي قيمة منطقية ستعيد الصفوف أو الأعمدة التي تحدث مرة واحدة بالضبط في النطاق أو الصفيف. هذا هو مفهوم قاعدة البيانات الفريد. سيعيد TRUE جميع الصفوف أو الأعمدة المميزة التي تحدث مرة واحدة بالضبط من النطاق أو الصفيف سيعيد FALSE (أو تم حذفه) جميع الصفوف أو الأعمدة المميزة من النطاق أو الصفيف' },
        },
    },
    VLOOKUP: {
        description: 'استخدام الدالة VLOOKUP للبحث عن قيمة في جدول.',
        abstract: 'استخدام الدالة VLOOKUP للبحث عن قيمة في جدول.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'القيمة التي تريد البحث عنها. يجب أن تكون في العمود الأول من نطاق الخلايا المحدد في table_array.' },
            tableArray: { name: 'table_array', detail: 'نطاق الخلايا الذي تبحث فيه VLOOKUP عن lookup_value وقيمة الإرجاع. يمكنك استخدام نطاق مسمى أو جدول، كما يمكنك استخدام أسماء بدلاً من مراجع الخلايا.' },
            colIndexNum: { name: 'col_index_num', detail: 'رقم العمود الذي يحتوي على قيمة الإرجاع، بدءاً من 1 للعمود الموجود في أقصى يسار table_array.' },
            rangeLookup: { name: 'range_lookup', detail: 'قيمة منطقية تحدد ما إذا كانت VLOOKUP تبحث عن تطابق تقريبي أو تام: تطابق تقريبي — 1/TRUE، وتطابق تام — 0/FALSE.' },
        },
    },
    VSTACK: {
        description: 'تلحق الصفائف عمودياً وبتسلسل لترجع صفيفاً أكبر.',
        abstract: 'تلحق الصفائف عمودياً وبتسلسل لترجع صفيفاً أكبر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'الصفائف المراد إلحاقها.' },
            array2: { name: 'array', detail: 'الصفائف المراد إلحاقها.' },
        },
    },
    WRAPCOLS: {
        description: 'التفاف صف أو عمود القيم المقدم بواسطة الأعمدة بعد عدد محدد من العناصر.',
        abstract: 'التفاف صف أو عمود القيم المقدم بواسطة الأعمدة بعد عدد محدد من العناصر.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'المتجه أو المرجع المراد التفافه.' },
            wrapCount: { name: 'wrap_count', detail: 'الحد الأقصى لعدد القيم لكل عمود.' },
            padWith: { name: 'pad_with', detail: 'القيمة التي سيتم لوحة بها. الإعداد الافتراضي هو #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'يلف الصف أو العمود المتوفر للقيم حسب الصفوف بعد عدد محدد من العناصر لتكوين صفيف جديد.',
        abstract: 'يلف الصف أو العمود المتوفر للقيم حسب الصفوف بعد عدد محدد من العناصر لتكوين صفيف جديد.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'المتجه أو المرجع المراد التفافه.' },
            wrapCount: { name: 'wrap_count', detail: 'الحد الأقصى لعدد القيم لكل صف.' },
            padWith: { name: 'pad_with', detail: 'القيمة التي سيتم لوحة بها. الإعداد الافتراضي هو #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'استخدم الدالة XLOOKUP للعثور على الأشياء في جدول أو نطاق حسب الصف. على سبيل المثال، ابحث عن سعر جزء السيارات حسب رقم الجزء، أو ابحث عن اسم موظف استنادا إلى معرف الموظف الخاص به. باستخدام XLOOKUP، يمكنك البحث في عمود واحد عن مصطلح بحث وإرجاع نتيجة من الصف نفسه في عمود آخر، بغض النظر عن الجانب الذي يعمل عليه عمود الإرجاع.',
        abstract: 'استخدم الدالة XLOOKUP للعثور على الأشياء في جدول أو نطاق حسب الصف. على سبيل المثال، ابحث عن سعر جزء السيارات حسب رقم الجزء، أو ابحث عن اسم موظف استنادا إلى معرف الموظف الخاص به. باستخدام XLOOKUP، يمكنك البحث في عمود واحد عن مصطلح بحث وإرجاع نتيجة من الصف نفسه في عمود آخر، بغض النظر عن الجانب الذي يعمل عليه عمود الإرجاع.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'القيمة التي يجب البحث عنها *إذا تم حذفه، ترجع XLOOKUP الخلايا الفارغة التي يعثر عليها في lookup_array .' },
            lookupArray: { name: 'lookup_array', detail: 'الصفيف أو النطاق المراد البحث فيه' },
            returnArray: { name: 'return_array', detail: 'الصفيف أو النطاق المراد إرجاعه' },
            ifNotFound: { name: 'if_not_found', detail: 'في حالة عدم العثور على تطابق صحيح، قم بإعادة النص [if_not_found] الذي توفره. إذا لم يتم العثور على تطابق صالح، وكان [if_not_found] مفقودا، يتم إرجاع #N/A .' },
            matchMode: { name: 'match_mode', detail: 'حدد نوع المطابقة: 0 - المطابقة الدقيقة. إذا لم يتم العثور على أي منها، فارجع #N/A. هذا هو الإعداد الافتراضي. -1 - التطابق الدقيق. إذا لم يتم العثور على أي عنصر، فسترجع العنصر الأصغر التالي. 1 - التطابق الدقيق. إذا لم يتم العثور على أي عنصر، فسترجع العنصر الأكبر التالي. 2 - تطابق أحرف البدل حيث *و?و ~ لها معنى خاص .' },
            searchMode: { name: 'search_mode', detail: 'حدد وضع البحث لاستخدامه: 1 - إجراء بحث بدءا من العنصر الأول. هذا هو الإعداد الافتراضي. -1 - إجراء بحث عكسي بدءا من العنصر الأخير. 2 - إجراء بحث ثنائي يعتمد على lookup_array يتم فرزها بترتيب تصاعدي . إذا لم يتم فرزها، فسيتم إرجاع نتائج غير صالحة. -2 - إجراء بحث ثنائي يعتمد على lookup_array يتم فرزها بترتيب تنازلي . إذا لم يتم فرزها، فسيتم إرجاع نتائج غير صالحة.' },
        },
    },
    XMATCH: {
        description: 'افترض أن لدينا قائمة بالمنتجات في الخلايا من C3 إلى C7 ونرغب في تحديد مكان وجود المنتج من الخلية E3 في القائمة. هنا، سنستخدم XMATCH لتحديد موضع العنصر داخل قائمة.',
        abstract: 'افترض أن لدينا قائمة بالمنتجات في الخلايا من C3 إلى C7 ونرغب في تحديد مكان وجود المنتج من الخلية E3 في القائمة. هنا، سنستخدم XMATCH لتحديد موضع العنصر داخل قائمة.',
        links: [
            {
                title: 'التعليمات',
                url: 'https://support.microsoft.com/ar-sa/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'قيمة البحث' },
            lookupArray: { name: 'lookup_array', detail: 'الصفيف أو النطاق المراد البحث فيه' },
            matchMode: { name: 'match_mode', detail: 'حدد نوع المطابقة: 0 - المطابقة الدقيقة (افتراضي) -1 - مطابقة تامة أو أصغر عنصر تالية 1 - المطابقة الدقيقة أو العنصر الأكبر التالي 2 - تطابق أحرف البدل حيث *و?و ~ لها معنى خاص .' },
            searchMode: { name: 'search_mode', detail: 'حدد نوع البحث: 1 - البحث من الأول إلى الأخير (افتراضي) -1 - البحث من الأخير إلى الأول (البحث العكسي). 2 - إجراء بحث ثنائي يعتمد على lookup_array يتم فرزها بترتيب تصاعدي . إذا لم يتم فرزها، فسيتم إرجاع نتائج غير صالحة. -2 - إجراء بحث ثنائي يعتمد على lookup_array يتم فرزها بترتيب تنازلي . إذا لم يتم فرزها، فسيتم إرجاع نتائج غير صالحة.' },
        },
    },
};

export default locale;
