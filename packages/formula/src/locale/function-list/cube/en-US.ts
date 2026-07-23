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

const locale = {
    CUBEKPIMEMBER: {
        description: 'Returns a key performance indicator (KPI) property and displays the KPI name in the cell. A KPI is a quantifiable measurement, such as monthly gross profit or quarterly employee turnover, that is used to monitor an organization\'s performance.',
        abstract: 'Returns a key performance indicator (KPI) property and displays the KPI name in the cell. A KPI is a quantifiable measurement, such as monthly gross profit or quarterly employee turnover, that is used to monitor an organization\'s performance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            kpiName: { name: 'Kpi_name', detail: 'Required. A text string of the name of the KPI in the cube.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Required. The KPI component returned and can be one of the following:' },
            caption: { name: 'Caption', detail: 'Optional. An alternative text string that is displayed in the cell instead of kpi_name and kpi_property.' },
        },
    },
    CUBEMEMBER: {
        description: 'Returns a member or tuple from the cube. Use to validate that the member or tuple exists in the cube.',
        abstract: 'Returns a member or tuple from the cube. Use to validate that the member or tuple exists in the cube.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Required. A text string of a multidimensional expression (MDX) that evaluates to a unique member in the cube. Alternatively, member_expression can be a tuple, specified as a cell range or an array constant.' },
            caption: { name: 'Caption', detail: 'Optional. A text string displayed in the cell instead of the caption, if one is defined, from the cube. When a tuple is returned, the caption used is the one for the last member in the tuple.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'The CUBEMEMBERPROPERTY function, one of the Cube functions in Excel, returns the value of a member property from a cube. Use it to validate that a member name exists within the cube, and to return the specified property for this member.',
        abstract: 'The CUBEMEMBERPROPERTY function, one of the Cube functions in Excel, returns the value of a member property from a cube. Use it to validate that a member name exists within the cube, and to return the specified property for this member.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Required. A text string of a multidimensional expression (MDX) of a member within the cube.' },
            property: { name: 'Property', detail: 'Required. A text string of the name of the property returned or a reference to a cell that contains the name of the property.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Returns the nth, or ranked, member in a set. Use to return one or more elements in a set, such as the top sales performer or the top 10 students.',
        abstract: 'Returns the nth, or ranked, member in a set. Use to return one or more elements in a set, such as the top sales performer or the top 10 students.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            setExpression: { name: 'Set_expression', detail: 'Required. A text string of a set expression, such as "{[Item1].children}". Set_expression can also be the CUBESET function, or a reference to a cell that contains the CUBESET function.' },
            rank: { name: 'Rank', detail: 'Required. An integer value specifying the top value to return. If rank is a value of 1, it returns the top value, if rank is a value of 2, it returns the second most top value, and so on. To return the top 5 values, use CUBERANKEDMEMBER five times, specifying a different rank, 1 through 5, each time.' },
            caption: { name: 'Caption', detail: 'Optional. A text string displayed in the cell instead of the caption, if one is defined, from the cube.' },
        },
    },
    CUBESET: {
        description: 'Defines a calculated set of members or tuples by sending a set expression to the cube on the server, which creates the set, and then returns that set to Microsoft Excel.',
        abstract: 'Defines a calculated set of members or tuples by sending a set expression to the cube on the server, which creates the set, and then returns that set to Microsoft Excel.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            setExpression: { name: 'Set_expression', detail: 'Required. A text string of a set expression that results in a set of members or tuples. Set_expression can also be a cell reference to an Excel range that contains one or more members, tuples, or sets included in the set.' },
            caption: { name: 'Caption', detail: 'Optional. A text string that is displayed in the cell instead of the caption, if one is defined, from the cube.' },
            sortOrder: { name: 'Sort_order', detail: 'Optional. The type of sort, if any, to perform and can be one of the following:' },
            sortBy: { name: 'Sort_by', detail: 'Optional. A text string of the value by which to sort. For example, to get the city with the highest sales, set_expression would be a set of cities, and sort_by would be the sales measure. Or, to get the city with the highest population, set_expression would be a set of cities, and sort_by would be the population measure. If sort_order requires sort_by, and sort_by is omitted, CUBESET returns the #VALUE! error message.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Returns the number of items in a set.',
        abstract: 'Returns the number of items in a set.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Set', detail: 'Required. A text string of a Microsoft Excel expression that evaluates to a set defined by the CUBESET function. Set can also be the CUBESET function, or a reference to a cell that contains the CUBESET function.' },
        },
    },
    CUBEVALUE: {
        description: 'Returns an aggregated value from the cube.',
        abstract: 'Returns an aggregated value from the cube.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connection', detail: 'Required. A text string of the name of the connection to the cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Optional. A text string of a multidimensional expression (MDX) that evaluates to a member or tuple within the cube. Alternatively, member_expression can be a set defined with the CUBESET function. Use member_expression as a slicer to define the portion of the cube for which the aggregated value is returned. If no measure is specified in member_expression, the default measure for that cube is used.' },
        },
    },
};

export default locale;
