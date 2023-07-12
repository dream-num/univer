/**
 * @jest-environment jsdom
 */
import { SheetContext } from '../../src/Basics';
import { Plugin, PluginManager } from '../../src/Plugin';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test getGlobalContext', () => {
    const container = createCoreTestContainer();
    const manager: PluginManager = container.get('PluginManager');
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}
    }
    const test = new Test();
    manager.install(test);
    expect(test.getContext()).not.toBeUndefined();
    manager.uninstall('test');
});

test('Test getName', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}
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

        onMounted(context: SheetContext): void {}
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

        onMounted(context: SheetContext): void {}
    }
    const test = new Test();
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.getObserver('abs1')).not.toBeNull();
});

test('Test removeObserve', () => {
    const container = createCoreTestContainer();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}
    }
    const test = new Test();
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.getObserver('abs1')).not.toBeNull();
    test.deleteObserve('abs1');
    expect(test.getObserver('abs1')).toBeNull();
});
