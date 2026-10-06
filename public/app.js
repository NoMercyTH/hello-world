let currentLang = 'th';
let selectedCategory = null;
let allCategories = [];
let allItems = [];

const translations = {
  th: {
    navTitle: "คลังข้อมูลความรู้ (Knowledge Repository)",
    export: "ส่งออก",
    import: "นำเข้า",
    statsOverview: "สรุปภาพรวม",
    totalItems: "รายการทั้งหมด",
    totalCategories: "หมวดหมู่ทั้งหมด",
    categories: "หมวดหมู่",
    allCategories: "ทุกหมวดหมู่",
    add: "เพิ่ม",
    addItem: "เพิ่มรายการใหม่",
    editItem: "แก้ไขรายการ",
    addCategory: "เพิ่มหมวดหมู่",
    searchPlaceholder: "ค้นหาชื่อ รายละเอียด หรือเนื้อหา...",
    noItemsFound: "ไม่พบข้อมูลในระบบ",
    titleTh: "ชื่อรายการ (ภาษาไทย) *",
    titleEn: "Title (English) *",
    category: "หมวดหมู่",
    descTh: "คำอธิบายสั้น (ไทย)",
    descEn: "Short Description (EN)",
    contentTh: "เนื้อหา / ข้อมูลเชิงลึก (ไทย)",
    contentEn: "Detailed Content (EN)",
    catTh: "ชื่อหมวดหมู่ (ไทย) *",
    catEn: "Category Name (EN) *",
    tags: "แท็ก",
    cancel: "ยกเลิก",
    save: "บันทึก",
    close: "ปิด",
    content: "เนื้อหา / รายละเอียด",
    viewDetail: "ดูรายละเอียด",
    edit: "แก้ไข",
    delete: "ลบ",
    confirmDeleteCat: "คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?",
    confirmDeleteItem: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
    importSuccess: "นำเข้าข้อมูลเรียบร้อยแล้ว!",
    importFailed: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
  },
  en: {
    navTitle: "Knowledge Repository",
    export: "Export",
    import: "Import",
    statsOverview: "Overview",
    totalItems: "Total Items",
    totalCategories: "Total Categories",
    categories: "Categories",
    allCategories: "All Categories",
    add: "Add",
    addItem: "Add New Item",
    editItem: "Edit Item",
    addCategory: "Add Category",
    searchPlaceholder: "Search by title, description, or content...",
    noItemsFound: "No items found",
    titleTh: "Title (Thai) *",
    titleEn: "Title (English) *",
    category: "Category",
    descTh: "Short Description (TH)",
    descEn: "Short Description (EN)",
    contentTh: "Detailed Content (TH)",
    contentEn: "Detailed Content (EN)",
    catTh: "Category Name (TH) *",
    catEn: "Category Name (EN) *",
    tags: "Tags",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    content: "Content / Details",
    viewDetail: "View Details",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteCat: "Are you sure you want to delete this category?",
    confirmDeleteItem: "Are you sure you want to delete this item?",
    importSuccess: "Data imported successfully!",
    importFailed: "Failed to import data"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  fetchStats();
  fetchCategories();
  fetchItems();
});

function setLanguage(lang) {
  currentLang = lang;

  // Toggle button styles
  const thBtn = document.getElementById('lang-th-btn');
  const enBtn = document.getElementById('lang-en-btn');

  if (lang === 'th') {
    thBtn.className = "px-3 py-1 text-xs font-semibold rounded-l-lg border border-indigo-400 bg-indigo-900 text-white";
    enBtn.className = "px-3 py-1 text-xs font-semibold rounded-r-lg border border-indigo-400 bg-indigo-600 text-indigo-100 hover:bg-indigo-800";
  } else {
    thBtn.className = "px-3 py-1 text-xs font-semibold rounded-l-lg border border-indigo-400 bg-indigo-600 text-indigo-100 hover:bg-indigo-800";
    enBtn.className = "px-3 py-1 text-xs font-semibold rounded-r-lg border border-indigo-400 bg-indigo-900 text-white";
  }

  // Update text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Re-render UI
  renderCategories();
  renderItems();
}

