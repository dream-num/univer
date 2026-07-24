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
    ACCRINT: {
        description: 'Returns the accrued interest for a security that pays periodic interest',
        abstract: 'Returns the accrued interest for a security that pays periodic interest',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: "The security's issue date." },
            firstInterest: { name: 'first_interest', detail: "The security's first interest date." },
            settlement: { name: 'settlement', detail: "The security's maturity date." },
            rate: { name: 'rate', detail: "The security's annual coupon rate." },
            par: { name: 'par', detail: "The security's par value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
            calcMethod: { name: 'calc_method', detail: 'Is a logical value: interest accrues from the issue date = TRUE or ignored; interest accrues from the last coupon payment date = FALSE.' },
        },
    },
    ACCRINTM: {
        description: 'Returns the accrued interest for a security that pays interest at maturity',
        abstract: 'Returns the accrued interest for a security that pays interest at maturity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: "The security's issue date." },
            settlement: { name: 'settlement', detail: "The security's maturity date." },
            rate: { name: 'rate', detail: "The security's annual coupon rate." },
            par: { name: 'par', detail: "The security's par value." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    AMORDEGRC: {
        description: 'Returns the depreciation for each accounting period by using a depreciation coefficient',
        abstract: 'Returns the depreciation for each accounting period by using a depreciation coefficient',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The cost of the asset.' },
            datePurchased: { name: 'date_purchased', detail: 'The date of the purchase of the asset.' },
            firstPeriod: { name: 'first_period', detail: 'The date of the end of the first period.' },
            salvage: { name: 'salvage', detail: 'The salvage value at the end of the life of the asset.' },
            period: { name: 'period', detail: 'The period.' },
            rate: { name: 'rate', detail: 'The rate of depreciation.' },
            basis: { name: 'basis', detail: 'The year basis to be used.' },
        },
    },
    AMORLINC: {
        description: 'Returns the depreciation for each accounting period',
        abstract: 'Returns the depreciation for each accounting period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The cost of the asset.' },
            datePurchased: { name: 'date_purchased', detail: 'The date of the purchase of the asset.' },
            firstPeriod: { name: 'first_period', detail: 'The date of the end of the first period.' },
            salvage: { name: 'salvage', detail: 'The salvage value at the end of the life of the asset.' },
            period: { name: 'period', detail: 'The period.' },
            rate: { name: 'rate', detail: 'The rate of depreciation.' },
            basis: { name: 'basis', detail: 'The year basis to be used.' },
        },
    },
    COUPDAYBS: {
        description: 'Returns the number of days from the beginning of the coupon period to the settlement date',
        abstract: 'Returns the number of days from the beginning of the coupon period to the settlement date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    COUPDAYS: {
        description: 'Returns the number of days in the coupon period that contains the settlement date',
        abstract: 'Returns the number of days in the coupon period that contains the settlement date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    COUPDAYSNC: {
        description: 'Returns the number of days from the settlement date to the next coupon date',
        abstract: 'Returns the number of days from the settlement date to the next coupon date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    COUPNCD: {
        description: 'Returns the next coupon date after the settlement date',
        abstract: 'Returns the next coupon date after the settlement date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    COUPNUM: {
        description: 'Returns the number of coupons payable between the settlement date and maturity date',
        abstract: 'Returns the number of coupons payable between the settlement date and maturity date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    COUPPCD: {
        description: 'Returns the previous coupon date before the settlement date',
        abstract: 'Returns the previous coupon date before the settlement date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    CUMIPMT: {
        description: 'Returns the cumulative interest paid between two periods',
        abstract: 'Returns the cumulative interest paid between two periods',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate.' },
            nper: { name: 'nper', detail: 'The total number of payment periods.' },
            pv: { name: 'pv', detail: 'The present value.' },
            startPeriod: { name: 'start_period', detail: 'The first period in the calculation. Payment periods are numbered beginning with 1.' },
            endPeriod: { name: 'end_period', detail: 'The last period in the calculation.' },
            type: { name: 'type', detail: 'The timing of the payment.' },
        },
    },
    CUMPRINC: {
        description: 'Returns the cumulative principal paid on a loan between two periods',
        abstract: 'Returns the cumulative principal paid on a loan between two periods',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate.' },
            nper: { name: 'nper', detail: 'The total number of payment periods.' },
            pv: { name: 'pv', detail: 'The present value.' },
            startPeriod: { name: 'start_period', detail: 'The first period in the calculation. Payment periods are numbered beginning with 1.' },
            endPeriod: { name: 'end_period', detail: 'The last period in the calculation.' },
            type: { name: 'type', detail: 'The timing of the payment.' },
        },
    },
    DB: {
        description: 'Returns the depreciation of an asset for a specified period by using the fixed-declining balance method',
        abstract: 'Returns the depreciation of an asset for a specified period by using the fixed-declining balance method',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The initial cost of the asset.' },
            salvage: { name: 'salvage', detail: 'The value at the end of the depreciation (sometimes called the salvage value of the asset).' },
            life: { name: 'life', detail: 'The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).' },
            period: { name: 'period', detail: 'The period for which you want to calculate the depreciation.' },
            month: { name: 'month', detail: 'The number of months in the first year. If month is omitted, it is assumed to be 12.' },
        },
    },
    DDB: {
        description: 'Returns the depreciation of an asset for a specified period by using the double-declining balance method or some other method that you specify',
        abstract: 'Returns the depreciation of an asset for a specified period by using the double-declining balance method or some other method that you specify',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The initial cost of the asset.' },
            salvage: { name: 'salvage', detail: 'The value at the end of the depreciation (sometimes called the salvage value of the asset).' },
            life: { name: 'life', detail: 'The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).' },
            period: { name: 'period', detail: 'The period for which you want to calculate the depreciation.' },
            factor: { name: 'factor', detail: 'The rate at which the balance declines. If factor is omitted, it is assumed to be 2 (the double-declining balance method).' },
        },
    },
    DISC: {
        description: 'Returns the discount rate for a security',
        abstract: 'Returns the discount rate for a security',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            pr: { name: 'pr', detail: "The security's price per $100 face value." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    DOLLARDE: {
        description: 'Converts a dollar price, expressed as a fraction, into a dollar price, expressed as a decimal number',
        abstract: 'Converts a dollar price, expressed as a fraction, into a dollar price, expressed as a decimal number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'A number expressed as an integer part and a fraction part, separated by a decimal symbol.' },
            fraction: { name: 'fraction', detail: 'The integer to use in the denominator of the fraction.' },
        },
    },
    DOLLARFR: {
        description: 'Converts a dollar price, expressed as a decimal number, into a dollar price, expressed as a fraction',
        abstract: 'Converts a dollar price, expressed as a decimal number, into a dollar price, expressed as a fraction',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'A decimal number.' },
            fraction: { name: 'fraction', detail: 'The integer to use in the denominator of the fraction.' },
        },
    },
    DURATION: {
        description: 'Returns the annual duration of a security with periodic interest payments',
        abstract: 'Returns the annual duration of a security with periodic interest payments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            coupon: { name: 'coupon', detail: "The security's annual coupon rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    EFFECT: {
        description: 'Returns the effective annual interest rate, given the nominal annual interest rate and the number of compounding periods per year.',
        abstract: 'Returns the effective annual interest rate, given the nominal annual interest rate and the number of compounding periods per year.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Required. The nominal interest rate.' },
            npery: { name: 'npery', detail: 'Required. The number of compounding periods per year.' },
        },
    },
    FV: {
        description: 'Returns the future value of an investment',
        abstract: 'Returns the future value of an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pmt: { name: 'pmt', detail: 'The payment made each period; it cannot change over the life of the annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    FVSCHEDULE: {
        description: 'Returns the future value of an initial principal after applying a series of compound interest rates',
        abstract: 'Returns the future value of an initial principal after applying a series of compound interest rates',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'The present value.' },
            schedule: { name: 'schedule', detail: 'An array of interest rates to apply.' },
        },
    },
    INTRATE: {
        description: 'Returns the interest rate for a fully invested security.',
        abstract: 'Returns the interest rate for a fully invested security.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Required. The security\'s settlement date. The security settlement date is the date after the issue date when the security is traded to the buyer.' },
            maturity: { name: 'maturity', detail: 'Required. The security\'s maturity date. The maturity date is the date when the security expires.' },
            investment: { name: 'investment', detail: 'Required. The amount invested in the security.' },
            redemption: { name: 'redemption', detail: 'Required. The amount to be received at maturity.' },
            basis: { name: 'basis', detail: 'Optional. The type of day count basis to use.' },
        },
    },
    IPMT: {
        description: 'Returns the interest payment for a given period for an investment based on periodic, constant payments and a constant interest rate.',
        abstract: 'Returns the interest payment for a given period for an investment based on periodic, constant payments and a constant interest rate.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Required. The interest rate per period.' },
            per: { name: 'per', detail: 'Required. The period for which you want to find the interest and must be in the range 1 to nper.' },
            nper: { name: 'nper', detail: 'Required. The total number of payment periods in an annuity.' },
            pv: { name: 'pv', detail: 'Required. The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'Optional. The future value, or a cash balance you want to attain after the last payment is made. If fv is omitted, it is assumed to be 0 (the future value of a loan, for example, is 0).' },
            type: { name: 'type', detail: 'Optional. The number 0 or 1 and indicates when payments are due. If type is omitted, it is assumed to be 0.' },
        },
    },
    IRR: {
        description: 'Returns the internal rate of return for a series of cash flows',
        abstract: 'Returns the internal rate of return for a series of cash flows',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'An array or a reference to cells that contain numbers for which you want to calculate the internal rate of return.\n1.Values must contain at least one positive value and one negative value to calculate the internal rate of return.\n2.IRR uses the order of values to interpret the order of cash flows. Be sure to enter your payment and income values in the sequence you want.\n3.If an array or reference argument contains text, logical values, or empty cells, those values are ignored.' },
            guess: { name: 'guess', detail: 'A number that you guess is close to the result of IRR.' },
        },
    },
    ISPMT: {
        description: 'Calculates the interest paid during a specific period of an investment',
        abstract: 'Calculates the interest paid during a specific period of an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate for the investment.' },
            per: { name: 'per', detail: 'The period for which you want to find the interest, and must be between 1 and Nper.' },
            nper: { name: 'nper', detail: 'The total number of payment periods for the investment.' },
            pv: { name: 'pv', detail: 'The present value of the investment. For a loan, Pv is the loan amount.' },
        },
    },
    MDURATION: {
        description: 'Returns the Macauley modified duration for a security with an assumed par value of $100',
        abstract: 'Returns the Macauley modified duration for a security with an assumed par value of $100',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            coupon: { name: 'coupon', detail: "The security's annual coupon rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    MIRR: {
        description: 'Returns the internal rate of return where positive and negative cash flows are financed at different rates',
        abstract: 'Returns the internal rate of return where positive and negative cash flows are financed at different rates',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'An array or a reference to cells that contain numbers. These numbers represent a series of payments (negative values) and income (positive values) occurring at regular periods.\n1.Values must contain at least one positive value and one negative value to calculate the modified internal rate of return. Otherwise, MIRR returns the #DIV/0! error value.\n2.If an array or reference argument contains text, logical values, or empty cells, those values are ignored; however, cells with the value zero are included.' },
            financeRate: { name: 'finance_rate', detail: 'The interest rate you pay on the money used in the cash flows.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'The interest rate you receive on the cash flows as you reinvest them.' },
        },
    },
    NOMINAL: {
        description: 'Returns the annual nominal interest rate',
        abstract: 'Returns the annual nominal interest rate',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'The effective interest rate.' },
            npery: { name: 'npery', detail: 'The number of compounding periods per year.' },
        },
    },
    NPER: {
        description: 'Returns the number of periods for an investment',
        abstract: 'Returns the number of periods for an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            pmt: { name: 'pmt', detail: 'The payment made each period; it cannot change over the life of the annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    NPV: {
        description: 'Returns the net present value of an investment based on a series of periodic cash flows and a discount rate',
        abstract: 'Returns the net present value of an investment based on a series of periodic cash flows and a discount rate',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The rate of discount over the length of one period.' },
            value1: { name: 'value1', detail: '1 to 254 arguments representing the payments and income.' },
            value2: { name: 'value2', detail: '1 to 254 arguments representing the payments and income.' },
        },
    },
    ODDFPRICE: {
        description: 'Returns the price per $100 face value of a security with an odd first period',
        abstract: 'Returns the price per $100 face value of a security with an odd first period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            issue: { name: 'issue', detail: "The security's issue date." },
            firstCoupon: { name: 'first_coupon', detail: "The security's first coupon date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    ODDFYIELD: {
        description: 'Returns the yield of a security with an odd first period',
        abstract: 'Returns the yield of a security with an odd first period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            issue: { name: 'issue', detail: "The security's issue date." },
            firstCoupon: { name: 'first_coupon', detail: "The security's first coupon date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            pr: { name: 'pr', detail: "The security's price." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    ODDLPRICE: {
        description: 'Returns the price per $100 face value of a security with an odd last period',
        abstract: 'Returns the price per $100 face value of a security with an odd last period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            lastInterest: { name: 'last_interest', detail: "The security's last coupon date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    ODDLYIELD: {
        description: 'Returns the yield of a security with an odd last period',
        abstract: 'Returns the yield of a security with an odd last period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            lastInterest: { name: 'last_interest', detail: "The security's last coupon date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            pr: { name: 'pr', detail: "The security's price." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    PDURATION: {
        description: 'Returns the number of periods required by an investment to reach a specified value',
        abstract: 'Returns the number of periods required by an investment to reach a specified value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Rate is the interest rate per period.' },
            pv: { name: 'pv', detail: 'Pv is the present value of the investment.' },
            fv: { name: 'fv', detail: 'Fv is the desired future value of the investment.' },
        },
    },
    PMT: {
        description: 'Returns the periodic payment for an annuity',
        abstract: 'Returns the periodic payment for an annuity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    PPMT: {
        description: 'Returns the payment on the principal for an investment for a given period',
        abstract: 'Returns the payment on the principal for an investment for a given period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            per: { name: 'per', detail: 'The period for which you want to find the interest and must be in the range 1 to nper.' },
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    PRICE: {
        description: 'Returns the price per $100 face value of a security that pays periodic interest',
        abstract: 'Returns the price per $100 face value of a security that pays periodic interest',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    PRICEDISC: {
        description: 'Returns the price per $100 face value of a discounted security',
        abstract: 'Returns the price per $100 face value of a discounted security',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            discount: { name: 'discount', detail: "The security's discount rate." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    PRICEMAT: {
        description: 'Returns the price per $100 face value of a security that pays interest at maturity',
        abstract: 'Returns the price per $100 face value of a security that pays interest at maturity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            issue: { name: 'issue', detail: "The security's issue date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            yld: { name: 'yld', detail: "The security's annual yield." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    PV: {
        description: 'Returns the present value of an investment',
        abstract: 'Returns the present value of an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pmt: { name: 'pmt', detail: 'The payment made each period; it cannot change over the life of the annuity.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    RATE: {
        description: 'Returns the interest rate per period of an annuity',
        abstract: 'Returns the interest rate per period of an annuity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pmt: { name: 'pmt', detail: 'The payment made each period; it cannot change over the life of the annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
            guess: { name: 'guess', detail: 'Your guess for what the rate will be.' },
        },
    },
    RECEIVED: {
        description: 'Returns the amount received at maturity for a fully invested security',
        abstract: 'Returns the amount received at maturity for a fully invested security',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            investment: { name: 'investment', detail: 'The amount invested in the security.' },
            discount: { name: 'discount', detail: "The security's discount rate." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    RRI: {
        description: 'Returns an equivalent interest rate for the growth of an investment',
        abstract: 'Returns an equivalent interest rate for the growth of an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Nper is the number of periods for the investment.' },
            pv: { name: 'pv', detail: 'Pv is the present value of the investment.' },
            fv: { name: 'fv', detail: 'Fv is the future value of the investment.' },
        },
    },
    SLN: {
        description: 'Returns the straight-line depreciation of an asset for one period',
        abstract: 'Returns the straight-line depreciation of an asset for one period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The initial cost of the asset.' },
            salvage: { name: 'salvage', detail: 'The value at the end of the depreciation (sometimes called the salvage value of the asset).' },
            life: { name: 'life', detail: 'The number of periods over which the asset is depreciated (sometimes called the useful life of the asset).' },
        },
    },
    SYD: {
        description: 'Returns the sum-of-years\' digits depreciation of an asset for a specified period',
        abstract: 'Returns the sum-of-years\' digits depreciation of an asset for a specified period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The initial cost of the asset.' },
            salvage: { name: 'salvage', detail: 'The value at the end of the depreciation (sometimes called the salvage value of the asset).' },
            life: { name: 'life', detail: 'The number of periods over which the asset is depreciated (sometimes called the useful life of the asset).' },
            per: { name: 'per', detail: 'The period and must use the same units as life.' },
        },
    },
    TBILLEQ: {
        description: 'Returns the bond-equivalent yield for a Treasury bill',
        abstract: 'Returns the bond-equivalent yield for a Treasury bill',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The Treasury bill's settlement date." },
            maturity: { name: 'maturity', detail: "The Treasury bill's maturity date." },
            discount: { name: 'discount', detail: "The Treasury bill's discount rate." },
        },
    },
    TBILLPRICE: {
        description: 'Returns the price per $100 face value for a Treasury bill',
        abstract: 'Returns the price per $100 face value for a Treasury bill',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The Treasury bill's settlement date." },
            maturity: { name: 'maturity', detail: "The Treasury bill's maturity date." },
            discount: { name: 'discount', detail: "The Treasury bill's discount rate." },
        },
    },
    TBILLYIELD: {
        description: 'Returns the yield for a Treasury bill',
        abstract: 'Returns the yield for a Treasury bill',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The Treasury bill's settlement date." },
            maturity: { name: 'maturity', detail: "The Treasury bill's maturity date." },
            pr: { name: 'pr', detail: "The Treasury bill's price per $100 face value." },
        },
    },
    VDB: {
        description: 'Returns the depreciation of an asset for a specified or partial period by using a declining balance method',
        abstract: 'Returns the depreciation of an asset for a specified or partial period by using a declining balance method',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'The initial cost of the asset.' },
            salvage: { name: 'salvage', detail: 'The value at the end of the depreciation (sometimes called the salvage value of the asset).' },
            life: { name: 'life', detail: 'The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).' },
            startPeriod: { name: 'start_period', detail: 'The starting period for which you want to calculate the depreciation.' },
            endPeriod: { name: 'end_period', detail: 'The ending period for which you want to calculate the depreciation.' },
            factor: { name: 'factor', detail: 'The rate at which the balance declines. If factor is omitted, it is assumed to be 2 (the double-declining balance method).' },
            noSwitch: { name: 'no_switch', detail: 'A logical value specifying whether to switch to straight-line depreciation when depreciation is greater than the declining balance calculation.' },
        },
    },
    XIRR: {
        description: 'Returns the internal rate of return for a schedule of cash flows that is not necessarily periodic',
        abstract: 'Returns the internal rate of return for a schedule of cash flows that is not necessarily periodic',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'A series of cash flows that corresponds to a schedule of payments in dates. The first payment is optional and corresponds to a cost or payment that occurs at the beginning of the investment. If the first value is a cost or payment, it must be a negative value. All succeeding payments are discounted based on a 365-day year. The series of values must contain at least one positive and one negative value.' },
            dates: { name: 'dates', detail: 'A schedule of payment dates that corresponds to the cash flow payments. Dates may occur in any order.' },
            guess: { name: 'guess', detail: 'A number that you guess is close to the result of XIRR.' },
        },
    },
    XNPV: {
        description: 'Returns the net present value for a schedule of cash flows that is not necessarily periodic',
        abstract: 'Returns the net present value for a schedule of cash flows that is not necessarily periodic',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The discount rate to apply to the cash flows.' },
            values: { name: 'values', detail: 'A series of cash flows that corresponds to a schedule of payments in dates. The first payment is optional and corresponds to a cost or payment that occurs at the beginning of the investment. If the first value is a cost or payment, it must be a negative value. All succeeding payments are discounted based on a 365-day year. The series of values must contain at least one positive and one negative value.' },
            dates: { name: 'dates', detail: 'A schedule of payment dates that corresponds to the cash flow payments. Dates may occur in any order.' },
        },
    },
    YIELD: {
        description: 'Returns the yield on a security that pays periodic interest',
        abstract: 'Returns the yield on a security that pays periodic interest',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            pr: { name: 'pr', detail: "The security's price per $100 face value." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            frequency: { name: 'frequency', detail: 'The number of coupon payments per year. For annual payments, frequency = 1; for semiannual, frequency = 2; for quarterly, frequency = 4.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    YIELDDISC: {
        description: 'Returns the annual yield for a discounted security; for example, a Treasury bill',
        abstract: 'Returns the annual yield for a discounted security; for example, a Treasury bill',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            pr: { name: 'pr', detail: "The security's price per $100 face value." },
            redemption: { name: 'redemption', detail: "The security's redemption value per $100 face value." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    YIELDMAT: {
        description: 'Returns the annual yield of a security that pays interest at maturity',
        abstract: 'Returns the annual yield of a security that pays interest at maturity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            issue: { name: 'issue', detail: "The security's issue date." },
            rate: { name: 'rate', detail: "The security's interest rate." },
            pr: { name: 'pr', detail: "The security's price per $100 face value." },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
};

export default locale;
