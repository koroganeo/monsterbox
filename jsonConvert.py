"""
Article Parser - Convert Excel metadata and text files to JSON

This script processes:
1. Excel file with article metadata
2. Text files (with .docx extension) containing bilingual article content
3. Outputs a structured JSON file for the Angular application

Author: Generated for MonsterBox Articles Project
"""

import openpyxl
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
import argparse


class ArticleParser:
    """Parse and merge article metadata and content"""
    
    def __init__(self, excel_path: str, articles_dir: str, output_path: str):
        self.excel_path = Path(excel_path)
        self.articles_dir = Path(articles_dir)
        self.output_path = Path(output_path)
        self.metadata_map = {}
        
    def parse_excel_metadata(self) -> Dict[str, Dict]:
        """Parse Excel file and create metadata lookup by slug"""
        print(f"📊 Parsing Excel metadata from: {self.excel_path}")
        
        wb = openpyxl.load_workbook(self.excel_path)
        sheet = wb.active
        
        # Get headers from first row
        headers = [cell.value for cell in sheet[1]]
        print(f"   Headers: {headers}")
        
        metadata_map = {}
        total_rows = 0
        
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]:  # Skip empty rows
                continue
                
            total_rows += 1
            
            # Create metadata dict
            metadata = dict(zip(headers, row))
            
            # Extract slug from URL
            slug_url = metadata.get('slug', '')
            slug = self._extract_slug_from_url(slug_url)
            
            if not slug:
                print(f"   ⚠️  Warning: Could not extract slug from: {slug_url}")
                continue
            
            # Parse JSON-like string fields
            metadata['tags'] = self._parse_array_field(metadata.get('tags', '[]'))
            metadata['creators'] = self._parse_array_field(metadata.get('creators', '[]'))
            
            # Convert datetime to ISO string
            if isinstance(metadata.get('createdAt'), datetime):
                metadata['createdAt'] = metadata['createdAt'].isoformat()
            
            # Clean up metadata
            cleaned_metadata = {
                'titleVi': metadata.get('titleVi', ''),
                'titleEn': metadata.get('titleEn', ''),
                'genres': metadata.get('genres', ''),
                'difficultyLevel': metadata.get('difficultyLevel', 'Không có thông tin'),
                'tags': metadata['tags'],
                'creators': metadata['creators'],
                'createdAt': metadata.get('createdAt', ''),
                'length': metadata.get('length', 0),
                'page': metadata.get('page', 1)
            }
            
            metadata_map[slug] = cleaned_metadata
        
        print(f"   ✅ Parsed {total_rows} metadata entries")
        print(f"   ✅ Valid slugs: {len(metadata_map)}")
        
        return metadata_map
    
    def _extract_slug_from_url(self, url: str) -> Optional[str]:
        """Extract slug from URL like 'https://mbpedia.com/vi/bai-viet/slug-here'"""
        if not url:
            return None
        
        # Pattern: extract last segment after /bai-viet/
        match = re.search(r'/bai-viet/([^/\s]+)', url)
        if match:
            return match.group(1)
        
        # Fallback: use last segment of URL
        segments = url.rstrip('/').split('/')
        return segments[-1] if segments else None
    
    def _parse_array_field(self, field_value: str) -> List[str]:
        """Parse string representation of array like \"['item1', 'item2']\" """
        if not field_value or field_value == '[]':
            return []
        
        try:
            # Remove outer brackets and split by comma
            cleaned = field_value.strip('[]')
            # Split and clean each item
            items = [item.strip().strip("'\"") for item in cleaned.split(',')]
            return [item for item in items if item]
        except Exception as e:
            print(f"   ⚠️  Error parsing array field '{field_value}': {e}")
            return []
    
    def parse_article_file(self, file_path: Path) -> Dict[str, Any]:
        """Parse a bilingual article text file"""
        print(f"   📄 Parsing: {file_path.name}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split into Vietnamese and English sections
        # The marker is "Article:" which starts the English section
        parts = content.split('\nArticle:')
        
        if len(parts) != 2:
            # Try alternative split
            parts = content.split('\n\nArticle:')
            if len(parts) != 2:
                print(f"   ⚠️  Warning: Could not split into Vi/En sections properly")
                # Use entire content as Vietnamese if no split found
                parts = [content, '']
        
        vi_section = parts[0]
        en_section = parts[1] if len(parts) > 1 else ''
        
        # Parse both sections
        vi_data = self._parse_section(vi_section, 'vi')
        en_data = self._parse_section(en_section, 'en') if en_section else {
            'title': '', 'description': '', 'content': '', 'tags': [], 'genres': []
        }
        
        # Try to match with metadata using Vietnamese title
        slug = self._find_slug_from_title(vi_data['title'])
        
        # If no match, generate slug from filename
        if not slug:
            filename = file_path.stem  # Remove .docx
            # Remove timestamp prefix
            slug_from_file = re.sub(r'^\d+__', '', filename)
            slug = self._slugify(slug_from_file)
        
        return {
            'slug': slug,
            'vi': vi_data,
            'en': en_data
        }
    
    def _find_slug_from_title(self, title: str) -> Optional[str]:
        """Find matching slug from metadata based on Vietnamese title"""
        if not title:
            return None
        
        # Clean title for comparison
        title_clean = title.lower().strip().strip('"').strip('"').strip('"')
        
        # Search through metadata for matching titleVi
        for slug, metadata in self.metadata_map.items():
            meta_title = metadata.get('titleVi', '').lower().strip()
            if meta_title and meta_title == title_clean:
                return slug
        
        return None
    
    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        # Vietnamese character mapping
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'đ': 'd',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        }
        
        # Convert to lowercase
        text = text.lower()
        
        # Replace Vietnamese characters
        for viet_char, latin_char in vietnamese_map.items():
            text = text.replace(viet_char, latin_char)
        
        # Replace uppercase Vietnamese
        for viet_char, latin_char in vietnamese_map.items():
            text = text.replace(viet_char.upper(), latin_char.upper())
        
        # Replace underscores and spaces with hyphens
        text = text.replace('_', '-').replace(' ', '-')
        
        # Remove any character that isn't alphanumeric or hyphen
        text = re.sub(r'[^a-z0-9-]', '', text)
        
        # Remove multiple consecutive hyphens
        text = re.sub(r'-+', '-', text)
        
        # Remove leading/trailing hyphens
        text = text.strip('-')
        
        return text
    
    def _parse_section(self, text: str, lang: str) -> Dict[str, str]:
        """Parse a single language section"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if not lines:
            return {'title': '', 'description': '', 'content': '', 'tags': []}
        
        # Extract fields
        title = ''
        genres = []
        tags = []
        description = ''
        content_lines = []
        
        in_description = False
        in_content = False
        
        for i, line in enumerate(lines):
            # Title (first line, remove prefix)
            if not title:
                if lang == 'vi':
                    title = line.replace('Bài Viết:', '').replace('Bài viết:', '').strip()
                else:
                    title = line.replace('Article:', '').strip()
                continue
            
            # Metadata fields (skip these)
            if any(line.startswith(prefix) for prefix in [
                'Chuyên mục:', 'Genres:', 'Tags:', 'Độ chuyên sâu:', 
                'Difficulty:', 'Tác giả:', 'Creators:', 'Ngày đăng:', 'Date:'
            ]):
                # Extract tags if present
                if line.startswith('Tags:'):
                    tags_str = line.split(':', 1)[1].strip()
                    tags = self._parse_array_field(tags_str)
                elif line.startswith('Chuyên mục:') or line.startswith('Genres:'):
                    genres_str = line.split(':', 1)[1].strip()
                    genres = self._parse_array_field(genres_str)
                continue
            
            # Description section marker
            if line == 'Description:':
                in_description = True
                continue
            
            # Content section marker
            if line.startswith('Bài viết:') or line.startswith('Content:'):
                in_description = False
                in_content = True
                continue
            
            # For English: content starts after empty line following description
            # or after we see enough metadata lines
            if lang == 'en' and not in_content and not in_description:
                # If we're past metadata and see substantial text, it's content
                if i > 5 and len(line) > 50:
                    in_content = True
            
            # Collect description
            if in_description:
                description += line + '\n\n'
                continue
            
            # Collect content
            if in_content:
                content_lines.append(line)
        
        # Join content with proper paragraph spacing
        content = '\n\n'.join(content_lines)
        
        return {
            'title': title,
            'description': description.strip(),
            'content': content.strip(),
            'tags': tags,
            'genres': genres
        }
    
    def process_all_articles(self) -> List[Dict]:
        """Process all article files and merge with metadata"""
        print(f"\n📁 Scanning for article files in: {self.articles_dir}")
        
        # Find all text files (they have .docx extension but are text)
        article_files = list(self.articles_dir.glob('*.docx'))
        
        # Filter out the metadata Excel file if it's in the same directory
        article_files = [f for f in article_files if not f.name.endswith('.xlsx')]
        
        print(f"   Found {len(article_files)} article files")
        
        articles = []
        matched_count = 0
        unmatched_count = 0
        
        for article_file in article_files:
            parsed = self.parse_article_file(article_file)
            
            if not parsed:
                unmatched_count += 1
                continue
            
            slug = parsed['slug']
            
            # Try to find matching metadata
            # First try direct match
            metadata = self.metadata_map.get(slug)
            
            # If not found, try fuzzy matching with Vietnamese title
            if not metadata:
                vi_title = parsed['vi']['title'].lower()
                for meta_slug, meta_data in self.metadata_map.items():
                    # This would require the metadata to have titleVi
                    # For now, we'll use the parsed data
                    pass
            
            # Create article entry
            article = {
                'id': slug,
                'metadata': metadata or {
                    'genres': parsed['vi'].get('genres', []),
                    'difficultyLevel': 'Không có thông tin',
                    'tags': parsed['vi'].get('tags', []),
                    'creators': [],
                    'createdAt': '',
                    'length': len(parsed['vi']['content']) + len(parsed['en']['content']),
                    'page': 1
                },
                'vi': {
                    'title': parsed['vi']['title'],
                    'description': parsed['vi']['description'],
                    'content': parsed['vi']['content']
                },
                'en': {
                    'title': parsed['en']['title'],
                    'description': parsed['en']['description'],
                    'content': parsed['en']['content']
                }
            }
            
            articles.append(article)
            
            if metadata:
                matched_count += 1
            else:
                unmatched_count += 1
        
        print(f"\n   ✅ Processed {len(articles)} articles")
        print(f"   ✅ Matched with metadata: {matched_count}")
        print(f"   ⚠️  Without metadata: {unmatched_count}")
        
        return articles
    
    def save_json(self, articles: List[Dict]):
        """Save articles to JSON file"""
        print(f"\n💾 Saving to: {self.output_path}")
        
        # Create output directory if needed
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            'meta': {
                'totalArticles': len(articles),
                'generatedAt': datetime.now().isoformat(),
                'version': '1.0'
            },
            'articles': articles
        }
        
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"   ✅ Saved {len(articles)} articles")
        print(f"   📊 File size: {self.output_path.stat().st_size / 1024:.2f} KB")
    
    def run(self):
        """Main execution flow"""
        print("=" * 70)
        print("🚀 MonsterBox Article Parser")
        print("=" * 70)
        
        # Step 1: Parse Excel metadata
        self.metadata_map = self.parse_excel_metadata()
        
        # Step 2: Process article files
        articles = self.process_all_articles()
        
        # Step 3: Save to JSON
        if articles:
            self.save_json(articles)
            
            # Show sample
            print("\n" + "=" * 70)
            print("📋 Sample Article Structure:")
            print("=" * 70)
            if articles:
                sample = articles[0]
                print(f"ID: {sample['id']}")
                print(f"Title (Vi): {sample['vi']['title'][:50]}...")
                print(f"Title (En): {sample['en']['title'][:50]}...")
                print(f"Tags: {sample['metadata']['tags'][:3]}")
                print(f"Content length: {len(sample['vi']['content'])} chars (Vi), {len(sample['en']['content'])} chars (En)")
        else:
            print("\n❌ No articles were processed!")
        
        print("\n" + "=" * 70)
        print("✨ Done!")
        print("=" * 70)


def main():
    """Command-line interface"""
    parser = argparse.ArgumentParser(
        description='Parse MonsterBox articles from Excel and text files to JSON',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process files in current directory
  python parse_articles_to_json.py
  
  # Specify custom paths
  python parse_articles_to_json.py \\
    --excel /path/to/metadata.xlsx \\
    --articles /path/to/articles/ \\
    --output /path/to/output.json
        """
    )
    
    parser.add_argument(
        '--excel',
        default='/mnt/user-data/uploads/1771166434637_MonsterBox_articles_metadata.xlsx',
        help='Path to Excel metadata file'
    )
    
    parser.add_argument(
        '--articles',
        default='/mnt/user-data/uploads',
        help='Directory containing article text files'
    )
    
    parser.add_argument(
        '--output',
        default='/home/claude/articles.json',
        help='Output JSON file path'
    )
    
    args = parser.parse_args()
    
    # Create parser and run
    article_parser = ArticleParser(
        excel_path=args.excel,
        articles_dir=args.articles,
        output_path=args.output
    )
    
    article_parser.run()


if __name__ == '__main__':
    main()