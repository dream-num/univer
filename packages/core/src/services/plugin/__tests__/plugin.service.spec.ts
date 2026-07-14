/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Inject, Injector } from '../../../common/di';
import { UniverInstanceType } from '../../../common/unit';
import { Univer } from '../../../univer';
import { LifecycleStages } from '../../lifecycle/lifecycle';
import { LifecycleService } from '../../lifecycle/lifecycle.service';
import { LogLevel } from '../../log/log.service';
import { DependentOn, DependentOnSymbol, Plugin, PluginService, PluginStore } from '../plugin.service';

function createPluginHarness(logLevel = LogLevel.VERBOSE) {
    const univer = new Univer({ logLevel });
    const injector = univer.__getInjector();

    return {
        univer,
        injector,
        pluginService: injector.get(PluginService),
        lifecycleService: injector.get(LifecycleService),
    };
}

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('PluginService', () => {
    it('should iterate plugin store entries and keep plugin metadata consistent', () => {
        const { univer, injector } = createPluginHarness();

        class StoreAlphaPlugin extends Plugin {
            static override pluginName = 'store-alpha-plugin';
            static override packageName = '@univerjs/store-alpha-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_DOC;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        class StoreBetaPlugin extends Plugin {
            static override pluginName = 'store-beta-plugin';
            static override packageName = '@univerjs/store-beta-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        @DependentOn(StoreAlphaPlugin, StoreBetaPlugin)
        class StoreDependentPlugin extends Plugin {
            static override pluginName = 'store-dependent-plugin';
            static override packageName = '@univerjs/store-dependent-plugin';
            static override version = Plugin.version;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        const store = new PluginStore();
        const alpha = injector.createInstance(StoreAlphaPlugin, undefined);
        const beta = injector.createInstance(StoreBetaPlugin, undefined);

        store.addPlugin(alpha);
        store.addPlugin(beta);

        const iterated: Array<[string, UniverInstanceType]> = [];
        store.forEachPlugin((plugin) => iterated.push([plugin.getPluginName(), plugin.getUnitType()]));

        expect(iterated).toEqual([
            ['store-alpha-plugin', UniverInstanceType.UNIVER_DOC],
            ['store-beta-plugin', UniverInstanceType.UNIVER_SHEET],
        ]);
        expect(store.removePlugins().map((plugin) => plugin.getPluginName())).toEqual([
            'store-alpha-plugin',
            'store-beta-plugin',
        ]);

        const afterRemoval: string[] = [];
        store.forEachPlugin((plugin) => afterRemoval.push(plugin.getPluginName()));
        expect(afterRemoval).toEqual([]);
        expect((StoreDependentPlugin as typeof StoreDependentPlugin & { [DependentOnSymbol]?: unknown })[DependentOnSymbol]).toEqual([
            StoreAlphaPlugin,
            StoreBetaPlugin,
        ]);

        univer.dispose();
    });

    it('should replay completed lifecycle stages for univer plugins registered after steady', () => {
        const { univer, pluginService, lifecycleService } = createPluginHarness();
        const lifecycleEvents: string[] = [];
        const metadata = {
            name: '',
            unitType: UniverInstanceType.UNRECOGNIZED,
        };

        class ReplayLifecyclePlugin extends Plugin {
            static override pluginName = 'replay-lifecycle-plugin';
            static override packageName = '@univerjs/replay-lifecycle-plugin';
            static override version = Plugin.version;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                metadata.name = this.getPluginName();
                metadata.unitType = this.getUnitType();
            }

            override onStarting(): void {
                lifecycleEvents.push('starting');
            }

            override onReady(): void {
                lifecycleEvents.push('ready');
            }

            override onRendered(): void {
                lifecycleEvents.push('rendered');
            }

            override onSteady(): void {
                lifecycleEvents.push('steady');
            }
        }

        lifecycleService.stage = LifecycleStages.Ready;
        lifecycleService.stage = LifecycleStages.Rendered;
        lifecycleService.stage = LifecycleStages.Steady;

        pluginService.registerPlugin(ReplayLifecyclePlugin);

        expect(metadata).toEqual({
            name: 'replay-lifecycle-plugin',
            unitType: UniverInstanceType.UNIVER_UNKNOWN,
        });
        expect(lifecycleEvents).toEqual(['starting', 'ready', 'rendered', 'steady']);

        univer.dispose();
    });

    it('should continue lifecycle transitions for loaded plugins and dispose them through the service', () => {
        const { univer, pluginService, lifecycleService } = createPluginHarness();
        const lifecycleEvents: string[] = [];
        const disposedPlugins: string[] = [];

        class RuntimeLifecyclePlugin extends Plugin {
            static override pluginName = 'runtime-lifecycle-plugin';
            static override packageName = '@univerjs/runtime-lifecycle-plugin';
            static override version = Plugin.version;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }

            override onStarting(): void {
                lifecycleEvents.push('starting');
            }

            override onReady(): void {
                lifecycleEvents.push('ready');
            }

            override onRendered(): void {
                lifecycleEvents.push('rendered');
            }

            override onSteady(): void {
                lifecycleEvents.push('steady');
            }

            override dispose(): void {
                disposedPlugins.push(this.getPluginName());
                super.dispose();
            }
        }

        pluginService.registerPlugin(RuntimeLifecyclePlugin);
        expect(lifecycleEvents).toEqual(['starting']);

        lifecycleService.stage = LifecycleStages.Ready;
        lifecycleService.stage = LifecycleStages.Rendered;
        lifecycleService.stage = LifecycleStages.Steady;

        expect(lifecycleEvents).toEqual(['starting', 'ready', 'rendered', 'steady']);

        pluginService.dispose();

        expect(disposedPlugins).toEqual(['runtime-lifecycle-plugin']);
        univer.dispose();
    });

    it('should lazily load typed plugins and flush later registrations once the type is started', () => {
        vi.useFakeTimers();

        const { univer, pluginService } = createPluginHarness();
        const constructed: string[] = [];

        class InitialSheetPlugin extends Plugin {
            static override pluginName = 'initial-sheet-plugin';
            static override packageName = '@univerjs/initial-sheet-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                constructed.push(this.getPluginName());
            }
        }

        class LateSheetPluginA extends Plugin {
            static override pluginName = 'late-sheet-plugin-a';
            static override packageName = '@univerjs/late-sheet-plugin-a';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                constructed.push(this.getPluginName());
            }
        }

        class LateSheetPluginB extends Plugin {
            static override pluginName = 'late-sheet-plugin-b';
            static override packageName = '@univerjs/late-sheet-plugin-b';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                constructed.push(this.getPluginName());
            }
        }

        pluginService.registerPlugin(InitialSheetPlugin);
        expect(constructed).toEqual([]);

        pluginService.startPluginsForType(UniverInstanceType.UNIVER_SHEET);
        pluginService.startPluginsForType(UniverInstanceType.UNIVER_SHEET);
        expect(constructed).toEqual(['initial-sheet-plugin']);

        pluginService.registerPlugin(LateSheetPluginA);
        pluginService.registerPlugin(LateSheetPluginB);
        expect(constructed).toEqual(['initial-sheet-plugin']);

        vi.runAllTimers();

        expect(constructed).toEqual([
            'initial-sheet-plugin',
            'late-sheet-plugin-a',
            'late-sheet-plugin-b',
        ]);

        univer.dispose();
    });

    it('should auto-register dependencies in topological order and report cross-type debug logs', () => {
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
        const { univer, pluginService } = createPluginHarness();
        const order: string[] = [];

        class CrossTypeDependencyPlugin extends Plugin {
            static override pluginName = 'cross-type-dependency-plugin';
            static override packageName = '@univerjs/cross-type-dependency-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                order.push(this.getPluginName());
            }
        }

        @DependentOn(CrossTypeDependencyPlugin)
        class CrossTypeRootPlugin extends Plugin {
            static override pluginName = 'cross-type-root-plugin';
            static override packageName = '@univerjs/cross-type-root-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_DOC;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                order.push(this.getPluginName());
            }
        }

        pluginService.registerPlugin(CrossTypeRootPlugin);
        pluginService.startPluginsForType(UniverInstanceType.UNIVER_DOC);

        expect(order).toEqual(['cross-type-dependency-plugin', 'cross-type-root-plugin']);
        expect(debugSpy).toHaveBeenCalledWith(
            expect.stringContaining('[PluginService]'),
            expect.stringContaining('depends on "cross-type-dependency-plugin" which has different type.')
        );
        expect(debugSpy).toHaveBeenCalledWith(
            expect.stringContaining('[PluginService]'),
            expect.stringContaining('will automatically register it with default configuration.')
        );

        univer.dispose();
    });

    it('should prioritize already-registered dependencies before dependent plugins', () => {
        const { univer, pluginService } = createPluginHarness();
        const order: string[] = [];

        class RegisteredDependencyPlugin extends Plugin {
            static override pluginName = 'registered-dependency-plugin';
            static override packageName = '@univerjs/registered-dependency-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                order.push(this.getPluginName());
            }
        }

        @DependentOn(RegisteredDependencyPlugin)
        class RegisteredRootPlugin extends Plugin {
            static override pluginName = 'registered-root-plugin';
            static override packageName = '@univerjs/registered-root-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                order.push(this.getPluginName());
            }
        }

        pluginService.registerPlugin(RegisteredDependencyPlugin);
        pluginService.registerPlugin(RegisteredRootPlugin);
        pluginService.startPluginsForType(UniverInstanceType.UNIVER_SHEET);

        expect(order).toEqual(['registered-dependency-plugin', 'registered-root-plugin']);
        univer.dispose();
    });

    it('should throw clear errors for invalid plugin definitions and incompatible dependencies', () => {
        const { univer, pluginService } = createPluginHarness();

        class InvalidTypePlugin extends Plugin {
            static override pluginName = 'invalid-type-plugin';
            static override packageName = '@univerjs/invalid-type-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNRECOGNIZED;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        class MissingNamePlugin extends Plugin {
            static override pluginName = '';
            static override packageName = '@univerjs/missing-name-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        class DuplicatedPlugin extends Plugin {
            static override pluginName = 'duplicated-plugin';
            static override packageName = '@univerjs/duplicated-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        class TypedDependencyPlugin extends Plugin {
            static override pluginName = 'typed-dependency-plugin';
            static override packageName = '@univerjs/typed-dependency-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        @DependentOn(TypedDependencyPlugin)
        class InvalidRootPlugin extends Plugin {
            static override pluginName = 'invalid-root-plugin';
            static override packageName = '@univerjs/invalid-root-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_UNKNOWN;

            constructor(@Inject(Injector) override readonly _injector: Injector) {
                super();
            }
        }

        expect(() => pluginService.registerPlugin(InvalidTypePlugin)).toThrow(/invalid plugin type/);
        expect(() => pluginService.registerPlugin(MissingNamePlugin)).toThrow(/no plugin name/);

        pluginService.registerPlugin(DuplicatedPlugin);
        expect(() => pluginService.registerPlugin(DuplicatedPlugin)).toThrow(/duplicated plugin name/);
        expect(() => pluginService.registerPlugin(InvalidRootPlugin)).toThrow(/cannot register a plugin with Univer type/);

        univer.dispose();
    });

    it('should clear pending lazy-load timers when the plugin service is disposed', () => {
        vi.useFakeTimers();

        const { univer, pluginService } = createPluginHarness();
        const constructed: string[] = [];

        class StartedSheetPlugin extends Plugin {
            static override pluginName = 'started-sheet-plugin';
            static override packageName = '@univerjs/started-sheet-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                constructed.push(this.getPluginName());
            }
        }

        class PendingSheetPlugin extends Plugin {
            static override pluginName = 'pending-sheet-plugin';
            static override packageName = '@univerjs/pending-sheet-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
                constructed.push(this.getPluginName());
            }
        }

        pluginService.registerPlugin(StartedSheetPlugin);
        pluginService.startPluginsForType(UniverInstanceType.UNIVER_SHEET);
        pluginService.registerPlugin(PendingSheetPlugin);

        pluginService.dispose();
        vi.runAllTimers();

        expect(constructed).toEqual(['started-sheet-plugin']);
        univer.dispose();
    });

    it('should accept plugins built with the current core version', () => {
        class SameVersionPlugin extends Plugin {
            static override pluginName = 'same-version-plugin';
            static override packageName = '@univerjs/same-version-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        const univer = new Univer();

        expect(() => univer.registerPlugin(SameVersionPlugin)).not.toThrow();
        univer.dispose();
    });

    it('should report the package name when a plugin version does not match core', () => {
        class MismatchVersionPlugin extends Plugin {
            static override pluginName = 'mismatch-version-plugin';
            static override packageName = '@univerjs/mismatch-version-plugin';
            static override version = '__MISMATCH_VERSION__';
            static override type = UniverInstanceType.UNIVER_SHEET;

            constructor(
                _config: undefined,
                @Inject(Injector) override readonly _injector: Injector
            ) {
                super();
            }
        }

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const univer = new Univer();

        expect(() => univer.registerPlugin(MismatchVersionPlugin)).not.toThrow();
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[PluginService]'),
            expect.stringContaining('Plugin version mismatch.')
        );
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[PluginService]'),
            expect.stringContaining('package: "@univerjs/mismatch-version-plugin"')
        );

        univer.dispose();
    });
});
