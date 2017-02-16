'use babel';

import { exec } from 'child_process';
import fs from 'fs';

export const PACKAGE_MANIFEST_PATH = `${process.env.HOME}/.atom/packages.json`;

// OS X apps don't inherit PATH, so reconstruct it. This is a bug, filed
// against Atom here: https://github.com/atom/atom-shell/issues/550
const PATH = process.platform === 'darwin' ?
              'eval `/usr/libexec/path_helper -s`' :
              process.env.PATH;

const execOptions = {
  env: process.env,
  shell: process.env.SHELL
};

function run(command) {
  return new Promise((resolve, reject) => {
    exec(`${PATH} ${command}`, execOptions, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
}

export function isPackageInstalled(packageName) {
  return new Promise((resolve, reject) => {
    listPackages().then(installedPackages => {
      resolve(installedPackages.includes(packageName));
    }).catch((error) => {
      reject(error);
    });
  });
}

export function listPackages() {
  return new Promise((resolve, reject) => {
    run(`apm list --installed --bare`).then(result => {
      const trimmedOutput = result.trim().split('\n');
      const withoutVersion = trimmedOutput.map(p => p.slice(0, p.indexOf('@')));
      resolve(withoutVersion);
    }).catch(err => {
      atom.notifications.addError(err);
    });
  });
}

function writePackageManifest(packages) {
  const fileContents = JSON.stringify({
    packages: [
      ...packages
    ]
  }, null, 2);
  fs.writeFileSync(PACKAGE_MANIFEST_PATH, fileContents);
  atom.notifications.addSuccess(`Created package manifest at ${PACKAGE_MANIFEST_PATH}`);
}

function createPackageManifest() {
  return listPackages().then((packages) => {
    writePackageManifest(packages);
    return packages;
  });
}

export function readPackageManifest() {
  try {
    // TODO: determine if fs.accessSync call is necessary
    // or if just letting fs.readFile throw inside the
    // try/catch would be fine.
    fs.accessSync(PACKAGE_MANIFEST_PATH);
    const fileContents = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');
    const parsedManifest = JSON.parse(fileContents);
    // FIXME: ಠ_ಠ maybe re-write this function so this isn't necessary
    return Promise.resolve(parsedManifest.packages);
  } catch(e) {
    atom.notifications.addInfo('No package manifest found, creating one...');
    return createPackageManifest();
  }
}

function installMissingPackages(manifest, installedPackages) {
  return new Promise((resolve, reject) => {
    const installedSet = new Set(installedPackages);
    const packagesToInstall = manifest.filter(x => !installedSet.has(x));
    if (packagesToInstall.length > 0) {
      const packageList = packagesToInstall.join(' ');
      const command = `apm install ${packageList}`;
      run(command).then(result => resolve(result));
    } else {
      resolve('No packages to install');
    }
  });
}

export function addPackageToManifest(pack, manifest = undefined) {
  if (manifest) {
    writePackageManifest([...manifest, pack.name]);
  } else {
    readPackageManifest().then(packageManifest => {
      writePackageManifest([...packageManifest, pack.name]);
    });
  }
}

export function removePackageFromManifest(pack, manifest = undefined) {
  if (manifest) {
    writePackageManifest(manifest.filter(p => p !== pack.name));
  } else {
    readPackageManifest().then(packageManifest => {
      writePackagedManifest(packageManifest.filter(p => p !== pack.name));
    });
  }
}

export function init() {
  readPackageManifest().then((manifest) => {
    listPackages().then((installedPackages) => {
      installMissingPackages(manifest, installedPackages).then(result => {
        atom.notifications.addInfo(result);
      });
    });
  });
}
