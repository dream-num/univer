/**
 * @jest-environment jsdom
 */
import { createCoreTestContainer } from '../ContainerStartUp';
import { SheetContext, PluginManager, Plugin } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test _initialize', () => {
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: SheetContext): void {}
    }
    const container = createCoreTestContainer();
    const context: SheetContext = container.get('Context');
    const manager2: PluginManager = container.createInstance(
        PluginManager,
        context,
        []
    );
    const manager1: PluginManager = container.createInstance(
        PluginManager,
        context,
        [new MyPlugin()]
    );
    manager1.setContext(context);
    manager2.setContext(context);
});

test('Test install', () => {
    const container = createCoreTestContainer();
    const context: SheetContext = container.get('Context');
    const manager: PluginManager = container.createInstance(PluginManager, context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: SheetContext): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
});

test('Test getPluginByName', () => {
    const container = createCoreTestContainer();
    const context: SheetContext = container.get('Context');
    const manager: PluginManager = container.createInstance(PluginManager, context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: SheetContext): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
    expect(manager.getPluginByName('plugin')).not.toBeUndefined();
});

test('Test uninstall', () => {
    const container = createCoreTestContainer();
    const context: SheetContext = container.get('Context');
    const manager: PluginManager = container.createInstance(PluginManager, context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: SheetContext): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
    expect(manager.getPluginByName('plugin')).not.toBeUndefined();
    manager.uninstall('plugin');
    expect(manager.getPluginByName('plugin')).toBeUndefined();
});
