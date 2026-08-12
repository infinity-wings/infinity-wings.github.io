'use strict';
const IW_SAVE_KEY='infinityWingsSaveV1';
const IW_SAVE_VERSION=1;
const IW_LEGACY_KEYS=['iwArchiveCoreLevelsV2','iwArchiveCoresV1','iwArchiveEnemiesV1','iwArchiveEnemyDefeatedV1','iwRunRecordsV1','infinityWingsPilotIdV2'];
function iwDefaultSave(){return{version:IW_SAVE_VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),profile:{pilotId:1,totalRuns:0,selectedFighter:'infinity'},story:{currentChapter:1,chapterOneCompleted:false,chapterTwoUnlocked:false,riftUnlocked:false,wrecksFound:0,wrecks:[false,false,false,false],introSeen:false},progression:{highestThreat:0,cores:{},enemies:[],defeated:[],fighters:['infinity']},runCheckpoint:null,records:[]}}
function iwNormalizeSave(raw){const base=iwDefaultSave(),save=raw&&typeof raw==='object'?raw:{},fighters=Array.isArray(save.progression?.fighters)?save.progression.fighters.filter(id=>typeof id==='string'):base.progression.fighters;return{...base,...save,version:IW_SAVE_VERSION,profile:{...base.profile,...save.profile},story:{...base.story,...save.story,wrecks:Array.isArray(save.story?.wrecks)?save.story.wrecks.slice(0,4).map(Boolean):base.story.wrecks},progression:{...base.progression,...save.progression,cores:save.progression?.cores&&typeof save.progression.cores==='object'?save.progression.cores:{},enemies:Array.isArray(save.progression?.enemies)?save.progression.enemies:[],defeated:Array.isArray(save.progression?.defeated)?save.progression.defeated:[],fighters:[...new Set(['infinity',...fighters])]},records:Array.isArray(save.records)?save.records.slice(0,20):[]}}
const saveSystem={
 data:null,migrationPending:false,
 load(){try{const raw=localStorage.getItem(IW_SAVE_KEY);if(raw)this.data=iwNormalizeSave(JSON.parse(raw))}catch(error){console.warn('永久存档损坏，已创建安全的新存档',error)}if(!this.data){this.data=iwDefaultSave();this.migrationPending=IW_LEGACY_KEYS.some(key=>localStorage.getItem(key)!==null);if(!this.migrationPending)this.commit()}return this.data},
 commit(){this.data=iwNormalizeSave(this.data);this.data.updatedAt=new Date().toISOString();localStorage.setItem(IW_SAVE_KEY,JSON.stringify(this.data));return this.data},
 migrate(){const data=this.data||this.load();const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};const cores=parse('iwArchiveCoreLevelsV2',{});const legacyCores=parse('iwArchiveCoresV1',[]);for(const id of legacyCores)cores[id]=Math.max(1,Number(cores[id])||0);data.progression.cores=cores;data.progression.enemies=parse('iwArchiveEnemiesV1',[]);data.progression.defeated=parse('iwArchiveEnemyDefeatedV1',[]);data.records=parse('iwRunRecordsV1',[]).slice(0,20);data.profile.pilotId=Math.max(1,Number(localStorage.getItem('infinityWingsPilotIdV2'))||1);data.profile.totalRuns=Math.max(data.profile.totalRuns,data.records.length);this.migrationPending=false;return this.commit()},
 markIntroSeen(){this.data.story.introSeen=true;this.commit()},
 recordRun(record){this.data.profile.totalRuns++;this.data.progression.highestThreat=Math.max(this.data.progression.highestThreat,record.threatIndex||0);this.data.records=[record,...this.data.records].slice(0,20);this.commit()},
 saveCheckpoint(checkpoint){this.data.runCheckpoint={...checkpoint,savedAt:new Date().toISOString()};this.commit();return this.data.runCheckpoint},
 clearCheckpoint(){this.data.runCheckpoint=null;this.commit()},
 selectFighter(id){const fighters=this.data.progression.fighters||['infinity'];this.data.profile.selectedFighter=fighters.includes(id)?id:'infinity';this.commit();return this.data.profile.selectedFighter},
 unlockFighter(id){const allowed=['infinity','laser','drone','missile','thunder'];if(!allowed.includes(id))return false;const fighters=this.data.progression.fighters;if(fighters.includes(id))return false;fighters.push(id);this.commit();return true},
 unlockAllFighters(){this.data.progression.fighters=['infinity','laser','drone','missile','thunder'];return this.commit()},
 completeChapterOne(){if(this.data.story.chapterOneCompleted)return false;Object.assign(this.data.story,{chapterOneCompleted:true,chapterTwoUnlocked:true,currentChapter:2,wrecksFound:4,wrecks:[true,true,true,true]});this.data.progression.fighters=['infinity','laser','drone','missile','thunder'];this.commit();return true},
 export(){this.commit();return JSON.stringify(this.data,null,2)},
 import(text){const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object'||!parsed.story)throw new Error('无效的无限之翼存档');this.data=iwNormalizeSave(parsed);return this.commit()},
 clear(){localStorage.removeItem(IW_SAVE_KEY);this.data=iwDefaultSave();this.migrationPending=false;return this.commit()}
};
saveSystem.load();window.IWSave=saveSystem;
