"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  search: string;
  placeholder?: string;
  className?: string;
};

const Search = ({ search, placeholder, className }: Props) => {
  const [keyword, setKeyword] = useState<string>(search || "");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      if (keyword.trim()) {
        params.set("search", keyword.trim());
      } else {
        params.delete("search");
      }

      // Reset to page 1 when searching
      params.delete("page");
      
      router.push(`?${params.toString()}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    
    // If input is cleared, immediately update URL
    if (!value.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      params.delete("page");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="w-full">
      <input
        id="keyword"
        type="text"
        value={keyword}
        onChange={handleInputChange}
        placeholder={placeholder || "Keyword Of Search"}
        onKeyUp={handleSearch}
        className={className || "w-full border border-accent-foreground"}
      />
    </div>
  );
};

export default Search;
