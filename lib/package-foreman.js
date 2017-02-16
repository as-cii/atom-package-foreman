'use babel';

import { CompositeDisposable } from 'atom';
import {
  addPackageToManifest,
  init,
  isPackageInstalled,
  listPackages,
  readPackageManifest,
  removePackageFromManifest
} from './package';

export default {
  subscriptions: null,
  manifestPath: null,
  packagesLoaded: false,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(this.onAllPackagesActivated));
    this.subscriptions.add(atom.packages.onDidActivatePackage(this.onPackageActivated));
    this.subscriptions.add(atom.packages.onDidDeactivatePackage(this.onPackageDeactivated));
  },

  onAllPackagesActivated() {
    this.packagesLoaded = true;
    init();
  },

  onPackageActivated(pack) {
    if (this.packagesLoaded) {
      readPackageManifest().then(manifest => {
        const isInManifest = manifest.includes(pack.name);
        if (!isInManifest) {
          atom.notifications.addInfo('Adding new package to manifest');
          addPackageToManifest(pack, manifest);
        }
      });
    }
  },

  onPackageDeactivated(pack) {
    if (this.packagesLoaded) {
      const { name } = pack;
      isPackageInstalled(name).then(isInstalled => {
        if (isInstalled) {
          readPackageManifest().then(manifest => {
            const isInManifest = manifest.includes(name);
            if (isInManifest) {
              removePackageFromManifest(pack, manifest);
            }
          });
        }
      });
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  }
};
