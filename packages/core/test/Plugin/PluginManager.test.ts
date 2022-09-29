/**
 * @jest-environment jsdom
 */
import { IOCContainerStartUpReady } from '../ContainerStartUp';
import { Context, PluginManager, Plugin, IOCContainer } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test _initialize', () => {
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: Context): void {}

        onMapping(container: IOCContainer): void {}
    }
    const container = IOCContainerStartUpReady();
    const context: Context = container.getSingleton('Context');
    const manager2: PluginManager = container.getInstance(
        'PluginManager',
        context,
        []
    );
    const manager1: PluginManager = container.getInstance('PluginManager', context, [
        new MyPlugin(),
    ]);
    manager1.setContext(context);
    manager2.setContext(context);
});

test('Test install', () => {
    const container = IOCContainerStartUpReady();
    const context: Context = container.getSingleton('Context');
    const manager: PluginManager = container.getInstance('PluginManager', context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: Context): void {}

        onMapping(container: IOCContainer): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
});

test('Test getPluginByName', () => {
    const container = IOCContainerStartUpReady();
    const context: Context = container.getSingleton('Context');
    const manager: PluginManager = container.getInstance('PluginManager', context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: Context): void {}

        onMapping(container: IOCContainer): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
    expect(manager.getPluginByName('plugin')).not.toBeUndefined();
});

test('Test uninstall', () => {
    const container = IOCContainerStartUpReady();
    const context: Context = container.getSingleton('Context');
    const manager: PluginManager = container.getInstance('PluginManager', context);
    class MyPlugin extends Plugin {
        constructor() {
            super('plugin');
        }

        onMounted(context: Context): void {}

        onMapping(container: IOCContainer): void {}
    }
    const plugin = new MyPlugin();
    manager.install(plugin);
    expect(manager.getPluginByName('plugin')).not.toBeUndefined();
    manager.uninstall('plugin');
    expect(manager.getPluginByName('plugin')).toBeUndefined();
});
