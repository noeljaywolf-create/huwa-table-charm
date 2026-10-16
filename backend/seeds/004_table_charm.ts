import type {Knex} from 'knex';import {v4 as uuid} from 'uuid';import catalog from '../catalog/table-charm.json';
export async function seed(knex:Knex):Promise<void>{
 for(const item of catalog){
 let category=await knex('categories').where({slug:item.category}).first();if(!category){category={id:uuid(),slug:item.category,title:({dinnerware:'Dinnerware',drinkware:'Glassware',cookware:'Cookware',appliances:'Kettles & Toasters',storage:'Kitchen Storage',serveware:'Serveware',flatware:'Cutlery',utensils:'Kitchen Tools'} as any)[item.category]};await knex('categories').insert(category)}
  let p=await knex('products').where({slug:item.slug}).first();const imgs=JSON.stringify([item.image,...((item as any).lifestyleImages||[]).map((l:any)=>l.src)].filter((v,i,a)=>a.indexOf(v)===i));if(p){await knex('products').where({id:p.id}).update({images:imgs});continue;}
 const id=uuid();await knex('products').insert({id,slug:item.slug,title:item.title,type:item.type,category_id:category.id,description:item.description,material:item.collection==='Crystalite'?'glass':item.collection==='Stainless Steel'?'stainless_steel':'',features:JSON.stringify({requires_quote:true}),images:imgs,tags:JSON.stringify(['table-charm',item.collection,'price-on-request']),published:true});
 await knex('variants').insert({id:uuid(),product_id:id,sku:item.sku,title:item.title,options:JSON.stringify({collection:item.collection}),price_cents:0,stock:0,lead_time_days:0,weight_kg:0,width_cm:0,height_cm:0,depth_cm:0,fulfilment_mode:'stocked',is_engravable:false,image:item.image});
 }
}
