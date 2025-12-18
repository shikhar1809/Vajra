import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { documentId } = await request.json();

        // Get document
        const { data: document, error: docError } = await supabase
            .from("financial_documents")
            .select("*")
            .eq("id", documentId)
            .single();

        if (docError || !document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // Update status to processing
        await supabase
            .from("financial_documents")
            .update({ processing_status: "processing" })
            .eq("id", documentId);

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from("financial-documents")
            .download(document.file_path);

        if (downloadError || !fileData) {
            await supabase
                .from("financial_documents")
                .update({
                    processing_status: "failed",
                    extracted_data: { error: "Failed to download file" },
                })
                .eq("id", documentId);
            return NextResponse.json({ error: "Download failed" }, { status: 500 });
        }

        // Extract text based on file type
        let extractedText = "";
        try {
            if (document.file_type === "application/pdf") {
                extractedText = await extractPDFText(fileData);
            } else if (
                document.file_type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                document.file_type === "application/vnd.ms-excel"
            ) {
                extractedText = await extractExcelText(fileData);
            } else if (document.file_type === "text/csv") {
                extractedText = await extractCSVText(fileData);
            } else if (
                document.file_type === "image/png" ||
                document.file_type === "image/jpeg"
            ) {
                extractedText = await extractImageText(fileData);
            }
        } catch (error) {
            console.error("Text extraction error:", error);
            await supabase
                .from("financial_documents")
                .update({
                    processing_status: "failed",
                    extracted_data: { error: "Text extraction failed" },
                })
                .eq("id", documentId);
            return NextResponse.json(
                { error: "Text extraction failed" },
                { status: 500 }
            );
        }

        // Use AI to extract vendor information
        const vendors = await extractVendorsWithAI(extractedText);

        // Store vendors in database
        for (const vendor of vendors) {
            // Check if vendor already exists (deduplicate)
            const { data: existingVendor } = await supabase
                .from("vendors")
                .select("*")
                .eq("user_id", document.user_id)
                .ilike("name", vendor.name)
                .single();

            let vendorId;
            if (existingVendor) {
                // Update existing vendor
                vendorId = existingVendor.id;
                await supabase
                    .from("vendors")
                    .update({
                        total_spend: (existingVendor.total_spend || 0) + vendor.amount,
                        last_seen: new Date().toISOString(),
                    })
                    .eq("id", vendorId);
            } else {
                // Create new vendor
                const { data: newVendor } = await supabase
                    .from("vendors")
                    .insert({
                        user_id: document.user_id,
                        name: vendor.name,
                        normalized_name: vendor.name.toLowerCase().trim(),
                        category: vendor.category,
                        total_spend: vendor.amount,
                        first_seen: vendor.date || new Date().toISOString(),
                        last_seen: vendor.date || new Date().toISOString(),
                    })
                    .select()
                    .single();
                vendorId = newVendor?.id;
            }

            // Create transaction record
            if (vendorId) {
                await supabase.from("vendor_transactions").insert({
                    vendor_id: vendorId,
                    user_id: document.user_id,
                    amount: vendor.amount,
                    transaction_date: vendor.date || new Date().toISOString(),
                    description: vendor.description,
                    document_id: documentId,
                });
            }
        }

        // Update document status
        await supabase
            .from("financial_documents")
            .update({
                processing_status: "completed",
                extracted_data: { vendors, extractedText: extractedText.substring(0, 1000) },
            })
            .eq("id", documentId);

        return NextResponse.json({ success: true, vendorsCount: vendors.length });
    } catch (error) {
        console.error("Processing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function extractPDFText(fileData: Blob): Promise<string> {
    // For now, return placeholder - will implement with pdf-parse
    const buffer = await fileData.arrayBuffer();
    // TODO: Implement PDF parsing
    return "PDF text extraction placeholder";
}

async function extractExcelText(fileData: Blob): Promise<string> {
    // For now, return placeholder - will implement with xlsx
    const buffer = await fileData.arrayBuffer();
    // TODO: Implement Excel parsing
    return "Excel text extraction placeholder";
}

async function extractCSVText(fileData: Blob): Promise<string> {
    const text = await fileData.text();
    return text;
}

async function extractImageText(fileData: Blob): Promise<string> {
    // For now, return placeholder - will implement with Tesseract.js
    // TODO: Implement OCR
    return "Image OCR placeholder";
}

interface Vendor {
    name: string;
    amount: number;
    date?: string;
    category?: string;
    description?: string;
}

async function extractVendorsWithAI(text: string): Promise<Vendor[]> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a financial document analyzer. Extract vendor information from financial documents.
Return a JSON array of vendors with: name, amount (number), date (ISO format), category (SaaS/Cloud/Marketing/Office/etc), description.
Only return valid JSON, no markdown or explanations.`,
                },
                {
                    role: "user",
                    content: `Extract all vendors and transactions from this document:\n\n${text.substring(0, 4000)}`,
                },
            ],
            temperature: 0.3,
        });

        const content = completion.choices[0]?.message?.content || "[]";
        const vendors = JSON.parse(content);
        return Array.isArray(vendors) ? vendors : [];
    } catch (error) {
        console.error("AI extraction error:", error);
        return [];
    }
}
