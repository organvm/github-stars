const fs = require('fs');
const yaml = require('js-yaml');

// Structural key migration (no yq dependency). This replaces the previous
// blanket line-regex approach, which could rename `updated_at`/`timestamp`
// anywhere they appeared regardless of nesting and silently corrupt unrelated
// fields. Renames are now scoped to their exact parent objects.

const filePath = 'repos.yml';
const data = yaml.load(fs.readFileSync(filePath, 'utf8')) || {};

// manifest_metadata.last_updated -> manifest_updated_at
if (data.manifest_metadata && data.manifest_metadata.last_updated !== undefined) {
  data.manifest_metadata.manifest_updated_at = data.manifest_metadata.last_updated;
  delete data.manifest_metadata.last_updated;
}

for (const repo of data.repositories || []) {
  // starred_at -> user_starred_at
  if (repo.starred_at !== undefined) {
    repo.user_starred_at = repo.starred_at;
    delete repo.starred_at;
  }

  // github_metadata.updated_at -> repo_pushed_at
  if (repo.github_metadata && repo.github_metadata.updated_at !== undefined) {
    repo.github_metadata.repo_pushed_at = repo.github_metadata.updated_at;
    delete repo.github_metadata.updated_at;
  }

  // ai_classification.timestamp -> classified_at
  if (repo.ai_classification && repo.ai_classification.timestamp !== undefined) {
    repo.ai_classification.classified_at = repo.ai_classification.timestamp;
    delete repo.ai_classification.timestamp;
  }
}

fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: -1, noRefs: true, sortKeys: false }));
console.log('Migration complete (structural key rename).');
