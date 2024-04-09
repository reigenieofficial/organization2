const path = require("path");
const webpack = require("webpack");

module.exports = {
  target: "web",
  entry: path.join(__dirname, "src", "index.js"), // Updated entry point to JavaScript file
  output: {
    path: path.join(__dirname, "public/dist"),
    filename: "build.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.jsx?$/, // Updated test property for JavaScript files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Using babel-loader for JavaScript files
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"], // Added @babel/preset-react preset
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  // Explicitly set devtool to false
  devtool: false,
  resolve: {
    extensions: [".js", ".jsx", ".json"], // Added .jsx extension
  },
};
