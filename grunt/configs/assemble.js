/**
 * Configuration Assemble: Static site generator
 *
 * {@link} https://github.com/assemble/assemble
 */
module.exports = {

	options: {
		data: [
			'<%= paths.src %>/assemble/data/**/*.{json,yml}',
			'<%= paths.src %>/components/**/*.{json,yml}',
			],
		helpers: ['handlebars-helper-partial', '<%= paths.src %>/assemble/helpers/**/*.js'],
		layoutdir: '<%= paths.src %>/assemble/layouts/',
		partials: [
			'<%= paths.src %>/assemble/partials/**/*.hbs',
			'<%= paths.src %>/components/**/*.hbs',
			'!<%= paths.src %>/components/**/*_page.hbs'
		],
		plugins: ['assemble-middleware-kssnode']
	},
	dev: {
		options: {
			production: false
		},
		files: [
			{
				cwd: '<%= paths.src %>/components/',
				dest: '<%= paths.dev %>/',
				expand: true,
				flatten: true,
				src: ['**/*_page.hbs']
			},
			{
				cwd: '<%= paths.src %>/assemble/pages/',
				dest: '<%= paths.dev %>/',
				expand: true,
				flatten: true,
				src: ['**/*.hbs']
			},
		]
	},
	dist: {
		options: {
			production: true
		},
		files: [
			{
				cwd: '<%= paths.src %>/components/',
				dest: '<%= paths.dev %>/components/',
				expand: true,
				flatten: true,
				src: ['**/*_page.hbs']
			},
			{
				cwd: '<%= paths.src %>/assemble/pages/',
				dest: '<%= paths.dist %>/',
				expand: true,
				flatten: true,
				src: ['**/*.hbs']
			},
		]
	}

};
