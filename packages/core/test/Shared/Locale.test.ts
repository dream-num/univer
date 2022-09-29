/**
 * @jest-environment jsdom
 */

import { LocaleType, UniverSheet } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

// mock data
const zh = {
    type: '表格',
};
const en = {
    type: 'table',
};

test('Test Locale', () => {
    const univerSheet = UniverSheet.newInstance({
        id: 'workbook-01',
        sheets: [
            {
                name: 'first sheet',
            },
        ],
        locale: LocaleType.ZH,
    });

    const locale = univerSheet.context.getLocale();

    locale.load({ zh, en });

    expect(locale.get('type')).toEqual('表格');

    locale.change(LocaleType.EN);

    expect(locale.get('type')).toEqual('table');
});
