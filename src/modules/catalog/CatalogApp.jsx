// CatalogApp.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./catalog.module.scss";
import ProductCard from "./ProductCard";
import Shimmer from "../../utils/Shimmer";
import CatalogChips from "../../utils/CatalogChips";
import { MeshContext } from "../../store/MeshContext";
const LIMIT = 20;

const CatalogApp = () => {
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const { setCurrentTab } = useContext(MeshContext);

  useEffect(() => {
    setCurrentTab("catalog");
  }, [setCurrentTab]);

  const apiFetch = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await axios.get("https://dummyjson.com/products", {
      params: { limit: LIMIT, skip },
    });

    const newData = res.data?.products || [];
    setProducts((prev) => [...prev, ...newData]);
    setSkip((prev) => prev + newData.length);

    if (newData.length < LIMIT) setHasMore(false);
    setLoading(false);
  };

  useEffect(() => {
    apiFetch();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
      if (bottomReached) apiFetch();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore, loading]);

  const handleFilterChange = (chip) => {
    setSelectedFilter(chip);
  };

  return (
    <div className={styles.catalogContainer}>
      <CatalogChips
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      <div className={styles.productList}>
        {loading ? (
          <Shimmer/>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <div className={styles.footerState}>
        {loading && <Shimmer />}
        {!hasMore && <p>No more products</p>}
      </div>
    </div>
  );
};

export default CatalogApp;
