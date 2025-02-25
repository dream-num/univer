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
    DAVERAGE: {
        description: 'Возвращает среднее значение выбранных записей базы данных',
        abstract: 'Возвращает среднее значение выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/daverage-function-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DCOUNT: {
        description: 'Считает ячейки, содержащие числа в базе данных',
        abstract: 'Считает ячейки, содержащие числа в базе данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dcount-function-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DCOUNTA: {
        description: 'Считает непустые ячейки в базе данных',
        abstract: 'Считает непустые ячейки в базе данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dcounta-function-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DGET: {
        description: 'Извлекает из базы данных одну запись, соответствующую заданным критериям',
        abstract: 'Извлекает из базы данных одну запись, соответствующую заданным критериям',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dget-function-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DMAX: {
        description: 'Возвращает максимальное значение из выбранных записей базы данных',
        abstract: 'Возвращает максимальное значение из выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dmax-function-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DMIN: {
        description: 'Возвращает минимальное значение из выбранных записей базы данных',
        abstract: 'Возвращает минимальное значение из выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dmin-function-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DPRODUCT: {
        description: 'Умножает значения в определенном поле записей, соответствующих критериям в базе данных',
        abstract: 'Умножает значения в определенном поле записей, соответствующих критериям в базе данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dproduct-function-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DSTDEV: {
        description: 'Оценивает стандартное отклонение на основе выборки из выбранных записей базы данных',
        abstract: 'Оценивает стандартное отклонение на основе выборки из выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dstdev-function-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DSTDEVP: {
        description: 'Вычисляет стандартное отклонение на основе всей совокупности выбранных записей базы данных',
        abstract: 'Вычисляет стандартное отклонение на основе всей совокупности выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dstdevp-function-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DSUM: {
        description: 'Складывает числа в столбце поля записей в базе данных, которые соответствуют критериям',
        abstract: 'Складывает числа в столбце поля записей в базе данных, которые соответствуют критериям',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dsum-function-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DVAR: {
        description: 'Оценивает дисперсию на основе выборки из выбранных записей базы данных',
        abstract: 'Оценивает дисперсию на основе выборки из выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dvar-function-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
    DVARP: {
        description: 'Вычисляет дисперсию на основе всей совокупности выбранных записей базы данных',
        abstract: 'Вычисляет дисперсию на основе всей совокупности выбранных записей базы данных',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/ru-ru/office/dvarp-function-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            database: { name: 'База данных', detail: 'интервал ячеек, образующих список или базу данных.' },
            field: { name: 'поле', detail: 'столбец, используемый функцией.' },
            criteria: { name: 'условия', detail: 'диапазон ячеек, который содержит задаваемые условия.' },
        },
    },
};
