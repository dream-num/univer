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
    AVEDEV: {
        description: 'Returns the average of the absolute deviations of data points from their mean.',
        abstract: 'Returns the average of the absolute deviations of data points from their mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/avedev-function-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number, cell reference, or range for which you want the average.' },
            number2: { name: 'nombre2', detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.' },
        },
    },
    AVERAGE: {
        description: 'Returns the average (arithmetic mean) of the arguments.',
        abstract: 'Returns the average of its arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'The first number, cell reference, or range for which you want the average.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.',
            },
        },
    },
    AVERAGEA: {
        description: 'Returns the average of its arguments, including numbers, text, and logical values.',
        abstract: 'Returns the average of its arguments, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/averagea-function-f5f84098-d453-4f4c-bbba-3d2c66356091',
            },
        ],
        functionParameter: {
            value1: {
                name: 'value1',
                detail: 'The first number, cell reference, or range for which you want the average.',
            },
            value2: {
                name: 'value2',
                detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.',
            },
        },
    },
    AVERAGEIF: {
        description: 'Returns the average (arithmetic mean) of all the cells in a range that meet a given criteria.',
        abstract: 'Returns the average (arithmetic mean) of all the cells in a range that meet a given criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/averageif-function-faec8e2e-0dec-4308-af69-f5576d8ac642',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'One or more cells to average, including numbers or names, arrays, or references that contain numbers.' },
            criteria: { name: 'criteria', detail: 'The criteria in the form of a number, expression, cell reference, or text that defines which cells are averaged. For example, criteria can be expressed as 32, "32", ">32", "apples", or B4.' },
            averageRange: { name: 'average_range', detail: 'The actual set of cells to average. If omitted, range is used.' },
        },
    },
    AVERAGEIFS: {
        description: 'Returns the average (arithmetic mean) of all cells that meet multiple criteria.',
        abstract: 'Returns the average (arithmetic mean) of all cells that meet multiple criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/averageifs-function-48910c45-1fc0-4389-a028-f7c5c3001690',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'One or more cells to average, including numbers or names, arrays, or references that contain numbers.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Is the set of cells to evaluate with the criteria.' },
            criteria1: { name: 'criteria1', detail: 'Used to define the cells for which the average will be calculated. For example, the criteria can be expressed as 32, "32", ">32", "apple", or B4' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Additional ranges. You can enter up to 127 range.' },
            criteria2: { name: 'criteria2', detail: 'Additional associated criteria. You can enter up to 127 criteria.' },
        },
    },
    BETA_DIST: {
        description: 'Returns the beta cumulative distribution function',
        abstract: 'Returns the beta cumulative distribution function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/beta-dist-function-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BETA_INV: {
        description: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        abstract: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/beta-inv-function-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BINOM_DIST: {
        description: 'Returns the individual term binomial distribution probability',
        abstract: 'Returns the individual term binomial distribution probability',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/binom-dist-function-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Returns the probability of a trial result using a binomial distribution',
        abstract: 'Returns the probability of a trial result using a binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/binom-dist-range-function-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BINOM_INV: {
        description: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        abstract: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/binom-inv-function-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHISQ_DIST: {
        description: 'Returns the cumulative beta probability density function',
        abstract: 'Returns the cumulative beta probability density function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chisq-dist-function-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Returns the one-tailed probability of the chi-squared distribution',
        abstract: 'Returns the one-tailed probability of the chi-squared distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chisq-dist-rt-function-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHISQ_INV: {
        description: 'Returns the cumulative beta probability density function',
        abstract: 'Returns the cumulative beta probability density function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chisq-inv-function-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Returns the inverse of the one-tailed probability of the chi-squared distribution',
        abstract: 'Returns the inverse of the one-tailed probability of the chi-squared distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chisq-inv-rt-function-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHISQ_TEST: {
        description: 'Returns the test for independence',
        abstract: 'Returns the test for independence',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chisq-test-function-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Returns the confidence interval for a population mean',
        abstract: 'Returns the confidence interval for a population mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/confidence-norm-function-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CONFIDENCE_T: {
        description: 'Returns the confidence interval for a population mean, using a Student\'s t distribution',
        abstract: 'Returns the confidence interval for a population mean, using a Student\'s t distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/confidence-t-function-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CORREL: {
        description: 'Returns the correlation coefficient between two data sets',
        abstract: 'Returns the correlation coefficient between two data sets',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/correl-function-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    COUNT: {
        description: 'Counts the number of cells that contain numbers, and counts numbers within the list of arguments.',
        abstract: 'Counts how many numbers are in the list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c',
            },
        ],
        functionParameter: {
            value1: {
                name: 'value 1',
                detail: 'The first item, cell reference, or range within which you want to count numbers.',
            },
            value2: {
                name: 'value 2',
                detail: 'Up to 255 additional items, cell references, or ranges within which you want to count numbers.',
            },
        },
    },
    COUNTA: {
        description: `Counts cells containing any type of information, including error values and empty text ("")
        If you do not need to count logical values, text, or error values`,
        abstract: 'Counts how many values are in the list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/counta-function-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'value1',
                detail: 'Required. The first argument representing the values that you want to count.',
            },
            number2: {
                name: 'value2',
                detail: 'Optional. Additional arguments representing the values that you want to count, up to a maximum of 255 arguments.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Counts the number of blank cells within a range.',
        abstract: 'Counts the number of blank cells within a range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/countblank-function-6a92d772-675c-4bee-b346-24af6bd3ac22',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'The range from which you want to count the blank cells.' },
        },
    },
    COUNTIF: {
        description: 'Counts the number of cells within a range that meet the given criteria.',
        abstract: 'Counts the number of cells within a range that meet the given criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'The group of cells you want to count. Range can contain numbers, arrays, a named range, or references that contain numbers. Blank and text values are ignored.' },
            criteria: { name: 'criteria', detail: 'A number, expression, cell reference, or text string that determines which cells will be counted.\nFor example, you can use a number like 32, a comparison like ">32", a cell like B4, or a word like "apples".\nCOUNTIF uses only a single criteria. Use COUNTIFS if you want to use multiple criteria.' },
        },
    },
    COUNTIFS: {
        description: 'Counts the number of cells within a range that meet multiple criteria.',
        abstract: 'Counts the number of cells within a range that meet multiple criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'The first range in which to evaluate the associated criteria.' },
            criteria1: { name: 'criteria1', detail: 'The criteria in the form of a number, expression, cell reference, or text that define which cells will be counted. For example, criteria can be expressed as 32, ">32", B4, "apples", or "32".' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Additional ranges. You can enter up to 127 range.' },
            criteria2: { name: 'criteria2', detail: 'Additional associated criteria. You can enter up to 127 criteria.' },
        },
    },
    COVARIANCE_P: {
        description: 'Returns covariance, the average of the products of paired deviations',
        abstract: 'Returns covariance, the average of the products of paired deviations',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/covariance-p-function-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    COVARIANCE_S: {
        description: 'Returns the sample covariance, the average of the products deviations for each data point pair in two data sets',
        abstract: 'Returns the sample covariance, the average of the products deviations for each data point pair in two data sets',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    DEVSQ: {
        description: 'Returns the sum of squares of deviations',
        abstract: 'Returns the sum of squares of deviations',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/devsq-function-8b739616-8376-4df5-8bd0-cfe0a6caf444',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    EXPON_DIST: {
        description: 'Returns the exponential distribution',
        abstract: 'Returns the exponential distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/expon-dist-function-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    F_DIST: {
        description: 'Returns the F probability distribution',
        abstract: 'Returns the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/f-dist-function-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    F_DIST_RT: {
        description: 'Returns the F probability distribution',
        abstract: 'Returns the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/f-dist-rt-function-d74cbb00-6017-4ac9-b7d7-6049badc0520',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    F_INV: {
        description: 'Returns the inverse of the F probability distribution',
        abstract: 'Returns the inverse of the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/f-inv-function-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    F_INV_RT: {
        description: 'Returns the inverse of the F probability distribution',
        abstract: 'Returns the inverse of the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/f-inv-rt-function-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    F_TEST: {
        description: 'Returns the result of an F-test',
        abstract: 'Returns the result of an F-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/f-test-function-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FISHER: {
        description: 'Returns the Fisher transformation',
        abstract: 'Returns the Fisher transformation',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/fisher-function-d656523c-5076-4f95-b87b-7741bf236c69',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FISHERINV: {
        description: 'Returns the inverse of the Fisher transformation',
        abstract: 'Returns the inverse of the Fisher transformation',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/fisherinv-function-62504b39-415a-4284-a285-19c8e82f86bb',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST: {
        description: 'Returns a value along a linear trend',
        abstract: 'Returns a value along a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST_ETS: {
        description: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        abstract: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Returns a confidence interval for the forecast value at the specified target date',
        abstract: 'Returns a confidence interval for the forecast value at the specified target date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        abstract: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Returns a statistical value as a result of time series forecasting',
        abstract: 'Returns a statistical value as a result of time series forecasting',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Returns a future value based on existing values',
        abstract: 'Returns a future value based on existing values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.LINEAR',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FREQUENCY: {
        description: 'Returns a frequency distribution as a vertical array',
        abstract: 'Returns a frequency distribution as a vertical array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/frequency-function-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMA: {
        description: 'Returns the Gamma function value',
        abstract: 'Returns the Gamma function value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gamma-function-ce1702b1-cf55-471d-8307-f83be0fc5297',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMA_DIST: {
        description: 'Returns the gamma distribution',
        abstract: 'Returns the gamma distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gamma-dist-function-9b6f1538-d11c-4d5f-8966-21f6a2201def',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMA_INV: {
        description: 'Returns the inverse of the gamma cumulative distribution',
        abstract: 'Returns the inverse of the gamma cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gamma-inv-function-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMALN: {
        description: 'Returns the natural logarithm of the gamma function, Γ(x)',
        abstract: 'Returns the natural logarithm of the gamma function, Γ(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gammaln-function-b838c48b-c65f-484f-9e1d-141c55470eb9',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Returns the natural logarithm of the gamma function, Γ(x)',
        abstract: 'Returns the natural logarithm of the gamma function, Γ(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gammaln-precise-function-5cdfe601-4e1e-4189-9d74-241ef1caa599',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAUSS: {
        description: 'Returns 0.5 less than the standard normal cumulative distribution',
        abstract: 'Returns 0.5 less than the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gauss-function-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GEOMEAN: {
        description: 'Returns the geometric mean',
        abstract: 'Returns the geometric mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GROWTH: {
        description: 'Returns values along an exponential trend',
        abstract: 'Returns values along an exponential trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/growth-function-541a91dc-3d5e-437d-b156-21324e68b80d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    HARMEAN: {
        description: 'Returns the harmonic mean',
        abstract: 'Returns the harmonic mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/harmean-function-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Returns the hypergeometric distribution',
        abstract: 'Returns the hypergeometric distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hypgeom-dist-function-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    INTERCEPT: {
        description: 'Returns the intercept of the linear regression line',
        abstract: 'Returns the intercept of the linear regression line',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/intercept-function-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    KURT: {
        description: 'Returns the kurtosis of a data set',
        abstract: 'Returns the kurtosis of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LARGE: {
        description: 'Returns the k-th largest value in a data set',
        abstract: 'Returns the k-th largest value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/large-function-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LINEST: {
        description: 'Returns the parameters of a linear trend',
        abstract: 'Returns the parameters of a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/linest-function-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LOGEST: {
        description: 'Returns the parameters of an exponential trend',
        abstract: 'Returns the parameters of an exponential trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/logest-function-f27462d8-3657-4030-866b-a272c1d18b4b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LOGNORM_DIST: {
        description: 'Returns the cumulative lognormal distribution',
        abstract: 'Returns the cumulative lognormal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/lognorm-dist-function-eb60d00b-48a9-4217-be2b-6074aee6b070',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LOGNORM_INV: {
        description: 'Returns the inverse of the lognormal cumulative distribution',
        abstract: 'Returns the inverse of the lognormal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/lognorm-inv-function-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    MAX: {
        description: 'Returns the largest value in a set of values.',
        abstract: 'Returns the maximum value in a list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/max-function-e0012414-9ac8-4b34-9a47-73e662c08098',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'The first number, cell reference, or range to calculate the maximum value from.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Additional numbers, cell references or ranges to calculate the maximum value from, up to a maximum of 255.',
            },
        },
    },
    MAXA: {
        description: 'Returns the maximum value in a list of arguments, including numbers, text, and logical values.',
        abstract: 'Returns the maximum value in a list of arguments, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/maxa-function-814bda1e-3840-4bff-9365-2f59ac2ee62d',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The first number argument for which you want to find the largest value.' },
            value2: { name: 'value2', detail: 'Number arguments 2 to 255 for which you want to find the largest value.' },
        },
    },
    MAXIFS: {
        description: 'Returns the maximum value among cells specified by a given set of conditions or criteria.',
        abstract: 'Returns the maximum value among cells specified by a given set of conditions or criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'The range of cells to max.' },
            criteriaRange1: { name: 'criteria_range1 ', detail: 'Is the set of cells to evaluate with the criteria.' },
            criteria1: { name: 'criteria1', detail: 'Is the criteria in the form of a number, expression, or text that defines which cells will be evaluated as maximum. ' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Additional ranges. You can enter up to 127 ranges.' },
            criteria2: { name: 'criteria2', detail: 'Additional associated criteria. You can enter up to 127 criteria.' },
        },
    },
    MEDIAN: {
        description: 'Returns the median of the given numbers',
        abstract: 'Returns the median of the given numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/median-function-d0916313-4753-414c-8537-ce85bdd967d2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    MIN: {
        description: 'Returns the smallest number in a set of values.',
        abstract: 'Returns the minimum value in a list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'The first number, cell reference, or range to calculate the minimum value from.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Additional numbers, cell references or ranges to calculate the minimum value from, up to a maximum of 255.',
            },
        },
    },
    MINA: {
        description: 'Returns the smallest value in a list of arguments, including numbers, text, and logical values',
        abstract: 'Returns the smallest value in a list of arguments, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/mina-function-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The first number, cell reference, or range to calculate the minimum value from.' },
            value2: { name: 'value2', detail: 'Additional numbers, cell references or ranges to calculate the minimum value from, up to a maximum of 255.' },
        },
    },
    MINIFS: {
        description: 'Returns the minimum value among cells specified by a given set of conditions or criteria.',
        abstract: 'Returns the minimum value among cells specified by a given set of conditions or criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/minifs-function-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'The actual range of cells in which the minimum value will be determined.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Is the set of cells to evaluate with the criteria.' },
            criteria1: { name: 'criteria1', detail: 'Is the criteria in the form of a number, expression, or text that defines which cells will be evaluated as minimum. The same set of criteria works for the MAXIFS, SUMIFS and AVERAGEIFS functions.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Additional ranges. You can enter up to 127 range.' },
            criteria2: { name: 'criteria2', detail: 'Additional associated criteria. You can enter up to 127 criteria.' },
        },
    },
    MODE_MULT: {
        description: 'Returns a vertical array of the most frequently occurring, or repetitive values in an array or range of data',
        abstract: 'Returns a vertical array of the most frequently occurring, or repetitive values in an array or range of data',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/mode-mult-function-50fd9464-b2ba-4191-b57a-39446689ae8c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    MODE_SNGL: {
        description: 'Returns the most common value in a data set',
        abstract: 'Returns the most common value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/mode-sngl-function-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Returns the negative binomial distribution',
        abstract: 'Returns the negative binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/negbinom-dist-function-c8239f89-c2d0-45bd-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORM_DIST: {
        description: 'Returns the normal cumulative distribution',
        abstract: 'Returns the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/norm-dist-function-edb1cc14-a21c-4e53-839d-8082074c9f8d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORM_INV: {
        description: 'Returns the inverse of the normal cumulative distribution',
        abstract: 'Returns the inverse of the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/norm-inv-function-54b30935-fee7-493c-bedb-2278a9db7e13',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORM_S_DIST: {
        description: 'Returns the standard normal cumulative distribution',
        abstract: 'Returns the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/norm-s-dist-function-1e787282-3832-4520-a9ae-bd2a8d99ba88',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORM_S_INV: {
        description: 'Returns the inverse of the standard normal cumulative distribution',
        abstract: 'Returns the inverse of the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/norm-s-inv-function-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PEARSON: {
        description: 'Returns the Pearson product moment correlation coefficient',
        abstract: 'Returns the Pearson product moment correlation coefficient',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/pearson-function-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Returns the k-th percentile of values in a range, where k is in the range 0..1, exclusive',
        abstract: 'Returns the k-th percentile of values in a range, where k is in the range 0..1, exclusive',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTILE_INC: {
        description: 'Returns the k-th percentile of values in a range',
        abstract: 'Returns the k-th percentile of values in a range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Returns the rank of a value in a data set as a percentage (0..1, exclusive) of the data set',
        abstract: 'Returns the rank of a value in a data set as a percentage (0..1, exclusive) of the data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentrank-exc-function-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Returns the percentage rank of a value in a data set',
        abstract: 'Returns the percentage rank of a value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERMUT: {
        description: 'Returns the number of permutations for a given number of objects',
        abstract: 'Returns the number of permutations for a given number of objects',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/permut-function-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERMUTATIONA: {
        description: 'Returns the number of permutations for a given number of objects (with repetitions) that can be selected from the total objects',
        abstract: 'Returns the number of permutations for a given number of objects (with repetitions) that can be selected from the total objects',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/permutationa-function-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PHI: {
        description: 'Returns the value of the density function for a standard normal distribution',
        abstract: 'Returns the value of the density function for a standard normal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/phi-function-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    POISSON_DIST: {
        description: 'Returns the Poisson distribution',
        abstract: 'Returns the Poisson distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/poisson-dist-function-8fe148ff-39a2-46cb-abf3-7772695d9636',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PROB: {
        description: 'Returns the probability that values in a range are between two limits',
        abstract: 'Returns the probability that values in a range are between two limits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/prob-function-9ac30561-c81c-4259-8253-34f0a238fc49',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    QUARTILE_EXC: {
        description: 'Returns the quartile of the data set, based on percentile values from 0..1, exclusive',
        abstract: 'Returns the quartile of the data set, based on percentile values from 0..1, exclusive',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/quartile-exc-function-5a355b7a-840b-4a01-b0f1-f538c2864cad',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    QUARTILE_INC: {
        description: 'Returns the quartile of a data set',
        abstract: 'Returns the quartile of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/quartile-inc-function-1bbacc80-5075-42f1-aed6-47d735c4819d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    RANK_AVG: {
        description: 'Returns the rank of a number in a list of numbers',
        abstract: 'Returns the rank of a number in a list of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/rank-avg-function-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The number whose rank you want to find.' },
            ref: { name: 'ref', detail: 'A reference to a list of numbers. Nonnumeric values in ref are ignored.' },
            order: { name: 'order', detail: 'A number specifying how to rank number. If order is 0 (zero) or omitted, Microsoft Excel ranks number as if ref were a list sorted in descending order. If order is any nonzero value, Microsoft Excel ranks number as if ref were a list sorted in ascending order.' },
        },
    },
    RANK_EQ: {
        description: 'Returns the rank of a number in a list of numbers',
        abstract: 'Returns the rank of a number in a list of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/rank-eq-function-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The number whose rank you want to find.' },
            ref: { name: 'ref', detail: 'A reference to a list of numbers. Nonnumeric values in ref are ignored.' },
            order: { name: 'order', detail: 'A number specifying how to rank number. If order is 0 (zero) or omitted, Microsoft Excel ranks number as if ref were a list sorted in descending order. If order is any nonzero value, Microsoft Excel ranks number as if ref were a list sorted in ascending order.' },
        },
    },
    RSQ: {
        description: 'Returns the square of the Pearson product moment correlation coefficient',
        abstract: 'Returns the square of the Pearson product moment correlation coefficient',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/rsq-function-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    SKEW: {
        description: 'Returns the skewness of a distribution',
        abstract: 'Returns the skewness of a distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/skew-function-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    SKEW_P: {
        description: 'Returns the skewness of a distribution based on a population: a characterization of the degree of asymmetry of a distribution around its mean',
        abstract: 'Returns the skewness of a distribution based on a population: a characterization of the degree of asymmetry of a distribution around its mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/skew-p-function-76530a5c-99b9-48a1-8392-26632d542fcb',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    SLOPE: {
        description: 'Returns the slope of the linear regression line',
        abstract: 'Returns the slope of the linear regression line',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/slope-function-11fb8f97-3117-4813-98aa-61d7e01276b9',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    SMALL: {
        description: 'Returns the k-th smallest value in a data set',
        abstract: 'Returns the k-th smallest value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/small-function-17da8222-7c82-42b2-961b-14c45384df07',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    STANDARDIZE: {
        description: 'Returns a normalized value',
        abstract: 'Returns a normalized value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/standardize-function-81d66554-2d54-40ec-ba83-6437108ee775',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    STDEV_P: {
        description: 'Calculates standard deviation based on the entire population given as arguments (ignores logical values and text).',
        abstract: 'Calculates standard deviation based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdev-p-function-6e917c05-31a0-496f-ade7-4f4e7462f285',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 254 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEV_S: {
        description: 'Estimates standard deviation based on a sample (ignores logical values and text in the sample).',
        abstract: 'Estimates standard deviation based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdev-s-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number argument corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 254 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVA: {
        description: 'Estimates standard deviation based on a sample, including numbers, text, and logical values.',
        abstract: 'Estimates standard deviation based on a sample, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdeva-function-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The first value argument corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
            value2: { name: 'value2', detail: 'Value arguments 2 to 254 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVPA: {
        description: 'Calculates standard deviation based on the entire population given as arguments, including text and logical values.',
        abstract: 'Calculates standard deviation based on the entire population, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdevpa-function-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The first value argument corresponding to a population.' },
            value2: { name: 'value2', detail: 'Value arguments 2 to 254 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STEYX: {
        description: 'Returns the standard error of the predicted y-value for each x in the regression',
        abstract: 'Returns the standard error of the predicted y-value for each x in the regression',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/steyx-function-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_DIST: {
        description: 'Returns the Percentage Points (probability) for the Student t-distribution',
        abstract: 'Returns the Percentage Points (probability) for the Student t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-dist-function-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_DIST_2T: {
        description: 'Returns the Percentage Points (probability) for the Student t-distribution',
        abstract: 'Returns the Percentage Points (probability) for the Student t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-dist-2t-function-198e9340-e360-4230-bd21-f52f22ff5c28',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_DIST_RT: {
        description: 'Returns the Student\'s t-distribution',
        abstract: 'Returns the Student\'s t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-dist-rt-function-20a30020-86f9-4b35-af1f-7ef6ae683eda',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_INV: {
        description: 'Returns the t-value of the Student\'s t-distribution as a function of the probability and the degrees of freedom',
        abstract: 'Returns the t-value of the Student\'s t-distribution as a function of the probability and the degrees of freedom',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-inv-function-2908272b-4e61-4942-9df9-a25fec9b0e2e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_INV_2T: {
        description: 'Returns the inverse of the Student\'s t-distribution',
        abstract: 'Returns the inverse of the Student\'s t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-inv-2t-function-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    T_TEST: {
        description: 'Returns the probability associated with a Student\'s t-test',
        abstract: 'Returns the probability associated with a Student\'s t-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/t-test-function-d4e08ec3-c545-485f-962e-276f7cbed055',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    TREND: {
        description: 'Returns values along a linear trend',
        abstract: 'Returns values along a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/trend-function-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    TRIMMEAN: {
        description: 'Returns the mean of the interior of a data set',
        abstract: 'Returns the mean of the interior of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    VAR_P: {
        description: 'Calculates variance based on the entire population (ignores logical values and text in the population).',
        abstract: 'Calculates variance based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/var-p-function-73d1285c-108c-4843-ba5d-a51f90656f3a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 254 corresponding to a population.' },
        },
    },
    VAR_S: {
        description: 'Estimates variance based on a sample (ignores logical values and text in the sample).',
        abstract: 'Estimates variance based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/var-s-function-913633de-136b-449d-813e-65a00b2b990b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number argument corresponding to a sample of a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 254 corresponding to a sample of a population.' },
        },
    },
    VARA: {
        description: 'Estimates variance based on a sample, including numbers, text, and logical values',
        abstract: 'Estimates variance based on a sample, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/vara-function-3de77469-fa3a-47b4-85fd-81758a1e1d07',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The value number argument corresponding to a sample of a population.' },
            value2: { name: 'value2', detail: 'Value arguments 2 to 254 corresponding to a sample of a population.' },
        },
    },
    VARPA: {
        description: 'Calculates variance based on the entire population, including numbers, text, and logical values',
        abstract: 'Calculates variance based on the entire population, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/varpa-function-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'The first value argument corresponding to a population.' },
            value2: { name: 'value2', detail: 'Value arguments 2 to 254 corresponding to a population.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Returns the Weibull distribution',
        abstract: 'Returns the Weibull distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/weibull-dist-function-4e783c39-9325-49be-bbc9-a83ef82b45db',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    Z_TEST: {
        description: 'Returns the one-tailed probability-value of a z-test',
        abstract: 'Returns the one-tailed probability-value of a z-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/z-test-function-d633d5a3-2031-4614-a016-92180ad82bee',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
};
