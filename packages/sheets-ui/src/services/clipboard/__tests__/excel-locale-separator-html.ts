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

function excelClipboardHtml(params: {
    decimalSeparatorCss: string;
    thousandSeparatorCss: string;
    extraStyles?: string;
    body: string;
}): string {
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta name=ProgId content=Excel.Sheet>
<meta name=Generator content="Microsoft Excel 15">
<style>
<!--table
    {mso-displayed-decimal-separator:"${params.decimalSeparatorCss}";
    mso-displayed-thousand-separator:"${params.thousandSeparatorCss}";}
td
    {mso-number-format:General;
    vertical-align:bottom;}
${params.extraStyles ?? ''}
-->
</style>
</head>
<body>
${params.body}
</body>
</html>`;
}

const groupedIntegerStyle = `.xl65
    {mso-number-format:"\\#\\,\\#\\#0";}`;

const decimalStyle = `.xl66
    {mso-number-format:"0\\.0";}`;

const groupedDecimalStyle = `.xl67
    {mso-number-format:"\\#\\,\\#\\#0\\.0";}`;

const groupedDecimalTwoStyle = `.xl65
    {mso-number-format:"\\#\\,\\#\\#0\\.00";}`;

const textStyle = `.xlText
    {mso-number-format:"\\@";}`;

/** Vietnamese / German Excel clipboard: comma decimal, dot thousands. */
export const excelLocaleViDeHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\.',
    extraStyles: `${groupedIntegerStyle}
${decimalStyle}
${groupedDecimalStyle}`,
    body: `<table border=0 cellpadding=0 cellspacing=0>
<!--StartFragment-->
 <tr><td class=xl65>516.382.306.730</td></tr>
 <tr><td class=xl66>12,5</td></tr>
 <tr><td class=xl67>1.000,5</td></tr>
<!--EndFragment-->
</table>`,
});

/** French Excel clipboard: comma decimal, space thousands (`\\0020`). */
export const excelLocaleFrHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\0020',
    extraStyles: groupedDecimalStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl67>1 000,5</td></tr>
<!--EndFragment-->
</table>`,
});

/** French Excel clipboard using a non-breaking space as the thousand separator. */
export const excelLocaleFrNbspHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\00A0',
    extraStyles: groupedDecimalStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl67>1\u00A0000,5</td></tr>
<!--EndFragment-->
</table>`,
});

/** Swiss Excel clipboard: apostrophe thousands, dot decimal. */
export const excelLocaleChHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\.',
    thousandSeparatorCss: '\\\'',
    extraStyles: groupedDecimalTwoStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl65>1'234.56</td></tr>
<!--EndFragment-->
</table>`,
});

/** US Excel clipboard: unchanged separators. */
export const excelLocaleUsHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\.',
    thousandSeparatorCss: '\\,',
    extraStyles: groupedDecimalTwoStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl65>1,234.56</td></tr>
<!--EndFragment-->
</table>`,
});

/** Text-formatted Excel cell must stay text even when the value looks like a locale number. */
export const excelLocaleTextHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\.',
    extraStyles: textStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xlText>516.382.306.730</td></tr>
<!--EndFragment-->
</table>`,
});

/** Excel numeric cells can carry the raw value in `x:num`. */
export const excelLocaleXNumHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\.',
    extraStyles: groupedIntegerStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl65 x:num="516382306730">516.382.306.730</td></tr>
<!--EndFragment-->
</table>`,
});

/** General-format Vietnamese number with no custom mso-number-format class. */
export const excelLocaleViGeneralHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\,',
    thousandSeparatorCss: '\\.',
    body: `<table>
<!--StartFragment-->
 <tr><td>516.382.306.730</td></tr>
<!--EndFragment-->
</table>`,
});

export const excelLocaleUsPlainHtml = excelClipboardHtml({
    decimalSeparatorCss: '\\.',
    thousandSeparatorCss: '\\,',
    extraStyles: groupedIntegerStyle,
    body: `<table>
<!--StartFragment-->
 <tr><td class=xl65>1,234</td></tr>
<!--EndFragment-->
</table>`,
});
