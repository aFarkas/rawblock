/**
 * Configuration Assemble: Static site generator
 *
 * {@link} https://github.com/assemble/assemble
 */
module.exports = {

	options: {
		data: [
			'<%= paths.src %>/templates/data/**/*.{json,yml}',
			'./src/components/**/*.{json,yml}',
			],
		helpers: ['handlebarsg-helper-partial', '<%= paths.src %>/templates/helpers/**/*.js'],
		layoutdir: '<%= paths.src %>/templates/layouts/',
		partials: [
			'<%= paths.src %>/templates/partials/**/*.hbs',
			'./src/components/**/*.hbs',
			'!./src/components/**/*_page.hbs',
		],
	},
	dev: {
		options: {
			production: false,
		},
		files: [
			{
				cwd: './src/components/',
				dest: '<%= paths.dev %>/',
				expand: true,
				flatten: true,
				src: ['**/*_page.hbs'],
			},
			{
				cwd: '<%= paths.src %>/templates/pages/',
				dest: '<%= paths.dev %>/',
				expand: true,
				flatten: true,
				src: ['**/*.hbs'],
			},
		],
	},
};
