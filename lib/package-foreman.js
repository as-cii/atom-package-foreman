'use babel';

import { CompositeDisposable } from 'atom';
import {
  addPackageToManifest,
  init,
  isPackageInstalled,
  readPackageManifest,
  listPackages
} from './package';

export default {
  subscriptions: null,
  manifestPath: null,
  packagesLoaded: false,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.packages.onDidActivatePackage(this.onPackageActivated));
    this.subscriptions.add(atom.packages.onDidDeactivatePackage(this.onPackageDeactivated));
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(this.onAllPackagesActivated));
  },

  onAllPackagesActivated() {
    this.packagesLoaded = true;
    init();
  },

  onPackageActivated(package) {
    if (this.packagesLoaded) {
      readPackageManifest().then(manifest => {
        const isInManifest = manifest.includes(package.name);
        if (!isInManifest) {
          console.log('Adding new package to manifest');
          addPackageToManifest(package, manifest);
        }
      });
    }
  },

  onPackageDeactivated(package) {
    if (this.packagesLoaded) {
      isPackageInstalled(package.name).then(isInstalled => {
        if (!isInstalled) {
          readPackageManifest().then(manifest => {
            const isInManifest = manifest.includes(package.name);
            if (isInManifest) {
              removePackageFromManifest(package, manifest);
            }
          });
        }
      });
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return { };
  }
};
