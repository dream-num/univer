# Univer CLI Tool

## Usage

Install dependency

```sh
npm i -g @univerjs/cli
```

### Create Plugin
Create a Univer plugin named `my-plugin` from a template

```sh
univer-cli create my-plugin
``` 

start develop plugin
```sh
cd my-plugin
npm i
npm run dev
```

### Custom Build


```sh
univer-cli build --include sort comment
``` 

## API

### Create

Command
```sh
univer-cli create <plugin> [inner]
```

- plugin: Required parameters, specify a plugin name, Please use `param-case` format, such as `data-validation`
- inner: Optional parameter, use this tag inside the Univer repository. With this flag set, we will put the plugin in the packages directory, otherwise we will create a new plugin in the current directory where the script is executed by default

### Build

### Init