# TODOs

- [ ] We should document core modules to make the code more understandable for new contributors.
- [ ] Remove properties and methods that are not used or not necessary.
- [ ] A graph to demonstrate how the modules are connected.
- [ ] Using mutations as remote calling is an anti-pattern and may cause performance issues. We should migrate to a direct way.
- [ ] Some dependencies are not necessary to be abstract, e.g. `IFormulaService`. Refactoring this can make the code easier to read.
- [ ] There is no retry or fallback mechanism for web worker failure.

## Interface should exposed by the engine

- Set formula data and subscribe to calculation results.
