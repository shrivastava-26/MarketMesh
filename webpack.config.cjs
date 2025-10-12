// webpack.config.cjs
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || "development"}`) });

const { ModuleFederationPlugin } = require("webpack").container;

// Proxy targets per environment
const proxyTargets = {
  development: {
    "/api/home": "http://localhost:3002",
    "/api/catalog": "http://localhost:3001",
    "/api/inventory": "http://localhost:3003",
    "/api/dashboard": "http://localhost:3004",
  },
  test: {
    "/api/home": "https://test.example.com/home",
    "/api/catalog": "https://test.example.com/catalog",
    "/api/inventory": "https://test.example.com/inventory",
    "/api/dashboard": "https://test.example.com/dashboard",
  },
  production: {
    "/api/home": "https://prod.example.com/home",
    "/api/catalog": "https://prod.example.com/catalog",
    "/api/inventory": "https://prod.example.com/inventory",
    "/api/dashboard": "https://prod.example.com/dashboard",
  },
};

const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  entry: "./src/main.jsx",
  mode: NODE_ENV,
  output: {
    publicPath: "auto",
    clean: true,
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 5173,
    historyApiFallback: true,
    proxy: Object.entries(proxyTargets[NODE_ENV]).map(([key, target]) => ({
      context: [key],
      target,
      changeOrigin: true,
      pathRewrite: { [`^${key}`]: "" },
    })),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { modules: true } },
          "sass-loader",
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "marketmesh_shell",
      remotes: {
        homeService: `homeService@${process.env.REACT_APP_HOME_SERVICE}`,
        catalogService: `catalogService@${process.env.REACT_APP_CATALOG_SERVICE}`,
        inventoryService: `inventoryService@${process.env.REACT_APP_INVENTORY_SERVICE}`,
        dashboardService: `dashboardService@${process.env.REACT_APP_DASHBOARD_SERVICE}`,
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.2.0" },
        "react-router-dom": { singleton: true },
      },
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
};
