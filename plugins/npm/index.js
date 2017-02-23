'use strict';

const fs = require('fs');
const shrinkwrapFile = 'npm-shrinkwrap.json';

module.exports = {

  check() {
    this.params.npmDependencies = this.params.npmDependencies ? this.params.npmDependencies : {};
    this.params.stages = this.params.stages ? this.params.stages : [];
    if ((this.params.npmDependencies.installed || this.params.npmDependencies.updated) && (this.params.stages.indexOf('check') >= 0) || this.params.stages.length === 0) {
      return this._npmAction();
    }
  },
  run() {
    if ((this.params.npmDependencies.installed || this.params.npmDependencies.updated) && this.params.stages.indexOf('run') >= 0) {
      return this._npmAction();
    }
  },

  addons: {
    packageConsolidate(config) {
      return this._npmAction()
        .then(() => this._npmCompare(config));
    },
    _npmCompare(config) {
      const file = shrinkwrapFile;
      this._npmPre();
      return this.execute('npm', [ 'shrinkwrap' ])
        .then(() => this._npmPost())
        .then(() => {
          const oldf = this.fsReadFile(`_${file}`);
          const newf = this.fsReadFile(file);
          fs.renameSync(file, `_${file}`);
          config.hasChanged = oldf.toString() !== newf.toString() ? `_${file}` : false;
          this.logger.info('Dependencies has changed', config.hasChanged ? '#green' : '#yellow', config.hasChanged !== false);
          return Promise.resolve(config);
        });
    },
    npmList(params) {
      this._npmPre();
      let args = [ 'list' ];
      if (params) {
        args = args.concat(args, params);
      }
      return this.execute('npm', args)
        .then((result) => this._npmPost(result));
    },
    npmDirectory() {
      return this.params.npmDependencies.directory ? this.params.npmDependencies.directory : 'node_modules';
    },
    npmIsInstalled() {
      this._npmPre();
      const result = this.fsExists(this.npmDirectory());
      this._npmPost();
      return result;
    },
    _npmAction() {
      if (!this.npmIsInstalled()) {
        this.logger.info('npm', '#green', 'installing', '...');
        return this._npmInstall();
      } else if (this.params.npmDependencies.updated) {
        this.logger.info('npm', '#green', 'updating', '...');
        return this._npmUpdate();
      } else {
        this.logger.info('npm installed:', '#green', 'OK');
        return Promise.resolve();
      }
    },
    _npmInstall() {
      this._npmPre();
      const args = [ 'install' ];
      return this.execute('npm', args)
        .then(() => this._npmPost());
    },
    _npmPre() {
      if (this._npmIsBaseDir()) {
        process.cwd(this.params.npmDependencies.baseDir);
      }
      if (this.params.npmDependencies.lockedInstall && this.fsExists(`_${shrinkwrapFile}`)) {
        fs.renameSync(`_${shrinkwrapFile}`, shrinkwrapFile);
      } else {
        this.logger.warn('Is not possible to make a locked installation.', '#green', `_${shrinkwrapFile}`, 'do not exists');
      }
    },
    _npmPost(result) {
      if (this._npmIsBaseDir()) {
        process.cwd(this.params.workingDir);
      }
      if (this.params.npmDependencies.lockedInstall && this.fsExists(shrinkwrapFile)) {
        fs.renameSync(shrinkwrapFile, `_${shrinkwrapFile}`);
      }
      return result;
    },
    _npmUpdate() {
      this._npmPre();
      const args = [ 'update' ];
      return this.execute('npm', args)
        .then(() => this.execute('npm', [ 'prune' ]))
        .then(() => this._npmPost());
    },
    _npmIsBaseDir() {
      return this.params.npmDependencies.baseDir && this.fsExists(this.params.npmDependencies.baseDir);
    }
  }
};