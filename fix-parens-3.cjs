const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

customerCode = customerCode.replace(/= \(\(b: any\) =>/g, '= (b: any) =>');
customerCode = customerCode.replace(/= \(\(t: any\) =>/g, '= (t: any) =>');
customerCode = customerCode.replace(/= \(\(p: any\) =>/g, '= (p: any) =>');
customerCode = customerCode.replace(/= \(\(_: any\) =>/g, '= (_: any) =>');
customerCode = customerCode.replace(/= \(\(i: any\) =>/g, '= (i: any) =>');

// Also fix some specific cases where I might have messed up tags or parens
// like <main> tag in GuideDashboard
const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

guideCode = guideCode.replace(/= \(\(b: any\) =>/g, '= (b: any) =>');
guideCode = guideCode.replace(/= \(\(t: any\) =>/g, '= (t: any) =>');
guideCode = guideCode.replace(/= \(\(p: any\) =>/g, '= (p: any) =>');
guideCode = guideCode.replace(/= \(\(_: any\) =>/g, '= (_: any) =>');
guideCode = guideCode.replace(/= \(\(i: any\) =>/g, '= (i: any) =>');

// Restore the missing </main> tag in GuideDashboard
if (guideCode.indexOf('</main>') === -1 && guideCode.indexOf('<main') !== -1) {
    guideCode = guideCode.replace(/<style>\{`/g, '</main>\n      <style>{`');
}

fs.writeFileSync(customerDashPath, customerCode);
fs.writeFileSync(guideDashPath, guideCode);
console.log('Fixed syntax parens and main tag.');
