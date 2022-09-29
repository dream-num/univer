import { Tuples } from '../../src/Shared/Tuples';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('checkup', () => {
    const test = (...argument: any) =>
        Tuples.checkup(
            argument,
            Tuples.BOOLEAN_TYPE,
            Tuples.STRING_TYPE,
            Tuples.NUMBER_TYPE,
            Tuples.FUNCTION_TYPE
        );
    expect(test(false, '1', 1, () => {})).toEqual(true);
    const test1 = (...argument: any) =>
        Tuples.checkup(argument, Tuples.BOOLEAN_TYPE);
    expect(test1('1')).toEqual(false);
    const test2 = (...argument: any) => Tuples.checkup(argument, Tuples.STRING_TYPE);
    expect(test2(1)).toEqual(false);
    const test3 = (...argument: any) => Tuples.checkup(argument, Tuples.NUMBER_TYPE);
    expect(test3('1')).toEqual(false);
    const test4 = (...argument: any) =>
        Tuples.checkup(argument, Tuples.FUNCTION_TYPE);
    expect(test4('1')).toEqual(false);
    const test5 = (...argument: any) => Tuples.checkup(argument, Tuples.OBJECT_TYPE);
    expect(test5('1')).toEqual(false);
});
