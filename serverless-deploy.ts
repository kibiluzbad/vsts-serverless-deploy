/// <reference path="typings/index.d.ts" />
import tl = require('vsts-task-lib');
import path = require('path');

var workingDir = tl.getPathInput('workdir', true, false) || tl.getVariable('BUILD_REPOSITORY_LOCALPATH');
var sls = tl.which('sls', false);

tl.cd(workingDir);

tl.debug('check path : ' + sls);

if (!tl.exist(sls)) {
	tl.debug('not found global installed serverless, try to find serverless locally.');
	var gt = tl.tool(tl.which('node', true));
	var serverless = tl.getInput('serverless', true);
	serverless = path.resolve(workingDir, serverless);
	tl.debug('check path : ' + serverless);
	if (!tl.exist(serverless)) {
		tl.setResult(tl.TaskResult.Failed, tl.loc('ServerlessNotInstalled', serverless));
	}
}
else {
	var gt = tl.tool(sls);
}
process.env.STACK_NAME=tl.getVariable('STACK_NAME');
tl.debug('STACKNAME:' + process.env.STACK_NAME);
gt.arg('deploy');
gt.line(tl.getInput('arguments', false));

gt.exec().then(function (code) {
	tl.setResult(tl.TaskResult.Succeeded, tl.loc('ServerlessReturnCode', code));
	process.env.STACK_NAME='';
}).fail(function (err) {
	tl.debug('taskRunner fail');
	tl.setResult(tl.TaskResult.Failed, tl.loc('ServerlessFailed', err.message));
	process.env.STACK_NAME='';
})

