/*
  drugs.ts
  Simple client to query public RxNorm (RxNav) REST API for medication search.

  Note: For production use and to combine with FDB matching, route these
  calls through a server-side proxy to normalize results and avoid CORS issues.
*/

export type DrugSearchResult = {
  rxcui?: string;
  name: string;
  synonyms?: string[];
};

export async function searchDrugsByName(name: string): Promise<DrugSearchResult[]> {
  if (!name) return [];
  const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Drug lookup failed');
  const data = await res.json();

  const items: DrugSearchResult[] = [];
  try {
    const drugGroup = data.drugGroup;
    if (drugGroup && drugGroup.conceptGroup) {
      for (const group of drugGroup.conceptGroup) {
        const concepts = group.concept || [];
        for (const c of concepts) {
          items.push({ rxcui: c.rxcui, name: c.name });
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  // dedupe by name
  const seen = new Set<string>();
  return items.filter(i => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  });
}

export default { searchDrugsByName };
