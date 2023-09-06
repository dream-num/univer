import { NUMFMT_PLUGIN_NAME } from './PLUGIN_NAME';

export const DEFAULT_DATA = [
    {
        label: 'defaultFmt.Automatic.text',
        value: 'Automatic',
        selected: true,
    },
    {
        label: 'defaultFmt.PlainText.text',
        value: 'PlainText',
        // border: true,
    },
    {
        // label: 'defaultFmt.Number.text',
        // suffix: 'defaultFmt.Number.example',
        value: 'Number',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Number.text',
                suffix: 'defaultFmt.Number.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Percent.text',
        // suffix: 'defaultFmt.Percent.example',
        value: 'Percent',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Percent.text',
                suffix: 'defaultFmt.Percent.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Scientific.text',
        // suffix: 'defaultFmt.Scientific.example',
        value: 'Scientific',
        // border: true,
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Scientific.text',
                suffix: 'defaultFmt.Scientific.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Accounting.text',
        // suffix: 'defaultFmt.Accounting.example',
        value: 'Accounting',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Accounting.text',
                suffix: 'defaultFmt.Accounting.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Thousand.text',
        // suffix: 'defaultFmt.Thousand.example',
        value: 'Thousand',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Thousand.text',
                suffix: 'defaultFmt.Thousand.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Currency.text',
        // suffix: 'defaultFmt.Currency.example',
        value: 'Currency',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Currency.text',
                suffix: 'defaultFmt.Currency.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Digit.text',
        // suffix: 'defaultFmt.Digit.example',
        value: 'Digit',
        // border: true,
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Digit.text',
                suffix: 'defaultFmt.Digit.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Date.text',
        // suffix: 'defaultFmt.Date.example',
        value: 'Date',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Date.text',
                suffix: 'defaultFmt.Date.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Time.text',
        // suffix: 'defaultFmt.Time.example',
        value: 'Time',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Time.text',
                suffix: 'defaultFmt.Time.example',
            },
        },
    },
    {
        // label: 'defaultFmt.Time24H.text',
        // suffix: 'defaultFmt.Time24H.example',
        value: 'Time24H',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.Time24H.text',
                suffix: 'defaultFmt.Time24H.example',
            },
        },
    },
    {
        // label: 'defaultFmt.DateTime.text',
        // suffix: 'defaultFmt.DateTime.example',
        value: 'DateTime',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.DateTime.text',
                suffix: 'defaultFmt.DateTime.example',
            },
        },
    },
    {
        // label: 'defaultFmt.DateTime24H.text',
        // suffix: 'defaultFmt.DateTime.example',
        value: 'DateTime24H',
        label: {
            name: `${NUMFMT_PLUGIN_NAME}FormatItem`,
            props: {
                labelText: 'defaultFmt.DateTime24H.text',
                suffix: 'defaultFmt.DateTime.example',
            },
        },
    },
];

export const MORE_FORMATS_SELECTIONS = [
    {
        label: 'format.moreCurrency',
        value: 'currency',
    },
    {
        label: 'format.moreDateTime',
        value: 'date',
    },
    {
        label: 'format.moreNumber',
        value: 'number',
    },
];
