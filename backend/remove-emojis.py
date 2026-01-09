import re
import os
from pathlib import Path

# Pattern to match emojis
emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE)

files_to_clean = [
    "src/server.js",
    "src/infrastructure/services/ai.service.js",
    "src/config/database.js",
    "src/config/passport-setup.js",
    "src/domain/use-cases/complete-prisma-items.use-case.js",
    "src/domain/use-cases/complete-prisma-by-blocks.use-case.js",
    "src/domain/use-cases/analyze-screening-results.use-case.js",
    "src/domain/use-cases/create-project.use-case.js",
    "src/api/controllers/ai.controller.js",
    "src/infrastructure/repositories/protocol.repository.js"
]

base_dir = Path(__file__).parent
cleaned_count = 0

for file_path in files_to_clean:
    full_path = base_dir / file_path
    if full_path.exists():
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        cleaned_content = emoji_pattern.sub('', content)
        
        if content != cleaned_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            cleaned_count += 1
            print(f"Limpiado: {file_path}")
        else:
            print(f"Sin cambios: {file_path}")
    else:
        print(f"No encontrado: {file_path}")

print(f"\nTotal archivos limpiados: {cleaned_count}")
