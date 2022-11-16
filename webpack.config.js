const fs = require('fs');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp =
  (relativePath) =>
  (relativeSubpath = '') =>
    path.resolve(appDirectory, relativePath, relativeSubpath);

module.exports = {
  entry: './src/index.tsx',

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: '[name].[chunkhash:6].js',
    chunkFilename: '[name].[chunkhash:6].js',
    publicPath: '/',
  },

  devServer: {
    hot: true,
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },

  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@styles': resolveApp('src/styles')(),
    },
    extensions: ['.js', '.ts', '.tsx'],
    symlinks: true,
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:6].css',
      ignoreOrder: true,
    }),
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      },
    }),
    new CompressionPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },

      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },

      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
    minimizer: [new UglifyJsPlugin()],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};
