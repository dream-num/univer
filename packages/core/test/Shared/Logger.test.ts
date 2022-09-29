/**
 * @jest-environment jsdom
 */
import { Logger } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('test info', () => {
    Logger.info('info');
});

test('test error', () => {
    Logger.error('error');
});

test('test warn', () => {
    Logger.error('warn');
});

test('test br', () => {
    Logger.error('br');
});
