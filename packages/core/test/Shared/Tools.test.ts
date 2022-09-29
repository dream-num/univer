/**
 * @jest-environment jsdom
 */
import { Tools } from '../../src/Shared/Tools';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('sheet Utils stringat', () => {
    expect(Tools.stringAt(2)).toEqual('C');
    expect(Tools.stringAt(30)).toEqual('undefinedE');
});

test('sheet Utils getEnvironment', () => {
    expect(Tools.getEnvironment().app_version).toEqual('4.0');
});

test('sheet Utils indexAt', () => {
    expect(Tools.indexAt('CE')).toEqual(82);
});

test('sheet Utils deleteBlank', () => {
    expect(Tools.deleteBlank('a b')).toEqual('ab');
    expect(Tools.deleteBlank()).toEqual(undefined);
});

test('sheet Utils getSystemType', () => {
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Mac68K',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Mac');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'X11',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Unix');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Linux',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Linux');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows 2000',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows 2000');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows XP',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows XP');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows 2003',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows 2003');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows Vista',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows Vista');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows 7',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows 7');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows 10',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows 10');
    Object.defineProperty(global.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
    });
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Windows 11',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Windows 11');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: '',
        configurable: true,
    });
    expect(Tools.getSystemType()).toEqual('Unknown system');
});

test('sheet Utils getBrowserType', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Opera',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('Opera');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Trident rv:11.0',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('IE11');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Edge',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('Edge');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Firefox',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('FF');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Safari',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('Safari');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Safari Chrome',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('Chrome');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'compatible; MSIE 7.0;',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('IE7');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'compatible; MSIE 8.0;',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('IE8');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'compatible; MSIE 9.0;',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('IE9');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'compatible; MSIE 10.0;',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('IE10');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'MSIE7',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('Unknown browser');
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'compatible; MSIE 5.0;',
        configurable: true,
    });
    expect(Tools.getBrowserType()).toEqual('0');
});

test('sheet Utils number check', () => {
    expect(Tools.isNumber([])).toBeFalsy();
    expect(Tools.isNumber({})).toBeFalsy();
    expect(Tools.isNumber(() => {})).toBeFalsy();
    expect(Tools.isNumber(undefined)).toBeFalsy();
    expect(Tools.isNumber(null)).toBeFalsy();
    expect(Tools.isNumber(0)).toBeTruthy();
    expect(Tools.isNumber(1212)).toBeTruthy();
    expect(Tools.isNumber(false)).toBeFalsy();
});

test('sheet Utils blank check', () => {
    expect(Tools.isBlank([])).toBeFalsy();
    expect(Tools.isBlank({})).toBeFalsy();
    expect(Tools.isBlank(() => {})).toBeFalsy();
    expect(Tools.isBlank(0)).toBeFalsy();
    expect(Tools.isBlank(1212)).toBeFalsy();
    expect(Tools.isBlank(false)).toBeFalsy();
    expect(Tools.isBlank(undefined)).toBeTruthy();
    expect(Tools.isBlank(null)).toBeTruthy();
    expect(Tools.isBlank('')).toBeTruthy();
    expect(Tools.isBlank(' ')).toBeTruthy();
    expect(Tools.isBlank(' ')).toBeTruthy();
});

test('sheet Utils plain object', () => {
    class GC {}
    expect(Tools.isPlainObject(new GC())).toBeFalsy();
    expect(Tools.isPlainObject({})).toBeTruthy();
    // eslint-disable-next-line no-new-object
    expect(Tools.isPlainObject(new Object())).toBeTruthy();
});

test('sheet Utils deepMerge', () => {
    const object = {
        zh: 'zh',
        en: 'en',
        array: [1, 2, 3],
        object: { key: 'key' },
    };
    const clone = Tools.deepMerge({}, object);
    expect(clone).toEqual(object);
    expect(clone.array === object.array).toBeFalsy();
    expect(clone.object === object.object).toBeFalsy();
    const arr = [[[1]], [[2]]];
    const arrClone = Tools.deepMerge([], arr);
    expect(arrClone === arr).toBeFalsy();
    const arr1 = [{ a: [1, 2] }];
    const arr1Clone = Tools.deepMerge([], arr1);
    expect(arr1Clone === arr1).toBeFalsy();
});

test('sheet Utils deepClone', () => {
    const object = {
        zh: 'zh',
        en: 'en',
        array: [1, 2, 3],
        object: { key: 'key' },
    };
    const clone = Tools.deepClone(object);
    expect(clone).toEqual(object);
    expect(clone.array === object.array).toBeFalsy();
    expect(clone.object === object.object).toBeFalsy();
    const reg = /test/;
    expect(Tools.deepClone(reg).test('test')).toEqual(true);
    expect(Tools.deepClone(new Date('1993')).getDate()).toEqual(1);
});

