const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

// Fix map(((b: any) =>
customerCode = customerCode.replace(/\.map\(\(\(b: any\) =>/g, '.map((b: any) =>');
// Just to be sure, any method(((
customerCode = customerCode.replace(/\(\(\(b: any\) =>/g, '((b: any) =>');
customerCode = customerCode.replace(/\(\(\(t: any\) =>/g, '((t: any) =>');
customerCode = customerCode.replace(/\(\(\(p: any\) =>/g, '((p: any) =>');

fs.writeFileSync(customerDashPath, customerCode);

const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

// Fix setAddDetailsForm(p: any) =>
guideCode = guideCode.replace(/setAddDetailsForm\(p: any\) =>/g, 'setAddDetailsForm((p: any) =>');
// Any other similar issues where a state setter was missing the opening paren
guideCode = guideCode.replace(/set([A-Za-z]+)\(p: any\) =>/g, 'set$1((p: any) =>');
guideCode = guideCode.replace(/set([A-Za-z]+)\(b: any\) =>/g, 'set$1((b: any) =>');
guideCode = guideCode.replace(/set([A-Za-z]+)\(t: any\) =>/g, 'set$1((t: any) =>');
guideCode = guideCode.replace(/set([A-Za-z]+)\(_: any\) =>/g, 'set$1((_: any) =>');
guideCode = guideCode.replace(/set([A-Za-z]+)\(i: any\) =>/g, 'set$1((i: any) =>');

// Also fix the triple parens just in case
guideCode = guideCode.replace(/\(\(\(b: any\) =>/g, '((b: any) =>');
guideCode = guideCode.replace(/\(\(\(t: any\) =>/g, '((t: any) =>');
guideCode = guideCode.replace(/\(\(\(p: any\) =>/g, '((p: any) =>');

fs.writeFileSync(guideDashPath, guideCode);
console.log('Fixed vite build errors.');
