# Building Isomorphic Univer

Univer is an isomorphic (full-stack) framework for building productivity tools, which means **support of Node.js is
at the same priority as browsers**.

To make your code aligned with the isomorphic architecture, please pay
attention to the following points:

## Separate Plugins

If the feature your are developing both needs to run on the server and the client, you should separate the feature into
at least two plugins. One for the underlying logic and the other for the UI.

The underlying logic often includes: models, commands and mutations to modify the data, and services to manage the data.

The UI includes menus, shortcuts, React components, Canvas elements, or other modules that depend on the browser environment.

For example, the filter feature is split into two plugins: `sheets-filter` and `sheets-filter-ui`.

Some modules rely on Node.js-only API such as `fs`, `path`, `child_process`, etc. These modules should be
implemented in another server-only plugin.

## Separate Facade API

**The Facade API is designed to be used by both the server and the client**. It should be implemented in each plugins and
composed by users (or the `@univerjs/presets` package) to provide a unified
API for the SDK.

You should implement the Facade API that can run on Node.js and the browser in the underlying logic plugins.

## Consider Implementing Commands in the Underlying Logic

Commands and especially those of type `MUTATION` should be implemented in the underlying logic plugins, and should not
read UI status directly to ensure that they can run on both Node.js and browsers.
