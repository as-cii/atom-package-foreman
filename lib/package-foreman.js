'use babel';

// import PackageForemanView from './package-foreman-view';
// import chokidar from 'chokidar';
import { CompositeDisposable } from 'atom';
import { init } from './package';

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
    // this.manifestPath = `${process.env.HOME}/.atom/packages.json`;

    init();

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
  }
};
