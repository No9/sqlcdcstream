var terminal = require('child_process').spawn('cmd');

terminal.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});

terminal.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});

terminal.on('exit', function (code) {
    console.log('child process exited with code ' + code);
});

setTimeout(function() {
	console.log('Sending stdin to terminal');
    terminal.stdin.write('osql -E -n-1 -i .\\sql\\installsqlcdc.sql -o install-database.log\n');
	terminal.stdin.end();
}, 1000);