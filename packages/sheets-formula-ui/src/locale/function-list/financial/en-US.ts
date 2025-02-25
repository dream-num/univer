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
    ACCRINT: {
        description: 'Returns the accrued interest for a security that pays periodic interest',
        abstract: 'Returns the accrued interest for a security that pays periodic interest',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/accrint-function-fe45d089-6722-4fb3-9379-e1f911d8dc74',
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
                url: 'https://support.microsoft.com/en-us/office/accrintm-function-f62f01f9-5754-4cc4-805b-0e70199328a7',
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
                url: 'https://support.microsoft.com/en-us/office/amordegrc-function-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORLINC: {
        description: 'Returns the depreciation for each accounting period',
        abstract: 'Returns the depreciation for each accounting period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/amorlinc-function-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaybs-function-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
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
                url: 'https://support.microsoft.com/en-us/office/coupdays-function-cc64380b-315b-4e7b-950c-b30b0a76f671',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaysnc-function-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
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
                url: 'https://support.microsoft.com/en-us/office/coupncd-function-fd962fef-506b-4d9d-8590-16df5393691f',
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
                url: 'https://support.microsoft.com/en-us/office/coupnum-function-a90af57b-de53-4969-9c99-dd6139db2522',
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
                url: 'https://support.microsoft.com/en-us/office/couppcd-function-2eb50473-6ee9-4052-a206-77a9a385d5b3',
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
                url: 'https://support.microsoft.com/en-us/office/cumipmt-function-61067bb0-9016-427d-b95b-1a752af0e606',
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
                url: 'https://support.microsoft.com/en-us/office/cumprinc-function-94a4516d-bd65-41a1-bc16-053a6af4c04d',
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
                url: 'https://support.microsoft.com/en-us/office/db-function-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
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
                url: 'https://support.microsoft.com/en-us/office/ddb-function-519a7a37-8772-4c96-85c0-ed2c209717a5',
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
                url: 'https://support.microsoft.com/en-us/office/disc-function-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
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
                url: 'https://support.microsoft.com/en-us/office/dollarde-function-db85aab0-1677-428a-9dfd-a38476693427',
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
                url: 'https://support.microsoft.com/en-us/office/dollarfr-function-0835d163-3023-4a33-9824-3042c5d4f495',
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
                url: 'https://support.microsoft.com/en-us/office/duration-function-b254ea57-eadc-4602-a86a-c8e369334038',
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
        description: 'Returns the effective annual interest rate',
        abstract: 'Returns the effective annual interest rate',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/effect-function-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'The nominal interest rate.' },
            npery: { name: 'npery', detail: 'The number of compounding periods per year.' },
        },
    },
    FV: {
        description: 'Returns the future value of an investment',
        abstract: 'Returns the future value of an investment',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/fv-function-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
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
                url: 'https://support.microsoft.com/en-us/office/fvschedule-function-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'The present value.' },
            schedule: { name: 'schedule', detail: 'An array of interest rates to apply.' },
        },
    },
    INTRATE: {
        description: 'Returns the interest rate for a fully invested security',
        abstract: 'Returns the interest rate for a fully invested security',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/intrate-function-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            investment: { name: 'investment', detail: 'The amount invested in the security.' },
            redemption: { name: 'redemption', detail: 'The amount to be received at maturity.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    IPMT: {
        description: 'Returns the interest payment for an investment for a given period',
        abstract: 'Returns the interest payment for an investment for a given period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/ipmt-function-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
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
    IRR: {
        description: 'Returns the internal rate of return for a series of cash flows',
        abstract: 'Returns the internal rate of return for a series of cash flows',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/irr-function-64925eaa-9988-495b-b290-3ad0c163c1bc',
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
                url: 'https://support.microsoft.com/en-us/office/ispmt-function-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
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
                url: 'https://support.microsoft.com/en-us/office/mduration-function-b3786a69-4f20-469a-94ad-33e5b90a763c',
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
                url: 'https://support.microsoft.com/en-us/office/mirr-function-b020f038-7492-4fb4-93c1-35c345b53524',
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
                url: 'https://support.microsoft.com/en-us/office/nominal-function-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
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
                url: 'https://support.microsoft.com/en-us/office/nper-function-240535b5-6653-4d2d-bfcf-b6a38151d815',
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
                url: 'https://support.microsoft.com/en-us/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568',
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
                url: 'https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
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
                url: 'https://support.microsoft.com/en-us/office/oddfyield-function-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
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
                url: 'https://support.microsoft.com/en-us/office/oddlprice-function-fb657749-d200-4902-afaf-ed5445027fc4',
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
                url: 'https://support.microsoft.com/en-us/office/oddlyield-function-c873d088-cf40-435f-8d41-c8232fee9238',
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
                url: 'https://support.microsoft.com/en-us/office/pduration-function-44f33460-5be5-4c90-b857-22308892adaf',
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
                url: 'https://support.microsoft.com/en-us/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441',
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
                url: 'https://support.microsoft.com/en-us/office/ppmt-function-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
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
                url: 'https://support.microsoft.com/en-us/office/price-function-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
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
                url: 'https://support.microsoft.com/en-us/office/pricedisc-function-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
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
                url: 'https://support.microsoft.com/en-us/office/pricemat-function-52c3b4da-bc7e-476a-989f-a95f675cae77',
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
                url: 'https://support.microsoft.com/en-us/office/pv-function-23879d31-0e02-4321-be01-da16e8168cbd',
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
                url: 'https://support.microsoft.com/en-us/office/rate-function-9f665657-4a7e-4bb7-a030-83fc59e748ce',
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
                url: 'https://support.microsoft.com/en-us/office/received-function-7a3f8b93-6611-4f81-8576-828312c9b5e5',
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
                url: 'https://support.microsoft.com/en-us/office/rri-function-6f5822d8-7ef1-4233-944c-79e8172930f4',
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
                url: 'https://support.microsoft.com/en-us/office/sln-function-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
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
                url: 'https://support.microsoft.com/en-us/office/syd-function-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
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
                url: 'https://support.microsoft.com/en-us/office/tbilleq-function-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
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
                url: 'https://support.microsoft.com/en-us/office/tbillprice-function-eacca992-c29d-425a-9eb8-0513fe6035a2',
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
                url: 'https://support.microsoft.com/en-us/office/tbillyield-function-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
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
                url: 'https://support.microsoft.com/en-us/office/vdb-function-dde4e207-f3fa-488d-91d2-66d55e861d73',
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
                url: 'https://support.microsoft.com/en-us/office/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d',
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
                url: 'https://support.microsoft.com/en-us/office/xnpv-function-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
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
                url: 'https://support.microsoft.com/en-us/office/yield-function-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
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
                url: 'https://support.microsoft.com/en-us/office/yielddisc-function-a9dbdbae-7dae-46de-b995-615faffaaed7',
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
                url: 'https://support.microsoft.com/en-us/office/yieldmat-function-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
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
