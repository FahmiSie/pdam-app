"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams, useRouter } from "next/navigation" // ✅ fix import
import { useCallback } from "react"

type Props = {
  count: number
  perPage: number
  currentPage: number
}

export default function SimplePagination({ count, perPage, currentPage }: Props) {
  const totalPage = Math.ceil(count / perPage)
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPage

  const router = useRouter()
  const searchParams = useSearchParams()

  const changePage = useCallback(
    (page: number) => {
      const safePage = Math.min(Math.max(page, 1), totalPage)
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", safePage.toString())
      router.replace(`?${params.toString()}`) 
    },
    [router, searchParams, totalPage]
  )

  const generatePages = () => {
    const start = Math.max(currentPage - 2, 1)
    const end = Math.min(currentPage + 2, totalPage)
    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => !isFirstPage && changePage(currentPage - 1)}
            className={isFirstPage ? "pointer-events-none opacity-50" : "cursor-pointer"} // ✅ fix typo
          />
        </PaginationItem>

        {/* Halaman pertama + ellipsis kiri */}
        {currentPage > 3 && (
          <>
            <PaginationItem>
              <PaginationLink className="cursor-pointer" onClick={() => changePage(1)}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {/* Halaman tengah */}
        {generatePages().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              className="cursor-pointer"
              isActive={page === currentPage}
              onClick={() => changePage(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Ellipsis kanan + halaman terakhir */}
        {currentPage < totalPage - 2 && ( // ✅ fix: masuk ke dalam kondisi
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink className="cursor-pointer" onClick={() => changePage(totalPage)}>
                {totalPage}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => !isLastPage && changePage(currentPage + 1)}
            className={isLastPage ? "pointer-events-none opacity-50" : "cursor-pointer"} // ✅ fix typo
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}