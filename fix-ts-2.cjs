const fs = require('fs');
const path = require('path');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

// Fix implicitly any parameters
customerCode = customerCode.replace(/\(b\s*=>/g, '(b: any =>');
customerCode = customerCode.replace(/\(t\s*=>/g, '(t: any =>');
customerCode = customerCode.replace(/\b(t|b)\s*=>/g, '($1: any) =>');
// Fix SupportTicket message sender
customerCode = customerCode.replace(/sender:\s*'admin'/g, "sender_role: 'admin'");
// Fix email duplicate line 503
customerCode = customerCode.replace(/email: '[^']*',\s*email: '/g, "email: '");
// Fix .text to .content in support ticket
customerCode = customerCode.replace(/msg\.text/g, "msg.content");
// Fix "user" string comparison for sender_role
customerCode = customerCode.replace(/==="user"/g, "==='traveler'");
customerCode = customerCode.replace(/=== 'user'/g, "=== 'traveler'");
customerCode = customerCode.replace(/!== 'user'/g, "!== 'traveler'");

fs.writeFileSync(customerDashPath, customerCode);

const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

// Fix implicitly any parameters
guideCode = guideCode.replace(/\(t\s*=>/g, '(t: any =>');
guideCode = guideCode.replace(/\(b\s*=>/g, '(b: any =>');
guideCode = guideCode.replace(/\(p\s*=>/g, '(p: any =>');
guideCode = guideCode.replace(/\b(t|b|p|_|i)\s*=>/g, '($1: any) =>');
// Fix new Date without parenthesis that might have been missed
guideCode = guideCode.replace(/new Date\(\)\(/g, 'new Date()');
guideCode = guideCode.replace(/new Date \(/g, 'new Date()(');

fs.writeFileSync(guideDashPath, guideCode);
console.log('TypeScript fixes applied round 2.');
