const LOCAL_DOMAINS = ['localhost', '127.0.0.1', ''];

let DEFAULT_COMPANIES = [
  {name: 'github', showDept: true, showLoc: true},
  {name: 'reddit', showLoc: true, filterLoc: 'Remote'},
  {name: 'twitch', showDept: true, showLoc: false, sortAfter: true, filterLoc: 'CA'},
  {name: 'discord'},
];

let DEFAULT_INCLUDE = [
  'engineer'
];

let DEFAULT_EXCLUDE = [
  'manager',
  'director',
  'data',
  'machine learning',
  'security',
  'network',
  'systems',
  'principal',
  'reliability',
  'android',
  'ios',
  'staff',
  '3d',
  'backend',
  'ml',
  'infrastructure',
  'support',
  'vp',
  'technical',
  'codeql',
  'salesforce'
];

let companyList = [];
let includeList = [];
let excludeList = [];

function getLocalStorageLists() {
  let includes = localStorage.getItem('include-list');
  let excludes = localStorage.getItem('exclude-list');
  includes = includes ? JSON.parse(includes) : null;
  excludes = excludes ? JSON.parse(excludes) : null;
  return [includes, excludes];
}

function setLocalStorageLists(list, keywords) {
  const stringified = JSON.stringify(keywords);
  localStorage.setItem(`${list}-list`, stringified);
}

function getLocalStorageCompanies() {
  let companies = localStorage.getItem('company-list');
  companies = companies ? JSON.parse(companies) : null;
  return companies;
}

function setLocalStorageCompanies(companies) {
  const stringified = JSON.stringify(companies);
  localStorage.setItem('company-list', stringified);
}

function resetLists() {
  setKeywords('include', DEFAULT_INCLUDE);
  setKeywords('exclude', DEFAULT_EXCLUDE);
}

function resetCompanies() {
  setCompanies(DEFAULT_COMPANIES);
  return DEFAULT_COMPANIES;
}

function clearCompanies() {
  setCompanies([]);
}

function clearLists() {
  setKeywords('include', []);
  setKeywords('exclude', []);
}

function getCompanies() {
  return companyList;
}

function setCompanies(companies) {
  setLocalStorageCompanies(companies)
  companyList = companies;
}

function getKeywords(list) {
  return list === 'include' ? includeList : excludeList;
}

function setKeywords(list, keywords) {
  setLocalStorageLists(list, keywords)
  if (list === 'include') {
    includeList = keywords;
  } else {
    excludeList = keywords;
  }
}

function includeKeywords(job) {
  return includeList.every((word) => job.title.toLowerCase().includes(word));
}

function excludeKeywords(job) {
  return excludeList.every((word) => !job.title.toLowerCase().includes(word));
}

function sortJobs(a, b) {
  const aTitle = a.title.toLowerCase();
  const bTitle = b.title.toLowerCase();

  if (aTitle < bTitle) {
    return -1;
  } else if (aTitle > bTitle) {
    return 1;
  } else {
    return 0;
  }
}

function createJobOutput(job, options) {
  const dept = job.departments.length ? job.departments[0].name : '';
  const loc = job.location && job.location.name ? job.location.name : '';
  let jobTitle = `<b><a href="${job.absolute_url}" target="_blank">${job.title}</a></b>`;
  jobTitle = options.showDept && dept ? dept + ' - ' + jobTitle : jobTitle;
  jobTitle = options.showLoc && loc ? jobTitle + ' (' + loc + ')' : jobTitle;
  return jobTitle;
}

const getJobs = async (company) => {
  if (LOCAL_DOMAINS.includes(window.location.hostname)) {
    const fakeRes = await fetch('./test-jobs.json');
    let fakeData = await fakeRes.json();
    return fakeData;
  }
  let res = await fetch(`https://api.greenhouse.io/v1/boards/${company}/jobs?content=true`);
  let data = await res.json();
  return data;
}

