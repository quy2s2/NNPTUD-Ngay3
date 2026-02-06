const API = 'https://api.escuelajs.co/api/v1/products';

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortAsc = true;

// ================= LOAD DATA =================
async function loadData() {
  const res = await fetch(API);
  products = await res.json();
  filtered = [...products];
  render();
}

// ================= RENDER =================
function render() {
  let data = [...filtered];

  if (sortField) {
    data.sort((a, b) =>
      sortAsc
        ? a[sortField] > b[sortField] ? 1 : -1
        : a[sortField] < b[sortField] ? 1 : -1
    );
  }

  const start = (currentPage - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  pageData.forEach(p => {
    const tr = document.createElement('tr');
    tr.title = p.description;
    tr.onclick = () => openDetail(p);
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ''}</td>
      <td><img src="${p.images?.[0]}" class="img-thumb"/></td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(data.length);
}

// ================= PAGINATION =================
function renderPagination(total) {
  const pages = Math.ceil(total / pageSize);
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';

  for (let i = 1; i <= pages; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="gotoPage(${i})">${i}</button>
      </li>`;
  }
}

function gotoPage(p) {
  currentPage = p;
  render();
}

// ================= SORT =================
function sortBy(field) {
  if (sortField === field) sortAsc = !sortAsc;
  else {
    sortField = field;
    sortAsc = true;
  }
  render();
}

// ================= SEARCH =================
document.getElementById('searchInput').oninput = e => {
  const q = e.target.value.toLowerCase();
  filtered = products.filter(p =>
    p.title.toLowerCase().includes(q)
  );
  currentPage = 1;
  render();
};

// ================= PAGE SIZE =================
document.getElementById('pageSize').onchange = e => {
  pageSize = +e.target.value;
  currentPage = 1;
  render();
};

// ================= EXPORT CSV =================
document.getElementById('exportCsv').onclick = () => {
  let rows = [['ID', 'Title', 'Price', 'Category']];
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    rows.push([...tr.children].map(td => td.innerText));
  });

  const csv = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'products.csv';
  a.click();
};

// ================= DETAIL MODAL =================
function openDetail(p) {
  detailId.value = p.id;
  detailTitle.value = p.title;
  detailPrice.value = p.price;
  detailDesc.value = p.description;
  new bootstrap.Modal(detailModal).show();
}

// ================= UPDATE =================
async function updateProduct() {
  const id = detailId.value;
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: detailTitle.value,
      price: +detailPrice.value,
      description: detailDesc.value
    })
  });

  loadData();
  bootstrap.Modal.getInstance(detailModal).hide();
}

// ================= CREATE =================
async function createProduct() {
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: createTitle.value,
      price: +createPrice.value,
      description: createDesc.value,
      categoryId: +createCategory.value,
      images: [createImage.value]
    })
  });

  loadData();
  bootstrap.Modal.getInstance(createModal).hide();
}

loadData();
