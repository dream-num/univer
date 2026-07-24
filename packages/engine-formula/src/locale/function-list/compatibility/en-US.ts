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
    BETADIST: {
        description: 'Returns the cumulative beta probability density function. The beta distribution is commonly used to study variation in the percentage of something across samples, such as the fraction of the day people spend watching television.',
        abstract: 'Returns the cumulative beta probability density function. The beta distribution is commonly used to study variation in the percentage of something across samples, such as the fraction of the day people spend watching television.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value between A and B at which to evaluate the function.' },
            alpha: { name: 'alpha', detail: 'Required. A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'Required. A parameter of the distribution.' },
            A: { name: 'A', detail: 'Optional. A lower bound to the interval of x.' },
            B: { name: 'B', detail: 'Optional. An upper bound to the interval of x.' },
        },
    },
    BETAINV: {
        description: 'Returns the inverse of the cumulative beta probability density function for a specified beta distribution. That is, if probability = BETADIST(x,...), then BETAINV(probability,...) = x. The beta distribution can be used in project planning to model probable completion times given an expected completion time and variability.',
        abstract: 'Returns the inverse of the cumulative beta probability density function for a specified beta distribution. That is, if probability = BETADIST(x,...), then BETAINV(probability,...) = x. The beta distribution can be used in project planning to model probable completion times given an expected completion time and variability.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability associated with the beta distribution.' },
            alpha: { name: 'alpha', detail: 'Required. A parameter of the distribution.' },
            beta: { name: 'beta', detail: 'Required. A parameter the distribution.' },
            A: { name: 'A', detail: 'Optional. A lower bound to the interval of x.' },
            B: { name: 'B', detail: 'Optional. An upper bound to the interval of x.' },
        },
    },
    BINOMDIST: {
        description: 'Returns the individual term binomial distribution probability. Use BINOMDIST in problems with a fixed number of tests or trials, when the outcomes of any trial are only success or failure, when trials are independent, and when the probability of success is constant throughout the experiment. For example, BINOMDIST can calculate the probability that two of the next three babies born are male.',
        abstract: 'Returns the individual term binomial distribution probability. Use BINOMDIST in problems with a fixed number of tests or trials, when the outcomes of any trial are only success or failure, when trials are independent, and when the probability of success is constant throughout the experiment. For example, BINOMDIST can calculate the probability that two of the next three babies born are male.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Required. The number of successes in trials.' },
            trials: { name: 'trials', detail: 'Required. The number of independent trials.' },
            probabilityS: { name: 'probability_s', detail: 'Required. The probability of success on each trial.' },
            cumulative: { name: 'cumulative', detail: 'Required. A logical value that determines the form of the function. If cumulative is TRUE, then BINOMDIST returns the cumulative distribution function, which is the probability that there are at most number_s successes; if FALSE, it returns the probability mass function, which is the probability that there are number_s successes.' },
        },
    },
    CHIDIST: {
        description: 'Returns the right-tailed probability of the chi-squared distribution. The χ2 distribution is associated with a χ2 test. Use the χ2 test to compare observed and expected values. For example, a genetic experiment might hypothesize that the next generation of plants will exhibit a certain set of colors. By comparing the observed results with the expected ones, you can decide whether your original hypothesis is valid.',
        abstract: 'Returns the right-tailed probability of the chi-squared distribution. The χ2 distribution is associated with a χ2 test. Use the χ2 test to compare observed and expected values. For example, a genetic experiment might hypothesize that the next generation of plants will exhibit a certain set of colors. By comparing the observed results with the expected ones, you can decide whether your original hypothesis is valid.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value at which you want to evaluate the distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'Required. The number of degrees of freedom.' },
        },
    },
    CHIINV: {
        description: 'Returns the inverse of the right-tailed probability of the chi-squared distribution. If probability = CHIDIST(x,...), then CHIINV(probability,...) = x. Use this function to compare observed results with expected ones in order to decide whether your original hypothesis is valid.',
        abstract: 'Returns the inverse of the right-tailed probability of the chi-squared distribution. If probability = CHIDIST(x,...), then CHIINV(probability,...) = x. Use this function to compare observed results with expected ones in order to decide whether your original hypothesis is valid.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability associated with the chi-squared distribution.' },
            degFreedom: { name: 'deg_freedom', detail: 'Required. The number of degrees of freedom.' },
        },
    },
    CHITEST: {
        description: 'Returns the test for independence. CHITEST returns the value from the chi-squared (χ2) distribution for the statistic and the appropriate degrees of freedom. You can use χ2 tests to determine whether hypothesized results are verified by an experiment.',
        abstract: 'Returns the test for independence. CHITEST returns the value from the chi-squared (χ2) distribution for the statistic and the appropriate degrees of freedom. You can use χ2 tests to determine whether hypothesized results are verified by an experiment.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Required. The range of data that contains observations to test against expected values.' },
            expectedRange: { name: 'expected_range', detail: 'Required. The range of data that contains the ratio of the product of row totals and column totals to the grand total.' },
        },
    },
    CONFIDENCE: {
        description: 'Returns the confidence interval for a population mean, using a normal distribution.',
        abstract: 'Returns the confidence interval for a population mean, using a normal distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Required. The significance level used to compute the confidence level. The confidence level equals 100*(1 - alpha)%, or in other words, an alpha of 0.05 indicates a 95 percent confidence level.' },
            standardDev: { name: 'standard_dev', detail: 'Required. The population standard deviation for the data range and is assumed to be known.' },
            size: { name: 'size', detail: 'Required. The sample size.' },
        },
    },
    COVAR: {
        description: 'Returns covariance, the average of the products of deviations for each data point pair in two data sets.',
        abstract: 'Returns covariance, the average of the products of deviations for each data point pair in two data sets.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Required. The first cell range of integers.' },
            array2: { name: 'array2', detail: 'Required. The second cell range of integers.' },
        },
    },
    CRITBINOM: {
        description: 'Returns the smallest value for which the cumulative binomial distribution is greater than or equal to a criterion value. Use this function for quality assurance applications. For example, use CRITBINOM to determine the greatest number of defective parts that are allowed to come off an assembly line run without rejecting the entire lot.',
        abstract: 'Returns the smallest value for which the cumulative binomial distribution is greater than or equal to a criterion value. Use this function for quality assurance applications. For example, use CRITBINOM to determine the greatest number of defective parts that are allowed to come off an assembly line run without rejecting the entire lot.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Required. The number of Bernoulli trials.' },
            probabilityS: { name: 'probability_s', detail: 'Required. The probability of a success on each trial.' },
            alpha: { name: 'alpha', detail: 'Required. The criterion value.' },
        },
    },
    EXPONDIST: {
        description: 'Returns the exponential distribution. Use EXPONDIST to model the time between events, such as how long an automated bank teller takes to deliver cash. For example, you can use EXPONDIST to determine the probability that the process takes at most 1 minute.',
        abstract: 'Returns the exponential distribution. Use EXPONDIST to model the time between events, such as how long an automated bank teller takes to deliver cash. For example, you can use EXPONDIST to determine the probability that the process takes at most 1 minute.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value of the function.' },
            lambda: { name: 'lambda', detail: 'Required. The parameter value.' },
            cumulative: { name: 'cumulative', detail: 'Required. A logical value that indicates which form of the exponential function to provide. If cumulative is TRUE, EXPONDIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    FDIST: {
        description: 'Returns the (right-tailed) F probability distribution (degree of diversity) for two data sets. You can use this function to determine whether two data sets have different degrees of diversity. For example, you can examine the test scores of men and women entering high school and determine if the variability in the females is different from that found in the males.',
        abstract: 'Returns the (right-tailed) F probability distribution (degree of diversity) for two data sets. You can use this function to determine whether two data sets have different degrees of diversity. For example, you can examine the test scores of men and women entering high school and determine if the variability in the females is different from that found in the males.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value at which to evaluate the function.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Required. The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Required. The denominator degrees of freedom.' },
        },
    },
    FINV: {
        description: 'Returns the inverse of the (right-tailed) F probability distribution. If p = FDIST(x,...), then FINV(p,...) = x.',
        abstract: 'Returns the inverse of the (right-tailed) F probability distribution. If p = FDIST(x,...), then FINV(p,...) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability associated with the F cumulative distribution.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Required. The numerator degrees of freedom.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Required. The denominator degrees of freedom.' },
        },
    },
    FTEST: {
        description: 'Returns the result of an F-test. An F-test returns the two-tailed probability that the variances in array1 and array2 are not significantly different. Use this function to determine whether two samples have different variances. For example, given test scores from public and private schools, you can test whether these schools have different levels of test score diversity.',
        abstract: 'Returns the result of an F-test. An F-test returns the two-tailed probability that the variances in array1 and array2 are not significantly different. Use this function to determine whether two samples have different variances. For example, given test scores from public and private schools, you can test whether these schools have different levels of test score diversity.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Required. The first array or range of data.' },
            array2: { name: 'array2', detail: 'Required. The second array or range of data.' },
        },
    },
    GAMMADIST: {
        description: 'Returns the gamma distribution. You can use this function to study variables that may have a skewed distribution. The gamma distribution is commonly used in queuing analysis.',
        abstract: 'Returns the gamma distribution. You can use this function to study variables that may have a skewed distribution. The gamma distribution is commonly used in queuing analysis.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value at which you want to evaluate the distribution.' },
            alpha: { name: 'alpha', detail: 'Required. A parameter to the distribution.' },
            beta: { name: 'beta', detail: 'Required. A parameter to the distribution. If beta = 1, GAMMADIST returns the standard gamma distribution.' },
            cumulative: { name: 'cumulative', detail: 'Required. A logical value that determines the form of the function. If cumulative is TRUE, GAMMADIST returns the cumulative distribution function; if FALSE, it returns the probability density function.' },
        },
    },
    GAMMAINV: {
        description: 'Returns the inverse of the gamma cumulative distribution. If p = GAMMADIST(x,...), then GAMMAINV(p,...) = x. You can use this function to study a variable whose distribution may be skewed.',
        abstract: 'Returns the inverse of the gamma cumulative distribution. If p = GAMMADIST(x,...), then GAMMAINV(p,...) = x. You can use this function to study a variable whose distribution may be skewed.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. The probability associated with the gamma distribution.' },
            alpha: { name: 'alpha', detail: 'Required. A parameter to the distribution.' },
            beta: { name: 'beta', detail: 'Required. A parameter to the distribution. If beta = 1, GAMMAINV returns the standard gamma distribution.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Returns the hypergeometric distribution. HYPGEOMDIST returns the probability of a given number of sample successes, given the sample size, population successes, and population size. Use HYPGEOMDIST for problems with a finite population, where each observation is either a success or a failure, and where each subset of a given size is chosen with equal likelihood.',
        abstract: 'Returns the hypergeometric distribution. HYPGEOMDIST returns the probability of a given number of sample successes, given the sample size, population successes, and population size. Use HYPGEOMDIST for problems with a finite population, where each observation is either a success or a failure, and where each subset of a given size is chosen with equal likelihood.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Required. The number of successes in the sample.' },
            numberSample: { name: 'number_sample', detail: 'Required. The size of the sample.' },
            populationS: { name: 'population_s', detail: 'Required. The number of successes in the population.' },
            numberPop: { name: 'number_pop', detail: 'Required. The population size.' },
        },
    },
    LOGINV: {
        description: 'Returns the inverse of the lognormal cumulative distribution function of x, where ln(x) is normally distributed with parameters mean and standard_dev. If p = LOGNORMDIST(x,...) then LOGINV(p,...) = x.',
        abstract: 'Returns the inverse of the lognormal cumulative distribution function of x, where ln(x) is normally distributed with parameters mean and standard_dev. If p = LOGNORMDIST(x,...) then LOGINV(p,...) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability associated with the lognormal distribution.' },
            mean: { name: 'mean', detail: 'Required. The mean of ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Required. The standard deviation of ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Returns the cumulative lognormal distribution of x, where ln(x) is normally distributed with parameters mean and standard_dev. Use this function to analyze data that has been logarithmically transformed.',
        abstract: 'Returns the cumulative lognormal distribution of x, where ln(x) is normally distributed with parameters mean and standard_dev. Use this function to analyze data that has been logarithmically transformed.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value at which to evaluate the function.' },
            mean: { name: 'mean', detail: 'Required. The mean of ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Required. The standard deviation of ln(x).' },
        },
    },
    MODE: {
        description: 'Let\'s say you want to find out the most common number of bird species sighted in a sample of bird counts at a critical wetland over a 30-year time period, or you want to find out the most frequently occurring number of phone calls at a telephone support center during off-peak hours. To calculate the mode of a group of numbers, use the MODE function.',
        abstract: 'Let\'s say you want to find out the most common number of bird species sighted in a sample of bird counts at a critical wetland over a 30-year time period, or you want to find out the most frequently occurring number of phone calls at a telephone support center during off-peak hours. To calculate the mode of a group of numbers, use the MODE function.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. The first number argument for which you want to calculate the mode.' },
            number2: { name: 'number2', detail: 'Optional. Number arguments 2 to 255 for which you want to calculate the mode. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Returns the negative binomial distribution. NEGBINOMDIST returns the probability that there will be number_f failures before the number_s-th success, when the constant probability of a success is probability_s. This function is similar to the binomial distribution, except that the number of successes is fixed, and the number of trials is variable. Like the binomial, trials are assumed to be independent.',
        abstract: 'Returns the negative binomial distribution. NEGBINOMDIST returns the probability that there will be number_f failures before the number_s-th success, when the constant probability of a success is probability_s. This function is similar to the binomial distribution, except that the number of successes is fixed, and the number of trials is variable. Like the binomial, trials are assumed to be independent.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Required. The number of failures.' },
            numberS: { name: 'number_s', detail: 'Required. The threshold number of successes.' },
            probabilityS: { name: 'probability_s', detail: 'Required. The probability of a success.' },
        },
    },
    NORMDIST: {
        description: 'The NORMDIST function returns the normal distribution for the specified mean and standard deviation. This function has a wide range of applications in statistics, including hypothesis testing.',
        abstract: 'The NORMDIST function returns the normal distribution for the specified mean and standard deviation. This function has a wide range of applications in statistics, including hypothesis testing.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value for which you want the distribution' },
            mean: { name: 'mean', detail: 'Required. The arithmetic mean of the distribution' },
            standardDev: { name: 'standard_dev', detail: 'Required. The standard deviation of the distribution' },
            cumulative: { name: 'cumulative', detail: 'Required. A logical value that determines the form of the function. If cumulative is TRUE, NORMDIST returns the cumulative distribution function; if cumulative is FALSE, it returns the probability mass function.' },
        },
    },
    NORMINV: {
        description: 'Returns the inverse of the normal cumulative distribution for the specified mean and standard deviation.',
        abstract: 'Returns the inverse of the normal cumulative distribution for the specified mean and standard deviation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability corresponding to the normal distribution.' },
            mean: { name: 'mean', detail: 'Required. The arithmetic mean of the distribution.' },
            standardDev: { name: 'standard_dev', detail: 'Required. The standard deviation of the distribution.' },
        },
    },
    NORMSDIST: {
        description: 'Returns the standard normal cumulative distribution function. The distribution has a mean of 0 (zero) and a standard deviation of one. Use this function in place of a table of standard normal curve areas.',
        abstract: 'Returns the standard normal cumulative distribution function. The distribution has a mean of 0 (zero) and a standard deviation of one. Use this function in place of a table of standard normal curve areas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Required. The value for which you want the distribution.' },
        },
    },
    NORMSINV: {
        description: 'Returns the inverse of the standard normal cumulative distribution. The distribution has a mean of zero and a standard deviation of one.',
        abstract: 'Returns the inverse of the standard normal cumulative distribution. The distribution has a mean of zero and a standard deviation of one.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. A probability corresponding to the normal distribution.' },
        },
    },
    PERCENTILE: {
        description: 'Returns the k-th percentile of values in a range. You can use this function to establish a threshold of acceptance. For example, you can decide to examine candidates who score above the 90th percentile.',
        abstract: 'Returns the k-th percentile of values in a range. You can use this function to establish a threshold of acceptance. For example, you can decide to examine candidates who score above the 90th percentile.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Required. The array or range of data that defines relative standing.' },
            k: { name: 'k', detail: 'Required. The percentile value in the range 0..1, inclusive.' },
        },
    },
    PERCENTRANK: {
        description: 'The PERCENTRANK function returns the rank of a value in a dataset as a percentage of the dataset -- essentially, the relative standing of a value within the whole dataset. For example, you could use PERCENTRANK to determine the standing of an individual\'s test score among the field of all scores for the same test.',
        abstract: 'The PERCENTRANK function returns the rank of a value in a dataset as a percentage of the dataset -- essentially, the relative standing of a value within the whole dataset. For example, you could use PERCENTRANK to determine the standing of an individual\'s test score among the field of all scores for the same test.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Required. The range of data (or pre-defined array) of numeric values within which percent rank is determined.' },
            x: { name: 'x', detail: 'Required. The value for which you want to know the rank within the array.' },
            significance: { name: 'significance', detail: 'Optional. A value that identifies the number of significant digits for the returned percentage value. If omitted, PERCENTRANK uses three digits (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Returns the Poisson distribution. A common application of the Poisson distribution is predicting the number of events over a specific time, such as the number of cars arriving at a toll plaza in 1 minute.',
        abstract: 'Returns the Poisson distribution. A common application of the Poisson distribution is predicting the number of events over a specific time, such as the number of cars arriving at a toll plaza in 1 minute.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The number of events.' },
            mean: { name: 'mean', detail: 'Required. The expected numeric value.' },
            cumulative: { name: 'cumulative', detail: 'Required. A logical value that determines the form of the probability distribution returned. If cumulative is TRUE, POISSON returns the cumulative Poisson probability that the number of random events occurring will be between zero and x inclusive; if FALSE, it returns the Poisson probability mass function that the number of events occurring will be exactly x.' },
        },
    },
    QUARTILE: {
        description: 'Returns the quartile of a data set. Quartiles often are used in sales and survey data to divide populations into groups. For example, you can use QUARTILE to find the top 25 percent of incomes in a population.',
        abstract: 'Returns the quartile of a data set. Quartiles often are used in sales and survey data to divide populations into groups. For example, you can use QUARTILE to find the top 25 percent of incomes in a population.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Required. The array or cell range of numeric values for which you want the quartile value.' },
            quart: { name: 'quart', detail: 'Required. Indicates which value to return.' },
        },
    },
    RANK: {
        description: 'Returns the rank of a number in a list of numbers. The rank of a number is its size relative to other values in a list. (If you were to sort the list, the rank of the number would be its position.)',
        abstract: 'Returns the rank of a number in a list of numbers. The rank of a number is its size relative to other values in a list. (If you were to sort the list, the rank of the number would be its position.)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. The number whose rank you want to find.' },
            ref: { name: 'ref', detail: 'Required. A reference to a list of numbers. Nonnumeric values in ref are ignored.' },
            order: { name: 'order', detail: 'Optional. A number specifying how to rank number. If order is 0 (zero) or omitted, Microsoft Excel ranks number as if ref were a list sorted in descending order. If order is any nonzero value, Microsoft Excel ranks number as if ref were a list sorted in ascending order.' },
        },
    },
    STDEV: {
        description: 'Estimates standard deviation based on a sample. The standard deviation is a measure of how widely values are dispersed from the average value (the mean).',
        abstract: 'Estimates standard deviation based on a sample. The standard deviation is a measure of how widely values are dispersed from the average value (the mean).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. The first number argument corresponding to a sample of a population.' },
            number2: { name: 'number2', detail: 'Optional. Number arguments 2 to 255 corresponding to a sample of a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    STDEVP: {
        description: 'Calculates standard deviation based on the entire population given as arguments. The standard deviation is a measure of how widely values are dispersed from the average value (the mean).',
        abstract: 'Calculates standard deviation based on the entire population given as arguments. The standard deviation is a measure of how widely values are dispersed from the average value (the mean).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Optional. Number arguments 2 to 255 corresponding to a population. You can also use a single array or a reference to an array instead of arguments separated by commas.' },
        },
    },
    TDIST: {
        description: 'Returns the Percentage Points (probability) for the Student t-distribution where a numeric value (x) is a calculated value of t for which the Percentage Points are to be computed. The t-distribution is used in the hypothesis testing of small sample data sets. Use this function in place of a table of critical values for the t-distribution.',
        abstract: 'Returns the Percentage Points (probability) for the Student t-distribution where a numeric value (x) is a calculated value of t for which the Percentage Points are to be computed. The t-distribution is used in the hypothesis testing of small sample data sets. Use this function in place of a table of critical values for the t-distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The numeric value at which to evaluate the distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'Required. An integer indicating the number of degrees of freedom.' },
            tails: { name: 'tails', detail: 'Required. Specifies the number of distribution tails to return. If Tails = 1, TDIST returns the one-tailed distribution. If Tails = 2, TDIST returns the two-tailed distribution.' },
        },
    },
    TINV: {
        description: 'Returns the two-tailed inverse of the Student\'s t-distribution.',
        abstract: 'Returns the two-tailed inverse of the Student\'s t-distribution.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Required. The probability associated with the two-tailed Student\'s t-distribution.' },
            degFreedom: { name: 'degFreedom', detail: 'Required. The number of degrees of freedom with which to characterize the distribution.' },
        },
    },
    TTEST: {
        description: 'Returns the probability associated with a Student\'s t-Test. Use TTEST to determine whether two samples are likely to have come from the same two underlying populations that have the same mean.',
        abstract: 'Returns the probability associated with a Student\'s t-Test. Use TTEST to determine whether two samples are likely to have come from the same two underlying populations that have the same mean.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Required. The first data set.' },
            array2: { name: 'array2', detail: 'Required. The second data set.' },
            tails: { name: 'tails', detail: 'Required. Specifies the number of distribution tails. If tails = 1, TTEST uses the one-tailed distribution. If tails = 2, TTEST uses the two-tailed distribution.' },
            type: { name: 'type', detail: 'Required. The kind of t-Test to perform.' },
        },
    },
    VAR: {
        description: 'Estimates variance based on a sample.',
        abstract: 'Estimates variance based on a sample.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. The first number argument corresponding to a sample of a population.' },
            number2: { name: 'number2', detail: 'Optional. Number arguments 2 to 255 corresponding to a sample of a population.' },
        },
    },
    VARP: {
        description: 'Calculates variance based on the entire population.',
        abstract: 'Calculates variance based on the entire population.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. The first number argument corresponding to a population.' },
            number2: { name: 'number2', detail: 'Optional. Number arguments 2 to 255 corresponding to a population.' },
        },
    },
    WEIBULL: {
        description: 'Returns the Weibull distribution. Use this distribution in reliability analysis, such as calculating a device\'s mean time to failure.',
        abstract: 'Returns the Weibull distribution. Use this distribution in reliability analysis, such as calculating a device\'s mean time to failure.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Required. The value at which to evaluate the function.' },
            alpha: { name: 'alpha', detail: 'Required. A parameter to the distribution.' },
            beta: { name: 'beta', detail: 'Required. A parameter to the distribution.' },
            cumulative: { name: 'cumulative', detail: 'Required. Determines the form of the function.' },
        },
    },
    ZTEST: {
        description: 'Returns the one-tailed probability-value of a z-test. For a given hypothesized population mean, μ0, ZTEST returns the probability that the sample mean would be greater than the average of observations in the data set (array) — that is, the observed sample mean.',
        abstract: 'Returns the one-tailed probability-value of a z-test. For a given hypothesized population mean, μ0, ZTEST returns the probability that the sample mean would be greater than the average of observations in the data set (array) — that is, the observed sample mean.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Required. The array or range of data against which to test x.' },
            x: { name: 'x', detail: 'Required. The value to test.' },
            sigma: { name: 'sigma', detail: 'Optional. The population (known) standard deviation. If omitted, the sample standard deviation is used.' },
        },
    },
};

export default locale;
