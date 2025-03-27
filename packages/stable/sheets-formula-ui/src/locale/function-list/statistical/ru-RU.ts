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

import enUS from './en-US';

export default enUS;

// export default {
//     AVEDEV: {
//         description: 'Возвращает среднее абсолютное отклонение значений выборки от их среднего арифметического',
//         abstract: 'Возвращает среднее абсолютное отклонение значений выборки от их среднего арифметического',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-avedev-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     AVERAGE: {
//         description: 'Возвращает среднее арифметическое аргументов.',
//         abstract: 'Возвращает среднее арифметическое аргументов',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-average-047bac88-d466-426c-a32b-8f33eb960cf6',
//             },
//         ],
//         functionParameter: {
//             number1: {
//                 name: 'number1',
//                 detail: 'Первое число, ссылка на ячейку или диапазон, для которого требуется вычислить среднее арифметическое.',
//             },
//             number2: {
//                 name: 'number2',
//                 detail: 'Дополнительные числа, ссылки на ячейки или диапазоны, для которых требуется вычислить среднее арифметическое, максимум 255.',
//             },
//         },
//     },
//     AVERAGEA: {
//         description: 'Возвращает среднее арифметическое своих аргументов, включая числа, текст и логические значения',
//         abstract: 'Возвращает среднее арифметическое своих аргументов, включая числа, текст и логические значения',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-averagea-f5f84098-d453-4f4c-bbba-3d2c66356091',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     AVERAGEIF: {
//         description: 'Возвращает среднее арифметическое всех ячеек в диапазоне, удовлетворяющих заданному критерию',
//         abstract: 'Возвращает среднее арифметическое всех ячеек в диапазоне, удовлетворяющих заданному критерию',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-averageif-faec8e2e-0dec-4308-af69-f5576d8ac642',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     AVERAGEIFS: {
//         description: 'Возвращает среднее арифметическое всех ячеек, удовлетворяющих нескольким критериям',
//         abstract: 'Возвращает среднее арифметическое всех ячеек, удовлетворяющих нескольким критериям',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-averageifs-48910c45-1fc0-4389-a028-f7c5c3001690',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     BETA_DIST: {
//         description: 'Возвращает бета-функцию плотности вероятности',
//         abstract: 'Возвращает бета-функцию плотности вероятности',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-beta-dist-11188c9c-780a-42c7-ba43-9ecb5a878d31',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     BETA_INV: {
//         description: 'Возвращает обратное значение функции бета-распределения',
//         abstract: 'Возвращает обратное значение функции бета-распределения',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-beta-inv-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     BINOM_DIST: {
//         description: 'Возвращает индивидуальное биномиальное распределение вероятностей',
//         abstract: 'Возвращает индивидуальное биномиальное распределение вероятностей',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-binom-dist-c5ae37b6-f39c-4be2-94c2-509a1480770c',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     BINOM_DIST_RANGE: {
//         description: 'Возвращает вероятность результата испытания с использованием биномиального распределения',
//         abstract: 'Возвращает вероятность результата испытания с использованием биномиального распределения',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-binom-dist-range-17331329-74c7-4053-bb4c-6653a7421595',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     BINOM_INV: {
//         description: 'Возвращает наименьшее значение, для которого кумулятивное биномиальное распределение меньше или равно критерию',
//         abstract: 'Возвращает наименьшее значение, для которого кумулятивное биномиальное распределение меньше или равно критериальному значению',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-binom-inv-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CHISQ_DIST: {
//         description: 'Возвращает кумулятивную бета-функцию плотности вероятности',
//         abstract: 'Возвращает кумулятивную бета-функцию плотности вероятности',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-chisq-dist-8486b05e-5c05-4942-a9ea-f6b341518732',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CHISQ_DIST_RT: {
//         description: 'Возвращает одностороннюю вероятность распределения хи-квадрат',
//         abstract: 'Возвращает одностороннюю вероятность распределения хи-квадрат',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-chisq-dist-rt-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CHISQ_INV: {
//         description: 'Возвращает кумулятивную бета-функцию плотности вероятности',
//         abstract: 'Возвращает кумулятивную бета-функцию плотности вероятности',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-chisq-inv-400db556-62b3-472d-80b3-254723e7092f',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CHISQ_INV_RT: {
//         description: 'Возвращает обратное значение односторонней вероятности распределения хи-квадрат',
//         abstract: 'Возвращает обратное значение односторонней вероятности распределения хи-квадрат',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-chisq-inv-rt-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CHISQ_TEST: {
//         description: 'Возвращает тест на независимость',
//         abstract: 'Возвращает тест на независимость',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-chisq-test-2e8a7861-b14a-4985-aa93-fb88de3f260f',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CONFIDENCE_NORM: {
//         description: 'Возвращает доверительный интервал для среднего значения генеральной совокупности',
//         abstract: 'Возвращает доверительный интервал для среднего значения генеральной совокупности',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-confidence-norm-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CONFIDENCE_T: {
//         description: 'Возвращает доверительный интервал для среднего значения генеральной совокупности с использованием распределения Стьюдента',
//         abstract: 'Возвращает доверительный интервал для среднего значения генеральной совокупности с использованием распределения Стьюдента',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-confidence-t-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     CORREL: {
//         description: 'Возвращает коэффициент корреляции между двумя наборами данных',
//         abstract: 'Возвращает коэффициент корреляции между двумя наборами данных',
//         links: [
//             {
//                 title: 'Инструкция',
//                 url: 'https://support.microsoft.com/ru-ru/office/функция-correl-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
//             },
//         ],
//         functionParameter: {
//             number1: { name: 'number1', detail: 'первое' },
//             number2: { name: 'number2', detail: 'второе' },
//         },
//     },
//     //TODO: Закончить перевод(честно говоря, я устал, слишком много его)
// };
