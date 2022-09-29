import {FilterPlugin} from "../src";

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('FilterPlugin', () => {
    new FilterPlugin({});
});
