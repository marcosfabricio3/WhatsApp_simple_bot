import * as baileys from 'baileys';
console.log('makeInMemoryStore' in baileys);
console.log(Object.keys(baileys).filter(k => k.toLowerCase().includes('store')));
