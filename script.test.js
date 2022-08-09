/**
 * @jest-environment jsdom
 */

const script = require('./script');
const testJobs = require('./test-jobs');

test('resets both keyword lists', () => {
  expect(script.includeList.length).toBe(0);
  expect(script.excludeList.length).toBe(0);
  script.resetLists();
  const includeList = script.getKeywords('include');
  const excludeList = script.getKeywords('exclude');
  expect(includeList.length).toBe(1);
  expect(excludeList.length).toBe(21);
});

test('includes correct job keywords', () => {
  const includedJobs = testJobs.jobs.filter(script.includeKeywords);
  expect(includedJobs.length).toBe(18);
});

test('excludes correct job keywords', () => {
  const excludedJobs = testJobs.jobs.filter(script.excludeKeywords);
  expect(excludedJobs.length).toBe(20);
});

test('includes and excludes correct job keywords', () => {
  const filteredJobs = testJobs.jobs
    .filter(script.includeKeywords)
    .filter(script.excludeKeywords);
  expect(filteredJobs.length).toBe(9);
});

test('sorts job titles correctly', () => {
  const fakeJobs = [{title: 'zebra'}, {title: 'happy'}, {title: 'avocado'}, {title: 'toast'}];
  const expectedJobs = [{title: 'avocado'}, {title: 'happy'}, {title: 'toast'}, {title: 'zebra'}];
  const sortedJobs = fakeJobs.sort(script.sortJobs);
  expect(sortedJobs).toStrictEqual(expectedJobs);
});

test('clears keywords', () => {
  document.body.innerHTML = `
    <div id="includes">x</div>
    <div id="excludes">x</div>
  `;
  const includesElement = document.getElementById('includes');
  const excludesElement = document.getElementById('excludes');
  expect(includesElement.innerHTML).not.toBeNull();
  expect(excludesElement.innerHTML).not.toBeNull();
  script.clearKeywords();
  expect(includesElement.innerHTML).toBe('');
  expect(excludesElement.innerHTML).toBe('');
});

test('displays keywords', () => {
  document.body.innerHTML = `
    <div id="includes"></div>
    <div id="excludes"></div>
  `;
  const includesElement = document.getElementById('includes');
  const excludesElement = document.getElementById('excludes');
  expect(includesElement.innerHTML).toBe('');
  expect(excludesElement.innerHTML).toBe('');
  script.displayKeywords();
  const includeTags = includesElement.querySelectorAll('span');
  const excludeTags = excludesElement.querySelectorAll('span');
  expect(includeTags.length).toBe(1);
  expect(excludeTags.length).toBe(21);
});

test('does not delete keyword', () => {
  const beforeIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.includes('engineer')).toBe(true);
  script.deleteKeyword('include', 'eng');
  const afterIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.length).toEqual(afterIncludeList.length);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('happy')).toBe(false);
  script.deleteKeyword('exclude', 'happy');
  const afterExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.length).toEqual(afterExcludeList.length);
});

test('deletes keywords correctly', () => {
  const beforeIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.includes('engineer')).toBe(true);
  script.deleteKeyword('include', 'engineer');
  const afterIncludeList = script.getKeywords('include');
  expect(afterIncludeList.includes('engineer')).toBe(false);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('3d')).toBe(true);
  script.deleteKeyword('exclude', '3d');
  const afterExcludeList = script.getKeywords('exclude');
  expect(afterExcludeList.includes('3d')).toBe(false);
});

test('adds keywords correctly', () => {
  document.body.innerHTML = `
    <input id="include-input" value="engineer">
    <input id="exclude-input" value="3d" />
  `;

  const beforeIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.includes('engineer')).toBe(false);
  script.addKeyword('include');
  const afterIncludeList = script.getKeywords('include');
  expect(afterIncludeList.includes('engineer')).toBe(true);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('3d')).toBe(false);
  script.addKeyword('exclude');
  const afterExcludeList = script.getKeywords('exclude');
  expect(afterExcludeList.includes('3d')).toBe(true);
});

test('does not add duplicate keyword', () => {
  document.body.innerHTML = `
    <input id="include-input" value="engineer">
    <input id="exclude-input" value="3d" />
  `;

  const beforeIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.includes('engineer')).toBe(true);
  script.addKeyword('include', 'engineer');
  const afterIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.length).toEqual(afterIncludeList.length);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('3d')).toBe(true);
  script.addKeyword('exclude', '3d');
  const afterExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.length).toEqual(afterExcludeList.length);
});

test('resets company list', () => {
  let companyList = script.getCompanies();
  expect(companyList.length).toBe(0);
  script.resetCompanies();
  companyList = script.getCompanies();
  expect(companyList.length).toBe(4);
});

test('clears company list', () => {
  script.resetCompanies();
  let companyList = script.getCompanies();
  expect(companyList.length).toBe(4);
  script.clearCompanies();
  companyList = script.getCompanies();
  expect(companyList.length).toBe(0);
});

test('sets company list correctly', () => {
  script.resetCompanies();
  let companyList = script.getCompanies();
  expect(companyList.length).toBe(4);
  script.setCompanies([{name: 'test'}]);
  companyList = script.getCompanies();
  expect(companyList.length).toBe(1);
});