const adaptJobs = (data, options) => {
  options = options || {};
  let filtered = data.jobs
    .filter(includeKeywords)
    .filter(excludeKeywords)
    .filter((j) => options.filterLoc ? j.location.name.includes(options.filterLoc) : true)
    .sort(options.sortAfter ? () => {} : sortJobs)
    .map((j) => createJobOutput(j, options));
  
  if (options.sortAfter) {
    filtered.sort();
  }

  return [filtered.join('<br />'), filtered.length];
}

function clearKeywords() {
  document.getElementById("includes").innerHTML = '';
  document.getElementById("excludes").innerHTML = '';
}

function displayKeywords() {
  includeList.forEach((word) => {
    document.getElementById("includes").innerHTML += `<span class="tag m-1">${word} <button class="delete is-small" onclick="deleteKeyword('include', '${word}');go();"></button></span>`;
  });
  excludeList.forEach((word) => {
    document.getElementById("excludes").innerHTML += `<span class="tag m-1">${word} <button class="delete is-small" onclick="deleteKeyword('exclude', '${word}');go();"></button></span>`;
  });
}

function deleteKeyword(list, keyword) {
  let array = list === 'include' ? includeList : excludeList;
  const keywordIndex = array.indexOf(keyword);
  if (keywordIndex === -1) {
    return;
  }
  const firstHalf = array.slice(0, keywordIndex);
  const secondHalf = array.slice(keywordIndex + 1);
  setKeywords(list, firstHalf.concat(secondHalf))
}

function addKeyword(list) {
  const input = document.getElementById(`${list}-input`);
  const keyword = input.value.toLowerCase();
  const array = list === 'include' ? includeList : excludeList;
  if (!array.includes(keyword)) {
    setKeywords(list, array.concat(keyword));
  }
  input.value = '';
}

const go = async () => {
  let companies = getLocalStorageCompanies();
  if (!companies) {
    companies = resetCompanies();
  } else {
    setCompanies(companies);
  }

  const [includes, excludes] = getLocalStorageLists();
  if (!includes && !excludes) {
    resetLists();
  } else {
    setKeywords('include', includes);
    setKeywords('exclude', excludes);
  }

  clearKeywords();
  displayKeywords();

  let isLoading = true;
  document.getElementById("refresh").classList.add('is-loading');
  document.getElementById("results").innerHTML = ``;
  
  for (let x=0; x < companies.length; x++) {
    const company = companies[x];
    let {name, ...options} = company;
    const jobData = await getJobs(name);
    const [jobs, count] = adaptJobs(jobData, options);

    if (isLoading) {
      isLoading = false;
      document.getElementById("refresh").classList.remove('is-loading');
    }
    
    document.getElementById("results").innerHTML += `
      <article class="panel is-info">
        <div class="panel-heading">
          <div class="columns">
            <div class="column is-11">${company.name} (${count} roles)</div>
            <div class="column is-1 has-text-right">
              <button class="button is-small" data-target="edit-company" onclick="test(event, '${company.name}')">
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${jobs}
        </div>
      </article>
    `;
  }
}

function test(event, name) {
  const modal = event.currentTarget.dataset.target;
  const $target = document.getElementById(modal);
  openModal($target);
  document.getElementById("edit-company-name").innerHTML = `Edit ${name}`;
  let companies = getLocalStorageCompanies();
  if (companies) {
    companies.forEach((company) => {
      if (company.name === name) {
        document.getElementById('edit-company-show-dept').checked = company.showDept;
        document.getElementById('edit-company-sort-dept').checked = company.sortAfter;
        document.getElementById('edit-company-show-loc').checked = company.showLoc;
        document.getElementById('edit-company-filter-loc').value = company.filterLoc || '';
      }
    });
  }
}

// Functions to open and close a modal
function openModal($el) {
  $el.classList.add('is-active');
}

function closeModal($el) {
  $el.classList.remove('is-active');
}

function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModal($modal);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});

if (typeof module !== 'undefined') {
  module.exports = {
    includeList,
    excludeList,
    getKeywords,
    includeKeywords,
    excludeKeywords,
    sortJobs,
    clearKeywords,
    displayKeywords,
    deleteKeyword,
    addKeyword,
    resetLists,
    companyList,
    getCompanies,
    setCompanies,
    clearCompanies,
    resetCompanies,
  }
}
