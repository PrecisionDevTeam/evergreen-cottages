const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const ts=require("typescript");

function load(file, mocks, globals={}) {
  const compiled=ts.transpileModule(fs.readFileSync(file,"utf8"),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},
    reportDiagnostics:true,
  });
  assert.equal((compiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
  const module={exports:{}};
  vm.runInNewContext(compiled.outputText,{
    module,exports:module.exports,require(name){
      if(name in mocks)return mocks[name];
      throw Error("Unmocked dependency: "+name);
    },Buffer,console,setTimeout,clearTimeout,URLSearchParams,...globals
  },{filename:file});
  return module.exports;
}
const base=path.join(__dirname,"..");
const guards=load(path.join(base,"src/lib/extension-reservation.ts"),{});
function harness(source, failLookup=false){
  let sessions=[];
  const db={
    reservation:{findUnique:async()=>{if(failLookup)throw Error("db unavailable");return source;}},
    websitePropertyOverride:{findFirst:async()=>null},
    calendarDay:{findMany:async()=>[{date:new Date("2027-01-03"),is_available:1,price:100}]},
  };
  class Stripe{constructor(){this.checkout={sessions:{create:async p=>{sessions.push(p);return{url:"https://example.test/checkout"};}}};}}
  const secret="test-secret";
  const exp=Math.floor(Date.now()/1000)+3600;
  const signature=crypto.createHmac("sha256",secret).update("v2:1:7:same:"+exp).digest("hex");
  const token="v2.1.7.same."+exp+"."+signature;
  const api=load(path.join(base,"src/pages/api/extension-checkout.ts"),{
    next:{},stripe:Stripe,crypto,
    "../../lib/db":{prisma:db,getProperty:async()=>({id:3,name:"Test unit",hostaway_property_id:"hw3",base_price:100,images:[]})},
    "../../lib/api-security":{verifyOrigin:()=>true,rateLimit:()=>true},
    "../../lib/extension-reservation":guards,
  },{
    process:{env:{EXTENSION_SECRET:secret}},
    fetch:async()=>({ok:true,json:async()=>({discount_percent:5,unit_change_cleaning_fee:40})}),
  }).default;
  return {sessions,async request(overrides={}){
    let status=200,result;
    const res={status(s){status=s;return this;},json(r){result=r;return this;}};
    await api({method:"POST",body:{token,propertyId:3,checkIn:"2027-01-02",checkOut:"2027-01-03",guests:1,...overrides}},res);
    return{status,result};
  }};
}
const source={guest_id:7,property_id:3,check_out:new Date("2027-01-02"),status:"confirmed",guest:{first_name:"Pat",last_name:"Guest",primary_email:"pat@example.test"},property:{id:3}};
test("same-unit extension starts at current checkout and creates one new checkout",async()=>{
  const h=harness(source),r=await h.request();
  assert.equal(r.status,200);
  assert.equal(h.sessions.length,1);
  assert.equal(h.sessions[0].metadata.checkIn,"2027-01-02");
  assert.equal(h.sessions[0].metadata.originalReservationId,"1");
  assert.equal(h.sessions[0].metadata.cleaningFee,"0");
});
for(const [label,value,request] of [
  ["missing original",null,{}],
  ["wrong guest",{...source,guest_id:8},{}],
  ["cancelled original",{...source,status:"cancelled"},{}],
  ["gap after original",source,{checkIn:"2027-01-03",checkOut:"2027-01-04"}],
  ["overlap original",source,{checkIn:"2027-01-01"}],
]){
  test(label+" cannot open payment",async()=>{
    const h=harness(value),r=await h.request(request);
    assert.equal(r.status,409);
    assert.equal(h.sessions.length,0);
  });
}
test("source lookup failure fails closed",async()=>{
  const h=harness(null,true),r=await h.request();
  assert.equal(r.status,503);
  assert.equal(h.sessions.length,0);
});
