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
    AVEDEV: {
        description: 'Returns the average of the absolute deviations of data points from their mean.',
        abstract: 'Returns the average of the absolute deviations of data points from their mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the average.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.' },
        },
    },
    AVERAGE: {
        description: 'Returns the average (arithmetic mean) of the arguments.',
        abstract: 'Returns the average of its arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range for which you want the average.',
            },
            number2: {
                name: 'number2',
                detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.',
            },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'The AVERAGE.WEIGHTED function finds the weighted average of a set of values, given the values and the corresponding weights.',
        abstract: 'The AVERAGE.WEIGHTED function finds the weighted average of a set of values, given the values and the corresponding weights.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=en',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'The values to be averaged. May refer to a range of cells, or may contain the values themselves.' },
            weights: { name: 'weights', detail: 'The corresponding list of weights to apply. May refer to a range of cells, or may contain the weights themselves. Weights cannot be negative, though they can be zero. At least one of the weights must be positive. If using a range of cells, that range must have the same number of rows and columns as the range of values.' },
            additionalValues: { name: 'additional_values', detail: 'Additional values to average. Additional values are optional.' },
            additionalWeights: { name: 'additional_weights', detail: 'Additional weights to apply. Additional weights are optional, but each additional_value must be followed by exactly one additional_weight .' },
        },
    },
    AVERAGEA: {
        description: 'Returns the average of its arguments, including numbers, text, and logical values.',
        abstract: 'Returns the average of its arguments, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/averagea-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/averageif-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/averageifs-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value between A and B at which to evaluate the function.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, BETA.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
            A: { name: 'A', detail: 'A lower bound to the interval of x.' },
            B: { name: 'B', detail: 'An upper bound to the interval of x.' },
        },
    },
    BETA_INV: {
        description: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        abstract: 'Returns the inverse of the cumulative distribution function for a specified beta distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/beta-inv-function',
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
    BINOM_DIST: {
        description: 'Returns the individual term binomial distribution probability',
        abstract: 'Returns the individual term binomial distribution probability',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'The number of successes in trials.' },
            trials: { name: 'trials', detail: 'The number of independent trials.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of success on each trial.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, BINOM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Returns the probability of a trial result using a binomial distribution',
        abstract: 'Returns the probability of a trial result using a binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'The number of independent trials.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of success on each trial.' },
            numberS: { name: 'number_s', detail: 'The number of successes in trials.' },
            numberS2: { name: 'number_s2', detail: 'If provided, returns the probability that the number of successful trials will fall between number_s and number_s2.' },
        },
    },
    BINOM_INV: {
        description: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        abstract: 'Returns the smallest value for which the cumulative binomial distribution is less than or equal to a criterion value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'The number of Bernoulli trials.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of success on each trial.' },
            alpha: { name: 'alpha', detail: 'The criterion value.' },
        },
    },
    CHISQ_DIST: {
        description: 'Returns the left-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the left-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which you want to evaluate the distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, CHISQ.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Returns the right-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the right-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which you want to evaluate the distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
        },
    },
    CHISQ_INV: {
        description: 'Returns the inverse of the left-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the inverse of the left-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the chi-squared distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Returns the inverse of the right-tailed probability of the chi-squared distribution.',
        abstract: 'Returns the inverse of the right-tailed probability of the chi-squared distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the chi-squared distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'The number of degrees of freedom.' },
        },
    },
    CHISQ_TEST: {
        description: 'Returns the test for independence',
        abstract: 'Returns the test for independence',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'The range of data that contains observations to test against expected values.' },
            expectedRange: { name: 'expected_range', detail: 'The range of data that contains the ratio of the product of row totals and column totals to the grand total.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Returns the confidence interval for a population mean, using a normal distribution.',
        abstract: 'Returns the confidence interval for a population mean, using a normal distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'The significance level used to compute the confidence level. The confidence level equals 100*(1 - alpha)%, or in other words, an alpha of 0.05 indicates a 95 percent confidence level.' },
            standardDev: { name: 'standard_dev', detail: 'The population standard deviation for the data range and is assumed to be known.' },
            size: { name: 'size', detail: 'The sample size.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Returns the confidence interval for a population mean, using a Student\'s t distribution',
        abstract: 'Returns the confidence interval for a population mean, using a Student\'s t distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'The significance level used to compute the confidence level. The confidence level equals 100*(1 - alpha)%, or in other words, an alpha of 0.05 indicates a 95 percent confidence level.' },
            standardDev: { name: 'standard_dev', detail: 'The population standard deviation for the data range and is assumed to be known.' },
            size: { name: 'size', detail: 'The sample size.' },
        },
    },
    CORREL: {
        description: 'Returns the correlation coefficient between two data sets',
        abstract: 'Returns the correlation coefficient between two data sets',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'A first range of cell values.' },
            array2: { name: 'array2', detail: 'A second range of cell values.' },
        },
    },
    COUNT: {
        description: 'Counts the number of cells that contain numbers, and counts numbers within the list of arguments.',
        abstract: 'Counts how many numbers are in the list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/count-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/counta-function',
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
    COUNTBLANK: {
        description: 'Counts the number of blank cells within a range.',
        abstract: 'Counts the number of blank cells within a range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/countblank-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/use-the-countif-function-in-microsoft-excel',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/countifs-function',
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
        description: 'Returns population covariance, the average of the products of deviations for each data point pair in two data sets.',
        abstract: 'Returns population covariance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'A first range of cell values.' },
            array2: { name: 'array2', detail: 'A second range of cell values.' },
        },
    },
    COVARIANCE_S: {
        description: 'Returns the sample covariance, the average of the products of deviations for each data point pair in two data sets.',
        abstract: 'Returns the sample covariance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'A first range of cell values.' },
            array2: { name: 'array2', detail: 'A second range of cell values.' },
        },
    },
    DEVSQ: {
        description: 'Returns the sum of squares of deviations',
        abstract: 'Returns the sum of squares of deviations',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The fist argument for which you want to calculate the sum of squared deviations.' },
            number2: { name: 'number2', detail: 'The 2 to 255 arguments for which you want to calculate the sum of squared deviations.' },
        },
    },
    EXPON_DIST: {
        description: 'Returns the exponential distribution',
        abstract: 'Returns the exponential distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which you want to evaluate the distribution.' },
            lambda: { name: 'lambda', detail: 'The parameter value.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, EXPON.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    F_DIST: {
        description: 'Returns the F probability distribution',
        abstract: 'Returns the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which to evaluate the function.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, F.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    F_DIST_RT: {
        description: 'Returns the (right-tailed) F probability distribution',
        abstract: 'Returns the (right-tailed) F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value at which to evaluate the function.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
        },
    },
    F_INV: {
        description: 'Returns the inverse of the F probability distribution',
        abstract: 'Returns the inverse of the F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the F cumulative distribution.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
        },
    },
    F_INV_RT: {
        description: 'Returns the inverse of the (right-tailed) F probability distribution',
        abstract: 'Returns the inverse of the (right-tailed) F probability distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the F cumulative distribution.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'The denominator degrees of freedom.' },
        },
    },
    F_TEST: {
        description: 'Returns the result of an F-test',
        abstract: 'Returns the result of an F-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The first array or range of data.' },
            array2: { name: 'array2', detail: 'The second array or range of data.' },
        },
    },
    FISHER: {
        description: 'Returns the Fisher transformation',
        abstract: 'Returns the Fisher transformation',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'A numeric value for which you want the transformation.' },
        },
    },
    FISHERINV: {
        description: 'Returns the inverse of the Fisher transformation',
        abstract: 'Returns the inverse of the Fisher transformation',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'The value for which you want to perform the inverse of the transformation.' },
        },
    },
    FORECAST: {
        description: 'Returns a value along a linear trend',
        abstract: 'Returns a value along a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The data point for which you want to predict a value.' },
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    FORECAST_ETS: {
        description: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        abstract: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Target date', detail: 'The data point for which you want to predict a value.' },
            values: { name: 'Values', detail: 'The historical values for which you want to forecast the next points.' },
            timeline: { name: 'Timeline', detail: 'The independent range or array of numeric dates or times with a constant step.' },
            seasonality: { name: 'Seasonality', detail: 'Optional. The seasonal length. Use 1 for automatic detection (default) or 0 for no seasonality.' },
            dataCompletion: { name: 'Data completion', detail: 'Optional. How to handle missing points. Use 1 to interpolate (default) or 0 to treat them as zero.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. A value from 1 through 7 that specifies how to aggregate duplicate time stamps.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Returns a confidence interval for the forecast value at the specified target date',
        abstract: 'Returns a confidence interval for the forecast value at the specified target date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Target date', detail: 'The data point for which you want a confidence interval.' },
            values: { name: 'Values', detail: 'The historical values used for the forecast.' },
            timeline: { name: 'Timeline', detail: 'The independent range or array of numeric dates or times with a constant step.' },
            confidenceLevel: { name: 'Confidence level', detail: 'Optional. A number between 0 and 1 for the confidence level. The default is 0.95.' },
            seasonality: { name: 'Seasonality', detail: 'Optional. The seasonal length. Use 1 for automatic detection (default) or 0 for no seasonality.' },
            dataCompletion: { name: 'Data completion', detail: 'Optional. How to handle missing points. Use 1 to interpolate (default) or 0 to treat them as zero.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. A value from 1 through 7 that specifies how to aggregate duplicate time stamps.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        abstract: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Values', detail: 'The historical values for which you want to detect seasonality.' },
            timeline: { name: 'Timeline', detail: 'The independent range or array of numeric dates or times with a constant step.' },
            dataCompletion: { name: 'Data completion', detail: 'Optional. How to handle missing points. Use 1 to interpolate (default) or 0 to treat them as zero.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. A value from 1 through 7 that specifies how to aggregate duplicate time stamps.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Returns a statistical value as a result of time series forecasting',
        abstract: 'Returns a statistical value as a result of time series forecasting',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Values', detail: 'The historical values used for the forecast.' },
            timeline: { name: 'Timeline', detail: 'The independent range or array of numeric dates or times with a constant step.' },
            statisticType: { name: 'Statistic type', detail: 'A value from 1 through 8 that specifies which forecast statistic to return.' },
            seasonality: { name: 'Seasonality', detail: 'Optional. The seasonal length. Use 1 for automatic detection (default) or 0 for no seasonality.' },
            dataCompletion: { name: 'Data completion', detail: 'Optional. How to handle missing points. Use 1 to interpolate (default) or 0 to treat them as zero.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. A value from 1 through 7 that specifies how to aggregate duplicate time stamps.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Returns a future value based on existing values',
        abstract: 'Returns a future value based on existing values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The data point for which you want to predict a value.' },
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    FREQUENCY: {
        description: 'Returns a frequency distribution as a vertical array',
        abstract: 'Returns a frequency distribution as a vertical array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'An array of or reference to a set of values for which you want to count frequencies. If data_array contains no values, FREQUENCY returns an array of zeros.' },
            binsArray: { name: 'bins_array', detail: 'An array of or reference to intervals into which you want to group the values in data_array. If bins_array contains no values, FREQUENCY returns the number of elements in data_array.' },
        },
    },
    GAMMA: {
        description: 'Returns the Gamma function value',
        abstract: 'Returns the Gamma function value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Input value to the gamma function.' },
        },
    },
    GAMMA_DIST: {
        description: 'Returns the gamma distribution',
        abstract: 'Returns the gamma distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, GAMMA.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    GAMMA_INV: {
        description: 'Returns the inverse of the gamma cumulative distribution',
        abstract: 'Returns the inverse of the gamma cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability associated with the gamma distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
        },
    },
    GAMMALN: {
        description: 'Returns the natural logarithm of the gamma function, Γ(x)',
        abstract: 'Returns the natural logarithm of the gamma function, Γ(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want to calculate GAMMALN.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Returns the natural logarithm of the gamma function, Γ(x)',
        abstract: 'Returns the natural logarithm of the gamma function, Γ(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want to calculate GAMMALN.PRECISE.' },
        },
    },
    GAUSS: {
        description: 'Returns 0.5 less than the standard normal cumulative distribution',
        abstract: 'Returns 0.5 less than the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'The value for which you want the distribution.' },
        },
    },
    GEOMEAN: {
        description: 'Returns the geometric mean',
        abstract: 'Returns the geometric mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the geometric mean.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the geometric mean, up to a maximum of 255.' },
        },
    },
    GROWTH: {
        description: 'Returns values along an exponential trend',
        abstract: 'Returns values along an exponential trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The set of y-values you already know in the relationship y = b*m^x.' },
            knownXs: { name: "known_x's", detail: 'The set of x-values you already know in the relationship y = b*m^x.' },
            newXs: { name: "new_x's", detail: 'Are new x-values for which you want GROWTH to return corresponding y-values.' },
            constb: { name: 'const', detail: 'A logical value specifying whether to force the constant b to equal 1.' },
        },
    },
    HARMEAN: {
        description: 'Returns the harmonic mean',
        abstract: 'Returns the harmonic mean',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the harmonic mean.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the harmonic mean, up to a maximum of 255.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Returns the hypergeometric distribution',
        abstract: 'Returns the hypergeometric distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'The number of successes in the sample.' },
            numberSample: { name: 'number_sample', detail: 'The size of the sample.' },
            populationS: { name: 'population_s', detail: 'The number of successes in the population.' },
            numberPop: { name: 'number_pop', detail: 'The population size.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, HYPGEOM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    INTERCEPT: {
        description: 'Returns the intercept of the linear regression line',
        abstract: 'Returns the intercept of the linear regression line',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    KURT: {
        description: 'Returns the kurtosis of a data set',
        abstract: 'Returns the kurtosis of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the kurtosis.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the kurtosis, up to a maximum of 255.' },
        },
    },
    LARGE: {
        description: 'Returns the k-th largest value in a data set',
        abstract: 'Returns the k-th largest value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data for which you want to determine the k-th largest value.' },
            k: { name: 'k', detail: 'The position (from the largest) in the array or cell range of data to return.' },
        },
    },
    LINEST: {
        description: 'Returns the parameters of a linear trend',
        abstract: 'Returns the parameters of a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The set of y-values you already know in the relationship y = m*x+b.' },
            knownXs: { name: "known_x's", detail: 'The set of x-values you already know in the relationship y = m*x+b.' },
            constb: { name: 'const', detail: 'A logical value specifying whether to force the constant b to equal 0.' },
            stats: { name: 'stats', detail: 'A logical value specifying whether to return additional regression statistics.' },
        },
    },
    LOGEST: {
        description: 'Returns the parameters of an exponential trend',
        abstract: 'Returns the parameters of an exponential trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The set of y-values you already know in the relationship y = b*m^x.' },
            knownXs: { name: "known_x's", detail: 'The set of x-values you already know in the relationship y = b*m^x.' },
            constb: { name: 'const', detail: 'A logical value specifying whether to force the constant b to equal 1.' },
            stats: { name: 'stats', detail: 'A logical value specifying whether to return additional regression statistics.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Returns the cumulative lognormal distribution',
        abstract: 'Returns the cumulative lognormal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, LOGNORM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    LOGNORM_INV: {
        description: 'Returns the inverse of the lognormal cumulative distribution',
        abstract: 'Returns the inverse of the lognormal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the lognormal distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
        },
    },
    MARGINOFERROR: {
        description: 'This function calculates the margin of error from a range of values and a confidence level.',
        abstract: 'This function calculates the margin of error from a range of values and a confidence level.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=en',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Range - The range of values used to calculate the margin of error.' },
            confidence: { name: 'confidence', detail: 'Confidence - The desired confidence level between (0, 1).' },
        },
    },
    MAX: {
        description: 'Returns the largest value in a set of values.',
        abstract: 'Returns the maximum value in a list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range to calculate the maximum value from.',
            },
            number2: {
                name: 'number2',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/maxa-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'The range of cells to max.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Is the set of cells to evaluate with the criteria.' },
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
                url: 'https://support.microsoft.com/en-us/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the given numbers.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the given numbers, up to a maximum of 255.' },
        },
    },
    MIN: {
        description: 'Returns the smallest number in a set of values.',
        abstract: 'Returns the minimum value in a list of arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'number1',
                detail: 'The first number, cell reference, or range to calculate the minimum value from.',
            },
            number2: {
                name: 'number2',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/mina-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/minifs-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want calculate the mode.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want calculate the mode, up to a maximum of 255.' },
        },
    },
    MODE_SNGL: {
        description: 'Returns the most common value in a data set',
        abstract: 'Returns the most common value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want calculate the mode.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want calculate the mode, up to a maximum of 255.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Returns the negative binomial distribution',
        abstract: 'Returns the negative binomial distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'The number of failures.' },
            numberS: { name: 'number_s', detail: 'The threshold number of successes.' },
            probabilityS: { name: 'probability_s', detail: 'The probability of a success.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, NEGBINOM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    NORM_DIST: {
        description: 'Returns the normal cumulative distribution',
        abstract: 'Returns the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, NORM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    NORM_INV: {
        description: 'Returns the inverse of the normal cumulative distribution',
        abstract: 'Returns the inverse of the normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the normal distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
        },
    },
    NORM_S_DIST: {
        description: 'Returns the standard normal cumulative distribution',
        abstract: 'Returns the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'The value for which you want the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, NORM.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    NORM_S_INV: {
        description: 'Returns the inverse of the standard normal cumulative distribution',
        abstract: 'Returns the inverse of the standard normal cumulative distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'A probability corresponding to the normal distribution.' },
        },
    },
    PEARSON: {
        description: 'Returns the Pearson product moment correlation coefficient',
        abstract: 'Returns the Pearson product moment correlation coefficient',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The dependent array or range of data.' },
            array2: { name: 'array2', detail: 'The independent array or range of data.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Returns the k-th percentile of values in a data set (Excludes 0 and 1).',
        abstract: 'Returns the k-th percentile of values in a data set (Excludes 0 and 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            k: { name: 'k', detail: 'The percentile value in the range 0 and 1 (Excludes 0 and 1).' },
        },
    },
    PERCENTILE_INC: {
        description: 'Returns the k-th percentile of values in a data set (Includes 0 and 1)',
        abstract: 'Returns the k-th percentile of values in a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            k: { name: 'k', detail: 'The percentile value in the range 0 and 1 (Includes 0 and 1).' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Returns the percentage rank of a value in a data set (Excludes 0 and 1)',
        abstract: 'Returns the percentage rank of a value in a data set (Excludes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            x: { name: 'x', detail: 'The value for which you want to know the rank.' },
            significance: { name: 'significance', detail: 'A value that identifies the number of significant digits for the returned percentage value. If omitted, PERCENTRANK.EXC uses three digits (0.xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Returns the percentage rank of a value in a data set (Includes 0 and 1)',
        abstract: 'Returns the percentage rank of a value in a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data that defines relative standing.' },
            x: { name: 'x', detail: 'The value for which you want to know the rank.' },
            significance: { name: 'significance', detail: 'A value that identifies the number of significant digits for the returned percentage value. If omitted, PERCENTRANK.INC uses three digits (0.xxx).' },
        },
    },
    PERMUT: {
        description: 'Returns the number of permutations for a given number of objects',
        abstract: 'Returns the number of permutations for a given number of objects',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number of items.' },
            numberChosen: { name: 'number_chosen', detail: 'The number of items in each permutations.' },
        },
    },
    PERMUTATIONA: {
        description: 'Returns the number of permutations for a given number of objects (with repetitions) that can be selected from the total objects',
        abstract: 'Returns the number of permutations for a given number of objects (with repetitions) that can be selected from the total objects',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number of items.' },
            numberChosen: { name: 'number_chosen', detail: 'The number of items in each permutations.' },
        },
    },
    PHI: {
        description: 'Returns the value of the density function for a standard normal distribution',
        abstract: 'Returns the value of the density function for a standard normal distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'X is the number for which you want the density of the standard normal distribution.' },
        },
    },
    POISSON_DIST: {
        description: 'Returns the Poisson distribution',
        abstract: 'Returns the Poisson distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, POISSON.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    PROB: {
        description: 'Returns the probability that values in a range are between two limits',
        abstract: 'Returns the probability that values in a range are between two limits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'The range of numeric values of x with which there are associated probabilities.' },
            probRange: { name: 'prob_range', detail: 'A set of probabilities associated with values in x_range.' },
            lowerLimit: { name: 'lower_limit', detail: 'The lower bound on the value for which you want a probability.' },
            upperLimit: { name: 'upper_limit', detail: 'The upper bound on the value for which you want a probability.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Returns the quartile of a data set (Excludes 0 and 1)',
        abstract: 'Returns the quartile of a data set (Excludes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data for which you want quartile values.' },
            quart: { name: 'quart', detail: 'The quartile value to return.' },
        },
    },
    QUARTILE_INC: {
        description: 'Returns the quartile of a data set (Includes 0 and 1)',
        abstract: 'Returns the quartile of a data set (Includes 0 and 1)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data for which you want quartile values.' },
            quart: { name: 'quart', detail: 'The quartile value to return.' },
        },
    },
    RANK_AVG: {
        description: 'Returns the rank of a number in a list of numbers',
        abstract: 'Returns the rank of a number in a list of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number whose rank you want to find.' },
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
                url: 'https://support.microsoft.com/en-us/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number whose rank you want to find.' },
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
                url: 'https://support.microsoft.com/en-us/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    SKEW: {
        description: 'Returns the skewness of a distribution',
        abstract: 'Returns the skewness of a distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the skewness.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the skewness, up to a maximum of 255.' },
        },
    },
    SKEW_P: {
        description: 'Returns the skewness of a distribution based on a population',
        abstract: 'Returns the skewness of a distribution based on a population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number, cell reference, or range for which you want the skewness.' },
            number2: { name: 'number2', detail: 'Additional numbers, cell references or ranges for which you want the skewness, up to a maximum of 255.' },
        },
    },
    SLOPE: {
        description: 'Returns the slope of the linear regression line',
        abstract: 'Returns the slope of the linear regression line',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    SMALL: {
        description: 'Returns the k-th smallest value in a data set',
        abstract: 'Returns the k-th smallest value in a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data for which you want to determine the k-th smallest value.' },
            k: { name: 'k', detail: 'The position (from the smallest) in the array or cell range of data to return.' },
        },
    },
    STANDARDIZE: {
        description: 'Returns a normalized value',
        abstract: 'Returns a normalized value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value you want to normalize.' },
            mean: { name: 'mean', detail: 'The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'The standard deviation of the distribution.' },
        },
    },
    STDEV_P: {
        description: 'Calculates standard deviation based on the entire population given as arguments (ignores logical values and text).',
        abstract: 'Calculates standard deviation based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 254 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEV_S: {
        description: 'Estimates standard deviation based on a sample (ignores logical values and text in the sample).',
        abstract: 'Estimates standard deviation based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 254 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVA: {
        description: 'Estimates standard deviation based on a sample, including numbers, text, and logical values.',
        abstract: 'Estimates standard deviation based on a sample, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/stdeva-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/stdevpa-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The dependent array or range of data.' },
            knownXs: { name: "known_x's", detail: 'The independent array or range of data.' },
        },
    },
    T_DIST: {
        description: 'Returns the probability for the Student t-distribution',
        abstract: 'Returns the probability for the Student t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The numeric value at which to evaluate the distribution' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, T.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    T_DIST_2T: {
        description: 'Returns the probability for the Student t-distribution (two-tailed)',
        abstract: 'Returns the probability for the Student t-distribution (two-tailed)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The numeric value at which to evaluate the distribution' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
        },
    },
    T_DIST_RT: {
        description: 'Returns the probability for the Student t-distribution (right-tailed)',
        abstract: 'Returns the probability for the Student t-distribution (right-tailed)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The numeric value at which to evaluate the distribution' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
        },
    },
    T_INV: {
        description: 'Returns the inverse of the probability for the Student t-distribution',
        abstract: 'Returns the inverse of the probability for the Student t-distribution',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'The probability associated with the Student\'s t-distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
        },
    },
    T_INV_2T: {
        description: 'Returns the inverse of the probability for the Student t-distribution (two-tailed)',
        abstract: 'Returns the inverse of the probability for the Student t-distribution (two-tailed)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'The probability associated with the Student\'s t-distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'An integer indicating the number of degrees of freedom.' },
        },
    },
    T_TEST: {
        description: 'Returns the probability associated with a Student\'s t-test',
        abstract: 'Returns the probability associated with a Student\'s t-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The first array or range of data.' },
            array2: { name: 'array2', detail: 'The second array or range of data.' },
            tails: { name: 'tails', detail: 'Specifies the number of distribution tails. If tails = 1, T.TEST uses the one-tailed distribution. If tails = 2, T.TEST uses the two-tailed distribution.' },
            type: { name: 'type', detail: 'The kind of t-Test to perform.' },
        },
    },
    TREND: {
        description: 'Returns values along a linear trend',
        abstract: 'Returns values along a linear trend',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'The set of y-values you already know in the relationship y = m*x+b.' },
            knownXs: { name: "known_x's", detail: 'The set of x-values you already know in the relationship y = m*x+b.' },
            newXs: { name: "new_x's", detail: 'Are new x-values for which you want TREND to return corresponding y-values.' },
            constb: { name: 'const', detail: 'A logical value specifying whether to force the constant b to equal 0.' },
        },
    },
    TRIMMEAN: {
        description: 'Returns the mean of the interior of a data set',
        abstract: 'Returns the mean of the interior of a data set',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of values to trim and average.' },
            percent: { name: 'percent', detail: 'The fractional number of data points to exclude from the calculation.' },
        },
    },
    VAR_P: {
        description: 'Calculates variance based on the entire population (ignores logical values and text in the population).',
        abstract: 'Calculates variance based on the entire population',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 254 corresponding to a population.' },
        },
    },
    VAR_S: {
        description: 'Estimates variance based on a sample (ignores logical values and text in the sample).',
        abstract: 'Estimates variance based on a sample',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number argument corresponding to a sample of a population.' },
            number2: { name: 'number2', detail: 'Number arguments 2 to 254 corresponding to a sample of a population.' },
        },
    },
    VARA: {
        description: 'Estimates variance based on a sample, including numbers, text, and logical values',
        abstract: 'Estimates variance based on a sample, including numbers, text, and logical values',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/vara-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/varpa-function',
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
                url: 'https://support.microsoft.com/en-us/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The value for which you want the distribution.' },
            alpha: { name: 'alpha', detail: 'A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'A parameter of the distribution.' },
            cumulative: { name: 'cumulative', detail: 'A logical value that determines the form of the function. If cumulative is TRUE, WEIBULL.DIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    Z_TEST: {
        description: 'Returns the one-tailed probability-value of a z-test',
        abstract: 'Returns the one-tailed probability-value of a z-test',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array or range of data against which to test x.' },
            x: { name: 'x', detail: 'The value to test.' },
            sigma: { name: 'sigma', detail: 'The population (known) standard deviation. If omitted, the sample standard deviation is used.' },
        },
    },
};

export default locale;
