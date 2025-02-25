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

export default {
    ARRAY_CONSTRAIN: {
        description: 'Задает размер массива, в который будут помещены результаты.',
        abstract: 'Задает размер массива, в который будут помещены результаты.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/3267036?hl=ru&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'массива', detail: 'диапазон для ограничения.' },
            numRows: { name: 'количество_строк', detail: 'количество строк, которое должен содержать результат.' },
            numCols: { name: 'количество_столбцов', detail: 'количество столбцов, которое должен содержать результат.' },
        },
    },
    FLATTEN: {
        description: 'Объединяет все значения из одного или нескольких диапазонов в один столбец.',
        abstract: 'Объединяет все значения из одного или нескольких диапазонов в один столбец.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.google.com/docs/answer/10307761?hl=ru&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'диапазон1', detail: 'Первый диапазон, который необходимо выровнять.' },
            range2: { name: 'диапазон2', detail: 'Дополнительные диапазоны, которые необходимо выровнять.' },
        },
    },
};
