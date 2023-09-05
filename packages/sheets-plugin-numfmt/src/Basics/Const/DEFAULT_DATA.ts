import { NUMFMT_PLUGIN_NAME } from "./PLUGIN_NAME";

export const DEFAULT_DATA = [
    {
        label: 'defaultFmt.Automatic.text',
        value: 'Automatic',
        selected: true,
    },
    {
        label: 'defaultFmt.PlainText.text',
        value: 'PlainText'
        // border: true,
    },
    {
        // label: 'defaultFmt.Number.text',
        // suffix: 'defaultFmt.Number.example',
        // value: 'Number'
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Number.text',
            suffix: 'defaultFmt.Number.example',
            value: 'Number'
        }
    },
    {
        // label: 'defaultFmt.Percent.text',
        // suffix: 'defaultFmt.Percent.example',
        // value: 'Percent'
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Percent.text',
            suffix: 'defaultFmt.Percent.example',
            value: 'Percent'
        }
    },
    {
        // label: 'defaultFmt.Scientific.text',
        // suffix: 'defaultFmt.Scientific.example',
        // value: 'Scientific'
        // border: true,
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Scientific.text',
            suffix: 'defaultFmt.Scientific.example',
            value: 'Scientific'
        }
    },
    {
        // label: 'defaultFmt.Accounting.text',
        // suffix: 'defaultFmt.Accounting.example',
        // value: 'Accounting',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Accounting.text',
            suffix: 'defaultFmt.Accounting.example',
            value: 'Accounting',
        }
    },
    {
        // label: 'defaultFmt.Thousand.text',
        // suffix: 'defaultFmt.Thousand.example',
        // value: 'Thousand',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Thousand.text',
            suffix: 'defaultFmt.Thousand.example',
            value: 'Thousand',
        }
    },
    {
        // label: 'defaultFmt.Currency.text',
        // suffix: 'defaultFmt.Currency.example',
        // value: 'Currency',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Currency.text',
            suffix: 'defaultFmt.Currency.example',
            value: 'Currency',
        }
    },
    {
        // label: 'defaultFmt.Digit.text',
        // suffix: 'defaultFmt.Digit.example',
        // value: 'Digit',
        // border: true,
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Digit.text',
            suffix: 'defaultFmt.Digit.example',
            value: 'Digit',
        }
    },
    {
        // label: 'defaultFmt.Date.text',
        // suffix: 'defaultFmt.Date.example',
        // value: 'Date',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Date.text',
            suffix: 'defaultFmt.Date.example',
            value: 'Date',
        }
    },
    {
        // label: 'defaultFmt.Time.text',
        // suffix: 'defaultFmt.Time.example',
        // value: 'Time',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Time.text',
            suffix: 'defaultFmt.Time.example',
            value: 'Time',
        }
    },
    {
        // label: 'defaultFmt.Time24H.text',
        // suffix: 'defaultFmt.Time24H.example',
        // value: 'Time24H',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.Time24H.text',
            suffix: 'defaultFmt.Time24H.example',
            value: 'Time24H',
        }
    },
    {
        // label: 'defaultFmt.DateTime.text',
        // suffix: 'defaultFmt.DateTime.example',
        // value: 'DateTime',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.DateTime.text',
            suffix: 'defaultFmt.DateTime.example',
            value: 'DateTime',
        }
    },
    {
        // label: 'defaultFmt.DateTime24H.text',
        // suffix: 'defaultFmt.DateTime.example',
        // value: 'DateTime24H',
        id: NUMFMT_PLUGIN_NAME + "FormatItem",
        props:{
            label: 'defaultFmt.DateTime24H.text',
            suffix: 'defaultFmt.DateTime.example',
            value: 'DateTime24H',
        }
    },
];

export const MORE_FORMATS_SELECTIONS = [
    {
        label: 'format.moreCurrency',
        value: 'MoreCurrency'
    },
    {
        label: 'format.moreDateTime',
        value: 'MoreDateTime'
    },
    {
        label: 'format.moreNumber',
        value: 'MoreNumber'
    },
]