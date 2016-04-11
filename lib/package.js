'use babel';

import { exec } from 'child_process';
import fs from 'fs';

export const PACKAGE_MANIFEST_PATH = `${process.env.HOME}/.atom/packages.json`;

function listPackages() {
  return new Promise((resolve, reject) => {
    exec(`apm list --installed --bare`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout.trim().split('\n'));
    })
  });
}

function createPackageManifest() {
  return listPackages().then((packages) => {
    const fileContents = JSON.stringify({
      packages: [
        ...packages
      ]
    }, null, 2);
    console.log('Writing file...');
    fs.writeFileSync(PACKAGE_MANIFEST_PATH, fileContents);
    console.log(`Created package manifest at ${PACKAGE_MANIFEST_PATH}`);
    return packages;
  });
}

function readPackageManifest() {
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
    console.log('No package manifest found, creating one...');
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
}

function addPackageToManifest(package) {

}

function addPackagesToManifest(packages = []) {

}

export function init() {
  readPackageManifest().then((manifest) => {
    listPackages().then((installedPackages) => {
      installMissingPackages(manifest, installedPackages).then(result => {
        console.log(result);
      });
    });
  });
}
