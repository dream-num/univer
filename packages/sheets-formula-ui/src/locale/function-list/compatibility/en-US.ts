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
                url: 'https://support.microsoft.com/en-us/office/betadist-function-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value between A and B at which to evaluate the function.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            A: { name: 'A', detail: 'A lower bound to the interval of x.' },
            B: { name: 'B', detail: 'An upper bound to the interval of x.' },
        },
    },
    BETAINV: {
        description: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        abstract: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/betainv-function-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the beta distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            A: { name: 'A', detail: 'A lower bound to the interval of x.' },
            B: { name: 'B', detail: 'An upper bound to the interval of x.' },
        },
    },
    BINOMDIST: {
        description: 'Returns the individual term binomial distribution probability',
        abstract: 'Returns the individual term binomial distribution probability',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/binomdist-function-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'The number of successes in trials.' },
            trials: { name: 'trials', detail: 'The number of independent trials.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of success on each trial.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, BINOMDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    CHIDIST: {
        description: 'Returns the right-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the right-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/chidist-function-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which you want to evaluate the distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
        },
    },
    CHIINV: {
        description: 'Returns the inverse of the right-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the inverse of the right-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/chiinv-function-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the chi-squared distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
        },
    },
    CHITEST: {
        description: 'Returns the test for independence',
        abstract: 'Returns the test for independence',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/chitest-function-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'The range of data that contains observations to test against expected values.' },
            expectedRange: { name: 'expected_range', detail: 'The range of data that contains the ratio of the product of row totals and column totals to the grand total.' },
        },
    },
    CONFIDENCE: {
        description: 'Returns the confidence interval for a population mean, using a normal distribution.',
        abstract: 'Returns the confidence interval for a population mean, using a normal distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/confidence-function-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'The significance level used to compute the confidence level. The confidence level equals 100*(1 - alpha)%, or in other words, an alpha of 0.05 indicates a 95 percent confidence level.' },
            standardDev: { name: 'standard_dev', detail: 'The population standard deviation for the data range and is assumed to be known.' },
            size: { name: 'size', detail: 'The sample size.' },
        },
    },
    COVAR: {
        description: 'Returns population covariance, the average of the products of deviations for each data point pair in two data sets.',
        abstract: 'Returns population covariance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/covar-function-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'A first range of cell values.' },
            array2: { name: 'array2', detail: 'A second range of cell values.' },
        },
    },
    CRITBINOM: {
        description: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        abstract: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/critbinom-function-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'The number of Bernoulli trials.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of success on each trial.' },
            alpha: { name: 'alpha', detail: 'The criterion value.' },
        },
    },
    EXPONDIST: {
        description: 'Returns the exponential distribution',
        abstract: 'Returns the exponential distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/expondist-function-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which you want to evaluate the distribution.' },
            lambda: { name: 'lambda', detail: 'The parameter value.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, EXPONDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    FDIST: {
        description: 'Returns the (right-tailed) F probability distribution',
        abstract: 'Returns the (right-tailed) F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/fdist-function-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which to evaluate the function.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
        },
    },
    FINV: {
        description: 'Returns the inverse of the (right-tailed) F probability distribution',
        abstract: 'Returns the inverse of the (right-tailed) F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/finv-function-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the F cumulative distribution.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
        },
    },
    FTEST: {
        description: 'Returns the result of an F-test',
        abstract: 'Returns the result of an F-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/ftest-function-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The first array or range of data.' },
            array2: { name: 'array2', detail: 'The second array or range of data.' },
        },
    },
    GAMMADIST: {
        description: 'Returns the gamma distribution',
        abstract: 'Returns the gamma distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/gammadist-function-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, GAMMADIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    GAMMAINV: {
        description: 'Returns the inverse of the gamma cumulative distribution',
        abstract: 'Returns the inverse of the gamma cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/gammainv-function-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the gamma distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Returns the hypergeometric distribution',
        abstract: 'Returns the hypergeometric distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hypgeomdist-function-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'The number of successes in the sample.' },
            numberSample: { name: 'number_sample', detail: 'The size of the sample.' },
            populationS: { name: 'population_s', detail: 'The number of successes in the population.' },
            numberPop: { name: 'number_pop', detail: 'The population size.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, HYPGEOMDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    LOGINV: {
        description: 'Returns the inverse of the lognormal cumulative distribution function',
        abstract: 'Returns the inverse of the lognormal cumulative distribution function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/loginv-function-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the lognormal distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
        },
    },
    LOGNORMDIST: {
        description: 'Returns the cumulative lognormal distribution',
        abstract: 'Returns the cumulative lognormal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/lognormdist-function-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, LOGNORM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    MODE: {
        description: 'Returns the most common value in a data set',
        abstract: 'Returns the most common value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/mode-function-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want calculate the mode.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want calculate the mode, up to a maximum of 255.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Returns the negative binomial distribution',
        abstract: 'Returns the negative binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/negbinomdist-function-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'The number of failures.' },
            numberS: { name: 'number_s', detail: 'The threshold number of successes.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of a success.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, NEGBINOMDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    NORMDIST: {
        description: 'Returns the normal cumulative distribution',
        abstract: 'Returns the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/normdist-function-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, NORMDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    NORMINV: {
        description: 'Returns the inverse of the normal cumulative distribution',
        abstract: 'Returns the inverse of the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/norminv-function-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the normal distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
        },
    },
    NORMSDIST: {
        description: 'Returns the standard normal cumulative distribution',
        abstract: 'Returns the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/normsdist-function-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'The value for which you want the distribution.' },
        },
    },
    NORMSINV: {
        description: 'Returns the inverse of the standard normal cumulative distribution',
        abstract: 'Returns the inverse of the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/normsinv-function-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the normal distribution.' },
        },
    },
    PERCENTILE: {
        description: 'Returns the k-th percentile of values in a data set (Includes 0 and 1)',
        abstract: 'Returns the k-th percentile of values in a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/percentile-function-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            k: { name: 'k', detail: 'The percentile value in the range 0 and 1 (Includes 0 and 1).' },
        },
    },
    PERCENTRANK: {
        description: 'Returns the percentage rank of a value in a data set (Includes 0 and 1)',
        abstract: 'Returns the percentage rank of a value in a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/percentrank-function-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            x: { name: 'x', detail: 'The value for which you want to know the rank.' },
            significance: { name: 'significance', detail: 'A value that identifies the number of significant digits for the returned percentage value. If omitted, PERCENTRANK.INC uses three digits (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Returns the Poisson distribution',
        abstract: 'Returns the Poisson distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/poisson-function-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, POISSON returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    QUARTILE: {
        description: 'Returns the quartile of a data set (Includes 0 and 1)',
        abstract: 'Returns the quartile of a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/quartile-function-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data for which you want quartile values.' },
            quart: { name: 'quart', detail: 'The quartile value to return.' },
        },
    },
    RANK: {
        description: 'Returns the rank of a number in a list of numbers',
        abstract: 'Returns the rank of a number in a list of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/rank-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number whose rank you want to find.' },
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
                url: 'https://support.microsoft.com/en-us/office/stdev-function-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a sample of a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 255 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVP: {
        description: 'Calculates standard deviation based on the entire population given as arguments.',
        abstract: 'Calculates standard deviation based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/stdevp-function-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 255 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    TDIST: {
        description: 'Returns the probability for the Student t-distribution',
        abstract: 'Returns the probability for the Student t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/tdist-function-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The numeric value at which to evaluate the distribution' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
            tails: { name: 'tails', detail: 'Specifies the number of distribution tails to return. If Tails = 1, TDIST returns the one-tailed distribution. If Tails = 2, TDIST returns the two-tailed distribution.' },
        },
    },
    TINV: {
        description: 'Returns the inverse of the probability for the Student t-distribution (two-tailed)',
        abstract: 'Returns the inverse of the probability for the Student t-distribution (two-tailed)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/tinv-function-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'The probability associated with the Student\'s t-distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
        },
    },
    TTEST: {
        description: 'Returns the probability associated with a Student\'s t-test',
        abstract: 'Returns the probability associated with a Student\'s t-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/ttest-function-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The first array or range of data.' },
            array2: { name: 'array2', detail: 'The second array or range of data.' },
            tails: { name: 'tails', detail: 'Specifies the number of distribution tails. If tails = 1, TTEST uses the one-tailed distribution. If tails = 2, TTEST uses the two-tailed distribution.' },
            type: { name: 'type', detail: 'The kind of t-Test to perform.' },
        },
    },
    VAR: {
        description: 'Estimates variance based on a sample.',
        abstract: 'Estimates variance based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/var-function-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a sample of a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 255 corresponding to a sample of a population.' },
        },
    },
    VARP: {
        description: 'Calculates variance based on the entire population.',
        abstract: 'Calculates variance based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/varp-function-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 255 corresponding to a population.' },
        },
    },
    WEIBULL: {
        description: 'Returns the Weibull distribution',
        abstract: 'Returns the Weibull distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/weibull-function-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, WEIBULL returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    ZTEST: {
        description: 'Returns the one-tailed probability-value of a z-test',
        abstract: 'Returns the one-tailed probability-value of a z-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/ztest-function-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data against which to test x.' },
            x: { name: 'x', detail: 'The value to test.' },
            sigma: { name: 'sigma', detail: 'The population (known) standard deviation. If omitted, the sample standard deviation is used.' },
        },
    },
};
