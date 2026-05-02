#!/bin/bash

echo "清理构建缓存..."
rm -rf dist node_modules/.cache

echo "安装依赖..."
npm install

echo "重新构建..."
npm run build

echo "Windows打包..."
npm run windows-build