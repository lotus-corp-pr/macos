# MonkeyGG2 Games Portal (vendored)

This directory contains the full [MonkeyGG2](https://github.com/MonkeyGG2/monkeygg2.github.io)
games portal, vendored into the macOS web desktop so all ~117 games run
locally without an external dependency.

## Why it's here
MonkeyGG2 is licensed under the "DO WHAT THE FUCK YOU WANT TO PUBLIC
LICENSE", which permits redistribution. The entire repo (HTML/CSS/JS,
fonts, images and the `games/` directory with WebGL assets) is copied
here verbatim so the portal is fully self-contained.

## Running it
The portal is a static site under `monkeygg2/`. Open `monkeygg2/index.html`
directly, or use the desktop's **Games** app (dock icon / Launchpad entry),
which loads the portal in a window.

All internal paths are relative (`js/`, `css/`, `fonts/`, `imgs/`,
`games/<name>`), so the portal works from any subpath without
reconfiguration. The single absolute link in `404.html` was made relative.

## Source
Upstream: https://github.com/MonkeyGG2/monkeygg2.github.io
