let includeList = [
  'Engineer'
];

let excludeList = [
  'Manager',
  'Director',
  'Data',
  'Machine Learning',
  'Security',
  'Network',
  'Systems',
  'Principal',
  'Reliability',
  'Android',
  'iOS',
  'Staff',
  '3D',
  'Backend',
  'ML',
  'Infrastructure',
  'Support',
  'VP',
  'Technical',
  'CodeQL',
  'Salesforce'
];

function includeKeywords(job) {
  return includeList.every((word) => job.title.includes(word));
}

function excludeKeywords(job) {
  return excludeList.every((word) => !job.title.includes(word));
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

const getEngineerJobs = async (company, options) => {
  options = options || {};
  let res = await fetch(`https://api.greenhouse.io/v1/boards/${company}/jobs?content=true`);
  let data = await res.json();
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

const go = async () => {
  const companies = [
    {name: 'discord'},
    {name: 'github', showDept: true, showLoc: true},
    {name: 'reddit', showLoc: true, filterLocSF: true},
    {name: 'twitch', showDept: true, showLoc: false, sortAfter: true, filterLocCA: true},
  ];
  let isLoading = true;
  document.getElementById("results").innerHTML = `<div class="spinner-border" role="status"></div>`;
  
  for (let x=0; x < companies.length; x++) {
    const company = companies[x];
    let {name, ...options} = company;
    const [jobs, count] = await getEngineerJobs(name, options);

    if (isLoading) {
      isLoading = false;
      document.getElementById("results").innerHTML = '';
    }
    
    document.getElementById("results").innerHTML += `<div class="row p-1">`;
    document.getElementById("results").innerHTML += `<h4>${company.name} (${count} roles)</h4>`;
    document.getElementById("results").innerHTML += jobs;
    document.getElementById("results").innerHTML += `</div>`;
  }
}

go();