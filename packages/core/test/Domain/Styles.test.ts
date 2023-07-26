import { nanoid } from 'nanoid';
import { Style } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test Styles', () => {
    const styles = new Style({
        1: {
            cl: {
                rgb: 'red',
            },
        },
    });
    const index = styles.setValue({
        cl: {
            rgb: 'blue',
        },
    });
    styles.setValue({
        cl: {
            rgb: 'green',
        },
    });
    expect(styles.get(index)).toEqual({
        cl: {
            rgb: 'blue',
        },
    });
});

test('Test each', () => {
    const map = {
        [nanoid(6)]: { cl: { rgb: 'red' } },
    };
    const styles = new Style(map);
    styles.each(([id, val]) => {
        if (val && val.cl) {
            expect(val.cl.rgb).toEqual('red');
        }
    });
});

test('Test search', () => {
    const map = {
        [nanoid(6)]: { cl: { rgb: 'red' } },
    };
    const styles = new Style(map);
    const find = styles.search({ cl: { rgb: 'red' } });
    expect(find).not.toBeUndefined();
});

test('Test get', () => {
    const map = {
        [nanoid(6)]: { cl: { rgb: 'red' } },
    };
    const styles = new Style(map);
    // const find1 = styles.get({ cl: { rgb: 'red' } });
    // expect(find1).not.toBeUndefined();
    const find2 = styles.get('0');
    expect(find2).not.toBeUndefined();
});

test('Test add', () => {
    const map = {};
    const styles = new Style(map);

    styles.add({ cl: { rgb: 'red' } });
    styles.add({ tr: { a: 10 } });

    const find1 = styles.search({ cl: { rgb: 'red' } });
    expect(find1).not.toBeUndefined();

    const find2 = styles.search({ tr: { a: 10 } });
    expect(find2).not.toBeUndefined();
});

test('Test setValue', () => {
    const map = {};
    const styles = new Style(map);
    styles.add({ cl: { rgb: 'red' } });
    styles.add({ tr: { a: 10 } });

    const result1 = styles.setValue({ tr: { a: 20 } });
    expect(result1).not.toBeUndefined();

    const result2 = styles.setValue();
    expect(result2).toBeUndefined();
});
