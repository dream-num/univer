/**
 * @jest-environment jsdom
 */
import { SheetContext } from '../../src/Basics';
import { Plugin, PluginManager } from '../../src/Plugin';
import { IOCContainer } from '../../src/DI';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test getGlobalContext', () => {
    const container = IOCContainerStartUpReady();
    const manager: PluginManager = container.getSingleton('PluginManager');
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}

        onMapping(container: IOCContainer): void {}
    }
    const test = new Test();
    manager.install(test);
    expect(test.getContext()).not.toBeUndefined();
    manager.uninstall('test');
});

test('Test getName', () => {
    const container = IOCContainerStartUpReady();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}

        onMapping(container: IOCContainer): void {}
    }
    const test = new Test();
    container.inject(test);
    expect(test.getPluginName()).toEqual('test');
});

test('Test getPluginByName', () => {
    const container = IOCContainerStartUpReady();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}

        onMapping(container: IOCContainer): void {}
    }
    const test = new Test();
    container.inject(test);
    expect(test.getPluginByName('test1')).toBeUndefined();
});

test('Test addObserve', () => {
    const container = IOCContainerStartUpReady();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}

        onMapping(container: IOCContainer): void {}
    }
    const test = new Test();
    container.inject(test);
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.getObserver('abs1')).not.toBeNull();
});

test('Test removeObserve', () => {
    const container = IOCContainerStartUpReady();
    class Test extends Plugin {
        constructor() {
            super('test');
        }

        onMounted(context: SheetContext): void {}

        onMapping(container: IOCContainer): void {}
    }
    const test = new Test();
    container.inject(test);
    test.pushToObserve('abs1');
    test.pushToObserve('abs2');
    expect(test.getObserver('abs1')).not.toBeNull();
    test.deleteObserve('abs1');
    expect(test.getObserver('abs1')).toBeNull();
});
