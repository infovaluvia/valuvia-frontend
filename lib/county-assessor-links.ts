// Public property-search tools published by each county's own Assessor
// office, where a homeowner can look up their real, current assessed
// value directly from the source — this is offered as a helpful link,
// not scraped or proxied by us (each site has its own terms of use,
// and assessed values change too unpredictably to safely cache).
// Keyed the same way the backend normalizes county names
// (jurisdiction_lookup.county_to_slug): lowercased, "county" stripped,
// non-alphanumeric replaced with "-".
export const COUNTY_ASSESSOR_LINKS: Record<string, string> = {
  'santa-clara': 'https://www.sccassessor.org/online-services/property-search',
  alameda: 'https://www.acassessor.org/homeowners/assessed-value-look-up/',
  'san-mateo': 'https://smcacre.gov/assessor/property-tax-look',
  'contra-costa': 'https://www.contracosta.ca.gov/552/Maps-Property-Information',
  marin: 'https://apps.marincounty.gov/TaxRollSearch',
  'san-francisco': 'https://sfassessor.org',
  'los-angeles': 'https://portal.assessor.lacounty.gov/',
  'san-diego': 'https://www.sdarcc.gov/content/arcc/home/divisions/assessor/secured-assessment-roll-search.html',
  orange: 'https://assessedvalue.ocassessor.gov/',
  'san-bernardino': 'https://arc.sbcounty.gov/property-information/',
  sacramento: 'https://assessorprop8.saccounty.gov/',
  fresno: 'https://www.fresnocountyca.gov/Departments/Assessor/Value',
  kern: 'https://www.kerncounty.com/government/departments/assessor-recorder/property/assessor-property-search',
  ventura: 'https://assessor.venturacounty.gov/',
  clackamas: 'https://www.clackamas.us/cmap',
  lane: 'https://www.lanecountyor.gov/government/county_departments/assessment___taxation',
}

export function countyToSlug(county: string): string {
  return county
    .toLowerCase()
    .replace(/\bcounty\b/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
