const fs = require('fs');
const path = require('path');

const customerDashPath = path.join(__dirname, 'src/pages/customer/CustomerDashboard.tsx');
let customerCode = fs.readFileSync(customerDashPath, 'utf8');

customerCode = customerCode.replace(/msg\.sender\b/g, 'msg.sender_role');
customerCode = customerCode.replace(/msg\.text\b/g, 'msg.content');
customerCode = customerCode.replace(/sender:\s*'guide'/g, "sender_role: 'guide'");
customerCode = customerCode.replace(/sender:\s*'user'/g, "sender_role: 'traveler'");
customerCode = customerCode.replace(/text:\s*/g, "content: ");

fs.writeFileSync(customerDashPath, customerCode);
console.log('CustomerDashboard fixed.');
