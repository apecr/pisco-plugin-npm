## Main Index:

- [Available Commands](#available-commands)
  - [Flows](#flows)
  - [Steps](#steps)
- [Plugins](#plugins)
  - [npm](#npm-manage-npm-in-steps)
  - [npmRegistry](#npmregistry-check-npm-registry-configuration)


## Available Commands:

### FLOWS

### STEPS

## PLUGINS

#### npm (Manage npm in steps)
[[Index]](#main-index)

npm commands wrapper for pisco

### Hook (stages: check, run)

Any step can ensure that **npm install** or **npm update** are correctly executed:

#### 1. Install plugin in your recipe

 **Add package dependency**:

    npm install pisco-plugin-npm --save

 **Add plugin on steps/$stepName/config.json plugins**:

```
{
  &quot;plugins&quot;: [
    [...]
    &quot;npm&quot;
  ]
}
```

#### 3. Configure plugin in config.json of your step


```
{
  &quot;npmDependencies&quot;: {
    &quot;installed&quot;: true,
    &quot;updated&quot;: true,
    &quot;baseDir&quot; : &quot;any&quot;, (default is &#39;.&#39;)
    &quot;directory&quot; : &quot;node_modules&quot; (default is &#39;node_modules&#39;)
  }
}
```

  - **installed** _(default: false)_ Ensure that npm install is executed if ${npm.directory} doesn&#39;t exists execute npm install.
  - **updated** _(default: false)_ Ensure that `npm update` and `npm prune` are executed. Detect if there are symbolics links and ask user to delete
  - **directory** _(default: &#39;node_modules&#39;)_ must to be the same value of `directory` in .npmrc file.
  - **baseDir** _(default: &#39;.&#39;)_ path to npm.json file relative.

#### 4. Configure the stages for the hook (could be check or run)

**By default the hook is set on check stage**

In config.json of your step

```
{
  &quot;stages&quot; : [&quot;check&quot;,&quot;run&quot;],
  &quot;npmDependencies&quot;: {
    [...]
  }
}
```


#### Examples:

Normal use, ensure npm install was executed:

```
{
  &quot;npmDependencies&quot;: {
    &quot;installed&quot;: true
  }
}
```

Check if there are symbolics links and ask user to update:

```
{
  &quot;npmDependencies&quot;: {
    &quot;updated&quot;: true
  }
}
```

### this.npmList

Execute **npm list ${opts}**

| Param | Description |
| --- | --- |
| opts | array with command options to append to npm list for example [ &#39;--offline&#39;, &#39;--json&#39; ]  |
| returns | a Promise with the complete child_process object result of the execution |



#### npmRegistry (Check npm registry configuration)
[[Index]](#main-index)

### Description

Plugin used to registry npm modules into a public npm registry

How to use this plugin:

- 1. Implicit: Calling public addons.
- 2. Explicit: By configuration. Checks if npm Registry is well configured.

configure this.params.stages with an array of the stages you want to check if the npm registry is ok.

```
  &quot;stages&quot; : [&quot;check&quot;, &quot;run&quot;]
```

### Transitive parameters

This parameters should be set on the step:

- **--registryUrl**: [String], default: &#39;undefined&#39; : Url of the npm registry. by default use what is configured on .npmrc

Note: you can change the repository that artifacts is going to be published by adding a .piscosour/piscosour.json file like this:

```
{
  &quot;params&quot; : {
    &quot;registryUrl&quot; : &quot;https://registry.npmjs.org/&quot;
  }
}
```

### Addons

#### this.publishNpm

Return: 0 if everything is Ok or status of the command executed.

