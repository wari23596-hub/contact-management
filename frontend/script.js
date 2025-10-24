/*  Contacts frontend script
    - Slide-in drawer for add/edit
    - Colorful pastel cards with avatar + actions at bottom
    - Toast notifications
    - View opens view.html?id=...
*/

const API = 'http://localhost:3000/contacts';

// DOM
const contactsEl = document.getElementById('contacts');
const searchInput = document.getElementById('searchInput');
const addBtn = document.getElementById('addBtn');

const drawer = document.getElementById('drawer');
const drawerTitle = document.getElementById('drawerTitle');
const closeDrawer = document.getElementById('closeDrawer');
const cancelDrawer = document.getElementById('cancelDrawer');
const drawerForm = document.getElementById('drawerForm');
const nameInp = document.getElementById('name');
const emailInp = document.getElementById('email');
const phoneInp = document.getElementById('phone');

const toast = document.getElementById('toast');

let editId = null;
let contactsCache = [];

/* Utility: show toast */
function showToast(msg){
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(()=> toast.style.display = 'none', 2500);
}

/* Drawer control */
function openDrawer(mode='add'){
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  if(mode === 'add'){
    drawerTitle.textContent = 'Add Contact';
    drawerForm.reset();
    editId = null;
  } else {
    drawerTitle.textContent = 'Edit Contact';
  }
}
function closeDrawerFn(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
}

/* add button */
addBtn.addEventListener('click', ()=> openDrawer('add'));
closeDrawer && closeDrawer.addEventListener('click', closeDrawerFn);
cancelDrawer && cancelDrawer.addEventListener('click', closeDrawerFn);

/* fetch contacts */
function fetchContacts(){
  fetch(API)
    .then(r => r.json())
    .then(data => {
      contactsCache = Array.isArray(data) ? data : [];
      renderContacts(contactsCache);
    })
    .catch(err => {
      console.error('fetch contacts', err);
      contactsEl.innerHTML = '<p class="muted">Unable to load contacts.</p>';
    });
}

/* random pastel variant chooser */
function variantFor(index){
  const v = (index % 4) + 1;
  return `variant-${v}`;
}

/* render */
function renderContacts(list){
  const q = (searchInput.value || '').toLowerCase();
  contactsEl.innerHTML = '';

  const filtered = list.filter(c => {
    const name = (c.name||'').toLowerCase();
    const email = (c.email||'').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if(filtered.length === 0){
    contactsEl.innerHTML = '<p class="muted">No contacts found.</p>';
    return;
  }

  filtered.forEach((c, idx) => {
    const card = document.createElement('article');
    card.className = `card ${variantFor(idx)}`;

    // avatar (default person icon). We can later show initials or image.
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = `<i class="fa-solid fa-user"></i>`;

    // body
    const body = document.createElement('div');
    body.className = 'card-body';

    const top = document.createElement('div');
    top.className = 'card-top';
    const nameEl = document.createElement('h3'); nameEl.textContent = c.name || '-';
    const emailEl = document.createElement('p'); emailEl.className = 'muted'; emailEl.textContent = c.email || '-';
    const phoneEl = document.createElement('p'); phoneEl.className = 'muted'; phoneEl.textContent = c.phone || '-';
    top.appendChild(nameEl);
    top.appendChild(emailEl);
    top.appendChild(phoneEl);

    // actions row at bottom of the card-body
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // view
    const vbtn = document.createElement('button');
    vbtn.className = 'icon-action icon-view';
    vbtn.title = 'View';
    vbtn.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    vbtn.addEventListener('click', ()=> window.location.href = `view.html?id=${c.id}`);

    // edit
    const ebtn = document.createElement('button');
    ebtn.className = 'icon-action icon-edit';
    ebtn.title = 'Edit';
    ebtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
    ebtn.addEventListener('click', ()=> {
      // populate drawer with contact data and open
      editId = c.id;
      drawerTitle.textContent = 'Edit Contact';
      nameInp.value = c.name || '';
      emailInp.value = c.email || '';
      phoneInp.value = c.phone || '';
      openDrawer('edit');
    });

    // delete
    const dbtn = document.createElement('button');
    dbtn.className = 'icon-action icon-delete';
    dbtn.title = 'Delete';
    dbtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    dbtn.addEventListener('click', ()=> {
      if(confirm(`Delete ${c.name || 'this contact'}?`)){
        fetch(`${API}/${c.id}`, { method:'DELETE' })
          .then(r => {
            if(!r.ok) throw new Error('delete failed');
            showToast('Contact deleted ✅');
            fetchContacts();
          })
          .catch(()=> showToast('Could not delete contact'));
      }
    });

    actions.appendChild(vbtn);
    actions.appendChild(ebtn);
    actions.appendChild(dbtn);

    body.appendChild(top);
    body.appendChild(actions);

    card.appendChild(avatar);
    card.appendChild(body);

    contactsEl.appendChild(card);
  });
}

/* live search */
searchInput.addEventListener('input', ()=> renderContacts(contactsCache));

/* handle drawer form submit */
drawerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const payload = {
    name: nameInp.value.trim(),
    email: emailInp.value.trim(),
    phone: phoneInp.value.trim()
  };

  if(!payload.name || !payload.email) {
    showToast('Please fill required fields');
    return;
  }

  if(editId){
    fetch(`${API}/${editId}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    .then(r => {
      if(!r.ok) throw new Error('update failed');
      closeDrawerFn();
      showToast('Contact updated ✅');
      fetchContacts();
    })
    .catch(()=> showToast('Unable to update contact'));
  } else {
    fetch(API, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    .then(r => {
      if(!r.ok) throw new Error('create failed');
      closeDrawerFn();
      showToast('Contact added ✅');
      fetchContacts();
    })
    .catch(()=> showToast('Unable to add contact'));
  }
});

/* initial load */
fetchContacts();
