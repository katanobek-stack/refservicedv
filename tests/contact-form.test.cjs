const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup({name='',message='Рефрижератор не охлаждает',popup=null}={}) {
  const handlers={}; const inputHandlers={}; const opened=[];
  const status={hidden:true,children:[],replaceChildren(...nodes){this.children=nodes},append(node){this.children.push(node)}};
  const input={setCustomValidity(value){this.validity=value},addEventListener(type,fn){inputHandlers[type]=fn}};
  const form={dataset:{service:'Ремонт рефрижераторов'},reportValidity(){return true},addEventListener(type,fn){handlers[type]=fn},querySelector(sel){return sel==='.form-status'?status:input}};
  class FormData {get(key){return {name,message}[key]}}
  const document={querySelector(sel){return sel==='#leadForm'?form:null},createTextNode(text){return {textContent:text}},createElement(){return {}}};
  const window={location:{pathname:'/refrigerator-repair.html'},open(...args){opened.push(args);return popup}};
  vm.runInNewContext(fs.readFileSync('script.js','utf8'),{document,window,FormData});
  return {submit:()=>handlers.submit({preventDefault(){}}),opened,status,input,inputHandlers};
}
test('blocked popup keeps a persistent actionable link and never claims delivery',()=>{
 const s=setup();s.submit();assert.equal(s.opened.length,1);assert.equal(s.status.hidden,false);
 const link=s.status.children[1];assert.equal(new URL(link.href).hostname,'wa.me');
 assert.match(new URL(link.href).searchParams.get('text'),/Ремонт рефрижераторов/);
 assert.match(new URL(link.href).searchParams.get('text'),/refrigerator-repair.html/);
 assert.match(s.status.children[0].textContent,/ещё не отправлено/);
});
test('name and message remain plain data rather than executable HTML',()=>{
 const s=setup({name:'<script>alert(1)</script>',message:'Тест & + ? #'});s.submit();
 const text=new URL(s.opened[0][0]).searchParams.get('text');assert.match(text,/<script>/);assert.match(text,/Тест & \+ \? #/);
 assert.equal(s.status.children[1].href,s.opened[0][0]);
});
test('whitespace-only message opens no window and sets a validation message',()=>{
 const s=setup({message:'   '});s.submit();assert.equal(s.opened.length,0);assert.ok(s.input.validity);
 s.inputHandlers.input({target:s.input});assert.equal(s.input.validity,'');
});
