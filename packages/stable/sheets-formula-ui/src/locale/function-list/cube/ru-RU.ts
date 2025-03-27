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
    CUBEKPIMEMBER: {
        description: 'Возвращает свойство ключевого показателя эффективности (KPI) и отображает имя KPI в ячейке. KPI — это количественная мера, такая как ежемесячная валовая прибыль или ежеквартальная текучесть сотрудников, используемая для мониторинга производительности организации.',
        abstract: 'Возвращает свойство ключевого показателя эффективности (KPI) и отображает имя KPI в ячейке. KPI — это количественная мера, такая как ежемесячная валовая прибыль или ежеквартальная текучесть сотрудников, используемая для мониторинга производительности организации.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubekpimember-function-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBEMEMBER: {
        description: 'Возвращает элемент или кортеж из куба. Используйте для проверки существования элемента или кортежа в кубе.',
        abstract: 'Возвращает элемент или кортеж из куба. Используйте для проверки существования элемента или кортежа в кубе.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubemember-function-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Возвращает значение свойства элемента из куба. Используйте для проверки существования имени элемента в кубе и для возврата указанного свойства для этого элемента.',
        abstract: 'Возвращает значение свойства элемента из куба. Используйте для проверки существования имени элемента в кубе и для возврата указанного свойства для этого элемента.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubememberproperty-function-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Возвращает n-ого или ранжированного элемента в наборе. Используйте для возврата одного или нескольких элементов в наборе, таких как лучший продавец или топ-10 студентов.',
        abstract: 'Возвращает n-ого или ранжированного элемента в наборе. Используйте для возврата одного или нескольких элементов в наборе, таких как лучший продавец или топ-10 студентов.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cuberankedmember-function-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBESET: {
        description: 'Определяет вычисляемый набор элементов или кортежей, отправляя выражение набора на сервер, который создает набор, а затем возвращает этот набор в Microsoft Excel.',
        abstract: 'Определяет вычисляемый набор элементов или кортежей, отправляя выражение набора на сервер, который создает набор, а затем возвращает этот набор в Microsoft Excel.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubeset-function-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBESETCOUNT: {
        description: 'Возвращает количество элементов в наборе.',
        abstract: 'Возвращает количество элементов в наборе.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubesetcount-function-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
    CUBEVALUE: {
        description: 'Возвращает агрегированное значение из куба.',
        abstract: 'Возвращает агрегированное значение из куба.',
        links: [
            {
                title: 'Инструкция',
                url: 'https://support.microsoft.com/en-us/office/cubevalue-function-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'первый' },
            number2: { name: 'number2', detail: 'второй' },
        },
    },
};
