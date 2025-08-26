<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/img/banner-light.png">
    <img src="./docs/img/banner-dark.png" alt="Univer" width="400" />
</picture>

Univer es un motor de suite ofimática de código abierto, diseñado para ofrecer a los desarrolladores una solución potente, flexible y fácil de usar. Soporta hojas de cálculo, documentos y presentaciones, y proporciona una amplia gama de funciones y una alta extensibilidad. <br />
**Extensible · Integrable · Alto rendimiento**

[English][readme-en-link] | [简体中文][readme-zh-link] | [日本語][readme-ja-link] | **Español**<br />
[Sitio oficial][official-site-link] | [Documentación][documentation-link] | [Demo en línea][playground-link] | [Blog][blog-link]

[![][github-license-shield]][github-license-link]
[![][github-actions-shield]][github-actions-link]
[![][github-stars-shield]][github-stars-link]
[![][github-contributors-shield]][github-contributors-link] <br />
[![][github-forks-shield]][github-forks-link]
[![][github-issues-shield]][github-issues-link]
[![][codecov-shield]][codecov-link]
[![][codefactor-shield]][codefactor-link]
[![][discord-shield]][discord-link]

[![Trendshift][github-trending-shield]][github-trending-url]

</div>

Usa Univer MCP para controlar Univer Sheet con lenguaje natural y crear hojas de cálculo verdaderamente nativas de IA.

https://github.com/user-attachments/assets/7429bd5f-d769-4057-9e67-353337531024

<details open>
<summary>
<strong>Índice</strong>
</summary>

