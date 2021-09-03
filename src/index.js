const child_process = require('child_process');
const path = require('path');

const nodeExecSync = child_process.execSync;

const bin = path.resolve(
  './node_modules/.bin/whistle'
);
const port = 8899;
const rule = path.resolve( './src/proxy.rule.js');

// 启动方式1， 16行代码 start 命令无法执行完成，导致后续代码不执行，也无法设置代理规则
function start() {
  console.log(`Starting the proxy server.....`);

  execSync(`${bin} start  --port=${port}`);
  execSync(`${bin} use ${rule} --force`);

  console.log(`Proxy Server start on localhost:${port}\n`);
}


// 启动方式2， 35 行代码执行时，whistle use 命令内部只根据 config.pid 判断 whistle 是否处于运行态，
// 而此时只设置了 config._pid，并没有设置 config.pid，导致代理规则没有被正确设置
function start2() {
  console.log(`Starting the proxy server.....`);

  process.argv[2] = 'start';
  process.argv[3] = `--port=${port}`;
  require('whistle/bin/whistle');

  process.argv[2] = 'use';
  process.argv[3] = rule;
  process.argv[4] = `--force`;
  require('whistle/bin/whistle');

  // 换成下面的写法也存在同样的问题：whistle 是否处于运行态判断错误
  // execSync(`${bin} use ${rule} --force`);

  console.log(`Proxy Server start on localhost:${port}\n`);
}


function close() {
  execSync(`${bin} stop`);
  console.log(`Proxy Server has closed`);
}

function execSync(cmd) {
  let stdout;
  let status = 0;
  try {
    stdout = nodeExecSync(cmd);
  } catch (err) {
    stdout = err.stdout;
    status = err.status;
  }
  return {
    stdout: stdout.toString(),
    status,
  };
}

// 启动方式 1 测试
start();

// 启动方式 2 测试
// start2();

process.stdin.setEncoding('utf8')
process.stdin.resume();

// 命令行输入：stop，关闭代理
process.stdin.on('data', function (data) {
  if(data.replace(/[\r\n]/, '') === 'stop'){
    close();
    process.exit(0);
  }
});
