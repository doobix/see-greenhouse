const LOCAL_DOMAINS = ['localhost', '127.0.0.1', ''];

let DEFAULT_COMPANIES = [
  {name: 'github', showDept: true, showLoc: true},
  {name: 'reddit', showLoc: true, filterLocSF: true},
  {name: 'twitch', showDept: true, showLoc: false, sortAfter: true, filterLocCA: true},
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
  let jobTitle = `<b><a href="${job.absolute_url}">${job.title}</a></b>`;
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
    .filter((j) => options.filterLocCA ? j.location.name.includes('CA') : true)
    .filter((j) => options.filterLocSF ? j.location.name.includes('San Francisco') : true)
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
        <p class="panel-heading">${company.name} (${count} roles)</p>
        <div class="p-4">
          ${jobs}
        </div>
      </article>
    `;
  }
}

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
  }
}
