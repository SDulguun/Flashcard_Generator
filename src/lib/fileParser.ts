import * as mammoth from 'mammoth'
import { extractText } from 'unpdf'
import JSZip from 'jszip'

export async function parseFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    return parsePDF(arrayBuffer)
  } else if (fileName.endsWith('.docx')) {
    return parseDOCX(buffer)
  } else if (fileName.endsWith('.doc')) {
    // Older .doc format - try to extract what we can
    return parseText(buffer)
  } else if (fileName.endsWith('.pptx')) {
    return parsePPTX(buffer)
  } else if (fileName.endsWith('.xlsx')) {
    return parseXLSX(buffer)
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf')) {
    return parseText(buffer)
  } else if (fileName.endsWith('.csv')) {
    return parseCSV(buffer)
  } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return parseHTML(buffer)
  } else if (fileName.endsWith('.odt') || fileName.endsWith('.odp')) {
    return parseODF(buffer)
  } else {
    throw new Error('Unsupported file type. Supported: PDF, DOCX, PPTX, XLSX, TXT, MD, RTF, CSV, HTML, ODT, ODP')
  }
}

async function parsePDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await extractText(arrayBuffer)
    if (typeof result.text === 'string') {
      return result.text
    } else if (Array.isArray(result.text)) {
      return result.text.join('\n')
    } else {
      return String(result.text || '')
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF file')
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

async function parsePPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer)
    const texts: string[] = []

    // PPTX stores slides in ppt/slides/slide*.xml
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return numA - numB
      })

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async('string')
      // Extract text from XML (text is in <a:t> tags)
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || []
      const slideText = textMatches
        .map(match => match.replace(/<\/?a:t>/g, ''))
        .join(' ')
      if (slideText.trim()) {
        texts.push(slideText.trim())
      }
    }

    return texts.join('\n\n')
  } catch (error) {
    console.error('PPTX parsing error:', error)
    throw new Error('Failed to parse PowerPoint file')
  }
}

async function parseXLSX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer)
    const texts: string[] = []

    // First get shared strings (XLSX stores text in a shared strings table)
    const sharedStringsFile = zip.files['xl/sharedStrings.xml']
    const sharedStrings: string[] = []

    if (sharedStringsFile) {
      const ssContent = await sharedStringsFile.async('string')
      const stringMatches = ssContent.match(/<t>([^<]*)<\/t>/g) || []
      stringMatches.forEach(match => {
        sharedStrings.push(match.replace(/<\/?t>/g, ''))
      })
    }

    // Get sheet data
    const sheetFiles = Object.keys(zip.files)
      .filter(name => name.match(/xl\/worksheets\/sheet\d+\.xml$/))
      .sort()

    for (const sheetFile of sheetFiles) {
      const content = await zip.files[sheetFile].async('string')
      // Extract cell values
      const cellMatches = content.match(/<v>([^<]*)<\/v>/g) || []
      const rowText = cellMatches
        .map(match => {
          const value = match.replace(/<\/?v>/g, '')
          // Check if it's a shared string reference
          const index = parseInt(value)
          if (!isNaN(index) && sharedStrings[index]) {
            return sharedStrings[index]
          }
          return value
        })
        .join(' | ')
      if (rowText.trim()) {
        texts.push(rowText.trim())
      }
    }

    return texts.join('\n')
  } catch (error) {
    console.error('XLSX parsing error:', error)
    throw new Error('Failed to parse Excel file')
  }
}

async function parseODF(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer)

    // ODF files store content in content.xml
    const contentFile = zip.files['content.xml']
    if (!contentFile) {
      throw new Error('Invalid ODF file')
    }

    const content = await contentFile.async('string')
    // Extract text from text:p and text:span tags
    const textMatches = content.match(/<text:[^>]*>([^<]*)/g) || []
    const text = textMatches
      .map(match => match.replace(/<text:[^>]*>/g, ''))
      .filter(t => t.trim())
      .join(' ')

    return text
  } catch (error) {
    console.error('ODF parsing error:', error)
    throw new Error('Failed to parse ODF file')
  }
}

function parseText(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

function parseCSV(buffer: Buffer): string {
  const text = buffer.toString('utf-8')
  const lines = text.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [line]
    return values.map(v => v.replace(/^"|"$/g, '').trim()).join(' - ')
  }).join('\n')
}

function parseHTML(buffer: Buffer): string {
  const html = buffer.toString('utf-8')
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
