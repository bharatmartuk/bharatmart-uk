"""Generate sample merchant onboarding documents for local/staging tests."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)


def font(size: int):
    for name in (
        r'C:\Windows\Fonts\arial.ttf',
        r'C:\Windows\Fonts\segoeui.ttf',
        r'C:\Windows\Fonts\calibri.ttf',
    ):
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def make_doc_png(path: Path, title: str, lines: list[str], size=(900, 1200), bg='#fffaf3', accent='#7f1d1d'):
    img = Image.new('RGB', size, bg)
    d = ImageDraw.Draw(img)
    d.rectangle([24, 24, size[0] - 25, size[1] - 25], outline=accent, width=4)
    d.rectangle([40, 40, size[0] - 41, size[1] - 41], outline='#d6c4ad', width=2)
    d.rectangle([60, 70, size[0] - 61, 150], fill=accent)
    d.text((80, 95), 'BHARATMART UK - SAMPLE DOCUMENT', fill='white', font=font(28))
    d.text((80, 180), title, fill=accent, font=font(36))
    y = 250
    for line in lines:
        d.text((80, y), line, fill='#1e1b16', font=font(22))
        y += 36
    d.text((80, size[1] - 120), 'FOR LOCAL / STAGING TESTING ONLY', fill='#837561', font=font(20))
    d.text((80, size[1] - 80), 'Not a real government or company document.', fill='#837561', font=font(18))
    img.save(path, 'PNG')
    print('wrote', path.name, path.stat().st_size)


def make_store_photo(path: Path):
    w, h = 1200, 800
    img = Image.new('RGB', (w, h), '#f4ede4')
    d = ImageDraw.Draw(img)
    d.rectangle([150, 180, 1050, 700], fill='#8b3a3a')
    d.rectangle([200, 250, 1000, 520], fill='#fff8f0')
    d.rectangle([220, 270, 980, 500], fill='#c4a574')
    d.rectangle([520, 420, 680, 700], fill='#4a2c0a')
    d.ellipse([640, 540, 660, 560], fill='#e8a317')
    for i, x in enumerate(range(180, 1020, 80)):
        color = '#a83635' if i % 2 == 0 else '#fff8f0'
        d.polygon([(x, 160), (x + 80, 160), (x + 60, 220), (x - 20, 220)], fill=color)
    d.rectangle([280, 280, 920, 380], fill='#7f1d1d')
    d.text((320, 305), "Priya's Pickle Kitchen", fill='#f4ede4', font=font(40))
    d.text((320, 545), 'SAMPLE STOREFRONT PHOTO', fill='#514534', font=font(24))
    d.text((320, 585), 'For BharatMart merchant onboarding tests', fill='#514534', font=font(20))
    img.save(path, 'JPEG', quality=88)
    print('wrote', path.name, path.stat().st_size)


def make_pdf(path: Path, title: str, body_lines: list[str]):
    content_lines = [f'BT /F1 18 Tf 50 780 Td ({title.replace("(", "\\(").replace(")", "\\)")}) Tj ET']
    y = 740
    for line in body_lines:
        safe = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        content_lines.append(f'BT /F1 12 Tf 50 {y} Td ({safe}) Tj ET')
        y -= 22
    content_lines.append('BT /F1 10 Tf 50 60 Td (SAMPLE FOR TESTING ONLY - NOT A REAL DOCUMENT) Tj ET')
    stream = '\n'.join(content_lines).encode('latin-1', errors='replace')
    objects = [
        b'1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n',
        b'2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n',
        (
            b'3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
            b'/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n'
        ),
        b'4 0 obj<< /Length ' + str(len(stream)).encode() + b' >>stream\n' + stream + b'\nendstream\nendobj\n',
        b'5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
    ]
    out = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for obj in objects:
        offsets.append(len(out))
        out.extend(obj)
    xref_pos = len(out)
    out.extend(f'xref\n0 {len(objects) + 1}\n'.encode())
    out.extend(b'0000000000 65535 f \n')
    for off in offsets[1:]:
        out.extend(f'{off:010d} 00000 n \n'.encode())
    out.extend(f'trailer<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n'.encode())
    path.write_bytes(out)
    print('wrote', path.name, path.stat().st_size)


biz_lines = [
    'Company: Priya Pickle Kitchen Ltd',
    'Company number: 14958201',
    'Registered office: 42 Brick Lane, London E1 6RF',
    'Incorporation date: 12 March 2024',
    'Nature of business: Manufacture & retail of',
    'homemade Indian pickles and grocery products',
    'Director: Priya Sharma',
    '',
    'This is a SAMPLE Companies House style certificate',
    'for BharatMart UK merchant onboarding tests.',
]
make_doc_png(OUT / 'business-registration.png', 'Certificate of Incorporation', biz_lines)
make_pdf(OUT / 'business-registration.pdf', 'Certificate of Incorporation (SAMPLE)', biz_lines)

id_lines = [
    'UNITED KINGDOM - SAMPLE DRIVING LICENCE',
    '1. SHARMA',
    '2. PRIYA',
    '3. 15.08.1992  LONDON',
    '4a. 01.01.2023   4b. 31.12.2032',
    '4c. DVLA',
    '5. SHARMA912158P99AB',
    '8. 42 BRICK LANE, LONDON E1 6RF',
    '',
    'Document type: Photocard driving licence (mock)',
    'Use for: Owner ID proof upload field',
]
make_doc_png(OUT / 'id-proof-driving-licence.png', 'Driving Licence (Mock)', id_lines)
make_pdf(OUT / 'id-proof-driving-licence.pdf', 'UK Driving Licence (SAMPLE)', id_lines)

food_lines = [
    "Food business operator: Priya Pickle Kitchen Ltd",
    "Trading as: Priya's Pickle Kitchen",
    'Premises: 42 Brick Lane, London E1 6RF',
    'Local authority: London Borough of Tower Hamlets',
    'Registration reference: FH-TH-2024-88214',
    'Hygiene rating: 5 - Very good (sample)',
    'Activities: Preparation, packing and retail of',
    'homemade pickles and ready-to-eat snacks',
    '',
    'Upload this as: Food hygiene / food licence',
]
make_doc_png(OUT / 'food-hygiene-licence.png', 'Food Business Registration', food_lines)
make_pdf(OUT / 'food-hygiene-licence.pdf', 'Food Hygiene Registration (SAMPLE)', food_lines)

make_store_photo(OUT / 'physical-store-photo.jpg')

logo = Image.new('RGB', (800, 800), '#fff8f0')
d = ImageDraw.Draw(logo)
d.ellipse([80, 80, 720, 720], fill='#7f1d1d', outline='#e8a317', width=12)
d.text((210, 360), "Priya's", fill='#f4ede4', font=font(64))
d.text((180, 440), 'Pickles', fill='#e8a317', font=font(56))
logo.save(OUT / 'store-logo.png', 'PNG')
print('wrote', 'store-logo.png', (OUT / 'store-logo.png').stat().st_size)
print('DONE')
