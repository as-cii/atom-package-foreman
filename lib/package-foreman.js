'use babel';

// import PackageForemanView from './package-foreman-view';
// import chokidar from 'chokidar';
import { CompositeDisposable } from 'atom';
import { addPackageToManifest,
         init,
         isPackageInstalled,
         readPackageManifest,
         listPackages } from './package';

export default {

  // packageForemanView: null,
  // modalPanel: null,
  subscriptions: null,
  manifestPath: null,
  packagesLoaded: false,

  activate(state) {
    // this.packageForemanView = new PackageForemanView(state.packageForemanViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.packageForemanView.getElement(),
    //   visible: false
    // });
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.packages.onDidActivatePackage(this.onPackageActivated));
    this.subscriptions.add(atom.packages.onDidDeactivatePackage(this.onPackageDeactivated));
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(this.onAllPackagesActivated));
    // this.manifestPath = `${process.env.HOME}/.atom/packages.json`;

    // init();

    // // Register command that toggles this view
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'package-foreman:toggle': () => this.toggle()
    // }));
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
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    // this.packageForemanView.destroy();
  },

  serialize() {
    return {
      // packageForemanViewState: this.packageForemanView.serialize()
    };
  }
};
