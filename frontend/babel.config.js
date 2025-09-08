module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      // Remove any react-native-dotenv plugins
    };
};