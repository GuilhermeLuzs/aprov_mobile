const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// O build CommonJS do three (usado quando alguém faz require("three"), como o
// @react-three/fiber/native) chama process.emitWarning ao carregar, e essa
// função não existe no React Native: o app quebra com "undefined is not a
// function". Força todo mundo a usar o build ESM, que também garante uma
// única cópia do three no bundle.
const THREE_ESM = path.resolve(__dirname, 'node_modules/three/build/three.module.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: THREE_ESM };
  return context.resolveRequest(context, moduleName, platform);
};

// Modelos 3D exportados do Blender (câmera guiada da avaliação).
config.resolver.assetExts.push('glb', 'gltf');

// O serviço Python de visão computacional mora no mesmo repositório,
// mas não faz parte do bundle do app.
config.resolver.blockList = [/cv-service[\\/].*/];

module.exports = config;
