const path = require('path');

module.exports = {
    entry : {
        register : './src/register.js'
    }, 
    output : {
        filename : '[name].bundle.js',
        path : path.resolve(__dirname, 'public', 'js')
    }, 
    mode : 'development',
    module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
      }
}