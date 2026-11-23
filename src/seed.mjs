import D from './plan-domain.cjs';
import {hashPassword} from './security.mjs';
export function seed(s,password='Unistmo#2026'){
 if(s.users.length)return;
 const now=new Date().toISOString();
 s.universities.push({id:'uni',name:'Universidad del Istmo'});
 s.campuses.push({id:'teh',university_id:'uni',code:'TEH',name:'Tehuantepec',active:true},{id:'ixt',university_id:'uni',code:'IXT',name:'Ixtepec',active:true},{id:'juc',university_id:'uni',code:'JUC',name:'Juchitán',active:true});
 s.careers.push({id:'comp',campus_id:'teh',predecessor_id:null,code:'IC',name:'Ingeniería en Computación',active:true});
 s.teacher_categories.push({id:'prof',code:'PI',name:'Profesor investigador',level:'Asociado A',researcher:true,active:true});
 const roles=[['teacher','Docente'],['head','Jefe de carrera'],['vice','Vicerrectoría'],['admin','Administrador general']];
 for(const[id,name]of roles)s.roles.push({id,code:id,name,active:true});
 for(const resource of ['plan','report','catalog','users','reports'])for(const action of ['read','write','review'])s.permissions.push({id:resource+':'+action,resource,action});
 const grant={teacher:['plan:read','plan:write','report:read','report:write'],head:['plan:read','plan:review','report:read','report:review','reports:read'],vice:['reports:read'],admin:['catalog:read','catalog:write','users:read','users:write']};
 for(const[role,perms]of Object.entries(grant))for(const p of perms)s.role_permissions.push({id:role+'-'+p,role_id:role,permission_id:p});
 const people=[['209','Ana','Ramírez',['teacher']],['118','Luis','López',['teacher','head']],['100','Vicerrectoría','Académica',['vice']],['001','Administración','Institucional',['admin']],['000','Coordinación','SIGD',['teacher','head','vice','admin']],['301','Luis','Martínez',['teacher']],['302','Elena','Cruz',['teacher']],['303','Raúl','Santiago',['teacher']]];
 for(const [n,first,last,rs]of people){
  const id='u'+n;const email=({'209':'ana.ramirez','118':'luis.lopez','100':'vicerrectoria','001':'administracion','000':'coordinacion.sigd'})[n]||'docente'+n;
  s.users.push({id,auth_uid:null,employee_number:n,first_name:first,last_name:last,second_last_name:null,email:email+'@unistmo.example',active:true});
  s.credentials.push({id,user_id:id,password_hash:hashPassword(password),must_change:false});
  s.employee_history.push({id,user_id:id,employee_number:n,start:'2026-08-01',end:null});
  for(const role of rs)s.role_assignments.push({id:id+'-'+role,user_id:id,role_id:role,campus_id:['head','teacher'].includes(role)?'teh':null,career_id:role==='head'?'comp':null,start:'2026-01-01',end:null});
  if(rs.includes('teacher')){const tid=n==='118'?'demo-head-118':n==='000'?'demo-teacher-000':'demo-teacher-'+n;s.teachers.push({id:tid,user_id:id,category_id:'prof',joined_on:'2026-08-01'});s.affiliations.push({id:tid,teacher_id:tid,career_id:'comp',start:'2026-08-01',end:null})}
 }
 s.periods.push({id:'sem-2026-a',code:'2026-2027 A',start:'2026-08-10',end:'2026-12-15',effective_weeks:14,nominal_weekly_minutes:2400,maximum_weekly_minutes:2400,enforce_maximum:false,rejection_threshold:30,state:'open',catalog_id:'cat-1'});
 for(const kind of ['PLAN','REPORT'])s.capture_windows.push({id:kind,period_id:'sem-2026-a',kind,opens_at:'2026-08-01T00:00:00Z',closes_at:kind==='PLAN'?'2026-11-30T23:59:59Z':'2026-12-15T23:59:59Z',enabled:true});
 const cat=structuredClone(D.FX.v1);cat.source='Semilla sintética de desarrollo · validar con institución';cat.mandatory=false;
 cat.sections.forEach((r,i)=>{s.rubrics.push({id:r.id,code:r.id,name:r.label,axis:r.id==='investigacion'?'investigacion':'docencia',active:r.active});s.activities.push({id:r.id,code:r.id,name:r.label,active:true});s.activity_classifications.push({id:r.id,activity_id:r.id,rubric_id:r.id,start:'2026-08-01',end:null});
  r.fields.forEach((f,j)=>{s.field_definitions.push({id:r.id+'-'+f.id,activity_id:r.id,key:f.id,label:f.label,type:f.type,required:!!f.required,position:j,constraints:Object.fromEntries(Object.entries(f).filter(([k])=>!['id','label','type','required','options'].includes(k))),comparison_key:r.id+'.'+f.id});for(const [k,o]of (f.options||[]).entries())s.field_options.push({id:r.id+'-'+f.id+'-'+k,field_id:r.id+'-'+f.id,value:o.value,label:o.label,position:k})});
  s.rubric_configuration.push({id:'cfg-'+r.id,catalog_id:'cat-1',rubric_id:r.id,in_plan:true,in_report:true,required:r.requiredForSubmission,position:i});s.activity_configuration.push({id:'actcfg-'+r.id,configuration_id:'cfg-'+r.id,activity_id:r.id,calculation:r.calculation.kind,parameters:r.calculation,required:true,position:i});
 });
 s.catalog_versions.push({id:'cat-1',period_id:'sem-2026-a',version:1,published_at:now,published_by:'u001',content:cat});
 s.study_plans.push({id:'ic2024',career_id:'comp',created_by:'u001',name:'Plan demostrativo 2024',semesters:10,registered_at:now,active:true});
 for(const[i,n]of ['Ingeniería de Software I','Bases de Datos II','Redes de Computadoras'].entries()){
  const id='subject-'+i,gid='group-'+i;s.subjects.push({id,code:'DEMO-'+i,name:n,credits:6,active:true});s.curriculum_semesters.push({id:'curr-'+i,study_plan_id:'ic2024',number:4+i});s.curriculum_subjects.push({id,semester_id:'curr-'+i,subject_id:id});s.groups.push({id:gid,period_id:'sem-2026-a',campus_id:'teh',semester_id:'curr-'+i,code:String(404+i*100),kind:'regular',capacity:40});s.course_offerings.push({id,group_id:gid,subject_id:id});s.teaching_assignments.push({id,offering_id:id,teacher_id:'demo-teacher-209',previous_id:null,start:'2026-08-10',end:null,weekly_minutes:i===0?360:240,students:[28,22,25][i],change_reason:null});
 }
 s.evidence_types.push({id:'document',code:'DOC',name:'Evidencia documental',mime_types:['application/pdf','image/png','image/jpeg'],max_bytes:5*1024*1024});
 for(const[code,name,unit]of [['workload','Carga semanal','horas'],['completion','Cumplimiento','porcentaje'],['failure','Reprobación','porcentaje']])s.indicators.push({id:code,code,name,unit,handler:code,confidentiality:'scoped',active:true});
 s.system_settings.push({id:'main',revision:1,content:{demo:true,currentPeriodId:'sem-2026-a'}});
}
