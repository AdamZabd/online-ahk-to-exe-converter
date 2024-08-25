var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var ahkexe = require('ahktoexe');

const { exec } = require("child_process");
var path = require('path');


const { finished } = require('stream');
const { promisify } = require('util');
const finishedAsync = promisify(finished);

http.createServer( function(req, res) {
	
	function sendFile(filePath, name){
		var stat = fs.statSync(filePath);
		console.log(filePath);
		
		res.setHeader('Content-Type', 'application/exe');
		res.setHeader('Content-length', stat.size);
		res.setHeader('Content-Disposition', 'attachment; filename=' + name);
		
		var readStream = fs.createReadStream(filePath);
		(async function run() {
			try {
				readStream.pipe(res);
				await finishedAsync(readStream);
				console.log("done?");
				fs.unlink(filePath, function(err) {
					if (err) throw err;
					console.log("Successfully deleted file");
				});
			}catch (err) {
				console.error(err);
			}
		})();
		
	}	
	
	if (req.url == '/fileupload') {
		
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			console.log(files);
			var filedata = files.filetoupload[0];
			
			var oldpath = filedata.filepath;
			var name = filedata.originalFilename.split(".")[0] + ".exe";
			var type = filedata.mimetype;
			
			var newpath = path.join(__dirname, name);
			
			if (type != "text/plain")
			{
				return res.end();
			}
			ahkexe(oldpath, newpath);
			
			(async function() {
			const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
			await sleep(5000);
			sendFile(newpath, name);
			})()
		});
		return;
	} else {
		
		if (req.url != "/"){
			res.end();
			return;
		}
		
		console.log("generate base");
		res.setHeader('Content-Type', 'text/html');
		res.write("<h2>AHK to EXE Converter</h2>");
		res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
		res.write('<input type="file" name="filetoupload"><br>');
		res.write('<input type="submit">');
		res.write('</form>');
		return res.end();
	}
})
.listen(80);

