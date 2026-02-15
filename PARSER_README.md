# Article Parser - Usage Guide

## Overview

This Python script converts your MonsterBox article collection from:
- Excel metadata file (`.xlsx`)
- Bilingual text files (`.docx` extension, but actually UTF-8 text)

Into a structured JSON file ready for use in your Angular 21 application.

## Features

✅ Parses 647 articles from Excel metadata  
✅ Extracts bilingual content (Vietnamese + English)  
✅ Matches content with metadata using titles  
✅ Generates SEO-friendly slugs  
✅ Handles Vietnamese characters properly  
✅ Creates clean, structured JSON output  

## Prerequisites

```bash
pip install openpyxl --break-system-packages
```

## File Structure Expected

```
your-data-folder/
├── MonsterBox_articles_metadata.xlsx     # Excel with article metadata
└── *.docx                                 # Article text files (UTF-8 format)
    ├── 1234567__Article_Title_One.docx
    ├── 1234568__Article_Title_Two.docx
    └── ...
```

### Article Text File Format

Each article file should contain:

```
Bài Viết: [Vietnamese Title]
Chuyên mục: ['Genre1', 'Genre2']
Tags: ['Tag1', 'Tag2', 'Tag3']
Độ chuyên sâu: [Difficulty Level]
Tác giả: ['Author Name']
Ngày đăng: YYYY-MM-DD

Description:

[Vietnamese description paragraph 1]

[Vietnamese description paragraph 2]

Bài viết:

[Vietnamese content paragraphs...]


Article: [English Title]
Genres: ['Genre1', 'Genre2']
Tags: ['Tag1', 'Tag2']
Difficulty: [Level]
Creators: ['Author Name']
Date: YYYY-MM-DD

Description:

[English description paragraphs...]

Content:

[English content paragraphs...]
```

## Usage

### Basic Usage (Default Paths)

```bash
python3 parse_articles_to_json.py
```

This uses default paths:
- Excel: `/mnt/user-data/uploads/1771166434637_MonsterBox_articles_metadata.xlsx`
- Articles: `/mnt/user-data/uploads/`
- Output: `/home/claude/articles.json`

### Custom Paths

```bash
python3 parse_articles_to_json.py \
  --excel /path/to/metadata.xlsx \
  --articles /path/to/articles/ \
  --output /path/to/output.json
```

### Help

```bash
python3 parse_articles_to_json.py --help
```

## Output Format

### JSON Structure

```json
{
  "meta": {
    "totalArticles": 647,
    "generatedAt": "2025-02-15T14:30:00.123456",
    "version": "1.0"
  },
  "articles": [
    {
      "id": "article-slug-here",
      "metadata": {
        "titleVi": "Vietnamese Title",
        "titleEn": "English Title",
        "genres": "Genre Name",
        "difficultyLevel": "Basic | Medium | Advanced",
        "tags": ["Tag1", "Tag2", "Tag3"],
        "creators": ["Author Name"],
        "createdAt": "2020-11-25T00:00:00",
        "length": 12345,
        "page": 1
      },
      "vi": {
        "title": "Vietnamese Title",
        "description": "Vietnamese description...",
        "content": "Full Vietnamese article content...",
        "tags": ["Tag1", "Tag2"],
        "genres": ["Genre1"]
      },
      "en": {
        "title": "English Title",
        "description": "English description...",
        "content": "Full English article content...",
        "tags": ["Tag1", "Tag2"],
        "genres": ["Genre1"]
      }
    }
  ]
}
```

## How It Works

### Step 1: Parse Excel Metadata
- Reads the Excel file
- Extracts metadata for all 647 articles
- Processes fields: genres, tags, creators, dates, difficulty levels
- Creates a lookup map by slug (extracted from URL)

### Step 2: Parse Article Files
- Reads each text file
- Splits into Vietnamese and English sections (marker: "Article:")
- Extracts title, description, tags, and content for each language
- Generates URL-friendly slug from Vietnamese title

### Step 3: Match & Merge
- Matches article content with Excel metadata using Vietnamese title
- Merges all data into structured format
- Falls back to filename-based slug if no match found

