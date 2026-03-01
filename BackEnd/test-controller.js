// quick verification logic outside of controller to ensure our parsing
// and order-handling code will trigger correctly when the model emits a
// human-readable "Calling Tool" string.

// reuse the parsing code from agent.controller.js
function extractToolCall(text) {
  let m;
  m = text.match(/Calling\s+tool:\s*`(\w+)\((.*)\)`/i);
  if (m) {
    try {
      return { name: m[1], args: JSON.parse(m[2]) };
    } catch (e) {}
  }
  m = text.match(/Calling\s+Tool:\s*`(\w+)`\s*with arguments:\s*`([^`]*)`/i);
  if (m) {
    try {
      const argText = m[2].replace(/'/g, '"');
      return { name: m[1], args: JSON.parse(argText) };
    } catch (e) {}
  }
  return null;
}

const fakeText = "Calling Tool: `orderMedicine` with arguments: `{'medicineName': 'paracetamol', 'quantity': 2}`";
const call = extractToolCall(fakeText);
console.log('parsed call:', call);
if (call && call.name === 'orderMedicine') {
  let { medicineName, quantity } = call.args;
  if (typeof quantity === 'string') {
    const num = parseInt(quantity, 10);
    if (!isNaN(num)) quantity = num;
  }
  console.log('would order', quantity, 'of', medicineName);
}