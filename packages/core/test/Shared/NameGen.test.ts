import { NameGen } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('NameGen getSheetName', () => {
    const name = NameGen.getSheetName();
    expect(name).not.toBeUndefined();
});
