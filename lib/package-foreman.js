'use babel';

import PackageForemanView from './package-foreman-view';
import { CompositeDisposable } from 'atom';

export default {

  packageForemanView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.packageForemanView = new PackageForemanView(state.packageForemanViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.packageForemanView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'package-foreman:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.packageForemanView.destroy();
  },

  serialize() {
    return {
      packageForemanViewState: this.packageForemanView.serialize()
    };
  },

  toggle() {
    console.log('PackageForeman was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
