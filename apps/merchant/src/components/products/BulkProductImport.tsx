'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Download, Upload } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@bharatmart/ui'
import { PRODUCT_BULK_MAX_ROWS, type ProductBulkInput } from '@bharatmart/validation'
import { bulkCreateProductsAction } from '@/app/(dashboard)/products/actions'

type CategoryOption = { id: string; name: string; slug: string }

const TEMPLATE_HEADERS = [
  'name',
  'slug',
  'description',
  'categorySlug',
  'pricePounds',
  'stockQuantity',
  'sku',
  'imageUrl',
  'status',
] as const

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      row.push(current.trim())
      current = ''
      continue
    }
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current.trim())
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      current = ''
      continue
    }
    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim())
    if (row.some((cell) => cell.length > 0)) rows.push(row)
  }

  return rows
}

function rowsToBulkInput(matrix: string[][]): { rows: ProductBulkInput; parseErrors: string[] } {
  const parseErrors: string[] = []
  if (matrix.length < 2) {
    return { rows: [], parseErrors: ['CSV needs a header row and at least one product row.'] }
  }

  const headers = matrix[0]!.map((header) => header.trim())
  const missing = TEMPLATE_HEADERS.filter((header) => !headers.includes(header))
  if (missing.length > 0) {
    return {
      rows: [],
      parseErrors: [`Missing CSV columns: ${missing.join(', ')}`],
    }
  }

  const indexOf = (name: string) => headers.indexOf(name)
  const rows: ProductBulkInput = []

  for (let i = 1; i < matrix.length; i += 1) {
    const cells = matrix[i]!
    const get = (name: (typeof TEMPLATE_HEADERS)[number]) => cells[indexOf(name)]?.trim() ?? ''

    const pricePounds = Number(get('pricePounds'))
    const stockQuantity = Number(get('stockQuantity'))
    const statusRaw = get('status').toUpperCase()
    const status =
      statusRaw === 'ACTIVE' ||
      statusRaw === 'DRAFT' ||
      statusRaw === 'OUT_OF_STOCK' ||
      statusRaw === 'ARCHIVED'
        ? statusRaw
        : undefined

    if (!get('name') || !get('slug') || !get('categorySlug') || !get('sku') || !get('imageUrl')) {
      parseErrors.push(`Row ${i + 1}: name, slug, categorySlug, sku, and imageUrl are required.`)
      continue
    }
    if (!Number.isFinite(pricePounds) || pricePounds <= 0) {
      parseErrors.push(`Row ${i + 1}: pricePounds must be a positive number (e.g. 14.99).`)
      continue
    }
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      parseErrors.push(`Row ${i + 1}: stockQuantity must be zero or more.`)
      continue
    }

    rows.push({
      name: get('name'),
      slug: get('slug'),
      description: get('description') || `${get('name')} from our store.`,
      categorySlug: get('categorySlug'),
      pricePounds,
      stockQuantity: Math.floor(stockQuantity),
      sku: get('sku'),
      imageUrl: get('imageUrl'),
      ...(status ? { status } : {}),
    })
  }

  if (rows.length > PRODUCT_BULK_MAX_ROWS) {
    parseErrors.push(`Too many rows. Maximum is ${PRODUCT_BULK_MAX_ROWS} products per import.`)
    return { rows: [], parseErrors }
  }

  return { rows, parseErrors }
}

export function BulkProductImport({ categories }: { categories: CategoryOption[] }) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ProductBulkInput>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Array<{ row: number; message: string }>>([])
  const [pending, startTransition] = useTransition()

  const categoryHint = useMemo(
    () => categories.slice(0, 6).map((category) => category.slug).join(', '),
    [categories],
  )

  function downloadTemplate() {
    const sampleCategory = categories[0]?.slug ?? 'homemade-foods'
    const sample = [
      TEMPLATE_HEADERS.join(','),
      [
        'Homestyle Mango Pickle',
        'homestyle-mango-pickle',
        'Small-batch mango pickle made for UK homes.',
        sampleCategory,
        '8.99',
        '25',
        'SKU-MANGO-001',
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        'DRAFT',
      ]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(','),
    ].join('\n')

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'bharatmart-products-template.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function onFileChange(file: File | null) {
    setResultMessage(null)
    setRowErrors([])
    setFileName(file?.name ?? null)
    if (!file) {
      setParsedRows([])
      setParseErrors([])
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const matrix = parseCsv(text)
      const { rows, parseErrors: nextErrors } = rowsToBulkInput(matrix)
      setParsedRows(rows)
      setParseErrors(nextErrors)
    }
    reader.readAsText(file)
  }

  return (
    <Card className="border-[#d6c4ad]">
      <CardHeader>
        <CardTitle className="text-base">Bulk import (CSV)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#514534]">
          Import up to {PRODUCT_BULK_MAX_ROWS} products in one go. Bulk uploads use a separate rate
          limit (5 imports / hour), so large catalogues are not blocked by the single-product write
          limit. Use category slugs such as: {categoryHint || 'homemade-foods'}.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={downloadTemplate} type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV template
          </Button>
          <Button asChild variant="outline">
            <Link href="/products/new">Add single product</Link>
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bulk-csv">Upload CSV</Label>
          <Input
            accept=".csv,text/csv"
            id="bulk-csv"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            type="file"
          />
          {fileName ? <p className="text-xs text-[#837561]">Selected: {fileName}</p> : null}
        </div>

        {parseErrors.length > 0 ? (
          <ul className="space-y-1 rounded-lg border border-[#a83635]/30 bg-[#fdf2f2] p-3 text-sm text-[#a83635]">
            {parseErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        {parsedRows.length > 0 ? (
          <p className="text-sm text-[#514534]">
            Ready to import <strong>{parsedRows.length}</strong> product
            {parsedRows.length === 1 ? '' : 's'}.
          </p>
        ) : null}

        <Button
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          disabled={pending || parsedRows.length === 0 || parseErrors.length > 0}
          onClick={() => {
            startTransition(async () => {
              const result = await bulkCreateProductsAction(parsedRows)
              if (!result.ok) {
                setResultMessage(result.error)
                setRowErrors([])
                return
              }
              setResultMessage(
                `Imported ${result.createdCount} product${result.createdCount === 1 ? '' : 's'}.`,
              )
              setRowErrors(result.errors)
              if (result.createdCount > 0) {
                setParsedRows([])
                setFileName(null)
              }
            })
          }}
          type="button"
        >
          <Upload className="mr-2 h-4 w-4" />
          {pending ? 'Importing…' : 'Import products'}
        </Button>

        {resultMessage ? <p className="text-sm font-medium text-[#2e6a39]">{resultMessage}</p> : null}
        {rowErrors.length > 0 ? (
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#d6c4ad] bg-[#fff8f0] p-3 text-sm text-[#514534]">
            {rowErrors.map((error) => (
              <li key={`${error.row}-${error.message}`}>
                Row {error.row}: {error.message}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
