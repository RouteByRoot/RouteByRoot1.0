const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

customerCode = customerCode.replace(/\(b: any =>/g, '(b: any) =>');
customerCode = customerCode.replace(/\(t: any =>/g, '(t: any) =>');
customerCode = customerCode.replace(/\(p: any =>/g, '(p: any) =>');

fs.writeFileSync(customerDashPath, customerCode);

const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

guideCode = guideCode.replace(/\(b: any =>/g, '(b: any) =>');
guideCode = guideCode.replace(/\(t: any =>/g, '(t: any) =>');
guideCode = guideCode.replace(/\(p: any =>/g, '(p: any) =>');

fs.writeFileSync(guideDashPath, guideCode);
console.log('Fixed missing parenthesis.');
