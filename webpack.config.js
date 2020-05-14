const path = require('path');

module.exports = {
	entry: './src/index.tsx',
	mode: "production",
	devtool: 'source-map',
	module: {
	rules: [
		{
			test: /\.ts(x?)$/,
			use: 'ts-loader',
			exclude: /node_modules/,
		},
		{
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
		},
		{
		test: /\.(png|j?g|svg|gif)?$/,
		use: 'file-loader'
		},
	],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
	},
	externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	}
};