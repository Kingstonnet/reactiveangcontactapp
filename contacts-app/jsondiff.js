type DiffResult = {
  path: string;
  changeType: "added" | "removed" | "modified";
  oldValue?: any;
  newValue?: any;
};

function deepDiff(obj1: any, obj2: any, path = ''): DiffResult[] {
  const diffs: DiffResult[] = [];

  // identical primitive or reference
  if (obj1 === obj2) return diffs;

  // handle primitive or null changes
  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    diffs.push({
      path,
      changeType: "modified",
      oldValue: obj1,
      newValue: obj2
    });
    return diffs;
  }

  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    const newPath = path ? `${path}.${key}` : key;

    if (!(key in obj1)) {
      // Added
      diffs.push({
        path: newPath,
        changeType: "added",
        newValue: obj2[key]
      });
    } else if (!(key in obj2)) {
      // Removed
      diffs.push({
        path: newPath,
        changeType: "removed",
        oldValue: obj1[key]
      });
    } else {
      // Recurse
      const subDiffs = deepDiff(obj1[key], obj2[key], newPath);
      diffs.push(...subDiffs);
    }
  }

  return diffs;
}

const json1 = {
  id: 1,
  name: "John",
  address: { city: "New York", zip: 12345 },
  emails: [
    { type: "work", email: "john@work.com" },
    { type: "home", email: "john@home.com" }
  ]
};

const json2 = {
  id: 1,
  name: "John Smith",
  address: { city: "New York", zip: 54321 },
  emails: [
    { type: "work", email: "john@work.com" },
    { type: "home", email: "john@gmail.com" }
  ]
};

const differences = deepDiff(json1, json2);
console.log(differences);
