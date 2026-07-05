const fs = require('fs');
const code = fs.readFileSync('assets/js/solar-water-heater-configurator.js','utf8');
function count(re){return (code.match(re)||[]).length}
console.log('backticks', count(/`/g));
console.log('single', count(/'/g));
console.log('double', count(/"/g));
console.log('openParen', count(/\(/g));
console.log('closeParen', count(/\)/g));
console.log('openBrace', count(/{/g));
console.log('closeBrace', count(/}/g));
console.log('openBracket', count(/\[/g));
console.log('closeBracket', count(/\]/g));
