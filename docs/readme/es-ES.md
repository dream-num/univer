<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="../img/banner-light.png">
    <img src="../img/banner-dark.png" alt="Univer" width="420" />
</picture>

**Un SDK ofimático full-stack e isomórfico para crear hojas de cálculo, documentos y presentaciones.**

Univer ayuda a crear experiencias de productividad integrables con una arquitectura de plugins,
renderizado basado en Canvas, un motor de fórmulas y una Facade API que funciona tanto en el navegador como en Node.js.

[English](../../README.md) | [简体中文](./zh-CN.md) | [繁體中文](./zh-TW.md) | [日本語](./ja-JP.md) | [한국어](./ko-KR.md) | Español

[📖 Documentación](https://docs.univer.ai) | [✨ Showcase](https://docs.univer.ai/showcase) | [📘 API Reference](https://docs.univer.ai/reference/classes/univer) | [📝 Blog](https://docs.univer.ai/blog)

[![Release](https://img.shields.io/github/v/release/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/releases)
[![License](https://img.shields.io/github/license/dream-num/univer?style=flat-square)](../../LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/dream-num/univer/build-packages.yml?style=flat-square)](https://github.com/dream-num/univer/actions/workflows/build-packages.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/dream-num/univer/badge/dev?style=flat-square)](https://www.codefactor.io/repository/github/dream-num/univer/overview/dev)
[![Codecov](https://img.shields.io/codecov/c/gh/dream-num/univer?token=aPfyW2pIMN&style=flat-square)](https://codecov.io/gh/dream-num/univer)

[![Stars](https://img.shields.io/github/stars/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/stargazers)
[![Contributors](https://img.shields.io/github/contributors/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/issues)
[![Last Commit](https://img.shields.io/github/last-commit/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/commits/main/)

[![Discord](https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2&style=flat-square)](https://discord.gg/z3NKNT6D2f)
[![Twitter](https://img.shields.io/twitter/follow/univerhq?style=flat-square&logo=x)](https://twitter.com/univerhq)
[![Open Collective](https://img.shields.io/opencollective/all/univer?logo=opencollective&style=flat-square)](https://opencollective.com/univer)

[![Trendshift](https://trendshift.io/api/badge/repositories/4376)](https://trendshift.io/repositories/4376)

</div>

## ✨ ¿Qué es Univer?

Univer es un SDK de código abierto para crear aplicaciones ofimáticas dentro de tu propio producto. Proporciona los bloques necesarios para experiencias de hojas de cálculo, documentos y presentaciones sin obligarte a usar una aplicación alojada ni una UI fija.

Usa Univer cuando necesites:

- Integrar edición de hojas de cálculo o documentos en un SaaS, herramienta interna, flujo de BI o aplicación de IA.
- Ejecutar procesamiento de libros/documentos en el servidor con la misma arquitectura que se usa en el navegador.
- Componer solo las funciones que necesitas mediante plugins o empezar rápido con presets.
- Extender el comportamiento mediante plugins personalizados, comandos, servicios, componentes de UI y Facade APIs.

Univer no es solo un visor de archivos de hojas de cálculo. Es un framework para crear tu propia superficie de productividad.

## 🌟 Highlights

<table>
  <tr>
    <td align="center" width="33%">
      ⚡<br />
      <strong>Preparado para superficies grandes</strong><br />
      <sub>El renderizado Canvas y un motor de fórmulas dedicado mantienen responsivos los libros complejos.</sub>
    </td>
    <td align="center" width="33%">
      🧩<br />
      <strong>Extensible por plugins</strong><br />
      <sub>Compón, reemplaza, carga bajo demanda o amplía capacidades sin adoptar todo el stack.</sub>
    </td>
    <td align="center" width="33%">
      🤖<br />
      <strong>Headless para infraestructura de IA</strong><br />
      <sub>Ejecuta lógica de libros y documentos en Node.js para impulsar agentes, automatización y flujos del servidor.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      🛠️<br />
      <strong>SDK listo para producto</strong><br />
      <sub>Adaptadores de framework, Facade APIs, presets y runtime headless encajan en integraciones reales.</sub>
    </td>
    <td align="center" width="33%">
      🌗<br />
      <strong>Dark mode listo</strong><br />
      <sub>Los componentes de UI y el motor de renderizado se adaptan a temas claros y oscuros.</sub>
    </td>
    <td align="center" width="33%">
      🔌<br />
      <strong>Facade API unificada</strong><br />
      <sub>Una API consistente para libros, rangos, fórmulas y documentos en el navegador y Node.js.</sub>
    </td>
  </tr>
</table>

## 🚀 ¿Por qué Univer?

- **Diseño isomórfico**: ejecuta aplicaciones UI en navegadores y procesamiento headless en Node.js.
- **Arquitectura basada en plugins**: cada capacidad se entrega como un plugin componible, por lo que las funciones se pueden añadir, quitar, reemplazar o cargar bajo demanda.
- **Preset mode para integración rápida**: usa bundles de plugins preparados desde [`univer-presets`](https://github.com/dream-num/univer-presets) cuando quieras una aplicación funcional rápidamente.
- **Plugin mode para control total**: compón paquetes manualmente cuando necesites carga personalizada, bundles más pequeños o integración profunda.
- **Facade API**: trabaja con libros, hojas, rangos, documentos, fórmulas, comandos y eventos mediante una API de alto nivel.
- **Motor de renderizado Canvas**: soporta superficies editables grandes y comparte la capa de renderizado entre distintos tipos de documento.
- **UI extensible**: integración con React, Vue, Web Components y shells de aplicación específicos de cada framework.

## ⚡ Inicio rápido

Para la mayoría de las aplicaciones, empieza con **Preset Mode**. Usa **Plugin Mode** cuando necesites componer paquetes manualmente y controlar el registro de plugins.

<details open>
<summary><strong>Preset Mode (recomendado)</strong></summary>

Los presets son colecciones curadas de plugins de Univer que incluyen los registros de Facade API y estilos necesarios.

```bash
pnpm add @univerjs/presets @univerjs/preset-sheets-core
```

```ts
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

univerAPI.createWorkbook({})
```

</details>

<details>
<summary><strong>Plugin Mode</strong></summary>

Plugin Mode te da control de bajo nivel sobre paquetes, imports de estilos, combinación de locales, registro de Facade API y orden de plugins.

```bash
pnpm add @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt @univerjs/sheets-numfmt-ui @univerjs/sheets-ui @univerjs/ui
```

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'

import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      UIEnUS,
      DocsUIEnUS,
      SheetsEnUS,
      SheetsUIEnUS,
      SheetsFormulaEnUS,
      SheetsFormulaUIEnUS,
      SheetsNumfmtUIEnUS,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverUIPlugin, { container: 'app' })
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)
univer.registerPlugin(UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)

const univerAPI = FUniver.newAPI(univer)
univerAPI.createWorkbook({})
```

</details>

Tu página necesita un contenedor:

```html
<div id="app" style="height: 100vh"></div>
```

Consulta más detalles en la [guía de instalación y uso básico](https://docs.univer.ai/guides/sheets/getting-started/installation), la [referencia de `createUniver`](https://docs.univer.ai/reference/methods/create-univer) y la [referencia de Facade API](https://docs.univer.ai/reference/classes/univer).

## 🧩 Preset Mode vs Plugin Mode

| Opción | Cuándo usarla | Empieza aquí |
| --- | --- | --- |
| **Preset Mode** | Quieres una configuración funcional de Sheets, Docs o Node con mínima configuración. | [`univer-presets`](https://github.com/dream-num/univer-presets) y la [guía de inicio](https://docs.univer.ai/guides/sheets/getting-started/installation) |
| **Plugin Mode** | Necesitas control estricto sobre paquetes, orden de registro de plugins, carga bajo demanda o composición personalizada en tiempo de ejecución. | Los [`examples/`](../../examples) de este repositorio y la [guía de arquitectura](https://docs.univer.ai/guides/recipes/architecture/univer) |
| **Headless Mode** | Necesitas procesamiento de libros/documentos en servidor, cálculo de fórmulas o automatización sin UI. | [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) |

Mantén todos los paquetes `@univerjs/*` en la misma versión. Si usas paquetes de Univer Pro, mantén también alineadas las versiones de `@univerjs-pro/*`.

Para expectativas de compatibilidad de API, APIs experimentales, APIs internas y reglas de deprecación, consulta la [política de estabilidad de API](../API_STABILITY.md).

## 🧭 Compatibilidad

- **Runtime de navegador**: Univer se compila con objetivo Chrome 70 y busca funcionar en Edge `>=70`, Firefox `>=63`, Chrome `>=70`, Safari `>=12.0` y Electron `>=5`.
- **Polyfills**: Univer depende de `Intl.Segmenter`. Añade un polyfill como `@formatjs/intl-segmenter` si tu navegador o runtime objetivo no lo incluye.
- **Herramientas de build**: Recomendamos Vite, esbuild o Webpack 5. Si tu herramienta no soporta el campo `exports` de `package.json` (común en Webpack 4), puede que necesites configurar mapeos de ruta adicionales.
- **React**: La capa de vista de Univer está construida sobre React 18, soporta React 18 y 19, y ofrece compatibilidad mínima para React 16.9+ y 17.
- **Runtime Node.js**: Headless Univer soporta Node.js `>=18.17.0`. Para desarrollar este monorepo se requiere Node.js `>=22.18`.

## 🛠️ Qué puedes construir

| Área | Capacidades open source | Extensiones de Univer Pro |
| --- | --- | --- |
| **Sheets** | Libros, hojas, rangos, selección, fórmulas, formato numérico, filtros, ordenación, validación de datos, formato condicional, hipervínculos, comentarios, buscar y reemplazar, notas, tablas, integración de dibujo y plugins de UI extensibles. | Colaboración en tiempo real, historial de edición, importación/exportación, impresión, gráficos, tablas dinámicas, sparklines, esquemas, formas, gráficos dentro de celdas, conectores de datos, cálculo del lado del servidor y funciones de fórmulas mejoradas. |
| **Docs** | Modelo de documento enriquecido, UI de edición, listas, hipervínculos, integración de dibujo, comentarios, inserción rápida y arquitectura compartida de documentos. | Colaboración, importación/exportación, impresión, tablas y listas mejoradas, columnas, callouts, bloques de código, citas, formas y recursos remotos de comentarios. |
| **Slides** | Modelo de datos de presentaciones y paquetes de UI en desarrollo activo. | Modelo y UI Pro para presentaciones, importación/exportación de slides, plugins de modelo/UI para gráficos y tablas, e infraestructura compartida de edición de formas. |
| **Bases** | Experiencias de datos estructurados personalizadas sobre la arquitectura de plugins, comandos y modelos de Univer. | Modelo de base de datos Base, comandos, integración de fórmulas, UI de workbench, editores de campos y vistas del motor de renderizado. |
| **Runtime** | Aplicaciones en navegador, uso headless en Node.js, patrones Web Worker/RPC, múltiples instancias y automatización orientada al servidor. | Paquetes de cliente/servidor de colaboración, cliente de colaboración para Node.js, servicios Pro de servidor, SSR, delegación de cómputo, cálculo del lado del servidor y herramientas de replay de changesets. |
| **Integrations** | React, Vue, Web Components, plantillas de frameworks, temas, localización y plugins personalizados. | Presets Pro y paquetes de despliegue empresarial. |

Sheets es actualmente la superficie de producto más madura. Docs y Slides comparten la arquitectura de Univer y siguen evolucionando dentro del mismo SDK.

## 🔓 Open Source y Pro

Este repositorio contiene el núcleo open source de Univer y plugins OSS de primera parte. Univer Pro se desarrolla por separado como una capa de extensión comercial para superficies de producto avanzadas, colaboración, capacidades de servidor e integraciones empresariales.

| Categoría | Open source | Univer Pro / comercial |
| --- | --- | --- |
| **Base** | SDK core, sistema de plugins, motor de renderizado, motor de fórmulas, Facade API, temas, i18n y adaptadores de frameworks. | Presets Pro y paquetes de despliegue empresarial. |
| **Sheets** | Edición básica de hojas de cálculo, fórmulas, formato numérico, filtro/ordenación, validación de datos, formato condicional, notas, tablas, hipervínculos, comentarios, dibujo, buscar y reemplazar. | Colaboración, historial de edición, importación/exportación, impresión, gráficos, tablas dinámicas, sparklines, esquemas, formas, gráficos dentro de celdas, conectores de datos, preprocesamiento de rangos y funciones mejoradas del motor de fórmulas. |
| **Docs** | Modelo de documento y UI de edición, listas, hipervínculos, comentarios, inserción rápida e integración de dibujo. | Colaboración, importación/exportación, impresión, tablas/listas mejoradas, columnas, callouts, bloques de código, citas, formas y recursos remotos de comentarios en hilos. |
| **Slides** | Modelo de presentaciones OSS y paquetes de UI. | Paquetes Pro de modelo/UI de slides, importación/exportación de slides, gráficos, tablas y UI reutilizable de editor de formas. |
| **Bases** | Arquitectura de plugins extensible para productos personalizados centrados en datos. | Modelo core de base de datos Base, comandos, mutations, integración de fórmulas, UI de workbench, editores de campos e integración con el motor de renderizado. |
| **Servidor y runtime** | Runtime headless en Node.js, patrones RPC/Web Worker y primitivas de automatización orientada al servidor. | Servidor de colaboración, cliente de colaboración para Node.js, servicios SSR, delegación de cómputo, cálculo del lado del servidor y herramientas de replay de changesets de colaboración. |

Las funciones Pro están documentadas en la [guía de Univer Pro](https://docs.univer.ai/guides/pro). Se separan aquí intencionalmente para que el alcance OSS sea claro.

Principios de separación:

- Los paquetes OSS de este repositorio están pensados para ser útiles por sí mismos bajo la licencia Apache-2.0. Univer Pro es opcional y no se requiere para usar las APIs públicas del SDK OSS.
- Los bugs, regresiones y problemas de seguridad en paquetes OSS deben reportarse y corregirse en el repositorio OSS, incluso cuando exista una función Pro relacionada.
- La documentación OSS no debe sugerir que capacidades Pro-only están disponibles en los paquetes públicos `@univerjs/*`. Las APIs, paquetes y rutas de despliegue Pro-only deben nombrarse explícitamente.
- Cuando una función OSS tenga una mejora Pro, el comportamiento OSS debe seguir documentado de forma independiente para que los usuarios puedan evaluar el alcance open source sin leer primero documentación comercial.

## 🌐 Ecosistema

- **Core SDK**: [`dream-num/univer`](https://github.com/dream-num/univer), este monorepo.
- **Presets**: [`dream-num/univer-presets`](https://github.com/dream-num/univer-presets), bundles de plugins para aplicaciones en navegador y Node.js.
- **AI agent skills**: [`dream-num/univer-sdk-skills`](https://github.com/dream-num/univer-sdk-skills), instrucciones reutilizables para agentes de IA que trabajan con integración de Univer, funciones Pro, desarrollo de plugins y backends Node. Consulta la [guía de AI Skills](https://docs.univer.ai/guides/skills).
- **Documentación**: [docs.univer.ai](https://docs.univer.ai), con guías de Sheets, Docs, Slides, recipes y Pro.
- **API Reference**: [docs.univer.ai/reference](https://docs.univer.ai/reference/classes/univer), Facade API y referencia de API generada.
- **Ejemplos y showcase**: [Univer Showcase](https://docs.univer.ai/showcase) y los [`examples/`](../../examples) de este repositorio.
- **AI-native spreadsheets**: [`dream-num/univer-mcp`](https://github.com/dream-num/univer-mcp), integración Univer Platform / MCP para controlar Univer Sheets con lenguaje natural.

## 📦 Guía del repositorio

```text
.
├── packages/      Paquetes core, motores, tipos de documento, plugins UI y plugins de funciones
├── examples/      Demos locales de navegador y Node.js usadas para desarrollo
├── common/        Herramientas internas compartidas, mock data, storybook y utilidades
├── e2e/           Pruebas Playwright y de comparación visual
├── tests/         Proyectos adicionales de pruebas de integración
└── docs/          Notas de arquitectura, imágenes y documentación local del repositorio
```

Los README de cada paquete están junto a sus paquetes dentro de [`packages/`](../../packages).

## 🧑‍💻 Desarrollo

Requisitos:

- Node.js `>=22.18`
- pnpm `>=10`

```bash
git clone https://github.com/dream-num/univer.git
cd univer
pnpm install
pnpm dev
```

Comandos útiles:

| Comando | Propósito |
| --- | --- |
| `pnpm dev` | Inicia la aplicación local de ejemplos. |
| `pnpm build` | Compila los paquetes del workspace, excluyendo paquetes internos de common. |
| `pnpm test` | Ejecuta pruebas unitarias mediante Turbo. |
| `pnpm typecheck` | Ejecuta comprobaciones TypeScript mediante Turbo. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm test:e2e` | Ejecuta pruebas Playwright. |
| `pnpm storybook:dev` | Inicia Storybook para desarrollo de componentes UI. |

Lee [CONTRIBUTING.md](../../CONTRIBUTING.md) antes de abrir un pull request.

## 📝 Notas para contribuidores

Notas locales del repositorio que vale la pena leer antes de cambios profundos:

- [Building Isomorphic Univer](../ISOMORPHIC.md): cómo separar lógica de navegador, Node.js, UI y plugins compartidos.
- [Política de estabilidad de API](../API_STABILITY.md): expectativas sobre stable, experimental, internal, deprecated y breaking changes.
- [Contributing to Facade API](../CONTRIBUTING-FACADE.md): expectativas de diseño para `FUniver`, `FWorkbook`, `FRange` y clases Facade relacionadas.
- [Naming Convention](../NAMING_CONVENTION.md): convenciones para archivos, carpetas, interfaces, plugins, comandos y tokens de inyección de dependencias.
- [Fixing Memory Leaks](../FIX_MEMORY_LEAK.md): patrones comunes de fugas de memoria y flujo de depuración para instancias Univer.
- [Architecture TLDRs](../tldr): notas breves sobre motor de fórmulas, Web Worker, permisos, selección y comportamiento ref-range.

## 💬 Comunidad

- Haz preguntas en [GitHub Discussions](https://github.com/dream-num/univer/discussions).
- Habla con la comunidad en [Discord](https://discord.gg/z3NKNT6D2f).
- Sigue [Twitter / X](https://twitter.com/univerhq) y [YouTube](https://www.youtube.com/@dreamNum).

Lee el [Código de Conducta](../../CODE_OF_CONDUCT.md) antes de participar.

## 🔒 Seguridad

Si crees haber encontrado un problema de seguridad, sigue la [Política de Seguridad](../../SECURITY.md).

## ❤️ Patrocinadores

Univer cuenta con el apoyo de la comunidad y patrocinadores. Puedes apoyar el proyecto a través de [Open Collective](https://opencollective.com/univer).

<a href="https://opencollective.com/univer/sponsor/0/website"><img src="https://opencollective.com/univer/sponsor/0/avatar.svg" alt="Sponsor 0" /></a>
<a href="https://opencollective.com/univer/sponsor/1/website"><img src="https://opencollective.com/univer/sponsor/1/avatar.svg" alt="Sponsor 1" /></a>
<a href="https://opencollective.com/univer/sponsor/2/website"><img src="https://opencollective.com/univer/sponsor/2/avatar.svg" alt="Sponsor 2" /></a>
<a href="https://opencollective.com/univer/sponsor/3/website"><img src="https://opencollective.com/univer/sponsor/3/avatar.svg" alt="Sponsor 3" /></a>
<a href="https://opencollective.com/univer/sponsor/4/website"><img src="https://opencollective.com/univer/sponsor/4/avatar.svg" alt="Sponsor 4" /></a>
<a href="https://opencollective.com/univer/sponsor/5/website"><img src="https://opencollective.com/univer/sponsor/5/avatar.svg" alt="Sponsor 5" /></a>
<a href="https://opencollective.com/univer/sponsor/6/website"><img src="https://opencollective.com/univer/sponsor/6/avatar.svg" alt="Sponsor 6" /></a>

<a href="https://opencollective.com/univer/backer/0/website"><img src="https://opencollective.com/univer/backer/0/avatar.svg" alt="Backer 0" /></a>
<a href="https://opencollective.com/univer/backer/1/website"><img src="https://opencollective.com/univer/backer/1/avatar.svg" alt="Backer 1" /></a>
<a href="https://opencollective.com/univer/backer/2/website"><img src="https://opencollective.com/univer/backer/2/avatar.svg" alt="Backer 2" /></a>
<a href="https://opencollective.com/univer/backer/3/website"><img src="https://opencollective.com/univer/backer/3/avatar.svg" alt="Backer 3" /></a>
<a href="https://opencollective.com/univer/backer/4/website"><img src="https://opencollective.com/univer/backer/4/avatar.svg" alt="Backer 4" /></a>
<a href="https://opencollective.com/univer/backer/5/website"><img src="https://opencollective.com/univer/backer/5/avatar.svg" alt="Backer 5" /></a>
<a href="https://opencollective.com/univer/backer/6/website"><img src="https://opencollective.com/univer/backer/6/avatar.svg" alt="Backer 6" /></a>

## 📄 Licencia

Copyright (c) 2021-present DreamNum Co., Ltd.

Publicado bajo la licencia [Apache-2.0](../../LICENSE).
