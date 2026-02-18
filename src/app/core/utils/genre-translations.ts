export const GENRE_VI_TO_EN: Record<string, string> = {
  'Giáo dục':              'Education',
  'Hóa học':               'Chemistry',
  'Khoa học Máy tính':     'Computer Science',
  'Khác':                  'Other',
  'Kinh tế học':           'Economics',
  'Lịch sử':               'History',
  'Monster Box':           'Monster Box',
  'Phát minh - Công nghệ': 'Invention & Technology',
  'Quan điểm - Ý tưởng':   'Opinions & Ideas',
  'Sinh học':              'Biology',
  'Thiên văn học':         'Astronomy',
  'Toán học':              'Mathematics',
  'Triết học - Tôn giáo':  'Philosophy & Religion',
  'Tâm lý học':            'Psychology',
  'Văn học - Nghệ Thuật':  'Literature & Arts',
  'Vật lý':                'Physics',
  'Xã hội - Văn hóa':      'Society & Culture',
  'Y học - Sức khỏe':      'Medicine & Health',
  'Địa lý':                'Geography',
};

export function translateGenre(viGenre: string, lang: string): string {
  if (lang !== 'en') return viGenre;
  const normalized = viGenre.normalize('NFC');
  return GENRE_VI_TO_EN[normalized] ?? viGenre;
}
