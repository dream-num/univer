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

import type { Injector } from '../../common/di';
import { describe, expect, it } from 'vitest';
import { UniverInstanceType } from '../../common/unit';
import { Univer } from '../../univer';
import { Plugin } from '../plugin/plugin.service';

describe('plugin version check', () => {
    it('should allow registering plugin with same version as core', () => {
        class SameVersionPlugin extends Plugin {
            static override pluginName = 'same-version-plugin';
            static override packageName = '@univerjs/same-version-plugin';
            static override version = Plugin.version;
            static override type = UniverInstanceType.UNIVER_SHEET;

            protected override _injector!: Injector;
        }

        const univer = new Univer();
        expect(() => univer.registerPlugin(SameVersionPlugin)).not.toThrow();
    });

    it('should throw with package name when plugin version mismatches', () => {
        class MismatchVersionPlugin extends Plugin {
            static override pluginName = 'mismatch-version-plugin';
            static override packageName = '@univerjs/mismatch-version-plugin';
            static override version = '__MISMATCH_VERSION__';
            static override type = UniverInstanceType.UNIVER_SHEET;

            protected override _injector!: Injector;
        }

        const univer = new Univer();
        expect(() => univer.registerPlugin(MismatchVersionPlugin)).toThrowError(
            /package "@univerjs\/mismatch-version-plugin" version mismatch/
        );
    });
});