- [🌈 Destacados](#-destacados)
- [✨ Características](#-características)
    - [📊 Univer Sheet](#-univer-sheet)
    - [📝 Univer Doc](#-univer-doc-en-desarrollo)
    - [📽️ Univer Slide](#%EF%B8%8F-univer-slide-en-desarrollo)
- [🌐 Internacionalización](#-internacionalización)
- [👾 Ejemplos](#-ejemplos)
- [💬 Comunidad](#-comunidad)
- [🤝 Contribución](#-contribución)
- [❤️ Patrocinadores](#%EF%B8%8F-patrocinadores)
- [📄 Licencia](#-licencia)

</details>

## 🌈 Destacados

- 📈 **Soporte para múltiples tipos de documentos**: Univer soporta **hojas de cálculo**, **documentos de texto** y próximamente **presentaciones**.
- 🧙‍♀️ **Isomorfismo multiplataforma**: Puede ejecutarse tanto en navegadores como en Node.js (y en el futuro, en dispositivos móviles), con la misma API.
- ⚙️ **Fácil integración**: Univer se puede integrar perfectamente en tus aplicaciones.
- 🎇 **Potente**: Univer ofrece una amplia gama de funciones, incluyendo **fórmulas**, **formato condicional**, **validación de datos**, **filtros**, **edición colaborativa**, **impresión**, **importación y exportación** y muchas más funciones en camino.
- 🔌 **Altamente extensible**: Gracias a su *arquitectura de plugins*, es muy sencillo para los desarrolladores implementar requisitos personalizados sobre Univer.
- 💄 **Altamente personalizable**: Puedes personalizar su apariencia mediante *temas* y también soporta internacionalización (i18n).
- 🥤 **Fácil de usar**: Los *Presets* y la *API Facade* facilitan el inicio rápido.
- ⚡ **Alto rendimiento**:
  - ✏️ Univer cuenta con un eficiente *motor de renderizado* basado en canvas, capaz de renderizar varios tipos de documentos con precisión. El motor soporta características avanzadas como *ajuste de puntuación*, *maquetación de texto e imagen* y *buffer de scroll*.
  - 🧮 Incorpora un *motor de fórmulas* ultrarrápido que puede funcionar en Web Workers o incluso en el servidor.
- 🌌 **Sistema altamente integrado**: Documentos, hojas de cálculo y presentaciones pueden interoperar y renderizarse en el mismo canvas, permitiendo el flujo de información y datos dentro de Univer.

## ✨ Características

Univer proporciona una amplia gama de funciones para hojas de cálculo, documentos y presentaciones. Aquí algunas de las principales:

### 📊 Univer Sheets

- **Funciones principales**: Soporte para celdas, filas, columnas, hojas y libros de trabajo.
- **Fórmulas**: Soporte para fórmulas matemáticas, estadísticas, lógicas, de texto, fecha y hora, búsqueda y referencia, ingeniería, financieras e informativas.
- **Permisos**: Permite restringir el acceso a elementos específicos.
- **Formato de números**: Soporta el formateo de números según criterios específicos.
- **Hipervínculos**: Permite enlazar a sitios web externos, correos electrónicos y otras ubicaciones dentro de la hoja.
- **Imágenes flotantes**: Permite insertar imágenes y posicionarlas en cualquier parte de la hoja.
- **Buscar y reemplazar**: Permite buscar texto específico y reemplazarlo.
- **Filtrado**: Permite filtrar datos según criterios.
- **Ordenación**: Permite ordenar datos según criterios.
- **Validación de datos**: Restringe el tipo de datos que se pueden introducir en una celda.
- **Formato condicional**: Aplica formato a celdas según criterios.
- **Comentarios**: Permite añadir comentarios a las celdas.
- **Resaltado cruzado**: Muestra resaltado cruzado para ayudar a localizar celdas seleccionadas.
- **Editor Zen**: Experiencia de edición sin distracciones.
- **Tablas dinámicas**[^1]: Permite resumir y analizar datos.
- **Minigráficos**[^1]: Pequeños gráficos dentro de una celda para visualización rápida.
- **Impresión**[^1]: Permite imprimir o exportar a PDF.
- **Importación y exportación**[^1]: Soporte para XLSX.
- **Gráficos**[^1]: Soporte para gráficos de barras, líneas, pastel, dispersión, etc.
- **Edición colaborativa**[^1]: Varios usuarios pueden editar simultáneamente. Incluye historial y recuperación de archivos.
- **Historial de edición**[^1]: Permite ver y restaurar versiones anteriores.

### 📝 Univer Docs (rc)

- **Funciones principales**: Soporte para párrafos, títulos, listas, superíndices, subíndices, etc.
- **Listas**: Soporte para listas ordenadas, desordenadas y de tareas.
- **Hipervínculos**: Permite insertar enlaces a sitios web, correos electrónicos y otras ubicaciones.
- **Imágenes flotantes**: Permite insertar imágenes y maquetación mixta de texto e imagen.
- **Encabezados y pies de página**: Permite añadir encabezados y pies de página.
- **Comentarios**: Permite añadir comentarios.
- **Impresión**[^1]: Permite imprimir o exportar a PDF.
- **Importación y exportación**[^1]: Soporte para DOCX.
- **Edición colaborativa**[^1]: Varios usuarios pueden editar simultáneamente.

### 📽️ Univer Slides (En desarrollo)

- **Funciones principales**: Univer soportará funciones principales de presentaciones, incluyendo diapositivas, formas, texto, imágenes y más.

## 🌐 Internacionalización

Univer soporta múltiples idiomas, incluyendo:

- `zh-CN`
- `zh-TW`
- `en-US`
- `ru-RU`
- `vi-VN`
- `fa-IR`
- `ko-KR`
- `es-ES`
- `ca-ES`

`zh-CN` y `en-US` son soportados oficialmente, los demás son contribuciones de la comunidad.

Puedes añadir el idioma que desees siguiendo la [guía de personalización de idiomas](https://univer.ai/guides/sheet/getting-started/i18n#using-custom-locales). También puedes ayudarnos a añadir nuevos idiomas consultando la [guía de contribución](./CONTRIBUTING.md).

## 👾 Ejemplos

Integra Univer en productos de IA como herramienta de presentación de datos.

[![][examples-preview-capalyze]][examples-link-capalyze]

Puedes encontrar todos los ejemplos en [Univer Examples](https://univer.ai/examples).

| **📊 Hojas de cálculo** | **📊 Multi-instancia** | **📊 Uniscript** |
| :---: | :---: | :---: |
| [![][examples-preview-0]][examples-link-0] | [![][examples-preview-1]][examples-link-1] | [![][examples-preview-2]][examples-link-2] |
| **📊 Big data** | **📊 Colaboración** | **📊 Playground colaborativo** |
| [![][examples-preview-3]][examples-link-3] | [![][examples-preview-4]][examples-link-4] | [![][examples-preview-5]][examples-link-5] |
| **📊 Importar & Exportar** | **📊 Impresión** | **📝 Documentos** |
| [![][examples-preview-6]][examples-link-6] | [![][examples-preview-7]][examples-link-7] | [![][examples-preview-8]][examples-link-8] |
| **📝 Multi-instancia** | **📝 Uniscript** | **📝 Big data** |
| [![][examples-preview-9]][examples-link-9] | [![][examples-preview-10]][examples-link-10] | [![][examples-preview-11]][examples-link-11] |
| **📝 Colaboración** | **📝 Playground colaborativo** | **📽️ Presentaciones** |
| [![][examples-preview-12]][examples-link-12] | [![][examples-preview-13]][examples-link-13] | [![][examples-preview-14]][examples-link-14] |
| **📊 Editor Zen** | **Univer Workspace (versión SaaS)** | &nbsp; |
| [![][examples-preview-15]][examples-link-15] | [![][examples-preview-16]][examples-link-16] | &nbsp; |

<!-- ## 📦 Ecosistema

Univer cuenta con un rico ecosistema de herramientas y recursos para ayudarte a empezar: -->

## 🔗 Enlaces

- [Última vista previa de la rama `dev`](https://univer-preview.vercel.app/)
- [Sitio oficial](https://univer.ai)
- [Repositorio de Presets](https://github.com/dream-num/univer-presets)

## 🔒 Seguridad

Univer se compromete a mantener un código seguro. Seguimos las mejores prácticas y actualizamos regularmente las dependencias. Más información en nuestra [Política de Seguridad](./SECURITY.md).

## 💬 Comunidad

[![][github-community-badge]][github-community-link] [![][discord-community-badge]][discord-community-link] [![][stackoverflow-community-badge]][stackoverflow-community-link]

Univer es un proyecto inclusivo y acogedor. Por favor, lee nuestro [Código de Conducta](./CODE_OF_CONDUCT.md) antes de participar en la comunidad.

Únete a la comunidad Univer:

- Chatea con nosotros y otros desarrolladores en [Discord][discord-community-link].
- Inicia una discusión en [GitHub Discussions][github-community-link].
- Abre un tema en [Stack Overflow][stackoverflow-community-link] y etiquétalo con `univer`.

También puedes encontrar Univer en:

[Twitter][twitter-community-link] | [YouTube][youtube-community-link]

## 🤝 Contribución

Agradecemos cualquier tipo de contribución. Puedes enviar [incidencias o solicitudes de funciones](https://github.com/dream-num/univer/issues). Por favor, lee primero nuestra [guía de contribución](./CONTRIBUTING.md).

Si deseas contribuir con código, consulta también la guía de contribución. Te guiará en el proceso de configuración del entorno de desarrollo y envío de pull requests.

## ❤️ Patrocinadores

El crecimiento y desarrollo de Univer depende del apoyo de patrocinadores y colaboradores. Si deseas apoyar el proyecto, considera convertirte en patrocinador a través de [Open Collective](https://opencollective.com/univer).

Gracias a nuestros patrocinadores, aquí mostramos solo algunos por limitaciones de espacio, sin orden particular:

[![][sponsor-badge-0]][sponsor-link-0]
[![][sponsor-badge-1]][sponsor-link-1]
[![][sponsor-badge-2]][sponsor-link-2]
[![][sponsor-badge-3]][sponsor-link-3]
[![][sponsor-badge-4]][sponsor-link-4]
[![][sponsor-badge-5]][sponsor-link-5]
[![][sponsor-badge-6]][sponsor-link-6]

[![][backer-badge-0]][backer-link-0]
[![][backer-badge-1]][backer-link-1]
[![][backer-badge-2]][backer-link-2]
[![][backer-badge-3]][backer-link-3]
[![][backer-badge-4]][backer-link-4]
[![][backer-badge-5]][backer-link-5]
[![][backer-badge-6]][backer-link-6]

## 📄 Licencia

Copyright © 2021-2025 DreamNum Co,Ltd. Todos los derechos reservados.

Distribuido bajo la licencia [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).

<!-- Notas -->
[^1]: Estas funciones son proporcionadas por la versión no OSS de Univer, que es gratuita para uso comercial y también incluye planes de pago.

<!-- Enlaces -->
[github-license-shield]: https://img.shields.io/github/license/dream-num/univer?style=flat-square
[github-license-link]: ./LICENSE
[github-actions-shield]: https://img.shields.io/github/actions/workflow/status/dream-num/univer/build.yml?style=flat-square
[github-actions-link]: https://github.com/dream-num/univer/actions/workflows/build.yml
[github-stars-link]: https://github.com/dream-num/univer/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/dream-num/univer?style=flat-square
[github-trending-shield]: https://trendshift.io/api/badge/repositories/4376
[github-trending-url]: https://trendshift.io/repositories/4376
[github-contributors-link]: https://github.com/dream-num/univer/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/dream-num/univer?style=flat-square
[github-forks-link]: https://github.com/dream-num/univer/network/members
[github-forks-shield]: https://img.shields.io/github/forks/dream-num/univer?style=flat-square
[github-issues-link]: https://github.com/dream-num/univer/issues
[github-issues-shield]: https://img.shields.io/github/issues/dream-num/univer?style=flat-square
[codecov-shield]: https://img.shields.io/codecov/c/gh/dream-num/univer?token=aPfyW2pIMN&style=flat-square
[codecov-link]: https://codecov.io/gh/dream-num/univer
[codefactor-shield]: https://www.codefactor.io/repository/github/dream-num/univer/badge/dev?style=flat-square
[codefactor-link]: https://www.codefactor.io/repository/github/dream-num/univer/overview/dev
[discord-shield]: https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2&style=flat-square
[discord-link]: https://discord.gg/z3NKNT6D2f

[readme-en-link]: ./README.md
[readme-zh-link]: ./README-zh.md
[readme-ja-link]: ./README-ja.md
[readme-es-link]: ./README-es.md

[official-site-link]: https://univer.ai
[documentation-link]: https://docs.univer.ai/en-US
[playground-link]: https://docs.univer.ai/en-US/showcase
[blog-link]: https://docs.univer.ai/en-US/blog

[stackoverflow-community-link]: https://stackoverflow.com/questions/tagged/univer
[stackoverflow-community-badge]: https://img.shields.io/badge/stackoverflow-univer-ef8236?labelColor=black&logo=stackoverflow&logoColor=white&style=for-the-badge
[github-community-link]: https://github.com/dream-num/univer/discussions
[github-community-badge]: https://img.shields.io/badge/github-univer-24292e?labelColor=black&logo=github&logoColor=white&style=for-the-badge
[discord-community-link]: https://discord.gg/z3NKNT6D2f
[discord-community-badge]: https://img.shields.io/discord/1136129819961217077?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[twitter-community-link]: https://twitter.com/univerhq
[youtube-community-link]: https://www.youtube.com/@dreamNum

[sponsor-link-0]: https://opencollective.com/univer/sponsor/0/website
[sponsor-link-1]: https://opencollective.com/univer/sponsor/1/website
[sponsor-link-2]: https://opencollective.com/univer/sponsor/2/website
[sponsor-link-3]: https://opencollective.com/univer/sponsor/3/website
[sponsor-link-4]: https://opencollective.com/univer/sponsor/4/website
[sponsor-link-5]: https://opencollective.com/univer/sponsor/5/website
[sponsor-link-6]: https://opencollective.com/univer/sponsor/6/website
[sponsor-badge-0]: https://opencollective.com/univer/sponsor/0/avatar.svg
[sponsor-badge-1]: https://opencollective.com/univer/sponsor/1/avatar.svg
[sponsor-badge-2]: https://opencollective.com/univer/sponsor/2/avatar.svg
[sponsor-badge-3]: https://opencollective.com/univer/sponsor/3/avatar.svg
[sponsor-badge-4]: https://opencollective.com/univer/sponsor/4/avatar.svg
[sponsor-badge-5]: https://opencollective.com/univer/sponsor/5/avatar.svg
[sponsor-badge-6]: https://opencollective.com/univer/sponsor/6/avatar.svg
[backer-link-0]: https://opencollective.com/univer/backer/0/website
[backer-link-1]: https://opencollective.com/univer/backer/1/website
[backer-link-2]: https://opencollective.com/univer/backer/2/website
[backer-link-3]: https://opencollective.com/univer/backer/3/website
[backer-link-4]: https://opencollective.com/univer/backer/4/website
[backer-link-5]: https://opencollective.com/univer/backer/5/website
[backer-link-6]: https://opencollective.com/univer/backer/6/website
[backer-badge-0]: https://opencollective.com/univer/backer/0/avatar.svg
[backer-badge-1]: https://opencollective.com/univer/backer/1/avatar.svg
[backer-badge-2]: https://opencollective.com/univer/backer/2/avatar.svg
[backer-badge-3]: https://opencollective.com/univer/backer/3/avatar.svg
[backer-badge-4]: https://opencollective.com/univer/backer/4/avatar.svg
[backer-badge-5]: https://opencollective.com/univer/backer/5/avatar.svg
[backer-badge-6]: https://opencollective.com/univer/backer/6/avatar.svg

[examples-preview-capalyze]: ./docs/img/examples-sheets-capalyze.gif
[examples-preview-0]: ./docs/img/examples-sheets.gif
[examples-preview-1]: ./docs/img/examples-sheets-multi.gif
[examples-preview-2]: ./docs/img/examples-sheets-uniscript.gif
[examples-preview-3]: ./docs/img/examples-sheets-big-data.gif
[examples-preview-4]: ./docs/img/pro-examples-sheets-collaboration.gif
[examples-preview-5]: ./docs/img/pro-examples-sheets-collaboration-playground.gif
[examples-preview-6]: ./docs/img/pro-examples-sheets-exchange.gif
[examples-preview-7]: ./docs/img/pro-examples-sheets-print.gif
[examples-preview-8]: ./docs/img/examples-docs.gif
[examples-preview-9]: ./docs/img/examples-docs-multi.gif
[examples-preview-10]: ./docs/img/examples-docs-uniscript.gif
[examples-preview-11]: ./docs/img/examples-docs-big-data.gif
[examples-preview-12]: ./docs/img/pro-examples-docs-collaboration.gif
[examples-preview-13]: ./docs/img/pro-examples-docs-collaboration-playground.gif
[examples-preview-14]: ./docs/img/examples-slides.gif
[examples-preview-15]: ./docs/img/zen-mode.gif
[examples-preview-16]: ./docs/img/univer-workspace-drag-chart.gif
[examples-link-capalyze]: https://capalyze.ai/
[examples-link-0]: https://docs.univer.ai/showcase
[examples-link-1]: https://docs.univer.ai/showcase
[examples-link-2]: https://docs.univer.ai/showcase
[examples-link-3]: https://docs.univer.ai/showcase
[examples-link-4]: https://docs.univer.ai/showcase
[examples-link-5]: https://docs.univer.ai/showcase
[examples-link-6]: https://docs.univer.ai/showcase
[examples-link-7]: https://docs.univer.ai/showcase
[examples-link-8]: https://docs.univer.ai/showcase
[examples-link-9]: https://docs.univer.ai/showcase
[examples-link-10]: https://docs.univer.ai/showcase
[examples-link-11]: https://docs.univer.ai/showcase
[examples-link-12]: https://docs.univer.ai/showcase
[examples-link-13]: https://docs.univer.ai/showcase
[examples-link-14]: https://docs.univer.ai/showcase
[examples-link-15]: https://univer.ai/guides/sheet/features/zen-editor
[examples-link-16]: https://youtu.be/kpV0MvQuFZA
