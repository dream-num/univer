# @univerjs/engine-render

[![npm version](https://img.shields.io/npm/v/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)
[![license](https://img.shields.io/npm/l/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)
[![downloads](https://img.shields.io/npm/dm/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)

`@univerjs/engine-render` is Univer's canvas rendering engine. It handles document layout, rendering primitives, interaction layers, scrolling, and zooming.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/engine-render` | `UniverEngineRender` | No | No | No |

## Installation

```sh
pnpm add @univerjs/engine-render
# or
npm install @univerjs/engine-render
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';

univer.registerPlugin(UniverRenderEnginePlugin);
```

## Incremental layout performance

The worker layout unit tests verify bounded work, time-budget yielding, page publication,
and TOC resolution independently of machine speed. Run the separate timing benchmark
from this package directory without coverage and with one worker:

```sh
pnpm exec vitest bench --run src/__tests__/worker-layout.bench.ts --maxWorkers=1 --coverage.enabled=false
```

The benchmark uses the same 1000-page fixture, warms up three times, then measures ten
runs. Vitest reports layout latency; the `1000-page-layout` JSON line also records every
run's maximum block duration, the median and worst block maxima, and how many runs reach
or exceed the 50 ms target. Fixture setup, assertions, and disposal are outside the
reported layout timing window. Timing results are diagnostic; functional failures still
fail the benchmark.

For comparisons, run the benchmark on the baseline and candidate revisions using the same
Node version, dependencies, and machine, alternating revisions across batches. Use the
same benchmark and fixture files in both checkouts; copy the harness into older revisions
that do not contain it. Keep the per-run samples to distinguish recurring regressions
from isolated spikes. Establish a noise baseline before introducing a relative regression gate; the 50 ms target is not a
single-sample pass/fail threshold in coverage CI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/engine-render)
- [GitHub repository](https://github.com/dream-num/univer)
