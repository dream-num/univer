# Sheets Filter

> There are a lot of implementation details that is not explicitly documented in the OOXML document or just simply hard to be noticed. This documents entails some interesting and important details.

## Architecture Design

Please refer to the excalidraw file in the same folder.

## Details of Microsoft Excel

The first detail that is interesting is 

## History Tickets

- [\[Feature Ticket\] Filter for Sheet](https://github.com/dream-num/univer/issues/1450)

## Custom Filters

### OOXML Compatibility

In OOXML, there are a limited number of custom filter operators (please refer to `CustomFilterOperator`), and other operators including `startsWith` and `endsWith` (for a full list of this kind of operators see `ExtendCustomFilterOperator`) are actually supported by the combinations of OOXML operators, `*?` regex-like fuzzy matching, filter-by-values, dynamic filter, and so on.

We take the same method instead of making `ExtendCustomFilterOperator` to be first-class citizens, because it is more OOXML-compatible and makes importing/exporting Excel files easier to implement.

The cost is to implement the transformation between `ExtendCustomFilterOperator` and combinations. But the overall cost seems to be acceptable.

