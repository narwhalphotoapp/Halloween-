const SUPABASE_URL = 'https://kzxagywfykxukhqoghsn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BLILiKMU2-G3OI3n46EaGA_LGc5PqoW';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const cameraInput = document.getElementById('camera-input');
const photoWall = document.getElementById('photo-wall');
const openCameraBtn = document.getElementById('open-camera-btn');
const previewModal = document.getElementById('preview-modal');
const previewImg = document.getElementById('preview-img');
const captionInput = document.getElementById('modal-caption-input');
const retakeBtn = document.getElementById('retake-btn');
const confirmBtn = document.getElementById('confirm-upload-btn');
const rotations = [-5,-3,3,5,-2,2,-4,4];

let selectedFile = null;
let visitorId = localStorage.getItem('spooky_visitor_id');
if (!visitorId) {
  visitorId = 'spooky-' + crypto.randomUUID().slice(0,8);
  localStorage.setItem('spooky_visitor_id', visitorId);
}

function escapeHtml(value='') {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderPhoto(photo,index=0,prepend=false) {
  const card=document.createElement('article');
  card.className='polaroid';
  card.dataset.id=photo.id || '';
  card.style.transform=`rotate(${rotations[index % rotations.length]}deg)`;
  card.innerHTML=`<div class="image-container"><img loading="lazy" src="${escapeHtml(photo.image_url)}" alt="Spooky moment"></div><div class="caption-text">${escapeHtml(photo.caption || '')}</div>`;
  if(prepend) photoWall.prepend(card); else photoWall.appendChild(card);
}

async function loadPhotos(){
  const {data,error}=await supabaseClient.from('halloween_polaroids').select('*').order('created_at',{ascending:false});
  if(error){console.error(error); return;}
  photoWall.innerHTML='';
  (data||[]).forEach((photo,i)=>renderPhoto(photo,i));
}

cameraInput.addEventListener('change',e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  selectedFile=file;
  previewImg.src=URL.createObjectURL(file);
  captionInput.value='';
  previewModal.hidden=false;
});

retakeBtn.onclick=()=>{
  selectedFile=null;
  cameraInput.value='';
  previewModal.hidden=true;
};

confirmBtn.onclick=async()=>{
  if(!selectedFile)return;
  confirmBtn.disabled=true;
  confirmBtn.textContent='Posting...';
  try{
    const ext=(selectedFile.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error:uploadError}=await supabaseClient.storage.from('HalloweenPolaroids').upload(path,selectedFile,{contentType:selectedFile.type||'image/jpeg',upsert:false});
    if(uploadError)throw uploadError;
    const {data:urlData}=supabaseClient.storage.from('HalloweenPolaroids').getPublicUrl(path);
    const caption=captionInput.value.trim().slice(0,40);
    const {data,error:dbError}=await supabaseClient.from('halloween_polaroids').insert([{image_url:urlData.publicUrl,caption,visitor_id:visitorId}]).select().single();
    if(dbError)throw dbError;
    renderPhoto(data,0,true);
    previewModal.hidden=true;
    selectedFile=null;
    cameraInput.value='';
  }catch(error){
    console.error(error);
    alert('Sorry — that photo could not be posted. Please try again.');
  }finally{
    confirmBtn.disabled=false;
    confirmBtn.textContent='Post to Wall';
  }
};

supabaseClient.channel('halloween-polaroids')
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'halloween_polaroids'},payload=>{
    if(payload.new.visitor_id===visitorId)return;
    renderPhoto(payload.new,0,true);
  }).subscribe();

loadPhotos();
