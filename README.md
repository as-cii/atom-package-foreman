# package-foreman package

This package is meant to be an all-in-one solution for sharing installed packages across multiple machines. At the time of writing, Atom does not currently have a way to sync installed packages across machines.

At CA Technologies we have a shared atom config so we have consistent snippets, keybindings, etc. across all of our dev machines and pairing stations, which works great for everything but packages, because we just clone the config repo to ~/.atom and you're good to go....except for the packages.

What this package does:
- Generate a package manifest
- Keep the package manifest up-to-date as packages are installed/uninstalled
- Automatically install packages in the manifest not already installed
