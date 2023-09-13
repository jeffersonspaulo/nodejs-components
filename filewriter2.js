const Fs = require('fs');

exports.id = 'filewriter2';
exports.title = 'File Writer txt';
exports.color = '#656D78';
exports.icon = 'file-text-o';
exports.input = true;
exports.output = 1;
exports.version = '1.0.2';
exports.author = 'Jefferson Siqueira de Paulo';
exports.options = { filename: '', path: '' };

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="filename" data-jc-config="placeholder:@(Type a filename with extension, e.g. output);maxlength:100">@(Filename)</div>
	<div class="help m">@(The file will be stored in the public directory. Can be accessed via HTTP e.g. <code>https://domain/filename.txt</code>)</div>
	<div data-jc="textbox" data-jc-path="path" data-jc-config="placeholder:@(Type a path);maxlength:100">@(Path)</div>
</div>`;

exports.readme = `# File Writer

This component writes data into the file.`;

exports.install = function(instance) {

	var filename;
	var path;
	var delimiter = '';

	instance.on('data', function(response) {
		filename && instance.custom.write(response.data);
	});

	instance.custom.write = function(data) {
		try{
			let timestamp = Date.now();

			var absolutePath = instance.options.path.replace(/\\/g,'/');

			filename = instance.options.filename + timestamp + ".txt";

			path = absolutePath + '/' + filename;

			Fs.writeFile(path, data, function (err,result) {
				if (err) {
					instance.throw({ "error": err, "component": "File Writer txt"});
					return console.log(err);
				}
				console.log(result);
			});

			instance.send2(0, true);
		} catch (err) {
			let dateOb = new Date();

			instance.throw({ "error": err.message, "data": dateOb.toLocaleString(), "component": "File Writer txt"});
			instance.send2(0, false);
	   }
	};

	instance.custom.reconfigure = function() {
		try{
			let timestamp = Date.now();
			var absolutePath = instance.options.path.replace(/\\/g,'/');

			filename = instance.options.filename + timestamp + ".txt";

			path = absolutePath + '/' + filename;
			var directoryFile = F.path.root(path);

			filename = filename ? directoryFile : null;
			instance.status(filename ? instance.options.filename : 'Not configured', filename ? undefined : 'red');
			filename && Fs.mkdir(directoryFile, NOOP);
		} catch (err) {
			let dateOb = new Date();

			instance.throw({ "error": err.message, "data": dateOb.toLocaleString(), "component": "File Writer 2"});
	   }
	};

	instance.custom.reconfigure();
	instance.on('options', instance.custom.reconfigure);
};