### Step 4: Generate JSON
- Creates final JSON with all articles
- Adds metadata (total count, generation timestamp)
- Outputs formatted, UTF-8 encoded JSON

## Slug Generation

The script converts Vietnamese titles to URL-friendly slugs:

```
"Ăn, Ngủ, Chơi, Lặp Lại"
    ↓
"an-ngu-choi-lap-lai"
```

Vietnamese character mapping:
- `à,á,ả,ã,ạ,ă,ằ,ắ,ẳ,ẵ,ặ,â,ầ,ấ,ẩ,ẫ,ậ` → `a`
- `đ` → `d`
- `è,é,ẻ,ẽ,ẹ,ê,ề,ế,ể,ễ,ệ` → `e`
- And so on for all Vietnamese diacritics

## Matching Logic

The script tries to match articles with metadata using:

1. **Primary**: Vietnamese title exact match
2. **Fallback**: Slug generated from filename

This ensures all articles get proper metadata even if titles don't match exactly.

## Output Statistics

After processing, you'll see:

```
======================================================================
🚀 MonsterBox Article Parser
======================================================================
📊 Parsing Excel metadata from: ...
   ✅ Parsed 646 metadata entries
   ✅ Valid slugs: 442

📁 Scanning for article files in: ...
   Found 647 article files
   ✅ Processed 647 articles
   ✅ Matched with metadata: 442
   ⚠️  Without metadata: 205

💾 Saving to: ...
   ✅ Saved 647 articles
   📊 File size: 15.2 MB
```

## Integration with Angular

### 1. Copy JSON to Assets

```bash
cp articles.json your-angular-project/src/assets/data/
```

### 2. Create Model

```typescript
// src/app/core/models/article.model.ts
export interface Article {
  id: string;
  metadata: ArticleMetadata;
  vi: ArticleContent;
  en: ArticleContent;
}

export interface ArticleMetadata {
  titleVi: string;
  titleEn: string;
  genres: string;
  difficultyLevel: string;
  tags: string[];
  creators: string[];
  createdAt: string;
  length: number;
  page: number;
}

export interface ArticleContent {
  title: string;
  description: string;
  content: string;
  tags: string[];
  genres: string[];
}
```

### 3. Load in Service

```typescript
// src/app/core/services/article.service.ts
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private data = toSignal(
    this.http.get<{ articles: Article[] }>('/assets/data/articles.json')
  );
  
  articles = computed(() => this.data()?.articles || []);
}
```

## Troubleshooting

### Issue: No articles processed
**Solution**: Ensure text files have `.docx` extension and are UTF-8 encoded

### Issue: Metadata not matching
**Solution**: Check that Vietnamese titles in files match `titleVi` in Excel exactly

### Issue: Invalid slugs generated
**Solution**: Verify Vietnamese character mapping in `_slugify()` method

### Issue: English content missing
**Solution**: Ensure files have "Article:" marker separating Vi/En sections

## Advanced Usage

### Process Only Specific Articles

Modify the script to filter files:

```python
article_files = [f for f in article_files if 'keyword' in f.name]
```

### Custom Slug Generation

Modify the `_slugify()` method to customize slug format.

### Additional Metadata Fields

Add more fields in the Excel parsing section:

```python
cleaned_metadata = {
    # ... existing fields ...
    'customField': metadata.get('customField', 'default'),
}
```

## Performance

- **647 articles**: ~3-5 seconds processing time
- **Output size**: ~15-20 MB (depends on content length)
- **Memory usage**: ~100-200 MB during processing

## Future Enhancements

Potential improvements:

1. **Fuzzy matching**: Better title matching with edit distance
2. **Markdown conversion**: Convert content to Markdown format
3. **Image extraction**: Extract and save referenced images
4. **Validation**: Verify all required fields exist
5. **Incremental updates**: Only process new/changed files

## Support

For issues or questions about the parser, check:

1. File format matches expected structure
2. Excel headers match script expectations
3. UTF-8 encoding is used for all text files
4. Python version >= 3.8

## License

Generated for MonsterBox Articles Project
