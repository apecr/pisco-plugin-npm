### Description

Plugin used to registry npm modules into a public npm registry

How to use this plugin:

- 1. Implicit: Calling public addons.
- 2. Explicit: By configuration. Checks if npm Registry is well configured.

configure this.params.stages with an array of the stages you want to check if the npm registry is ok.

```
  "stages" : ["check", "run"]
```

### Transitive parameters

This parameters should be set on the step:

- **--registryUrl**: [String], default: 'undefined' : Url of the npm registry. by default use what is configured on .npmrc

### Addons

#### this.publishNpm

Return: 0 if everything is Ok or status of the command executed.