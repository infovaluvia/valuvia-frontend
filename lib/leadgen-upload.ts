// Client-side counterpart to valuvia-leadgen's scripts/push_leads_to_backend.py.
// Parses a leadgen *_clean.csv / master CSV in the browser and builds the
// same LeadCreate[] payload that script sends to POST /api/v1/leads/bulk --
// used by the admin "Upload Leads" page so an admin can push a batch
// without running Python locally, pasting the shared secret in for that
// one request instead of it living in a repo or env file anyone browses to.

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I

// Mirrors scripts/push_leads_to_backend.py's short_code() exactly: first 5
// bytes of SHA-256(county:apn) as a big-endian uint, base-32-ish encoded.
// Byte-for-byte identical output to the Python version for the same input,
// verified against known Python outputs during development.
export async function shortCode(county: string, apn: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${county}:${apn}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const digestBytes = new Uint8Array(digest)

  let n = 0
  for (let i = 0; i < 5; i++) {
    n = n * 256 + digestBytes[i]
  }

  let chars = ''
  for (let i = 0; i < 6; i++) {
    const rem = n % CODE_ALPHABET.length
    n = Math.floor(n / CODE_ALPHABET.length)
    chars += CODE_ALPHABET[rem]
  }
  return chars
}

// Minimal RFC4180-ish CSV parser: handles quoted fields (including escaped
// "" and embedded commas), does not handle embedded newlines inside a
// quoted field (this pipeline's own export never produces those, but a
// hand-edited file could -- such a file will misparse, not silently
// corrupt data, since row counts would visibly not match).
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (rows.length === 0) return []
  const header = rows[0]
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? ''
    })
    return obj
  })
}

function toCents(dollarString: string): number | null {
  if (!dollarString) return null
  const n = parseFloat(dollarString)
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

export interface LeadPayload {
  code: string
  situs_address: string
  apn: string | null
  county: string
  state: string
  owner_name: string | null
  owner_email: null
  owner_phone: null
  assessed_value_cents: number | null
  estimated_market_value_cents: number | null
  mail_batch: string | null
  lead_score: number | null
  lead_tier: string | null
  source_batch: string | null
  potential_appeal_gap_pct: number | null
}

export async function rowsToLeads(rows: Record<string, string>[]): Promise<LeadPayload[]> {
  return Promise.all(
    rows.map(async (row) => ({
      code: await shortCode(row.county, row.apn || row.property_address),
      situs_address: row.property_address,
      apn: row.apn || null,
      county: row.county,
      state: row.property_state || 'CA',
      owner_name: row.owner_full_name || null,
      owner_email: null,
      owner_phone: null,
      assessed_value_cents: toCents(row.current_assessed_value),
      estimated_market_value_cents: toCents(row.propstream_estimated_value),
      mail_batch: row.mail_batch || null,
      lead_score: row.lead_score ? parseInt(row.lead_score, 10) : null,
      lead_tier: row.lead_tier || null,
      source_batch: row.source_batch || null,
      potential_appeal_gap_pct: row.potential_appeal_gap_pct
        ? parseFloat(row.potential_appeal_gap_pct)
        : null,
    }))
  )
}
