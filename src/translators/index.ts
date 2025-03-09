import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';



export async function translateText(text: string, sourceLang = 'en', targetLang = "sq"): Promise<string> {
    return new Promise((resolve, reject) => {
        // Path to the Python script

        console.log(1)
        const pythonScriptPath = path.join(__dirname, './translate.py');

        // Make sure the script exists and is executable
        if (!fs.existsSync(pythonScriptPath)) {
            return reject(new Error(`Translation script not found at ${pythonScriptPath}`));
        }

        console.log(2)

        // Make the Python script executable
        fs.chmodSync(pythonScriptPath, 0o755);

        console.log(3)

        // Input data for the Python script
        const inputData = JSON.stringify({
            text,
            target_lang: targetLang,
            source_lang: sourceLang
        });

        console.log(4)

        // Spawn the Python process
        const pythonProcess = spawn('python3', [pythonScriptPath]);

        let outputData = '';
        let errorData = '';

        console.log(5)

        // Collect data from the Python script's stdout
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        console.log(6)

        // Collect any error messages from stderr
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        console.log(7)

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}: ${errorData}`));
            }

            try {
                const result = JSON.parse(outputData);

                if (result.error) {
                    return reject(new Error(`Translation failed: ${result.error}`));
                }

                if (result.translated_text === null) {
                    return reject(new Error('Translation failed: No translated text returned'));
                }

                resolve(result.translated_text);
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error}`));
            }
        });

        // Send the input data to the Python script
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
    });
}

