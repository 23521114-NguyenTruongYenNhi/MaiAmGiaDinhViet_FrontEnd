module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Đảm bảo plugins là một MẢNG [ ], không phải đối tượng { }
      "react-native-reanimated/plugin", 
    ],
  };
};