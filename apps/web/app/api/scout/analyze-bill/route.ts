
import { NextResponse } from 'next/server';
import { llm } from '@/lib/llm/llm-provider';
const pdfParse = require('pdf-parse');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Convert file to buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF text
        let textContent = '';
        try {
            const data = await pdfParse(buffer);
            textContent = data.text;
        } catch (e) {
            console.error('PDF Parse Error:', e);
            return NextResponse.json(
                { error: 'Failed to parse PDF file' },
                { status: 400 }
            );
        }

        // Send to LLM for analysis
        const prompt = `
            Analyze this invoice/bill content for cybersecurity compliance and fraud detection.
            
            Document Content:
            """${textContent.substring(0, 3000)}""" (truncated if too long)
            
            Task:
            1. Extract the Vendor Name and Amount.
            2. Check if this vendor is a known secure entity or looks suspicious (typos, generic names).
            3. Analyze the transaction for fraud indicators (unusual items, round numbers, urgency).
            4. Provide a "Cybersecurity Compliance Score" (0-100) based on professional formatting and details.
            
            Output strictly as JSON:
            {
                "vendorName": "string",
                "amount": "string",
                "date": "string",
                "isSuspicious": boolean,
                "complianceScore": number,
                "riskLevel": "Low" | "Medium" | "High" | "Critical",
                "findings": ["string", "string"],
                "fraudIndicators": ["string"]
            }
        `;

        const analysisResult = await llm.generate([
            { role: 'system', content: 'You are an expert forensic accountant and cybersecurity analyst.' },
            { role: 'user', content: prompt }
        ]);

        const parsedResult = llm.parseJSON(analysisResult.content) || {
            vendorName: "Unknown",
            isSuspicious: true,
            riskLevel: "High",
            findings: ["Failed to parse AI response"]
        };

        return NextResponse.json({
            success: true,
            data: parsedResult,
            rawTextPreview: textContent.substring(0, 200) + '...'
        });

    } catch (error: any) {
        console.error('[Scout Bill Analysis] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