test('sheet Utils diffValue', () => {
    expect(Tools.diffValue(null, undefined)).toBeFalsy();
    expect(Tools.diffValue([], {})).toBeFalsy();
    expect(Tools.diffValue(1, '')).toBeFalsy();
    expect(Tools.diffValue(1, 1)).toBeTruthy();
    expect(Tools.diffValue(/s/, /s/)).toBeTruthy();
    expect(Tools.diffValue('s', 's')).toBeTruthy();
    expect(
        Tools.diffValue(new Date('2020/11/11'), new Date('2020/11/11'))
    ).toBeTruthy();
    expect(Tools.diffValue({ a: 1 }, { a: 1 })).toBeTruthy();
    expect(
        Tools.diffValue({ a: { b: 2, c: [1, 2, 3] } }, { a: { b: 2, c: [1, 2, 3] } })
    ).toBeTruthy();
    expect(
        Tools.diffValue({ a: { b: 2, c: [1, 2, 3] } }, { a: { b: 2, c: [1, 2, 4] } })
    ).toBeFalsy();
    expect(Tools.diffValue([1, 2, 3, 5], [1, 2, 3, 5])).toBeTruthy();
    expect(Tools.diffValue([1, 2, 3, 5], [1, 2, 8, 5])).toBeFalsy();
    expect(
        Tools.diffValue(
            [1, { b: 2, c: [1, 2, 3] }, 3, 5],
            [1, { b: 2, c: [1, 2, 3] }, 3, 5]
        )
    ).toBeTruthy();
});

test('sheet Utils isBoolean', () => {
    const a = true;
    expect(Tools.isBoolean(true)).toEqual(true);
});

test('sheet Utils isFunction', () => {
    const a = () => {};
    expect(Tools.isFunction(a)).toEqual(true);
});

test('sheet Utils hasLength', () => {
    const a = 'abc';
    expect(Tools.hasLength(a)).toEqual(true);
    const b = 'abc';
    expect(Tools.hasLength(b, 5)).toEqual(false);
});

test('sheet Utils capitalize', () => {
    const a = 'abc';
    expect(Tools.capitalize(a)).toEqual('Abc');
});

test('sheet Utils camelCase', () => {
    const a = 'ab-c';
    expect(Tools.camelCase(a)).toEqual('abC');
});

test('sheet Utils ABCatNum', () => {
    const a = '';
    expect(Tools.ABCatNum(a)).toEqual(NaN);
    const b = '`';
    expect(Tools.ABCatNum(b)).toEqual(NaN);
});

test('sheet Utils chatAtABC', () => {
    expect(Tools.chatAtABC(2)).toEqual('C');
});

test('sheet Utils itCount', () => {
    Tools.itCount(2)();
});

test('sheet Utils isAndroid', () => {
    Object.defineProperty(global.navigator, 'userAgent', { value: 'Android' });
    expect(Tools.isAndroid()).toEqual(true);
});

test('sheet Utils isTablet', () => {
    Object.defineProperty(global.navigator, 'userAgent', { value: 'ipad' });
    expect(Tools.isTablet()).toEqual(true);
});

test('sheet Utils isWeChat', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'micromessenger',
    });
    expect(Tools.isWeChat()).toEqual(true);
});

test('sheet Utils isIphone', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'iPhone',
    });
    expect(Tools.isIPhone()).toEqual(true);
});

test('sheet Utils isIEBrowser', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'User-Agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1;',
    });
    expect(Tools.isIEBrowser()).toEqual(true);
});

test('sheet Utils isMobile', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Android',
    });
    expect(Tools.isMobile()).toEqual(true);
    Object.defineProperty(document.body, 'clientWidth', {
        value: '300',
    });
    Object.defineProperty(document.body, 'clientHeight', {
        value: '400',
    });
    expect(Tools.isMobile()).toEqual(true);
});

test('sheet Utils fillTwoDimensionalArray', () => {
    const a = Tools.fillTwoDimensionalArray(3, 3, '3');
    expect(a.length).toEqual(3);
});

test('sheet Utils diffArrays', () => {
    expect(Tools.diffValue([1], [1, 2])).toEqual(false);
});

test('sheet Utils getLanguage', () => {
    Object.defineProperty(global, 'navigator', {
        value: null,
        configurable: true,
    });
    expect(Tools.getLanguage()).toEqual('en-US');
});
