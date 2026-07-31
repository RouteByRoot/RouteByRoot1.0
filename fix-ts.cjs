const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

// Fix chatMessages
customerCode = customerCode.replace(/const \[chatMessages, setChatMessages\]/g, 'const [localChatMessages, setLocalChatMessages]');
customerCode = customerCode.replace(/setChatMessages\(/g, 'setLocalChatMessages(');
customerCode = customerCode.replace(/chatMessages\.map/g, 'localChatMessages.map');
customerCode = customerCode.replace(/chatMessages\.length/g, 'localChatMessages.length');

// Fix email duplicate (around line 503)
customerCode = customerCode.replace(/email:\s*'[^']*',\s*email:\s*'/g, "email: '");

// Fix prev => to (prev: any) =>
customerCode = customerCode.replace(/\bprev =>/g, '(prev: any) =>');

fs.writeFileSync(customerDashPath, customerCode);

const guideDashPath = path.join(__dirname, 'src/pages/guide/GuideDashboard.tsx');
let guideCode = fs.readFileSync(guideDashPath, 'utf8');

// Fix chatMessages
guideCode = guideCode.replace(/const \[chatMessages, setChatMessages\]/g, 'const [localChatMessages, setLocalChatMessages]');
guideCode = guideCode.replace(/setChatMessages\(/g, 'setLocalChatMessages(');
guideCode = guideCode.replace(/chatMessages\.map/g, 'localChatMessages.map');
guideCode = guideCode.replace(/chatMessages\.length/g, 'localChatMessages.length');

// Fix new expression lacking construct signature
guideCode = guideCode.replace(/new Date\s*\)/g, 'new Date())');
guideCode = guideCode.replace(/new Date\s*;/g, 'new Date();');
// more generic: new Date followed by something that is not a parenthesis
guideCode = guideCode.replace(/new Date([^\(\w])/g, 'new Date()$1');

// Fix title attribute on Lucide icons (it usually causes TS errors on Lucide react)
guideCode = guideCode.replace(/title="[^"]*"/g, ''); 

// Fix prev => to (prev: any) =>
guideCode = guideCode.replace(/\bprev =>/g, '(prev: any) =>');

fs.writeFileSync(guideDashPath, guideCode);
console.log('TypeScript fixes applied.');
