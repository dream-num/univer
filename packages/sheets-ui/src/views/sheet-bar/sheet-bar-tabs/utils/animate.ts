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

const Tween: Record<string, Function> = {
    easeOutStrong(t: number, b: number, c: number, d: number): number {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    backOut(t: number, b: number, c: number, d: number, s: number): number {
        if (typeof s === 'undefined') {
            s = 0.7;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
};

export interface AnimateConfig {
    loop: boolean;
    begin: number;
    end: number;
    duration: number;
    delay: number;
    type: string;
    receive: (v: number) => void;
    success: (v: number) => void;
    cancel: (v: number) => void;
    complete: (v: number) => void;
}

const CONFIG: AnimateConfig = {
    loop: false,
    begin: 0,
    end: 0,
    duration: 300,
    delay: 0,
    type: 'easeOutStrong',
    receive(v) {
        /*noop*/
    },
    success(v) {
        /*noop*/
    },
    cancel(v) {
        /*noop*/
    },
    complete(v) {
        /*noop*/
    },
};

export enum AnimateStatus {
    Request,
    Cancel,
}

export class Animate {
    protected _config: AnimateConfig;

    protected _status: AnimateStatus = AnimateStatus.Request;

    protected _start: number = 0;

    protected _handle: number = 0;

    protected _delayHandle: NodeJS.Timeout | number | null = null;

    constructor(config: Partial<AnimateConfig>) {
        this._config = {
            ...CONFIG,
            ...config,
        };
        if (this._config.loop) {
            this._config.complete = () => {
                /*noop*/
            };
            this._config.success = () => {
                this.request();
            };
        }
    }

    static success(...animates: Animate[]): Promise<void> {
        let successNumber = 0;
        return new Promise<void>((resolve) => {
            for (let i = 0; i < animates.length; i++) {
                const animate = animates[i];
                const config = animate._config;
                const success = config.success;
                const loop = config.loop;
                if (loop) {
                    continue;
                }
                config.success = (v) => {
                    successNumber++;
                    if (success) {
                        success.call(animate, v);
                    }
                    if (successNumber === animates.length) {
                        resolve();
                    }
                };
            }
        });
    }

    request(): void {
        if (this._config.delay === 0) {
            this._status = AnimateStatus.Request;
            this._start = Date.now();
            this._fakeHandle();
        } else {
            this._delayHandle && clearTimeout(this._delayHandle);
            this._delayHandle = setTimeout(() => {
                this._status = AnimateStatus.Request;
                this._start = Date.now();
                this._fakeHandle();
            }, this._config.delay);
        }
    }

    cancel(): void {
        this._status = AnimateStatus.Cancel;
        this._delayHandle && clearTimeout(this._delayHandle);
        cancelAnimationFrame(this._handle);
    }

    protected _fakeHandle(): void {
        let times = Date.now() - this._start;
        times = times >= this._config.duration ? this._config.duration : times;

        const val = Tween[this._config.type](
            times,
            this._config.begin,
            this._config.end - this._config.begin,
            this._config.duration,
            0.7
        );
        const fix = val.toFixed(2);

        this._config.receive(fix);

        if (this._status === AnimateStatus.Cancel) {
            this._config.cancel(fix);
            this._config.complete(fix);
            return;
        }

        if (times === this._config.duration) {
            this._config.success(fix);
            this._config.complete(fix);
            return;
        }

        this._handle = requestAnimationFrame(() => {
            this._fakeHandle();
        });
    }
}
