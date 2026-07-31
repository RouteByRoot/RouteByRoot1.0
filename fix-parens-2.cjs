const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

customerCode = customerCode.replace(/\.map\(b: any\) =>/g, '.map((b: any) =>');
customerCode = customerCode.replace(/\.filter\(b: any\) =>/g, '.filter((b: any) =>');
customerCode = customerCode.replace(/\.map\(t: any\) =>/g, '.map((t: any) =>');
customerCode = customerCode.replace(/\.filter\(t: any\) =>/g, '.filter((t: any) =>');
customerCode = customerCode.replace(/\.map\(p: any\) =>/g, '.map((p: any) =>');
customerCode = customerCode.replace(/\.filter\(p: any\) =>/g, '.filter((p: any) =>');
customerCode = customerCode.replace(/find\(b: any\) =>/g, 'find((b: any) =>');
customerCode = customerCode.replace(/find\(t: any\) =>/g, 'find((t: any) =>');
customerCode = customerCode.replace(/\(b: any\) =>/g, '((b: any) =>'); // wait this is dangerous

// Instead of regex, let's fix the exact known missing parens for map/filter/find/findIndex/sort/some/every
const arrayMethods = ['map', 'filter', 'find', 'findIndex', 'sort', 'some', 'every'];
arrayMethods.forEach(method => {
    ['b', 't', 'p', '_', 'i'].forEach(varName => {
        customerCode = customerCode.replace(new RegExp(`\\.${method}\\(${varName}: any\\) =>`, 'g'), `.${method}((${varName}: any) =>`);
    });
});

// There might also be `(prev: any) => prev.map(b: any) =>`
customerCode = customerCode.replace(/map\(b: any\) =>/g, 'map((b: any) =>');
customerCode = customerCode.replace(/map\(t: any\) =>/g, 'map((t: any) =>');

fs.writeFileSync(customerDashPath, customerCode);

const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

arrayMethods.forEach(method => {
    ['b', 't', 'p', '_', 'i'].forEach(varName => {
        guideCode = guideCode.replace(new RegExp(`\\.${method}\\(${varName}: any\\) =>`, 'g'), `.${method}((${varName}: any) =>`);
    });
});

guideCode = guideCode.replace(/map\(b: any\) =>/g, 'map((b: any) =>');
guideCode = guideCode.replace(/map\(t: any\) =>/g, 'map((t: any) =>');
guideCode = guideCode.replace(/map\(p: any\) =>/g, 'map((p: any) =>');
guideCode = guideCode.replace(/map\(_: any\) =>/g, 'map((_: any) =>');
guideCode = guideCode.replace(/map\(i: any\) =>/g, 'map((i: any) =>');

fs.writeFileSync(guideDashPath, guideCode);
console.log('Fixed syntax parens.');
