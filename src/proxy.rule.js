exports.name = 'custom proxy rule';
exports.rules = `/.*/ enable://intercept
https://www.baidu.com https://www.163.com
`;
