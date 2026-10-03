# Super Phantom Cat — webOS Port

This repository contains a recovered browser build of **Super Phantom Cat**
adapted for webOS. The project packages the HTML5/Cocos2d game as a webOS
application and includes the recovered game assets, runtime patches, and build
scripts.

## Project layout

- `app/` — webOS application package and game assets
- `build-ipk.sh` / `build-ipk.cmd` — Linux and Windows packaging helpers
- `changes*.patch` / `changes*.diff` — source and rendering fixes applied to the recovered build

## Building

### GitHub Actions

Open **Actions → Build webOS IPK → Run workflow** to build the current branch.
The workflow also runs automatically when the application, Linux build script,
or workflow changes on `main`.

After a successful run, download the `.ipk` from the run's **Artifacts** section.
Artifacts are retained for 30 days. The package version comes from
`app/appinfo.json`. The build uses the webOS TV profile and skips minification
to preserve the recovered runtime. Only `app/` is packaged; repository-level
tests and documentation are not included.

### Local build

Install Node.js 20 or later and the webOS CLI first:

```sh
npm install --global @webos-tools/cli@3.2.6
ares-config --profile tv
```

On Linux:

```sh
sh build-ipk.sh
```

On Windows:

```bat
build-ipk.cmd
```

The scripts create an installable webOS package from the contents of `app/`.

## Status

This is a preservation and recovery project. It is intended for research,
archival, and compatibility testing of the recovered web build.
