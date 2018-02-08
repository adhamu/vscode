"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:max-classes-per-file ... */
const defaultOption = {
    delimiter: '/',
};
class TrieNode {
    constructor(token, value = null) {
        this.token = token;
        this.value = value;
        this.children = {};
    }
    // is store value
    isLoaded() {
        return this.value !== null;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    getValue() {
        return this.value;
    }
    clearValue() {
        this.value = null;
        return this;
    }
    getChildren() {
        return Object.keys(this.children).map(key => this.children[key]);
    }
    addChild(token, childNode) {
        this.children[token] = childNode;
        return this;
    }
    getChild(token) {
        return this.children[token];
    }
    removeChild(token) {
        return delete this.children[token];
    }
    getChildrenNum() {
        return Object.keys(this.children).length;
    }
    hasChild(token) {
        return this.children[token] !== undefined ? true : false;
    }
}
class Trie {
    constructor(dict, option) {
        this.option = Object.assign({}, defaultOption, option);
        this.root = new TrieNode('@root');
        Object.keys(dict).forEach(key => this.add(key, dict[key]));
    }
    empty() {
        this.root = new TrieNode('@root');
    }
    isEmpty() {
        return this.root.getChildrenNum() <= 0;
    }
    add(path, value) {
        const tokens = Array.isArray(path) ? path : this.splitPath(path);
        const bottomNode = tokens.reduce((parent, token) => {
            let node = parent.getChild(token);
            if (node === undefined) {
                node = new TrieNode(token);
                parent.addChild(token, node);
            }
            return node;
        }, this.root);
        bottomNode.setValue(value);
    }
    remove(path) {
        const tokens = Array.isArray(path) ? path : this.splitPath(path);
        const node = this.findNode(this.root, tokens);
        if (!node) {
            return false;
        }
        if (node.getChildrenNum() <= 0) {
            const precedeTokens = tokens.slice(0, tokens.length - 1);
            return this.remove(precedeTokens);
        }
        node.clearValue();
        return true;
    }
    findPrefix(path) {
        const tokens = Array.isArray(path) ? path : this.splitPath(path);
        const node = this.findPrefixNode(this.root, tokens);
        return node.getValue();
    }
    clearPrefix(path) {
        const tokens = Array.isArray(path) ? path : this.splitPath(path);
        const node = this.findPrefixNode(this.root, tokens);
        return node.clearValue();
    }
    findPrefixNode(parent, tokens) {
        let result = parent;
        const tokensQueue = tokens.slice().reverse();
        let curentNode = this.root;
        do {
            curentNode = curentNode.getChild(tokensQueue.pop());
            if (curentNode === undefined) {
                break;
            }
            if (curentNode.isLoaded()) {
                result = curentNode;
            }
        } while (tokensQueue.length > 0);
        return result;
    }
    findNode(parent, tokens) {
        const [top, ...rest] = tokens;
        if (top === undefined) {
            return parent;
        }
        const childNode = parent.getChild(top);
        if (childNode !== undefined) {
            return this.findNode(childNode, rest);
        }
        return null;
    }
    getAllValues() {
        const nodeQueue = [this.root];
        const result = [];
        do {
            const curentNode = nodeQueue.shift();
            if (curentNode.isLoaded()) {
                result.push(curentNode.getValue());
            }
            const childrenNodes = curentNode.getChildren();
            nodeQueue.push(...childrenNodes);
        } while (nodeQueue.length > 0);
        return result;
    }
    findValuesWithShortestBranch() {
        const nodeQueue = [this.root];
        const result = [];
        do {
            const curentNode = nodeQueue.shift();
            if (curentNode.isLoaded()) {
                result.push(curentNode.getValue());
            }
            else {
                const childrenNodes = curentNode.getChildren();
                nodeQueue.push(...childrenNodes);
            }
        } while (nodeQueue.length > 0);
        return result;
    }
    splitPath(path) {
        let normalizePath = path;
        if (normalizePath[0] === this.option.delimiter) {
            normalizePath = normalizePath.substr(1);
        }
        if (normalizePath[normalizePath.length - 1] === this.option.delimiter) {
            normalizePath = normalizePath.substr(0, normalizePath.length - 1);
        }
        return normalizePath.split(this.option.delimiter);
    }
}
exports.default = Trie;
//# sourceMappingURL=Trie.js.map