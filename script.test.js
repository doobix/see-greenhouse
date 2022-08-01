/**
 * @jest-environment jsdom
 */

const script = require('./script');
const testJobs = require('./test-jobs');

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  jest.restoreAllMocks();
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
  expect(beforeIncludeList.includes('engineer')).toStrictEqual(true);
  script.deleteKeyword('include', 'eng');
  const afterIncludeList = script.getKeywords('include');
  expect(afterIncludeList.includes('engineer')).toStrictEqual(true);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('happy')).toStrictEqual(false);
  script.deleteKeyword('exclude', 'happy');
  const afterExcludeList = script.getKeywords('exclude');
  expect(afterExcludeList.includes('happy')).toStrictEqual(false);
});

test('deletes keywords correctly', () => {
  const beforeIncludeList = script.getKeywords('include');
  expect(beforeIncludeList.includes('engineer')).toStrictEqual(true);
  script.deleteKeyword('include', 'engineer');
  const afterIncludeList = script.getKeywords('include');
  expect(afterIncludeList.includes('engineer')).toStrictEqual(false);

  const beforeExcludeList = script.getKeywords('exclude');
  expect(beforeExcludeList.includes('3d')).toStrictEqual(true);
  script.deleteKeyword('exclude', '3d');
  const afterExcludeList = script.getKeywords('exclude');
  expect(afterExcludeList.includes('3d')).toStrictEqual(false);
});
