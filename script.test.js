const script = require('./script');
const testJobs = require('./test-jobs');

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