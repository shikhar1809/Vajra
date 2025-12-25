import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const supabase = supabaseAdmin;

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get document status
        const { data: document, error } = await supabase
            .from("financial_documents")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error || !document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            documentId: document.id,
            filename: document.filename,
            status: document.processing_status,
            error: document.extracted_data?.error,
            vendorsCount: document.extracted_data?.vendors?.length || 0,
        });
    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
