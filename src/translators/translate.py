#!/usr/bin/env python3

import sys
import json
import asyncio
from googletrans import Translator

async def translate_text(text, source_lang, target_lang):
    translator = Translator(service_urls=['translate.googleapis.com'])
    result = await translator.translate(text, src=source_lang, dest=target_lang)
    return result

async def process_stdin():
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        
        text = data.get("text", "")
        target_lang = data.get("target_lang", "en")
        source_lang = data.get("source_lang", "auto")
        
        # For 'auto' language detection
        if not source_lang or source_lang == "auto":
            source_lang = "auto"
        
        result = await translate_text(text, source_lang, target_lang)
        
        # Handle the result after properly awaiting it
        output = {
            "translated_text": result.text if hasattr(result, 'text') else str(result),
            "source_language": result.src if hasattr(result, 'src') else source_lang,
            "target_language": result.dest if hasattr(result, 'dest') else target_lang,
            "error": None
        }
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({
            "translated_text": None, 
            "error": f"Translation error: {str(e)}"
        }))

if __name__ == "__main__":
    # Just handle stdin from Node.js
    asyncio.run(process_stdin())