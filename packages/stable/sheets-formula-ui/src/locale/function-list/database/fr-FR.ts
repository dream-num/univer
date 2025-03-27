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
        description: 'Returns the average of selected database entries',
        abstract: 'Returns the average of selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/daverage-function-a6a2d5ac-4b4b-48cd-a1d8-7b37834e5aee',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DCOUNT: {
        description: 'Counts the cells that contain numbers in a database',
        abstract: 'Counts the cells that contain numbers in a database',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dcount-function-c1fc7b93-fb0d-4d8d-97db-8d5f076eaeb1',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DCOUNTA: {
        description: 'Counts nonblank cells in a database',
        abstract: 'Counts nonblank cells in a database',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dcounta-function-00232a6d-5a66-4a01-a25b-c1653fda1244',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DGET: {
        description: 'Extracts from a database a single record that matches the specified criteria',
        abstract: 'Extracts from a database a single record that matches the specified criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dget-function-455568bf-4eef-45f7-90f0-ec250d00892e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DMAX: {
        description: 'Returns the maximum value from selected database entries',
        abstract: 'Returns the maximum value from selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dmax-function-f4e8209d-8958-4c3d-a1ee-6351665d41c2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DMIN: {
        description: 'Returns the minimum value from selected database entries',
        abstract: 'Returns the minimum value from selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dmin-function-4ae6f1d9-1f26-40f1-a783-6dc3680192a3',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DPRODUCT: {
        description: 'Multiplies the values in a particular field of records that match the criteria in a database',
        abstract: 'Multiplies the values in a particular field of records that match the criteria in a database',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dproduct-function-4f96b13e-d49c-47a7-b769-22f6d017cb31',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DSTDEV: {
        description: 'Estimates the standard deviation based on a sample of selected database entries',
        abstract: 'Estimates the standard deviation based on a sample of selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dstdev-function-026b8c73-616d-4b5e-b072-241871c4ab96',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DSTDEVP: {
        description: 'Calculates the standard deviation based on the entire population of selected database entries',
        abstract: 'Calculates the standard deviation based on the entire population of selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dstdevp-function-04b78995-da03-4813-bbd9-d74fd0f5d94b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DSUM: {
        description: 'Adds the numbers in the field column of records in the database that match the criteria',
        abstract: 'Adds the numbers in the field column of records in the database that match the criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dsum-function-53181285-0c4b-4f5a-aaa3-529a322be41b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DVAR: {
        description: 'Estimates variance based on a sample from selected database entries',
        abstract: 'Estimates variance based on a sample from selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dvar-function-d6747ca9-99c7-48bb-996e-9d7af00f3ed1',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DVARP: {
        description: 'Calculates variance based on the entire population of selected database entries',
        abstract: 'Calculates variance based on the entire population of selected database entries',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dvarp-function-eb0ba387-9cb7-45c8-81e9-0394912502fc',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
};
