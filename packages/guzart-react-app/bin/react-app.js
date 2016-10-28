#!/usr/bin/env node

const spawn = require('cross-spawn');

const scriptName = process.argv[2];
const args = process.argv.slice(3);
const scriptPath = require.resolve(`../scripts/${scriptName}.js`);
const output = spawn.sync('node', [scriptPath, ...args], { stdio: 'inherit' });
process.exit(output.status);