async function fetchStats() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (data.success) {
      document.getElementById('stat-total-items').textContent = data.data.totalItems;
      document.getElementById('stat-total-categories').textContent = data.data.totalCategories;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      allCategories = data.data;
      renderCategories();
      populateCategoryDropdown();
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

function renderCategories() {
  const container = document.getElementById('categories-list');
  container.innerHTML = '';

  // "All Categories" option
  const allLi = document.createElement('li');
  allLi.className = `p-2 rounded-lg cursor-pointer flex justify-between items-center transition ${selectedCategory === null ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100 text-slate-600'}`;
  allLi.onclick = () => selectCategory(null);
  allLi.innerHTML = `<span><i class="fa-solid fa-layer-group mr-2"></i>${translations[currentLang].allCategories}</span>`;
  container.appendChild(allLi);

  allCategories.forEach(cat => {
    const name = currentLang === 'th' ? cat.name_th : cat.name_en;
    const li = document.createElement('li');
    li.className = `p-2 rounded-lg cursor-pointer flex justify-between items-center group transition ${selectedCategory === cat.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100 text-slate-600'}`;

    li.innerHTML = `
      <span onclick="selectCategory(${cat.id})" class="flex-1 truncate"><i class="fa-regular fa-folder mr-2"></i>${name}</span>
      <div class="hidden group-hover:flex items-center gap-1.5 text-xs">
        <button onclick="event.stopPropagation(); openCategoryModal(${cat.id})" class="text-slate-400 hover:text-indigo-600"><i class="fa-solid fa-pen"></i></button>
        <button onclick="event.stopPropagation(); deleteCategory(${cat.id})" class="text-slate-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(li);
  });
}

function populateCategoryDropdown() {
  const select = document.getElementById('item-category');
  select.innerHTML = `<option value="">-- ${translations[currentLang].category} --</option>`;
  allCategories.forEach(cat => {
    const name = currentLang === 'th' ? cat.name_th : cat.name_en;
    select.innerHTML += `<option value="${cat.id}">${name}</option>`;
  });
}

function selectCategory(catId) {
  selectedCategory = catId;
  renderCategories();
  fetchItems();
}

async function fetchItems() {
  try {
    let url = '/api/items?';
    if (selectedCategory) url += `category_id=${selectedCategory}&`;
    const searchVal = document.getElementById('search-input').value.trim();
    if (searchVal) url += `search=${encodeURIComponent(searchVal)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      allItems = data.data;
      renderItems();
    }
  } catch (err) {
    console.error('Error fetching items:', err);
  }
}

function renderItems() {
  const container = document.getElementById('items-container');
  const emptyState = document.getElementById('empty-state');
  container.innerHTML = '';

  if (allItems.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  allItems.forEach(item => {
    const title = currentLang === 'th' ? item.title_th : item.title_en;
    const desc = currentLang === 'th' ? item.description_th : item.description_en;
    const catName = currentLang === 'th' ? (item.category_name_th || 'ทั่วไป') : (item.category_name_en || 'General');

    const tagsArr = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2 gap-2">
          <span class="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">${catName}</span>
          <div class="flex items-center space-x-2 text-slate-400 text-xs">
            <button onclick="openItemModal(${item.id})" class="hover:text-indigo-600 p-1" title="${translations[currentLang].edit}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteItem(${item.id})" class="hover:text-red-600 p-1" title="${translations[currentLang].delete}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>

        <h3 class="font-bold text-slate-800 text-base mb-1 hover:text-indigo-600 cursor-pointer" onclick="viewItemDetail(${item.id})">${title}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 mb-3">${desc || '-'}</p>

        ${tagsArr.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-3">
            ${tagsArr.map(t => `<span class="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">#${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
        <span class="text-slate-400">${new Date(item.updated_at).toLocaleDateString(currentLang === 'th' ? 'th-TH' : 'en-US')}</span>
        <button onclick="viewItemDetail(${item.id})" class="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
          ${translations[currentLang].viewDetail} <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

let searchDebounce = null;
function handleSearch() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    fetchItems();
  }, 300);
}

// ITEM MODAL HANDLERS
function openItemModal(itemId = null) {
  const modal = document.getElementById('item-modal');
  const titleEl = document.getElementById('item-modal-title');
  const form = document.getElementById('item-form');
  form.reset();

  if (itemId) {
    titleEl.textContent = translations[currentLang].editItem;
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      document.getElementById('item-id').value = item.id;
      document.getElementById('item-title-th').value = item.title_th;
      document.getElementById('item-title-en').value = item.title_en;
      document.getElementById('item-category').value = item.category_id || '';
      document.getElementById('item-desc-th').value = item.description_th || '';
      document.getElementById('item-desc-en').value = item.description_en || '';
      document.getElementById('item-content-th').value = item.content_th || '';
      document.getElementById('item-content-en').value = item.content_en || '';
      document.getElementById('item-tags').value = item.tags || '';
    }
  } else {
    titleEl.textContent = translations[currentLang].addItem;
    document.getElementById('item-id').value = '';
    if (selectedCategory) {
      document.getElementById('item-category').value = selectedCategory;
    }
  }

  modal.classList.remove('hidden');
}

function closeItemModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

async function saveItem(e) {
  e.preventDefault();
  const id = document.getElementById('item-id').value;
  const payload = {
    title_th: document.getElementById('item-title-th').value,
    title_en: document.getElementById('item-title-en').value,
    category_id: document.getElementById('item-category').value || null,
    description_th: document.getElementById('item-desc-th').value,
    description_en: document.getElementById('item-desc-en').value,
    content_th: document.getElementById('item-content-th').value,
    content_en: document.getElementById('item-content-en').value,
    tags: document.getElementById('item-tags').value
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/items/${id}` : '/api/items';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeItemModal();
      fetchItems();
      fetchStats();
    }
  } catch (err) {
    console.error('Error saving item:', err);
  }
}

async function deleteItem(id) {
  if (!confirm(translations[currentLang].confirmDeleteItem)) return;
  try {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchItems();
      fetchStats();
    }
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}

// CATEGORY MODAL HANDLERS
function openCategoryModal(catId = null) {
  const modal = document.getElementById('category-modal');
  const titleEl = document.getElementById('category-modal-title');
  const form = document.getElementById('category-form');
  form.reset();

  if (catId) {
    titleEl.textContent = translations[currentLang].edit;
    const cat = allCategories.find(c => c.id === catId);
    if (cat) {
      document.getElementById('category-id').value = cat.id;
      document.getElementById('cat-name-th').value = cat.name_th;
      document.getElementById('cat-name-en').value = cat.name_en;
      document.getElementById('cat-desc-th').value = cat.description_th || '';
      document.getElementById('cat-desc-en').value = cat.description_en || '';
    }
  } else {
    titleEl.textContent = translations[currentLang].addCategory;
    document.getElementById('category-id').value = '';
  }

  modal.classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('category-id').value;
  const payload = {
    name_th: document.getElementById('cat-name-th').value,
    name_en: document.getElementById('cat-name-en').value,
    description_th: document.getElementById('cat-desc-th').value,
    description_en: document.getElementById('cat-desc-en').value
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/categories/${id}` : '/api/categories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeCategoryModal();
      fetchCategories();
      fetchStats();
    }
  } catch (err) {
    console.error('Error saving category:', err);
  }
}

async function deleteCategory(id) {
  if (!confirm(translations[currentLang].confirmDeleteCat)) return;
  try {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      if (selectedCategory === id) selectedCategory = null;
      fetchCategories();
      fetchItems();
      fetchStats();
    }
  } catch (err) {
    console.error('Error deleting category:', err);
  }
}

// VIEW ITEM DETAIL MODAL
function viewItemDetail(id) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  const modal = document.getElementById('view-modal');
  const catName = currentLang === 'th' ? (item.category_name_th || 'ทั่วไป') : (item.category_name_en || 'General');

  document.getElementById('view-category-badge').textContent = catName;
  document.getElementById('view-title').textContent = currentLang === 'th' ? item.title_th : item.title_en;
  document.getElementById('view-desc').textContent = (currentLang === 'th' ? item.description_th : item.description_en) || '-';
  document.getElementById('view-content').textContent = (currentLang === 'th' ? item.content_th : item.content_en) || '-';

  const tagsContainer = document.getElementById('view-tags');
  const tagsArr = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  tagsContainer.innerHTML = tagsArr.length > 0
    ? tagsArr.map(t => `<span class="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium">#${t}</span>`).join('')
    : '<span class="text-slate-400 text-xs">-</span>';

  document.getElementById('view-date').textContent = new Date(item.updated_at).toLocaleString(currentLang === 'th' ? 'th-TH' : 'en-US');

  modal.classList.remove('hidden');
}

function closeViewModal() {
  document.getElementById('view-modal').classList.add('hidden');
}

// EXPORT / IMPORT HANDLERS
function exportData() {
  window.location.href = '/api/data/export';
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const content = JSON.parse(e.target.result);
      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (data.success) {
        alert(translations[currentLang].importSuccess);
        fetchCategories();
        fetchItems();
        fetchStats();
      } else {
        alert(translations[currentLang].importFailed + ': ' + data.error);
      }
    } catch (err) {
      alert(translations[currentLang].importFailed);
    }
  };
  reader.readAsText(file);
}
