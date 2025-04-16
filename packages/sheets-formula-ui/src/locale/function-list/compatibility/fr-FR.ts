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
    BETADIST: {
        description: 'Returns the beta cumulative distribution function',
        abstract: 'Returns the beta cumulative distribution function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/betadist-function-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BETAINV: {
        description: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        abstract: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/betainv-function-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    BINOMDIST: {
        description: 'Returns the individual term binomial distribution probability',
        abstract: 'Returns the individual term binomial distribution probability',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/binomdist-function-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHIDIST: {
        description: 'Returns the one-tailed probability of the chi-squared distribution',
        abstract: 'Returns the one-tailed probability of the chi-squared distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chidist-function-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHIINV: {
        description: 'Returns the inverse of the one-tailed probability of the chi-squared distribution',
        abstract: 'Returns the inverse of the one-tailed probability of the chi-squared distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chiinv-function-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CHITEST: {
        description: 'Returns the test for independence',
        abstract: 'Returns the test for independence',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/chitest-function-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CONFIDENCE: {
        description: 'Returns the confidence interval for a population mean',
        abstract: 'Returns the confidence interval for a population mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/confidence-function-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    COVAR: {
        description: 'Returns covariance, the average of the products of paired deviations',
        abstract: 'Returns covariance, the average of the products of paired deviations',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/covar-function-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    CRITBINOM: {
        description: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        abstract: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/critbinom-function-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    EXPONDIST: {
        description: 'Returns the exponential distribution',
        abstract: 'Returns the exponential distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/expondist-function-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FDIST: {
        description: 'Returns the F probability distribution',
        abstract: 'Returns the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/fdist-function-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FINV: {
        description: 'Returns the inverse of the F probability distribution',
        abstract: 'Returns the inverse of the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/finv-function-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    FTEST: {
        description: 'Returns the result of an F-test',
        abstract: 'Returns the result of an F-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/ftest-function-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMADIST: {
        description: 'Returns the gamma distribution',
        abstract: 'Returns the gamma distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gammadist-function-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    GAMMAINV: {
        description: 'Returns the inverse of the gamma cumulative distribution',
        abstract: 'Returns the inverse of the gamma cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/gammainv-function-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    HYPGEOMDIST: {
        description: 'Returns the hypergeometric distribution',
        abstract: 'Returns the hypergeometric distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hypgeomdist-function-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LOGINV: {
        description: 'Returns the inverse of the lognormal cumulative distribution function',
        abstract: 'Returns the inverse of the lognormal cumulative distribution function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/loginv-function-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    LOGNORMDIST: {
        description: 'Returns the cumulative lognormal distribution',
        abstract: 'Returns the cumulative lognormal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/lognormdist-function-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    MODE: {
        description: 'Returns the most common value in a data set',
        abstract: 'Returns the most common value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/mode-function-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NEGBINOMDIST: {
        description: 'Returns the negative binomial distribution',
        abstract: 'Returns the negative binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/negbinomdist-function-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORMDIST: {
        description: 'Returns the normal cumulative distribution',
        abstract: 'Returns the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/normdist-function-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORMINV: {
        description: 'Returns the inverse of the normal cumulative distribution',
        abstract: 'Returns the inverse of the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/norminv-function-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORMSDIST: {
        description: 'Returns the standard normal cumulative distribution',
        abstract: 'Returns the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/normsdist-function-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    NORMSINV: {
        description: 'Returns the inverse of the standard normal cumulative distribution',
        abstract: 'Returns the inverse of the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/normsinv-function-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTILE: {
        description: 'Returns the k-th percentile of values in a range',
        abstract: 'Returns the k-th percentile of values in a range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentile-function-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    PERCENTRANK: {
        description: 'Returns the percentage rank of a value in a data set',
        abstract: 'Returns the percentage rank of a value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/percentrank-function-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    POISSON: {
        description: 'Returns the Poisson distribution',
        abstract: 'Returns the Poisson distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/poisson-function-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    QUARTILE: {
        description: 'Returns the quartile of a data set',
        abstract: 'Returns the quartile of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/quartile-function-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    RANK: {
        description: 'Returns the rank of a number in a list of numbers',
        abstract: 'Returns the rank of a number in a list of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/rank-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The number whose rank you want to find.' },
            ref: { name: 'ref', detail: 'A reference to a list of numbers. Nonnumeric values in ref are ignored.' },
            order: { name: 'order', detail: 'A number specifying how to rank number. If order is 0 (zero) or omitted, Microsoft Excel ranks number as if ref were a list sorted in descending order. If order is any nonzero value, Microsoft Excel ranks number as if ref were a list sorted in ascending order.' },
        },
    },
    STDEV: {
        description: 'Estimates standard deviation based on a sample. The standard deviation is a measure of how widely values are dispersed from the average value (the mean).',
        abstract: 'Estimates standard deviation based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdev-function-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The premier number argument corresponding to a sample of a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 255 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVP: {
        description: 'Calculates standard deviation based on the entire population given as arguments.',
        abstract: 'Calculates standard deviation based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/stdevp-function-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The premier number argument corresponding to a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 255 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    TDIST: {
        description: 'Returns the Student\'s t-distribution',
        abstract: 'Returns the Student\'s t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/tdist-function-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    TINV: {
        description: 'Returns the inverse of the Student\'s t-distribution',
        abstract: 'Returns the inverse of the Student\'s t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/tinv-function-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    TTEST: {
        description: 'Returns the probability associated with a Student\'s t-test',
        abstract: 'Returns the probability associated with a Student\'s t-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/ttest-function-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    VAR: {
        description: 'Estimates variance based on a sample.',
        abstract: 'Estimates variance based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/var-function-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The premier number argument corresponding to a sample of a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 255 corresponding to a sample of a population.' },
        },
    },
    VARP: {
        description: 'Calculates variance based on the entire population.',
        abstract: 'Calculates variance based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/varp-function-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The premier number argument corresponding to a population.' },
            number2: { name: 'nombre2', detail: 'Number arguments 2 to 255 corresponding to a population.' },
        },
    },
    WEIBULL: {
        description: 'Returns the Weibull distribution',
        abstract: 'Returns the Weibull distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/weibull-function-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
    ZTEST: {
        description: 'Returns the one-tailed probability-value of a z-test',
        abstract: 'Returns the one-tailed probability-value of a z-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/ztest-function-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'premier' },
            number2: { name: 'nombre2', detail: 'second' },
        },
    },
};
