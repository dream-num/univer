/**
 * @jest-environment jsdom
 */

import { Locale, LocaleType } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

// mock data
const zh = {
    type: '表格',
};
const en = {
    type: 'table',
};

test('Test Locale', () => {
    const locale = new Locale();

    locale.load({ zh, en });

    expect(locale.get('type')).toEqual('表格');

    locale.change(LocaleType.EN);

    expect(locale.get('type')).toEqual('table');
});
