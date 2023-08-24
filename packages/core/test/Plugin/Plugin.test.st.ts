/**
 * @jest-environment jsdom
 */
import { Plugin } from '../../src/Plugin';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test getName', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }
    }
    const test = new Test();
    expect(test.getPluginName()).toEqual('test');
});

test('Test getPluginByName', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }
    }
    const test = new Test();
    expect(test.getPluginByName('test1')).toBeUndefined();
});

test('Test addObserve', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }
    }
    const test = new Test();
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.pushToObserve('abs1')).not.toBeNull();
});

test('Test removeObserve', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }
    }
    const test = new Test();
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.pushToObserve('abs1')).not.toBeNull();
    test.deleteObserve('abs1');
    expect(test.deleteObserve('abs1')).toBeNull();
});
