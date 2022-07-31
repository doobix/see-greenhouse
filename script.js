const getEngineerJobs = async (company, options) => {
  options = options || {};
  let res = await fetch(`https://api.greenhouse.io/v1/boards/${company}/jobs?content=true`);
  let data = await res.json();
  let filtered = data.jobs
    .filter((j) => j.title.includes('Engineer'))
    .filter((j) => !j.title.includes('Manager'))
    .filter((j) => !j.title.includes('Director'))
    .filter((j) => !j.title.includes('Data'))
    .filter((j) => !j.title.includes('Machine Learning'))
    .filter((j) => !j.title.includes('Security'))
    .filter((j) => !j.title.includes('Network'))
    .filter((j) => !j.title.includes('Systems'))
    .filter((j) => !j.title.includes('Principal'))
    .filter((j) => !j.title.includes('Reliability'))
    .filter((j) => !j.title.includes('Android'))
    .filter((j) => !j.title.includes('iOS'))
    .filter((j) => !j.title.includes('Staff'))
    .filter((j) => !j.title.includes('3D'))
    .filter((j) => !j.title.includes('Backend'))
    .filter((j) => !j.title.includes('ML'))
    .filter((j) => !j.title.includes('Infrastructure'))
    .filter((j) => !j.title.includes('Support'))
    .filter((j) => !j.title.includes('VP'))
    .filter((j) => !j.title.includes('Technical'))
    .filter((j) => !j.title.includes('CodeQL'))
    .filter((j) => !j.title.includes('Salesforce'))
    .filter((j) => options.filterLocCA ? j.location.name.includes('CA') : true)
    .filter((j) => options.filterLocSF ? j.location.name.includes('San Francisco') : true)
    .sort((a, b) => {
      if (options.sortAfter) {
        return 0;
      }
      
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
    
      if (aTitle < bTitle) {
        return -1;
      } else if (aTitle > bTitle) {
        return 1;
      } else {
        return 0;
      }
    })
    .map((j)=>{
      const dept = j.departments.length ? j.departments[0].name : '';
      const loc = j.location && j.location.name ? j.location.name : '';
      let jobTitle = `<b><a href="${j.absolute_url}">${j.title}</a></b>`;
      jobTitle = options.showDept && dept ? dept + ' - ' + jobTitle : jobTitle;
      jobTitle = options.showLoc && loc ? jobTitle + ' (' + loc + ')' : jobTitle;
      return jobTitle;
    });
  
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