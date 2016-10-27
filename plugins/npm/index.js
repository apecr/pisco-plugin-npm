'use strict';

const fs = require('fs');
const path = require('path');

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
        return this._npmAreSymbolicLinks()
          .then((result) => this._npmCheckIfUpdate(result));
      } else {
        this.logger.info('npm installed:', '#green', 'OK');
      }
    },
    _npmInstall() {
      this._npmPre();
      const args = [ 'install' ];
      return this.execute('npm', args)
        .then(() => this._npmPost());
    },
    _npmAreSymbolicLinks() {
      this._npmPre();
      if (!this.npmIsInstalled()) {
        return Promise.resolve(false);
      }
      return new Promise((ok, ko) => {
        const where = this.npmDirectory();
        fs.readdir(where, (err, files) => {
          if (err) {
            return ko(err);
          }

          const promises = files.map((file) => new Promise((res, rej) => {
            fs.lstat(path.resolve(where, file), (_err, stats) => {
              if (_err) {
                return rej();
              }
              const isSymbolicLink = stats.isSymbolicLink();
              if (isSymbolicLink) {
                this.logger.info('#yellow', `Symbolic link found: ${file}`);
              }
              return res(isSymbolicLink);
            });
          }));

          return Promise.all(promises)
            .then((result) => result.reduce((a, b) => a || b))
            .then((result) => ok(result));
        });
      });
    },
    _npmCheckIfUpdate(check) {
      if (check) {
        this._npmPromptLinks();
        return this.inquire('promptLinks')
          .then(() => {
            if (this.params.donpmUpdate) {
              return this._npmUpdate();
            }
          });
      }
      return this._npmUpdate();
    },
    _npmPre() {
      if (this._npmIsBaseDir()) {
        process.cwd(this.params.npmDependencies.baseDir);
      }
    },
    _npmPost(result) {
      if (this._npmIsBaseDir()) {
        process.cwd(this.params.workingDir);
      }
      return result;
    },
    _npmPromptLinks() {
      this.params.promptLinks = [ {
        type: 'confirm',
        name: 'donpmUpdate',
        required: true,
        message: `There are symbolic links in your ${this.npmDirectory()} folder. Do you want to update npm dependencies anyway?`
      } ];
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
