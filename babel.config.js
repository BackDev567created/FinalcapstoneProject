module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Temporarily remove nativewind to fix the error
      // 'nativewind/babel'
    ],
  };
};