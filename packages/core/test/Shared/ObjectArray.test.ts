import { ObjectArray } from '../../src/Shared/ObjectArray';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('object array create', () => {
    const array = new ObjectArray<{}>({ 1: 'UniverSheet1' });
    expect(array.getLength()).toEqual(2);
    array.push({ 2: 'UniverSheet2' });
    array.push({ 3: 'UniverSheet3' });
    expect(array.getLength()).toEqual(4);
});

test('object array pop', () => {
    const array = new ObjectArray();
    expect(array.pop()).toBeNull();
    array.push('univerSheet1');
    array.push('univerSheet2');
    array.push('univerSheet3');
    array.pop();
    expect(array.get(0)).toEqual('univerSheet1');
    expect(array.get(1)).toEqual('univerSheet2');
    expect(array.get(2)).toBeUndefined();
    expect(array.getLength()).toEqual(2);
});

test('object array shift', () => {
    const array = new ObjectArray();
    expect(array.shift()).toBeNull();

    array.push('univerSheet1');
    array.push('univerSheet2');
    array.push('univerSheet3');
    array.shift();

    expect(array.get(0)).toEqual('univerSheet2');
    expect(array.get(1)).toEqual('univerSheet3');
    expect(array.get(2)).toBeUndefined();
    expect(array.getLength()).toEqual(2);
});

test('object array inserts', () => {
    const array1 = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
    });
    const array2 = new ObjectArray({
        0: 'univerSheet3',
        1: 'univerSheet4',
        2: 'univerSheet5',
    });
    array1.inserts(0, array2);
    expect(array1.get(0)).toEqual('univerSheet3');
    expect(array1.get(1)).toEqual('univerSheet4');
    expect(array1.get(2)).toEqual('univerSheet5');
    expect(array1.get(3)).toEqual('univerSheet0');
    expect(array1.get(4)).toEqual('univerSheet1');
    expect(array1.get(5)).toEqual('univerSheet2');
    expect(array1.getLength()).toEqual(6);

    const array3 = new ObjectArray();
    array3.inserts(3, array2);
    expect(array3.getLength()).toEqual(array2.getLength());
});

test('object array insert', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
    });
    array.insert(1, 'univerSheetNew');
    expect(array.get(0)).toEqual('univerSheet0');
    expect(array.get(1)).toEqual('univerSheetNew');
    expect(array.get(2)).toEqual('univerSheet1');
    expect(array.get(3)).toEqual('univerSheet2');
    expect(array.get(4)).toEqual('univerSheet3');
    expect(array.get(5)).toEqual('univerSheet4');
    expect(array.get(6)).toEqual('univerSheet5');
    expect(array.getLength()).toEqual(7);
});

test('object array splice', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    expect(array.getLength()).toEqual(11);

    const splice1 = array.splice(0, 2);
    expect(array.get(0)).toEqual('univerSheet2');
    expect(array.get(1)).toEqual('univerSheet3');
    expect(array.get(2)).toEqual('univerSheet4');
    expect(array.get(3)).toEqual('univerSheet5');
    expect(array.get(4)).toEqual('univerSheet6');
    expect(array.get(5)).toEqual('univerSheet7');
    expect(array.get(6)).toEqual('univerSheet8');
    expect(array.get(7)).toEqual('univerSheet9');
    expect(array.get(8)).toEqual('univerSheet10');
    expect(array.getLength()).toEqual(9);
    expect(splice1.getLength()).toEqual(2);

    const splice2 = array.splice(2, 3);
    expect(array.get(0)).toEqual('univerSheet2');
    expect(array.get(1)).toEqual('univerSheet3');
    expect(array.get(2)).toEqual('univerSheet7');
    expect(array.get(3)).toEqual('univerSheet8');
    expect(array.get(4)).toEqual('univerSheet9');
    expect(array.get(5)).toEqual('univerSheet10');
    expect(array.getLength()).toEqual(6);
    expect(splice2.getLength()).toEqual(3);

    expect(new ObjectArray().splice(0, 10)).toEqual(new ObjectArray());
});

test('object array unshift', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    array.unshift('univerSheet4');
    expect(array.get(0)).toEqual('univerSheet4');
    expect(array.get(1)).toEqual('univerSheet0');
    expect(array.get(2)).toEqual('univerSheet1');
    expect(array.get(3)).toEqual('univerSheet2');
    expect(array.get(4)).toEqual('univerSheet3');
    expect(array.getLength()).toEqual(5);
});

test('object array set', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    array.set(0, 'univerSheetNew0');
    array.set(1, 'univerSheetNew1');
    array.set(2, 'univerSheetNew2');
    array.set(10, 'univerSheetNew10');
    expect(array.get(0)).toEqual('univerSheetNew0');
    expect(array.get(1)).toEqual('univerSheetNew1');
    expect(array.get(2)).toEqual('univerSheetNew2');
    expect(array.get(10)).toEqual('univerSheetNew10');
    expect(array.getLength()).toEqual(11);
});

