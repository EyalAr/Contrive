<html>
<head>
	<title>{{title}}</title>
	<link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
	<h1>{{title}}</h1>
	<div>
		{{date.day}}/{{date.month}}/{{date.year}}
	</div>
	{{#authors}}
	<div>
		{{name}} &lt;{{email}}&gt;
	</div>
	{{/authors}}
	<hr>
	<div>
		{{{_content}}}
	</div>
</body>
</html>