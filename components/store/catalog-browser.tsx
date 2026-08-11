"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCatalogBrands, useCatalogProducts } from "@/lib/hooks/use-catalog";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type { CatalogListFilters } from "@/lib/types/catalog";

export function CatalogBrowser() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [brand, setBrand] = useState("");
  const [sortBy, setSortBy] =
    useState<CatalogListFilters["sort_by"]>("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [inStock, setInStock] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<CatalogListFilters>(
    () => ({
      search: deferredSearch || undefined,
      brand: brand || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      in_stock: inStock ? true : undefined,
      featured: featuredOnly ? true : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      page,
      per_page: 12,
    }),
    [
      deferredSearch,
      brand,
      sortBy,
      sortDir,
      inStock,
      featuredOnly,
      minPrice,
      maxPrice,
      page,
    ],
  );

  const brands = useCatalogBrands();
  const catalog = useCatalogProducts(filters);
  const totalPages = Math.max(
    1,
    Math.ceil((catalog.data?.total ?? 0) / (filters.per_page || 12)),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Name, brand, model…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          label="Brand"
          value={brand}
          onChange={(e) => {
            setPage(1);
            setBrand(e.target.value);
          }}
        >
          <option value="">All brands</option>
          {(brands.data || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by"
          value={sortBy}
          onChange={(e) => {
            setPage(1);
            setSortBy(e.target.value as CatalogListFilters["sort_by"]);
          }}
        >
          <option value="published_at">Newest</option>
          <option value="name">Name</option>
          <option value="min_price">Price</option>
          <option value="sale_count">Popular</option>
          <option value="is_featured">Featured</option>
        </Select>
        <Select
          label="Direction"
          value={sortDir}
          onChange={(e) => {
            setPage(1);
            setSortDir(e.target.value as "asc" | "desc");
          }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
        <Input
          label="Min price"
          type="number"
          min={0}
          step="0.01"
          value={minPrice}
          onChange={(e) => {
            setPage(1);
            setMinPrice(e.target.value);
          }}
        />
        <Input
          label="Max price"
          type="number"
          min={0}
          step="0.01"
          value={maxPrice}
          onChange={(e) => {
            setPage(1);
            setMaxPrice(e.target.value);
          }}
        />
        <label className="flex items-end gap-2 pb-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setPage(1);
              setInStock(e.target.checked);
            }}
          />
          In stock only
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => {
              setPage(1);
              setFeaturedOnly(e.target.checked);
            }}
          />
          Featured only
        </label>
      </div>

      {catalog.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : catalog.isError ? (
        <Alert
          variant="error"
          title={formatApiError(catalog.error).message}
          items={formatApiError(catalog.error).errors}
        />
      ) : !catalog.data?.items.length ? (
        <p className="py-12 text-center text-muted">
          No products match these filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {catalog.data.items.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <p>
              {catalog.data.total} product
              {catalog.data.total === 1 ? "" : "s"} · page {page} of{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
