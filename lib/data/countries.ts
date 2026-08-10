import raw from "@/lib/data/country.json";

export type CountryEntry = {
  code: string;
  country: string;
  dial_code: string;
};

type CountryMap = Record<string, { country: string; dial_code: string }>;

export const COUNTRIES: CountryEntry[] = Object.entries(raw as CountryMap)
  .map(([code, value]) => ({
    code,
    country: value.country,
    dial_code: value.dial_code,
  }))
  .sort((a, b) => a.country.localeCompare(b.country));