test('object array last', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    expect(array.last()).toEqual('univerSheet3');
});

test('object array push', () => {
    const array = new ObjectArray();
    array.push('univerSheet0');
    array.push('univerSheet1');
    array.push('univerSheet2');
    expect(array.get(0)).toEqual('univerSheet0');
    expect(array.get(1)).toEqual('univerSheet1');
    expect(array.get(2)).toEqual('univerSheet2');
    expect(array.getLength()).toEqual(3);
});

test('object array includes', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
    });
    expect(array.includes('univerSheet0')).toBeTruthy();
    expect(array.includes('univerSheet10')).toBeFalsy();
});

test('object array slice', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
    });
    const slice = array.slice(1, 4);
    expect(slice.get(0)).toEqual('univerSheet1');
    expect(slice.get(1)).toEqual('univerSheet2');
    expect(slice.get(2)).toEqual('univerSheet3');
    expect(slice.getLength()).toEqual(3);

    expect(new ObjectArray().slice(0, 10)).toEqual(new ObjectArray());
});

test('object array concat', () => {
    const array1 = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
    });
    const array2 = new ObjectArray({
        0: 'univerSheet3',
        1: 'univerSheet4',
        2: 'univerSheet5',
    });
    const array3 = array1.concat(array2);
    expect(array3.get(0)).toEqual('univerSheet0');
    expect(array3.get(1)).toEqual('univerSheet1');
    expect(array3.get(2)).toEqual('univerSheet2');
    expect(array3.get(3)).toEqual('univerSheet3');
    expect(array3.get(4)).toEqual('univerSheet4');
    expect(array3.get(5)).toEqual('univerSheet5');
    expect(array3.getLength()).toEqual(6);
});

test('object array delete', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    array.delete(0);
    expect(array.get(0)).toEqual('univerSheet1');
    expect(array.get(1)).toEqual('univerSheet2');
    expect(array.get(2)).toEqual('univerSheet3');
    expect(array.getLength()).toEqual(3);
});

test('object array find', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    const find1 = array.find((k, v) => v === 'univerSheet1');
    const find2 = array.find((k, v) => v === 'univerSheet100');
    expect(find1).toEqual('univerSheet1');
    expect(find2).toEqual(null);
});

test('object array findIndex', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    const find1 = array.findIndex((k, v) => v === 'univerSheet1');
    const find2 = array.findIndex((k, v) => v === 'test1');
    expect(find1).toEqual(1);
    expect(find2).toEqual(-1);
});

test('object array map', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    const find = array.map((v) => `${v}-new`);
    expect(find.get(0)).toEqual('univerSheet0-new');
    expect(find.get(1)).toEqual('univerSheet1-new');
    expect(find.get(2)).toEqual('univerSheet2-new');
    expect(find.get(3)).toEqual('univerSheet3-new');
    expect(find.getLength()).toEqual(4);
});

test('object array filter', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    const find = array.filter((k, v) => k > 1);
    expect(find.get(0)).toEqual('univerSheet2');
    expect(find.get(1)).toEqual('univerSheet3');
    expect(find.getLength()).toEqual(2);
});

test('object array iterator', () => {
    const array = new ObjectArray<string>({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    for (const item of array) {
        console.log(item);
    }
});

test('object array forEach', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
    });
    array.forEach((k, v) => {
        if (v === 'univerSheet2') return false;
    });
});

test('object array bigData', () => {
    console.time();
    const array = new ObjectArray<number>(1000000);
    for (let i = 0; i < 1000000; i++) {
        array.set(i, i);
    }
    console.timeEnd();
});

test('native array bigData', () => {
    console.time();
    const array = new Array<number>(1000000);
    for (let i = 0; i < 1000000; i++) {
        array.push(i);
    }
    console.timeEnd();
});

test('object array delete bug 001', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    array.delete(array.getLength() - 1);
    expect(array.getLength()).toEqual(0);
});

test('object array delete bug 002', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    array.delete(8);
    expect(array.get(8)).toEqual('univerSheet9');
});

test('object array clone', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    expect(array.clone()).toEqual(array);
    expect(array.clone((v) => (v === 'univerSheet0' ? 'univerSheet100' : v)).get(0)).toEqual('univerSheet100');
});

test('object array clear', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    expect(array.getSizeOf()).toEqual(11);
    array.clear();
    expect(array.getSizeOf()).toEqual(0);
});

test('object array forOf', () => {
    const array = new ObjectArray({
        0: 'univerSheet0',
        1: 'univerSheet1',
        2: 'univerSheet2',
        3: 'univerSheet3',
        4: 'univerSheet4',
        5: 'univerSheet5',
        6: 'univerSheet6',
        7: 'univerSheet7',
        8: 'univerSheet8',
        9: 'univerSheet9',
        10: 'univerSheet10',
    });
    const iterator = array[Symbol.iterator]()[Symbol.iterator]();
    for (const val of array) {
        console.log(val);
    }
});
