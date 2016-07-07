var options ={
    year:   "2010", //for the index page, set the variables in index.md
    course: "BA Fine Art", // "MFA", "BA Fine Art", or "BA Fine Art & History of Art" these are checked in navheader template
    bp:__dirname
}


var Metalsmith = require('metalsmith'),
	markdown = require('metalsmith-markdown'),
	templates = require('metalsmith-templates'),
	Handlebars = require('handlebars'),
	goldcat = require('goldcat'),
	collections = require('metalsmith-collections'),
	permalinks = require('metalsmith-permalinks'),
	paths = require('metalsmith-paths'),
	fs = require('fs'),
    assets=require('metalsmith-assets'),
	colors= require('colors');

console.log("Degree Show Catalogue Build".red.underline);

console.log("Setting up templates...".yellow);
//setup for templates
Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/templates/partials/header.hbs').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/templates/partials/footer.hbs').toString());
Handlebars.registerPartial('navheader', fs.readFileSync(__dirname + '/templates/partials/navheader.hbs').toString());
Handlebars.registerPartial('pagenav', fs.readFileSync(__dirname + '/templates/partials/pagenav.hbs').toString());
Handlebars.registerPartial('slideshow-header', fs.readFileSync(__dirname + '/templates/partials/slideshow-header.hbs').toString());
Handlebars.registerPartial('video-header', fs.readFileSync(__dirname + '/templates/partials/video-header.hbs').toString());
Handlebars.registerPartial('video-footer', fs.readFileSync(__dirname + '/templates/partials/video-footer.hbs').toString());
Handlebars.registerHelper('paginate', require('handlebars-paginate'));
Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;
    
    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }
    
    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }
    
    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };
    
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }
    
    result = operators[operator](lvalue, rvalue);
    
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});
Handlebars.registerHelper('grouped_each', function(every, context, options) {
    var out = "", subcontext = [], i;
    if (context && context.length > 0) {
        for (i = 0; i < context.length; i++) {
            if (i > 0 && i % every === 0) {
                out += options.fn(subcontext);
                subcontext = [];
            }
            subcontext.push(context[i]);
        }
        out += options.fn(subcontext);
    }
    return out;
});


console.log("Starting metalsmith...".yellow);
//build everything

Metalsmith(__dirname)
	.use(paths())
	.use(goldcat.makePages(options))
	.use(markdown())
	.use(collections({
		students: {
			sortBy:"sort",
			reverse:false
			}
		}))
	.use(paths())
	.use(goldcat.studentDirectory())
	.use(goldcat.nextStudent())
	.use(templates('handlebars'))
    .destination('../../testbuild/bfa')
    .use(assets({
  source: '../assets', // relative to the working directory
  destination: '../assets' // relative to the build directory
    }))
    .build(function (err){
    	if(err) console.log(err)
    	else console.log("Done!".green.underline)
    })
