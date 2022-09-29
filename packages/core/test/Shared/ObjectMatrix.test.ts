import { ObjectMatrix } from '../../src/Shared/ObjectMatrix';
import { ObjectArray } from '../../src/Shared/ObjectArray';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test ObjectMatrix getLength', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(3);
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(4);
});

test('Test ObjectMatrix getRow', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getRow(0)).not.toBeUndefined();
    expect(matrix.getRow(1)).not.toBeUndefined();
    expect(matrix.getRow(2)).not.toBeUndefined();
    expect(matrix.getRow(3)).toBeUndefined();
});

test('Test ObjectMatrix insertRow', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getRow(0)).not.toBeUndefined();
    expect(matrix.getRow(1)).not.toBeUndefined();
    expect(matrix.getRow(2)).not.toBeUndefined();
    expect(matrix.getRow(3)).toBeUndefined();
});

test('Test ObjectMatrix getRowOrCreate', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getRowOrCreate(0)).not.toBeUndefined();
    expect(matrix.getRowOrCreate(1)).not.toBeUndefined();
    expect(matrix.getRowOrCreate(2)).not.toBeUndefined();
    expect(matrix.getRowOrCreate(3)).not.toBeUndefined();
});

test('Test ObjectMatrix swapRow', () => {
    const matrix = new ObjectMatrix();
    const srcRow = new ObjectArray({ 0: 0, 1: 1 });
    const disRow = new ObjectArray({ 0: 0, 1: 1 });
    matrix.insertRow(0, srcRow);
    matrix.insertRow(1, disRow);
    expect(matrix.getRow(0) === srcRow).toBeTruthy();
    expect(matrix.getRow(1) === disRow).toBeTruthy();
    matrix.swapRow(0, 1);
    expect(matrix.getRow(1) === srcRow).toBeTruthy();
    expect(matrix.getRow(0) === disRow).toBeTruthy();
});

test('Test ObjectMatrix toArray', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.toArray().length).toEqual(3);
});

test('Test ObjectMatrix getValue', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getValue(0, 0)).toEqual(0);
});

test('Test ObjectMatrix DeleteValue', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getValue(0, 0)).toEqual(0);
    matrix.deleteValue(0, 0);
    expect(matrix.getValue(0, 0)).toEqual(1);
});

test('Test ObjectMatrix spliceRows', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
});

test('Test ObjectMatrix insertRow', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(3);
});

test('Test ObjectMatrix forEach', () => {
    const matrix = new ObjectMatrix<ObjectArray<number>>();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.forEach((k, v) => k <= 1);
});

test('Test ObjectMatrix BigData', () => {
    console.time();
    const matrix = new ObjectMatrix<ObjectArray<number>>();
    for (let i = 0; i < 100000; i++) {
        matrix.insertRow(i, new ObjectArray());
    }
    console.timeEnd();
});

test('Test rest', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(6);
    matrix.reset();
    expect(matrix.getLength()).toEqual(0);
});

test('Test hasValue', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.hasValue()).toEqual(true);
    matrix.reset();
    expect(matrix.hasValue()).toEqual(false);
});

test('Test getMatrix', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getMatrix()).not.toBeUndefined();
});

test('Test setValue', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.setValue(0, 0, 10);
    expect(matrix.getValue(0, 0)).toEqual(10);
});

test('Test pushRow', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(6);
    matrix.pushRow(new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getLength()).toEqual(7);
});

test('Test insertRows', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));

    const matrix1 = new ObjectMatrix();
    matrix1.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix1.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix1.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix1.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix1.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix1.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));

    matrix.insertRows(0, matrix1);
    expect(matrix.getLength()).toEqual(12);
});

test('Test getFragments', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));

    const fragment = matrix.getFragments(0, 1, 0, 1);
    expect(fragment).not.toBeUndefined();
});

test('Test getSizeOf', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getSizeOf()).toEqual(6);
});

test('Test getRange', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getRange()).not.toBeUndefined();
});

test('Test toJSON', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.toJSON()).not.toBeUndefined();
});

test('Test getData', () => {
    const matrix = new ObjectMatrix();
    matrix.insertRow(0, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(1, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(2, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(3, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(4, new ObjectArray({ 0: 0, 1: 1 }));
    matrix.insertRow(5, new ObjectArray({ 0: 0, 1: 1 }));
    expect(matrix.getData()).not.toBeUndefined();
});
