const VERSIONS = ["441", "481", "501", "541"];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export class VersionAssets {
  constructor() {
    this.versionIdx = 0;
    this.manifest = [];
    this.basePrefix = "";
  }

  get version() {
    return VERSIONS[this.versionIdx];
  }

  async loadCurrentManifest() {
    const v = this.version;
    const candidates = [
      `../../max_pack_all_versions/by_version/v${v}/manifest.json`,
      `../max_pack_all_versions/by_version/v${v}/manifest.json`,
      `/max_pack_all_versions/by_version/v${v}/manifest.json`,
    ];

    let lastErr = null;
    for (const manifestUrl of candidates) {
      try {
        const data = await fetchJson(manifestUrl);
        this.manifest = data;
        this.basePrefix = manifestUrl.replace("/manifest.json", "");
        return data;
      } catch (err) {
        lastErr = err;
      }
    }

    throw lastErr ?? new Error("Failed to load version manifest");
  }

  nextVersion() {
    this.versionIdx = (this.versionIdx + 1) % VERSIONS.length;
  }

  prevVersion() {
    this.versionIdx = (this.versionIdx - 1 + VERSIONS.length) % VERSIONS.length;
  }

  getFirstRawImageUrl() {
    if (!this.manifest.length) return null;
    const raw = this.manifest[0].raw_file;
    return `${this.basePrefix}/raw/${raw}`;
  }
}
