npm commands wrapper for pisco

### Hook (stages: check, run)

Any step can ensure that **npm install** or **npm update** are correctly executed:

#### 1. Install plugin in your recipe

 **Add package dependency**:

    npm install pisco-plugin-npm --save

 **Add plugin on steps/$stepName/config.json plugins**:

```
{
  "plugins": [
    [...]
    "npm"
  ]
}
```

#### 3. Configure plugin in config.json of your step


```
{
  "npmDependencies": {
    "installed": true,
    "updated": true,
    "lockedInstall": true (default is false)
    "baseDir" : "any", (default is '.')
    "directory" : "node_modules" (default is 'node_modules')
  }
}
```

  - **installed** _(default: false)_ Ensure that npm install is executed if ${npm.directory} doesn't exists execute npm install.
  - **updated** _(default: false)_ Ensure that `npm update` and `npm prune` are executed. Detect if there are symbolics links and ask user to delete
  - **lockedInstall** _(default: false)_ If true and _npm_shrinkwrap.json exists installation is locked at this file.
  - **directory** _(default: 'node_modules')_ must to be the same value of `directory` in .npmrc file.
  - **baseDir** _(default: '.')_ path to npm.json file relative.

#### 4. Configure the stages for the hook (could be check or run)

**By default the hook is set on check stage**

In config.json of your step

```
{
  "stages" : ["check","run"],
  "npmDependencies": {
    [...]
  }
}
```


#### Examples:

Normal use, ensure npm install was executed:

```
{
  "npmDependencies": {
    "installed": true
  }
}
```

Check if there are symbolics links and ask user to update:

```
{
  "npmDependencies": {
    "updated": true
  }
}
```

### this.npmList

Execute **npm list ${opts}**

| Param | Description |
| --- | --- |
| opts | array with command options to append to npm list for example [ '--offline', '--json' ]  |
| returns | a Promise with the complete child_process object result of the execution |

