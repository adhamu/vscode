#!/bin/bash
brew cask install vscodium

APPLICATION_SUPPORT="${HOME}/Library/Application Support/VSCodium/User"

function symlink() {
    echo "Symlinking $2 to $1"
    ln -sf "$1" "$2"
}

mv "${HOME}/.vscode-oss/extensions" "${HOME}/.vscode-oss/_extensions"
symlink "${PWD}/extensions" "${HOME}/.vscode-oss/extensions"

FILES=('snippets' 'keybindings.json' 'settings.json' 'projects.json')

for F in ${FILES[@]}; do
    mv "${APPLICATION_SUPPORT}/${F}" "${APPLICATION_SUPPORT}/_${F}"
    symlink ${PWD}/${F} "${APPLICATION_SUPPORT}/${F}"
done
