var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
const { exec } = require("child_process");
var path = require('path');

http.createServer( function(req, res) {
	
	function sendFile(filePath, name){
		var stat = fs.statSync(filePath);
		
		res.setHeader('Content-Type', 'application/exe');
		res.setHeader('Content-length', stat.size);
		res.setHeader('Content-Disposition', 'attachment; filename=' + name);
		
		var readStream = fs.createReadStream(filePath);
		readStream.pipe(res);
	}	
	
	if (req.url == '/fileupload') {
		
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			console.log(files);
			var filedata = files.filetoupload[0];
			var oldpath = filedata.filepath;
			var name = filedata.originalFilename.split(".")[0] + ".exe";
			var type = filedata.mimetype;
			var size = filedata.size;
			
			var newpath = path.join(__dirname, name);
			
			if (type != "text/plain")
			{
				return res.end();
			}
			exec('"Ahk2exe.exe" /base AutoHotkey64.exe /in ' + oldpath + ' /out ' + newpath, function(err, stdout, stderr){
				if (!err){
					console.log('Generated ' + name);
					sendFile(newpath, name);
				}else{
					console.log(err);
				}
			});
			
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
.listen(8080, '127.0.0.1');

