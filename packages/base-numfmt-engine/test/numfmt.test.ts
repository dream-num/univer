/**
 * @jest-environment jsdom
 */
import { numfmt } from '../src/index';

test('numfmt custom', () => {
    const formatter = numfmt('[green]#,##0;[red]-#,##0');
    expect(formatter(100)).toEqual('100');
});

test('numfmt color', () => {
    const formatter = numfmt('[green]#,##0;[red]-#,##0');
    expect(formatter.color(-10)).toEqual('red');
    expect(formatter.color(10)).toEqual('green');
});

test('numfmt number', () => {
    const formatter = numfmt('[green]#,##0;[red]-#,##0');
    const color = formatter.color(-10);
    expect(color).toEqual('red');
});

test('numfmt date', () => {
    const formatter = numfmt('yyyy"年"m"月"d"日";@');
    expect(formatter(0)).toEqual('1900年1月0日');
});

test('numfmt time', () => {
    const formatter = numfmt('[$-409]h:mm:ss AM/PM;@');
    expect(formatter(12)).toEqual('12:00:00 AM');
});

test('numfmt currency', () => {
    const formatter = numfmt('￥#,##0.00;[red]￥#,##0.00');
    expect(formatter(1.0)).toEqual('￥1.00');
});

test('numfmt percentage', () => {
    const formatter = numfmt('0.00%');
    expect(formatter(0.1)).toEqual('10.00%');
});

test('numfmt percentage', () => {
    // console.log(numfmt.parseValue('100.00'));
    // console.log(numfmt("yyyy-mm-dd")(44876));

    const formatter = numfmt('')('100.00');
    console.log(formatter);
});
