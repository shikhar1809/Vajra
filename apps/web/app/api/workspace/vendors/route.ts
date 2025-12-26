import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// POST - Add new vendor to workspace
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workspaceId, name, domain, contactEmail, contactName, description } = body;

        if (!workspaceId || !name || !domain) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, name, and domain are required' },
                { status: 400 }
            );
        }

        // Insert vendor
        const { data: vendor, error } = await supabase
            .from('vendors')
            .insert({
                workspace_id: workspaceId,
                name,
                domain,
                contact_email: contactEmail,
                contact_name: contactName,
                description,
                status: 'active',
                security_score: 0, // Will be updated after scan
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating vendor:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: vendor,
        });
    } catch (error) {
        console.error('Vendor creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create vendor' },
            { status: 500 }
        );
    }
}

// GET - Get all vendors for workspace
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        if (!supabase) return NextResponse.json({ success: true, data: [] });

        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching vendors:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { vendors: vendors || [] },
        });
    } catch (error) {
        console.error('Vendors GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vendors' },
            { status: 500 }
        );
    }
}
