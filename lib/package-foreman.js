'use babel';

import PackageForemanView from './package-foreman-view';
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import chokidar from 'chokidar';
import { exec } from 'child_process';

export default {

  // packageForemanView: null,
  // modalPanel: null,
  subscriptions: null,
  manifestPath: null,

  activate(state) {
    // this.packageForemanView = new PackageForemanView(state.packageForemanViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.packageForemanView.getElement(),
    //   visible: false
    // });
    this.subscriptions = new CompositeDisposable();
    this.manifestPath = `${process.env.HOME}/.atom/packages.json`;

    this.doMath();

    // // Register command that toggles this view
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'package-foreman:toggle': () => this.toggle()
    // }));
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    // this.packageForemanView.destroy();
  },

  serialize() {
    return {
      // packageForemanViewState: this.packageForemanView.serialize()
    };
  },

  doMath() {
    this.readPackageManifest().then((manifest) => {
      this.listPackages().then((installedPackages) => {
        this.installMissingPackages(manifest, installedPackages).then(result => {
          console.log(result);
        });
      });
    });
    // return (
    //   this.modalPanel.isVisible() ?
    //   this.modalPanel.hide() :
    //   this.modalPanel.show()
    // );
  },

  listPackages() {
    return new Promise((resolve, reject) => {
      exec(`apm list --installed --bare`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout.trim().split('\n'));
      })
    });
  },

  createPackageManifest() {
    return this.listPackages().then((packages) => {
      const fileContents = JSON.stringify({
        packages: [
          ...packages
        ]
      }, null, 2);
      console.log('Writing file...');
      fs.writeFileSync(this.manifestPath, fileContents);
      console.log(`Created package manifest at ${this.manifestPath}`);
      return packages;
    });
  },

  readPackageManifest() {
    try {
      fs.accessSync(this.manifestPath);
      // TODO: actually read it and return the contents
    } catch(e) {
      console.log('No package manifest found, creating one...');
      return this.createPackageManifest();
    }
  },

  installMissingPackages(manifest, installedPackages) {
    return new Promise((resolve, reject) => {
      debugger;
      const installedSet = new Set(installedPackages);
      const packagesToInstall = manifest.filter(x => !installedSet.has(x));
      if (packagesToInstall.length > 0) {
        const packageList = packagesToInstall.join(' ');
        const command = `apm install ${packageList}`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          }
          resolve(stdout);
        });
      } else {
        resolve('No packages to install');
      }
    });
  },

  addPackageToManifest(package) {

  },

  addPackagesToManifest(packages = []) {

  }

};
